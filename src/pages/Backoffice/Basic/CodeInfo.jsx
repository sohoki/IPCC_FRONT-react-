import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { alert } from '@/lib/alert.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import CODE from '@/constants/CODE.jsx';
import API_URL from '@/constants/URL.jsx';

import MasterDetailGrid from '@/components/Common/MasterDetailGrid.jsx';
import CodeDetailCellRenderer from './components/CodeDetailCellRenderer.jsx';
import {useResetForm}  from '@/hooks/use-form.jsx'
import {CommonSelect} from '@/components/Common/Select.jsx';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';

const CodeFormModal = React.lazy(() => import('./components/CodeFormModal.jsx'));
const DetailCodeFormModal = React.lazy(() => import('./components/DetailCodeFormModal.jsx'));

// ── 초기값 ─────────────────────────────────────────────────────────────────
const INITIAL_CODE_FORM = {
    mode: 'Ins',
    clCode:'GOV0001',
    codeId: '',
    systemCode: '',
    codeIdNm: '',
    codeIdDc: '',
    useAt: 'Y',
    idCheck: 'N',
};

const INITIAL_DETAIL_FORM = {
    mode: 'Ins',
    clCode:'GOV0001',
    codeId: '',
    code: '',
    systemCode: '',
    codeNm: '',
    codeDc: '',
    codeEtc1: '',
    codeEtc2: '',
    useAt: 'Y',
};
const INITIAL_SEARCH_FORM = {
    searchSystemCode: 'IPCC',
    searchCondition: '',
    searchKeyword: '',
}

const SYSTEM_PARAMS = { systemUseyn: 'Y', systemMenuUse: 'Y' };
const SYSTEM_MAPPING  = { id: 'systemCode',      text: 'systemName'};
const SEARCH_MENU = { pageIndex: '1', pageUnit: '1000', searchSystemCode : 'IPCC'};


