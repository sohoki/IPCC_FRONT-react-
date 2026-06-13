import { useCallback, useMemo, useRef, useState } from 'react';

/**
 * AG-Grid Infinite Row Model 공통 훅
 *
 * @param {Object} options
 * @param {(params: Object) => Promise<{ rows: any[], total: number }>} options.fetchApi
 * @param {number}  [options.pageUnit=20]
 * @param {Object}  [options.initialFilters={}]
 * @param {boolean} [options.enableSort=false]
 * @param {number}  [options.noRowsOverlayMs=10000] - "데이터 없음" 오버레이 자동 숨김 시간 (0이면 비활성)
 */
export const useGridInfinite = ({
  fetchApi,
  pageUnit = 20,
  initialFilters = {},
  enableSort = false,
  noRowsOverlayMs = 10000,
}) => {
    const gridApiRef = useRef(null);
    const lastDataRef = useRef({ rows: [], total: 0 });

    // 검색 파라미터를 ref로 관리 → stale closure 방지
    const appliedParamsRef = useRef({ ...initialFilters });
    const [tempParams, setTempParams] = useState(() => ({ ...initialFilters }));
    const [totalCount, setTotalCount] = useState(0);

    // setTimeout ID 추적 → unmount 시 정리
    const timersRef = useRef([]);

    const safeLater = useCallback((fn, ms = 0) => {
        const id = setTimeout(() => {
        // 컴포넌트 unmount 후 실행 방지
        if (gridApiRef.current) fn();
        }, ms);
        timersRef.current.push(id);
        return id;
    }, []);

    // 로딩 상태 헬퍼
    const setLoading = useCallback(
        (on) => safeLater(() => gridApiRef.current?.setGridOption('loading', on)),
        [safeLater],
    );

    // 오버레이 관리
    const handleOverlay = useCallback(
        (rows) => {
        if (!rows?.length) {
            gridApiRef.current?.showNoRowsOverlay();
            if (noRowsOverlayMs > 0) {
            safeLater(() => gridApiRef.current?.hideOverlay(), noRowsOverlayMs);
            }
        } else {
            gridApiRef.current?.hideOverlay();
        }
        },
        [safeLater, noRowsOverlayMs],
    );

    // ── 컬럼 기본 설정 ──
    const defaultColDef = useMemo(
        () => ({
        resizable: true,
        sortable: true,
        filter: false,
        minWidth: 80,
        }),
        [],
    );

    // ── DataSource 팩토리 ──
    const buildDataSource = useCallback(
        (searchParams) => ({
        getRows: async ({ startRow, sortModel, successCallback, failCallback }) => {

            const pageIndex = String(Math.floor(startRow / pageUnit) + 1);

            const req = {
            ...searchParams,
            pageIndex,
            pageUnit: String(pageUnit),
            ...(enableSort && sortModel?.[0]
                ? { sortField: sortModel[0].colId, sortOrder: sortModel[0].sort }
                : {}),
            };

            setLoading(true);

            try {
            const { rows = [], total = 0 } = await fetchApi(req);

            lastDataRef.current = { rows, total };

            safeLater(() => {
                setTotalCount(total);
                setLoading(false);
                handleOverlay(rows);
            });

            successCallback(rows, total);
            } catch (err) {
            console.error('Grid Load Error:', err);
            setLoading(false);
            failCallback?.();
            }
        },
        }),
        [fetchApi, pageUnit, enableSort, setLoading, safeLater, handleOverlay],
    );

    // ── Grid 초기화 (최초 1회) ──
    const onGridReady = useCallback(
        (params) => {
        gridApiRef.current = params.api;
        params.api.setGridOption('cacheBlockSize', pageUnit);
        // ref에서 읽으므로 stale closure 없음
        params.api.setGridOption('datasource', buildDataSource(appliedParamsRef.current));
        },
        [pageUnit, buildDataSource],
    );

    // ── 검색 ──
    const handleSearch = useCallback(
        (pageIndex = 1) => {
        const next = { ...tempParams };
        appliedParamsRef.current = next;

        const api = gridApiRef.current;
        if (!api) return;

        api.setGridOption('datasource', buildDataSource(next));
        safeLater(() => api.paginationGoToPage(Math.max(0, pageIndex - 1)));
        },
        [tempParams, buildDataSource, safeLater],
    );

    // ── 새로고침 (현재 페이지 유지 옵션) ──
    const refreshGrid = useCallback(
        ({ keepPage = true, extraParams = {} } = {}) => {
        const api = gridApiRef.current;
        if (!api) return;

        const currentPage = keepPage ? (api.paginationGetCurrentPage?.() ?? 0) : 0;
        const merged = { ...appliedParamsRef.current, ...extraParams };

        api.setGridOption('datasource', buildDataSource(merged));
        safeLater(() => api.paginationGoToPage(currentPage));
        },
        [buildDataSource, safeLater],
    );

    // ── Cleanup (컴포넌트에서 useEffect로 호출) ──
    const cleanup = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    return {
        gridApiRef,
        onGridReady,
        defaultColDef,
        tempParams,
        setTempParams,
        handleSearch,
        refreshGrid,
        totalCount,
        cleanup, // useEffect return에서 호출
    };
};