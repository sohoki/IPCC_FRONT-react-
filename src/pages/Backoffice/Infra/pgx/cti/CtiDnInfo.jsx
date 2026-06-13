import React, { useState, useMemo, useCallback, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const CtiDnFormModal = lazy(() => import('@/pages/Backoffice/Infra/pgx/cti/components/CtiDnFormModal.jsx'));

const INITIAL_SEARCH_FORM = {
    searchCondition: '',
    searchKeyword: '',
};

const CtiDnInfo = () => {
    const [pageUnit] = useState(20);

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [selectedDn, setSelectedDn] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState(null);

    const fetchData = async (query) => {
        const res = await fnAjaxFetch({
            url: URL.CTI_DN_LIST,
            method: 'POST',
            data: query,
        });
        const data = res?.data;
        return {
            rows: data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    };

    const {
        onGridReady,
        defaultColDef,
        tempParams,
        setTempParams,
        handleSearch,
    } = useGridInfinite({
        fetchApi: fetchData,
        pageUnit,
        initialFilters: INITIAL_SEARCH_FORM,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempParams((prev) => ({ ...prev, [name]: value }));
    };

    const onSearch = (pageIndex) => handleSearch(pageIndex || 1);

    const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') onSearch(1);
    };

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    const handleOpenFormModal = useCallback((rowData = null) => {
        setSelectedDn(rowData ? rowData.dn : null);
        setSelectedRowData(rowData);
        setFormModalOpen(true);
    }, []);

    const handleDelete = useCallback(async (dn, centerId, tenantId, dnmajorId) => {
        const first = await Swal.fire({
            icon: 'question',
            title: 'DN ??��',
            html: `<b>${dn}</b> �??? ??�� ?�시겠습?�까?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?�니??,
            focusCancel: true,
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            icon: 'warning',
            title: 'DN ??�� ?�인',
            html: `<b>${dn}</b> �??? ??��?�시�??�스?�에 ?�향???�을 ???�습?�다.<br>?�말�???��?�시겠습?�까?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?�니??,
            focusCancel: true,
        });
        if (!second.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_DN_DELETE,
                method: 'POST',
                data: { dn, centerId, tenantId, dnmajorId },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??��?�었?�니??' });
                handleSearch(1);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '??��???�패?�습?�다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 �??�류가 발생?�습?�다.' });
        }
    }, [handleSearch]);

    const columnDefs = useMemo(() => [
        { headerName: '?�터�?, field: 'centerName', width: 110 },
        { headerName: '?�넌?�명', field: 'tenantName', width: 110 },
        { headerName: 'DN ?�분류', field: 'dnmajorId', width: 100 },
        { headerName: 'DN ?�분�?, field: 'dnsubId', width: 100 },
        { headerName: 'DN', field: 'dn', width: 110 },
        { headerName: 'MediaId', field: 'mediaId', width: 90 },
        { headerName: '부미디??, field: 'submediaId', width: 80 },
        { headerName: '모델�?, field: 'dnModelname', width: 110 },
        { headerName: 'ServiceDesc', field: 'dnServicedesc', width: 110 },
        { headerName: '종류', field: 'dnKind', width: 80 },
        { headerName: '?�??, field: 'dnType', width: 80 },
        { headerName: 'IP', field: 'dnIp', width: 100 },
        { headerName: '감청?��?', field: 'observerFlag', width: 90 },
        { headerName: '감시', field: 'monitorFlag', width: 80 },
        { headerName: 'tag', field: 'tag', width: 80 },
        {
            headerName: '?�정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button
                    className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => handleOpenFormModal(p.data)}
                >
                    ?�정
                </button>
            ),
        },
        {
            headerName: '??��', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button
                    className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleDelete(
                        p.data?.dn,
                        p.data?.centerId,
                        p.data?.tenantId,
                        p.data?.dnmajorId,
                    )}
                >
                    ??��
                </button>
            ),
        },
    ], [handleOpenFormModal, handleDelete]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">CTI DN ?�황</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">?�프??관�?/li>
                        <li className="breadcrumb-item">CTI DN ?�황</li>
                    </ol>
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                        <select
                            name="searchCondition"
                            className="form-select"
                            style={{ width: 120 }}
                            value={tempParams.searchCondition}
                            onChange={handleInputChange}
                        >
                            <option value="">?�택</option>
                            <option value="dn">DN</option>
                        </select>
                        <input
                            type="text"
                            name="searchKeyword"
                            placeholder="검?�어�??�력?�세??
                            value={tempParams.searchKeyword}
                            onChange={handleInputChange}
                            onKeyDown={onSearchKeyDown}
                        />
                    </div>
                    <div className="col-auto content-search__action">
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onSearch(1)}>
                            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.7 5C12.0791 5 13.4018 5.58699 14.377 6.63183C15.3521 7.67668 15.9 9.09379 15.9 10.5714C15.9 11.9514 15.428 13.22 14.652 14.1971L14.868 14.4286H15.5L19.5 18.7143L18.3 20L14.3 15.7143V15.0371L14.084 14.8057C13.172 15.6371 11.988 16.1429 10.7 16.1429C9.32087 16.1429 7.99823 15.5559 7.02304 14.511C6.04786 13.4662 5.5 12.0491 5.5 10.5714C5.5 9.09379 6.04786 7.67668 7.02304 6.63183C7.99823 5.58699 9.32087 5 10.7 5ZM10.7 6.71429C8.7 6.71429 7.1 8.42857 7.1 10.5714C7.1 12.7143 8.7 14.4286 10.7 14.4286C12.7 14.4286 14.3 12.7143 14.3 10.5714C14.3 8.42857 12.7 6.71429 10.7 6.71429Z" fill="currentColor"/>
                            </svg>
                            검??                        </button>
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleReset()}>
                            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 8L15 12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1046 16 14.1046 15.5523 14.8284 14.8284" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            검??초기??                        </button>
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenFormModal()}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                            </svg>
                            개별 ?�록
                        </button>
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
                        overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>?�이?��? ?�습?�다.</span>"
                        overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 �?..</span>"
                        onGridReady={onGridReady}
                    />
                </div>
            </div>

            <CtiDnFormModal
                open={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                dn={selectedDn}
                rowData={selectedRowData}
                onSuccess={() => { setFormModalOpen(false); onSearch(1); }}
            />
        </div>
    );
};

export default CtiDnInfo;