// ── 메인 그리드 사용유무 Switch 셀 ────────────────────────────────────────
const MainUseAtCell = ({ value, data, context }) => {
    const [currentValue, setCurrentValue] = useState(value);

    const handleChange = async (payload) => {
        const newValue = payload.useAt;
        try {
            await context?.updateUseAt(data.codeId, newValue);
            setCurrentValue(newValue);
        } catch {
            alert.error('수정에 실패했습니다.', 'error');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <UseSwitch
                value={currentValue}
                name="useAt"
                onChange={handleChange}
                onText="사용"
                offText="사용안함"
            />
        </div>
    );
};

// ── CodeInfo ───────────────────────────────────────────────────────────────
const CodeInfo = () => {
    const gridApiRef = useRef(null);
    const searchRef = useRef(null);

    const [tempParams, setTempParams] = useState(INITIAL_SEARCH_FORM);
    const [pageUnit] = useState(20);
    const [rowData, setRowData] = useState([]);

    // ── 분류코드 모달 ──
    const [codeForm, setCodeForm] = useState(INITIAL_CODE_FORM);
    const [codeModalOpen, setCodeModalOpen] = useState(false);


    const {options: systemOptions, isLoading: isLoadingSystem} = useCustomReqDataCombo({
        url: API_URL.SERVER_SYSTEM_COMBO,
        params: SYSTEM_PARAMS,
        mapping: SYSTEM_MAPPING,
    });

    const openCodeMoal = useCallback((codeId, rawData) => {
        if (!codeId) {
            setCodeForm({ ...INITIAL_CODE_FORM, idCheck: 'N' });
        } else {
            setCodeForm({
                mode: 'Edt',
                clCode:rawData?.clCode || 'GOV0001',
                systemCode: rawData?.systemCode || '',
                codeId,
                codeIdNm: rawData?.codeIdNm || '',
                codeIdDc: rawData?.codeIdDc || '',
                useAt: rawData?.useAt || '',
                idCheck: 'Y',
            });
        }
        setCodeModalOpen(true);
    }, []);

    // ── 상세코드 모달 ──
    const [detailForm, setDetailForm] = useState(INITIAL_DETAIL_FORM);
    const [codeDetailModalOpen, setCodeDetailModalOpen] = useState(false);

    const openDetailCodeMoal = useCallback(async (codeId, code, rawData) => {
        if (!codeId) {
            await alert.warning('분류코드가 없습니다.', '등록 확인');
            return;
        }
        if (!code) {
            setDetailForm({ ...INITIAL_DETAIL_FORM, codeId, systemCode : rawData?.systemCode || '' });
        } else {
            setDetailForm({
                mode: 'Edt',
                clCode: rawData?.clCode || 'GOV0001',
                code,
                codeId,
                systemCode: rawData?.systemCode || '',
                codeNm: rawData?.codeNm || '',
                codeDc: rawData?.codeDc || '',
                codeEtc1: rawData?.codeEtc1 || '',
                useAt: rawData?.useAt || 'Y',
            });
        }
        setCodeDetailModalOpen(true);
    }, []);

    // ── 서브 그리드 데이터 로드 ──
    const fetchDetailCodeStable = useCallback(async ({ codeId, systemCode, pageIndex = '1', pageUnit = '100' }) => {
        const res = await fnAjaxFetch({
            url: API_URL.CODE_LIST_SUB_LIST,
            method: 'POST',
            data: { codeId, systemCode, pageIndex, pageUnit },
            withCredentials: true,
        });
        return res?.data?.result?.resultList || res?.data?.result?.result || res?.data?.rows || [];
    }, []);

    const fetchDetailCodeRef = useRef(fetchDetailCodeStable);
    useEffect(() => { fetchDetailCodeRef.current = fetchDetailCodeStable; }, [fetchDetailCodeStable]);

    // ── 서브 그리드 리프레시 ──
    const refreshDetailRows = useCallback(async ({ parentRowId, codeId, systemCode }) => {
        const gridApi = gridApiRef.current;
        if (!gridApi) return;
        const info = gridApi.getDetailGridInfo(`detail_${parentRowId}`);
        if (!info) return;
        try {
            info.api.setGridOption('loading', true);
            const rows = await fetchDetailCodeRef.current({ codeId, systemCode });
            info.api.setGridOption('rowData', rows.map((r) => ({ ...r, codeId, __parentId: parentRowId })));
        } finally {
            info.api.setGridOption('loading', false);
        }
    }, []);

    // ── 분류코드 사용유무 API ──
    const updateUseAt = useCallback(async (codeId, newValue) => {
        await fnAjaxFetch({
            url: API_URL.CODE_PROCESS_UPDATE_USEYN,
            method: 'POST',
            data: { codeId, useAt: newValue },
            withCredentials: true,
        });
    }, []);

    // ── 검색 ──
    const fetchCodeList = useCallback(async (query) => {
        const res = await fnAjaxFetch({ url: API_URL.CODEID_LIST, method: 'POST', data: query });
        const data = res?.data;
        return {
            rows: data?.result.resultList || [],
            total: data?.result.paginationInfo?.totalRecordCount || 0,
        };
    }, []);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setTempParams((prev) => ({ ...prev, [name]: value }));
    }, []);

    const onSearch = useCallback(async (pageIndex) => {
        if (tempParams.searchKeyword && !tempParams.searchCondition) {
            searchRef.current?.focus();
            searchRef.current?.classList.add('input-focus-highlight');
            setTimeout(() => searchRef.current?.classList.remove('input-focus-highlight'), 2000);
            await alert.warning('검색 조건을 선택해주세요.', '검색 확인');
            return;
        }
        const req = { ...tempParams, pageIndex: String(pageIndex), pageUnit: String(pageUnit) };
        const { rows } = await fetchCodeList(req);
        setRowData(rows);
    }, [tempParams, pageUnit, fetchCodeList]);

    useEffect(() => {
        fetchCodeList({ searchCondition: '', searchKeyword: '', pageIndex: '1', pageUnit: String(pageUnit) })
            .then(({ rows }) => setRowData(rows))
            .catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onSearchKeyDown = useCallback((e) => {
        if (e.key === 'Enter') onSearch(1);
    }, [onSearch]);

    // ── useCommonSubmit / useCommonDelete ──
    const { handleSubmit: handleCodeSubmit } = useCommonSubmit({
        form: detailForm,
        type: 'json',
        checkField: [
            { inputId: 'codeNm', type: CODE.TEXT, message: '상세코드명을 입력해주세요.' },
        ],
        
        confirmMessage: `${detailForm.codeNm} "를`,
        setModalOpen: setCodeDetailModalOpen,
        URL: API_URL.CODE_DETAIL_UPDATE,
        reloadFunction: 'none',
        callback: async () => {
            await refreshDetailRows({ parentRowId: detailForm.codeId, codeId: detailForm.codeId, systemCode: detailForm.systemCode });
        },
    });

    const { handleDelete: handleCodeDelete } = useCommonDelete({
        gridApiRef,
        URL: API_URL.CODE_DETAIL_INFO,
        MESSAGE: '상세 코드 정보',
        reloadFunction: 'none',
    });

    const { handleSubmit: handleCodeIdSubmit } = useCommonSubmit({
        form: codeForm,
        type: 'json',
        checkField: [
            { inputId: 'codeId',   type: CODE.TEXT, message: '코드를' },
            { inputId: 'codeIdNm', type: CODE.TEXT, message: '코드명을' },
        ],
        confirmMessage: `${codeForm.codeIdNm} "를`,
        gridApiRef,
        setModalOpen: setCodeModalOpen,
        URL: API_URL.CODE_PROCESS_UPDATE,
        reloadFunction: onSearch,
    });

    const { handleDelete: handleCodeIdDelete } = useCommonDelete({
        gridApiRef,
        URL: API_URL.CODE_INFO,
        MESSAGE: '코드 정보',
        reloadFunction: onSearch,
    });

    // ── 메인 그리드 컬럼 ──
    const colModel = useMemo(() => [
        {
            headerName: '분류코드ID', field: 'codeId',
            cellStyle: { textAlign: 'left' }, colId: 'codeId',
            cellRenderer: 'agGroupCellRenderer',
        },
         {
            headerName: '시스템명', field: 'systemName',
            cellStyle: { textAlign: 'left' }, width: 150,
        },
        { headerName: '분류코드명',    field: 'codeIdNm',      cellStyle: { textAlign: 'left' }, flex: 1 },
        { headerName: '분류코드설명',  field: 'codeIdDc',      cellStyle: { textAlign: 'left' }, sortable: false, flex: 1 },
        {
            headerName: '사용유무', field: 'useAt',
            width: 100, cellStyle: { textAlign: 'center' },
            cellRenderer: MainUseAtCell,
        },
        { headerName: '수정자',   field: 'lastUpdusrId',  cellStyle: { textAlign: 'left' }, width: 100 },
        {
            headerName: '수정일자', field: 'lastUpdtPnttm',
            cellStyle: { textAlign: 'left' },
            cellRenderer: (p) => {
                if (!p.data?.lastUpdtPnttm) return '';
                return new Date(p.data.lastUpdtPnttm.split(' ')[0]).toLocaleDateString('ko-KR');
            },
        },
        {
            headerName: '세부코드등록', cellStyle: { textAlign: 'center' }, width: 110,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={(e) => { e.preventDefault(); openDetailCodeMoal(p.data?.codeId, '', p.data); }}
                >세부코드등록</button>
            ),
        },
        {
            headerName: '수정', cellStyle: { textAlign: 'center' }, width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={(e) => { e.preventDefault(); openCodeMoal(p.data?.codeId, p.data); }}
                >수정</button>
            ),
        },
        {
            headerName: '삭제', cellStyle: { textAlign: 'center' }, width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray js-code-delete"
                    onClick={(e) => { e.preventDefault(); 
                        handleCodeIdDelete(
                            { code: p.data?.codeId, name: p.data?.codeIdNm },
                            [
                                { key:"systemCode",
                                   value: p.data?.systemCode
                                }
                            ]
                        ); 
                    }}
                >삭제</button>
            ),
        },
    ], [openDetailCodeMoal, openCodeMoal, handleCodeIdDelete]);

    // ── context: 서브 그리드 렌더러에 필요한 콜백 묶음 ──
    const gridContext = useMemo(() => ({
        fetchDetail: (params) => fetchDetailCodeRef.current(params),
        onEdit: openDetailCodeMoal,
        onDelete: handleCodeDelete,
        refreshRows: refreshDetailRows,
        updateUseAt,
    }), [openDetailCodeMoal, handleCodeDelete, refreshDetailRows, updateUseAt]);

    const handleSearchChange = useCallback((e) => {
        const { name, value } = e.target;
        setTempParams({ ...INITIAL_SEARCH_FORM, [name]: value });
    }, []);
    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    return (
        <>
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">기초 관리</div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">기초 관리</li>
                            <li className="breadcrumb-item">코드 관리</li>
                        </ol>
                    </div>
                </div>
                <div className="col-12 content-search">
                    <div className="row g-0 w-100 justify-content-between">
                        <div className="col-auto content-search__option">
                            <CommonSelect
                                comboId="searchSystemCode"
                                comboData={systemOptions || []}
                                value={tempParams.searchSystemCode || ''}
                                onChange={handleSearchChange}
                                placeholder={isLoadingSystem ? '로딩 중...' : '시스템을 선택하세요'}
                                style={{ height: 32, fontSize: 15 }}
                            />
                            <select
                                id="searchCondition"
                                name="searchCondition"
                                ref={searchRef}
                                value={tempParams.searchCondition}
                                onChange={handleInputChange}
                            >
                                <option value="" disabled>선택</option>
                                <option value="codeId">코드</option>
                                <option value="codeIdName">코드명</option>
                            </select>
                            <input
                                type="text"
                                name="searchKeyword"
                                placeholder="검색어를 입력하세요"
                                value={tempParams.searchKeyword}
                                onChange={handleInputChange}
                                onKeyDown={onSearchKeyDown}
                            />
                        </div>
                        <div className="col-auto content-search__action">
                            <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onSearch(1)}>
                                검색
                            </button>
                            <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleReset()}>
                                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 8L15 12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1046 16 14.1046 15.5523 14.8284 14.8284" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                검색 초기화
                            </button>
                            <button type="button" className="btn btn-primary btn-default__blue" onClick={() => openCodeMoal()}>
                                등록
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-12 content-table content-table__main">
                    <MasterDetailGrid
                        columnDefs={colModel}
                        rowData={rowData}
                        getRowId={(params) => params.data.codeId}
                        isRowMaster={(data) => (data ? !!data.codeId : false)}
                        detailCellRenderer={CodeDetailCellRenderer}
                        detailRowHeight={250}
                        pageSize={pageUnit}
                        context={gridContext}
                        onGridReady={(params) => { gridApiRef.current = params.api; }}
                    />
                </div>
            </div>
            <Suspense fallback={null}>
                {codeModalOpen && (
                    <CodeFormModal
                        open={codeModalOpen}
                        form={codeForm}
                        setForm={setCodeForm}
                        onData={systemOptions}
                        onClose={() => setCodeModalOpen(false)}
                        onSubmit={handleCodeIdSubmit}
                    />
                )}
                {codeDetailModalOpen && (
                    <DetailCodeFormModal
                        open={codeDetailModalOpen}
                        form={detailForm}
                        setForm={setDetailForm}
                        onClose={() => setCodeDetailModalOpen(false)}
                        onSubmit={handleCodeSubmit}
                    />
                )}
            </Suspense>
        </>
    );
};

export default CodeInfo;
