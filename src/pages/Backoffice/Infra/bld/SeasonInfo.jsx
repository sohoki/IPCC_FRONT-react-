import React, { useState, useMemo, useCallback, lazy } from 'react';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const SeasonFormModal = lazy(() => import('@/pages/Backoffice/Infra/bld/components/SeasonFormModal.jsx'));

const INITIAL_SEARCH_FORM = { searchCenter: '', searchKeyword: '' };

const SeasonInfo = () => {
    const [pageUnit] = useState(20);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const { options: centerOptions } = useCustomReqDataCombo({
        url: URL.CENTER_COMBO,
        method: 'GET',
        mapping: { id: 'centerId', text: 'centerNm' },
    });

    const fetchData = async (query) => {
        const res = await fnAjaxFetch({ url: URL.SEASON_LIST, method: 'POST', data: query });
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

    const handleOpenModal = useCallback((rowData = null) => {
        setSelectedRow(rowData);
        setModalOpen(true);
    }, []);

    const { handleDelete } = useCommonDelete({
        gridApiRef, URL: URL.SEASON_DELETE, MESSAGE: '시즌', reloadFunction: onSearch,
    });

    const columnDefs = useMemo(() => [
        { headerName: '시즌명', field: 'season_nm', flex: 1 },
        { headerName: '시즌시작일', field: 'season_start_day', width: 120 },
        { headerName: '시즌종료일', field: 'season_end_day', width: 120 },
        { headerName: '사용여부', field: 'use_yn', width: 90 },
        { headerName: '사용지점', field: 'season_centerinfo_nm', flex: 1 },
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
                    onClick={() => handleDelete({ code: p.data?.season_cd, name: p.data?.season_nm })}>삭제</button>
            ),
        },
    ], [handleOpenModal, handleDelete]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">시즌 관리</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">시설 관리</li>
                        <li className="breadcrumb-item">시즌 관리</li>
                    </ol>
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                        <select name="searchCenter" className="form-select" style={{ width: 160 }}
                            value={tempParams.searchCenter} onChange={handleInputChange}>
                            <option value="">전체 지점</option>
                            {centerOptions.map(o => (<option key={o.code} value={o.code}>{o.codeNm}</option>))}
                        </select>
                        <input type="text" name="searchKeyword" placeholder="검색어를 입력하세요"
                            value={tempParams.searchKeyword} onChange={handleInputChange} onKeyDown={onSearchKeyDown} />
                    </div>
                    <div className="col-auto content-search__action">
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onSearch(1)}>검색</button>
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleReset()}>검색 초기화</button>
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenModal()}>시즌 등록</button>
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

            <SeasonFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                rowData={selectedRow}
                centerOptions={centerOptions}
                onSuccess={() => { setModalOpen(false); onSearch(1); }}
            />
        </div>
    );
};

export default SeasonInfo;
