import React, { useState, useMemo, useCallback, lazy } from 'react';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const SeatFormModal = lazy(() => import('@/pages/Backoffice/Infra/bld/components/SeatFormModal.jsx'));

const INITIAL_SEARCH_FORM = {
    searchCenterCd: '',
    searchFloorCd: '',
    searchPartCd: '',
    searchKeyword: '',
};

// 콤보 응답에서 목록 추출 (lmap/VO 공통)
const extractList = (res) => {
    const raw = res?.data?.result;
    return Array.isArray(raw) ? raw : (raw?.resultList || raw?.result || []);
};

const SeatInfo = () => {
    const [pageUnit] = useState(20);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    // 지점 콤보
    const { options: centerOptions } = useCustomReqDataCombo({
        url: URL.CENTER_COMBO,
        method: 'GET',
        mapping: { id: 'centerId', text: 'centerNm' },
    });

    // 검색바 종속 콤보 (지점→층→구역)
    const [floorOptions, setFloorOptions] = useState([]);
    const [partOptions, setPartOptions] = useState([]);

    const fetchData = async (query) => {
        const res = await fnAjaxFetch({ url: URL.SEAT_LIST, method: 'POST', data: query });
        const data = res?.data;
        return {
            rows: data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    };

    const {
        gridApiRef,
        onGridReady,
        defaultColDef,
        tempParams,
        setTempParams,
        handleSearch,
    } = useGridInfinite({ fetchApi: fetchData, pageUnit, initialFilters: INITIAL_SEARCH_FORM });

    // 지점 변경 시 층 콤보 조회 / 구역 초기화
    const onCenterChange = useCallback(async (centerCd) => {
        setTempParams((prev) => ({ ...prev, searchCenterCd: centerCd, searchFloorCd: '', searchPartCd: '' }));
        setPartOptions([]);
        if (!centerCd) { setFloorOptions([]); return; }
        try {
            const res = await fnAjaxFetch({ url: `${URL.FLOOR_COMBO}/${encodeURIComponent(centerCd)}.do`, method: 'GET', withCredentials: true, showLoading: false });
            setFloorOptions(extractList(res));
        } catch { setFloorOptions([]); }
    }, [setTempParams]);

    // 층 변경 시 구역 콤보 조회
    const onFloorChange = useCallback(async (floorCd) => {
        setTempParams((prev) => ({ ...prev, searchFloorCd: floorCd, searchPartCd: '' }));
        if (!floorCd) { setPartOptions([]); return; }
        try {
            const res = await fnAjaxFetch({ url: `${URL.BLD_PART_COMBO}/${encodeURIComponent(floorCd)}.do`, method: 'GET', withCredentials: true, showLoading: false });
            setPartOptions(extractList(res));
        } catch { setPartOptions([]); }
    }, [setTempParams]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempParams((prev) => ({ ...prev, [name]: value }));
    };

    const onSearch = (pageIndex) => handleSearch(pageIndex || 1);
    const onSearchKeyDown = (e) => { if (e.key === 'Enter') onSearch(1); };

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);
    const onReset = () => { handleReset(); setFloorOptions([]); setPartOptions([]); };

    const handleOpenModal = useCallback((rowData = null) => {
        setSelectedRow(rowData);
        setModalOpen(true);
    }, []);

    const { handleDelete } = useCommonDelete({
        gridApiRef,
        URL: URL.SEAT_DELETE,
        MESSAGE: '좌석',
        reloadFunction: onSearch,
    });

    const columnDefs = useMemo(() => [
        { headerName: '지점', field: 'center_nm', width: 120 },
        { headerName: '층수', field: 'floor_nm', width: 110 },
        { headerName: '구역', field: 'part_nm', width: 120 },
        { headerName: '좌석명', field: 'seat_nm', flex: 1 },
        { headerName: '좌석등급', field: 'seat_class_txt', width: 110 },
        { headerName: '금액', field: 'part_pay_cost', width: 100 },
        { headerName: '정렬순서', field: 'seat_order', width: 90 },
        { headerName: '사용여부', field: 'use_yn', width: 90 },
        { headerName: '수정일자', field: 'last_updt_dtm', width: 120 },
        { headerName: '수정자', field: 'last_updusr_id', width: 110 },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify" onClick={() => handleOpenModal(p.data)}>수정</button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleDelete({ code: p.data?.seat_cd, name: p.data?.seat_nm })}>삭제</button>
            ),
        },
    ], [handleOpenModal, handleDelete]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">좌석 관리</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">시설 관리</li>
                        <li className="breadcrumb-item">좌석 관리</li>
                    </ol>
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                        <select name="searchCenterCd" className="form-select" style={{ width: 150 }}
                            value={tempParams.searchCenterCd} onChange={(e) => onCenterChange(e.target.value)}>
                            <option value="">전체 지점</option>
                            {centerOptions.map(o => (<option key={o.code} value={o.code}>{o.codeNm}</option>))}
                        </select>
                        <select name="searchFloorCd" className="form-select" style={{ width: 130 }}
                            value={tempParams.searchFloorCd} onChange={(e) => onFloorChange(e.target.value)}>
                            <option value="">전체 층</option>
                            {floorOptions.map(o => (<option key={o.floor_cd} value={o.floor_cd}>{o.floor_nm}</option>))}
                        </select>
                        <select name="searchPartCd" className="form-select" style={{ width: 130 }}
                            value={tempParams.searchPartCd} onChange={handleInputChange}>
                            <option value="">전체 구역</option>
                            {partOptions.map(o => (<option key={o.part_cd} value={o.part_cd}>{o.part_nm}</option>))}
                        </select>
                        <input type="text" name="searchKeyword" placeholder="검색어를 입력하세요"
                            value={tempParams.searchKeyword} onChange={handleInputChange} onKeyDown={onSearchKeyDown} />
                    </div>
                    <div className="col-auto content-search__action">
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onSearch(1)}>검색</button>
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={onReset}>검색 초기화</button>
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenModal()}>좌석 등록</button>
                    </div>
                </div>
            </div>
            <div className="col-12 content-table content-table__main">
                <div className="ag-theme-quartz" style={{ width: '100%' }}>
                    <AgGridReact
                        columnDefs={columnDefs}
                        theme={themeQuartz}
                        defaultColDef={defaultColDef}
                        rowModelType="infinite"
                        pagination={true}
                        paginationPageSize={pageUnit}
                        paginationPageSizeSelector={[10, 20, 50, 100]}
                        cacheBlockSize={pageUnit}
                        maxBlocksInCache={2}
                        domLayout="autoHeight"
                        overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
                        overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
                        onGridReady={onGridReady}
                    />
                </div>
            </div>

            <SeatFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                rowData={selectedRow}
                centerOptions={centerOptions}
                onSuccess={() => { setModalOpen(false); onSearch(1); }}
            />
        </div>
    );
};

export default SeatInfo;
