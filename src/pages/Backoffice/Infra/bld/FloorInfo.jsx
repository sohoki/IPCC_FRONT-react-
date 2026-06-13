import React, { useState, useMemo, useCallback, lazy } from 'react';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCustomReqDataCombo, useCommonCodeData } from '@/hooks/use-combo-data.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const FloorFormModal = lazy(() => import('@/pages/Backoffice/Infra/bld/components/FloorFormModal.jsx'));
const PartListModal = lazy(() => import('@/pages/Backoffice/Infra/bld/components/PartListModal.jsx'));

const INITIAL_SEARCH_FORM = { centerCd: '', searchKeyword: '' };

const FloorInfo = () => {
    const [pageUnit] = useState(20);
    const [floorModalOpen, setFloorModalOpen] = useState(false);
    const [partModalOpen, setPartModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const { options: centerOptions } = useCustomReqDataCombo({
        url: URL.CENTER_COMBO,
        method: 'GET',
        mapping: { id: 'centerId', text: 'centerNm' },
    });
    const { options: floorPartOptions } = useCommonCodeData('FLOOR_PART');

    const fetchData = async (query) => {
        const res = await fnAjaxFetch({ url: URL.FLOOR_LIST, method: 'POST', data: query });
        const data = res?.data;
        return {
            rows: data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    };

    const {
        gridApiRef, onGridReady, defaultColDef, tempParams, setTempParams, handleSearch,
    } = useGridInfinite({ fetchApi: fetchData, pageUnit, initialFilters: INITIAL_SEARCH_FORM });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempParams((prev) => ({ ...prev, [name]: value }));
    };
    const onSearch = (pageIndex) => handleSearch(pageIndex || 1);
    const onSearchKeyDown = (e) => { if (e.key === 'Enter') onSearch(1); };
    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    const handleOpenFloorModal = useCallback((rowData) => {
        setSelectedRow(rowData);
        setFloorModalOpen(true);
    }, []);

    const handleOpenPartModal = useCallback((rowData) => {
        setSelectedRow(rowData);
        setPartModalOpen(true);
    }, []);

    const { handleDelete } = useCommonDelete({
        gridApiRef, URL: URL.FLOOR_DELETE, MESSAGE: '층', reloadFunction: onSearch,
    });

    const columnDefs = useMemo(() => [
        {
            headerName: '도면 이미지', field: 'floor_map1', width: 120, sortable: false,
            cellRenderer: (p) => (p.value && p.value !== 'no_image.png')
                ? <img src={`/upload/${p.value}`} style={{ width: 90, height: 50, objectFit: 'cover' }} alt="도면" />
                : <span className="text-muted small">없음</span>,
        },
        { headerName: '층수', field: 'floor_info_txt', width: 100 },
        { headerName: '층 이름', field: 'floor_nm', flex: 1 },
        { headerName: '좌석 현황', field: 'floor_seat_cnt', width: 100 },
        { headerName: '사용 여부', field: 'use_yn', width: 90 },
        { headerName: '수정자', field: 'last_updusr_id', width: 110 },
        { headerName: '수정일자', field: 'last_updt_dtm', width: 120 },
        {
            headerName: '구역', width: 80, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-primary btn-outline__gray" onClick={() => handleOpenPartModal(p.data)}>구역</button>
            ),
        },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify" onClick={() => handleOpenFloorModal(p.data)}>수정</button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleDelete({ code: p.data?.floor_cd, name: p.data?.floor_nm })}>삭제</button>
            ),
        },
    ], [handleOpenFloorModal, handleOpenPartModal, handleDelete]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">층 관리</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">시설 관리</li>
                        <li className="breadcrumb-item">층 관리</li>
                    </ol>
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                        <select name="centerCd" className="form-select" style={{ width: 180 }}
                            value={tempParams.centerCd} onChange={handleInputChange}>
                            <option value="">전체 지점</option>
                            {centerOptions.map(o => (<option key={o.code} value={o.code}>{o.codeNm}</option>))}
                        </select>
                        <input type="text" name="searchKeyword" placeholder="검색어를 입력하세요"
                            value={tempParams.searchKeyword} onChange={handleInputChange} onKeyDown={onSearchKeyDown} />
                    </div>
                    <div className="col-auto content-search__action">
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onSearch(1)}>검색</button>
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleReset()}>검색 초기화</button>
                    </div>
                </div>
            </div>
            <div className="col-12 content-table content-table__main">
                <div className="ag-theme-material" style={{ width: '100%' }}>
                    <AppAgGrid
                        columnDefs={columnDefs}
                        theme={gridTheme}
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

            <FloorFormModal
                open={floorModalOpen}
                onClose={() => setFloorModalOpen(false)}
                rowData={selectedRow}
                floorPartOptions={floorPartOptions}
                onSuccess={() => { setFloorModalOpen(false); onSearch(1); }}
            />

            <PartListModal
                open={partModalOpen}
                onClose={() => setPartModalOpen(false)}
                floor={selectedRow}
            />
        </div>
    );
};

export default FloorInfo;
