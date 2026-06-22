import React, { useState, useMemo, useCallback, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const CtiDnFormModal    = lazy(() => import('@/pages/Backoffice/Infra/pgx/cti/components/CtiDnFormModal.jsx'));
const CtiLoginFormModal = lazy(() => import('@/pages/Backoffice/Infra/pgx/cti/components/CtiLoginFormModal.jsx'));

const INITIAL_DN_SEARCH    = { searchCondition: '', searchKeyword: '' };
const INITIAL_LOGIN_SEARCH = { searchCondition: '', searchKeyword: '' };

const SearchIcon = () => (
    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.7 5C12.0791 5 13.4018 5.58699 14.377 6.63183C15.3521 7.67668 15.9 9.09379 15.9 10.5714C15.9 11.9514 15.428 13.22 14.652 14.1971L14.868 14.4286H15.5L19.5 18.7143L18.3 20L14.3 15.7143V15.0371L14.084 14.8057C13.172 15.6371 11.988 16.1429 10.7 16.1429C9.32087 16.1429 7.99823 15.5559 7.02304 14.511C6.04786 13.4662 5.5 12.0491 5.5 10.5714C5.5 9.09379 6.04786 7.67668 7.02304 6.63183C7.99823 5.58699 9.32087 5 10.7 5ZM10.7 6.71429C8.7 6.71429 7.1 8.42857 7.1 10.5714C7.1 12.7143 8.7 14.4286 10.7 14.4286C12.7 14.4286 14.3 12.7143 14.3 10.5714C14.3 8.42857 12.7 6.71429 10.7 6.71429Z" fill="currentColor"/>
    </svg>
);

const ResetIcon = () => (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 8L15 12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1046 16 14.1046 15.5523 14.8284 14.8284" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const AddIcon = () => (
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
    </svg>
);

const CtiDnInfo = () => {
    const [activeTab, setActiveTab] = useState('dn');
    const [pageUnit] = useState(20);

    // ── DN ──
    const [dnFormOpen, setDnFormOpen]       = useState(false);
    const [selectedDn, setSelectedDn]       = useState(null);
    const [selectedRowData, setSelectedRowData] = useState(null);

    const fetchDnData = async (query) => {
        const res = await fnAjaxFetch({ url: URL.CTI_DN_LIST, method: 'POST', data: query });
        const data = res?.data;
        return {
            rows:  data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    };

    const {
        onGridReady: onDnGridReady,
        defaultColDef: dnDefaultColDef,
        tempParams: dnParams,
        setTempParams: setDnParams,
        handleSearch: handleDnSearch,
    } = useGridInfinite({ fetchApi: fetchDnData, pageUnit, initialFilters: INITIAL_DN_SEARCH });

    const { handleReset: resetDn } = useResetForm(setDnParams, INITIAL_DN_SEARCH);
    const onDnSearch = useCallback((p) => handleDnSearch(p || 1), [handleDnSearch]);

    const handleOpenDnForm = useCallback((rowData = null) => {
        setSelectedDn(rowData ? rowData.dn : null);
        setSelectedRowData(rowData);
        setDnFormOpen(true);
    }, []);

    const handleDnDelete = useCallback(async (dn, centerId, tenantId, dnmajorId) => {
        const first = await Swal.fire({
            icon: 'question', title: 'DN 삭제',
            html: `<b>${dn}</b> 를 삭제 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오', focusCancel: true,
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            icon: 'warning', title: 'DN 삭제 확인',
            html: `<b>${dn}</b> 를 삭제하시면 시스템에 영향이 있을 수 있습니다.<br>정말로 삭제하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오', focusCancel: true,
        });
        if (!second.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_DN_DELETE, method: 'POST',
                data: { dn, centerId, tenantId, dnmajorId }, withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
                handleDnSearch(1);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [handleDnSearch]);

    const dnColumnDefs = useMemo(() => [
        { headerName: '센터명',      field: 'centerName',    width: 110 },
        { headerName: '테넌트명',    field: 'tenantName',    width: 110 },
        { headerName: 'DN 대분류',   field: 'dnmajorId',     width: 100 },
        { headerName: 'DN 소분류',   field: 'dnsubId',       width: 100 },
        { headerName: 'DN',          field: 'dn',            width: 110 },
        { headerName: 'MediaId',     field: 'mediaId',       width: 90 },
        { headerName: '부미디어',    field: 'submediaId',    width: 80 },
        { headerName: '모델명',      field: 'dnModelname',   width: 110 },
        { headerName: 'ServiceDesc', field: 'dnServicedesc', width: 110 },
        { headerName: '종류',        field: 'dnKind',        width: 80 },
        { headerName: '유형',        field: 'dnType',        width: 80 },
        { headerName: 'IP',          field: 'dnIp',          width: 100 },
        { headerName: '감청여부',    field: 'observerFlag',  width: 90 },
        { headerName: '감시',        field: 'monitorFlag',   width: 80 },
        { headerName: 'tag',         field: 'tag',           width: 80 },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify" onClick={() => handleOpenDnForm(p.data)}>
                    수정
                </button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleDnDelete(p.data?.dn, p.data?.centerId, p.data?.tenantId, p.data?.dnmajorId)}
                >
                    삭제
                </button>
            ),
        },
    ], [handleOpenDnForm, handleDnDelete]);

    // ── Login ──
    const [loginFormOpen, setLoginFormOpen] = useState(false);

    const fetchLoginData = async (query) => {
        const res = await fnAjaxFetch({ url: URL.CTI_LOGIN_ID_LIST, method: 'POST', data: query });
        const data = res?.data;
        return {
            rows:  data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    };

    const {
        onGridReady: onLoginGridReady,
        defaultColDef: loginDefaultColDef,
        tempParams: loginParams,
        setTempParams: setLoginParams,
        handleSearch: handleLoginSearch,
    } = useGridInfinite({ fetchApi: fetchLoginData, pageUnit, initialFilters: INITIAL_LOGIN_SEARCH });

    const { handleReset: resetLogin } = useResetForm(setLoginParams, INITIAL_LOGIN_SEARCH);
    const onLoginSearch = useCallback((p) => handleLoginSearch(p || 1), [handleLoginSearch]);

    const handleLoginDelete = useCallback(async (loginId, centerId, mediaId) => {
        const first = await Swal.fire({
            icon: 'question', title: 'LoginId 삭제',
            html: `<b>${loginId}</b> 를 삭제 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오', focusCancel: true,
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            icon: 'warning', title: 'LoginId 삭제 확인',
            html: `<b>${loginId}</b> 를 삭제하시면 시스템에 영향이 있을 수 있습니다.<br>정말로 삭제하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오', focusCancel: true,
        });
        if (!second.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_LOGIN_ID_DELETE, method: 'POST',
                data: { loginId, centerId, mediaId }, withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
                handleLoginSearch(1);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
                handleLoginSearch(1);
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
            handleLoginSearch(1);
        }
    }, [handleLoginSearch]);

    const loginColumnDefs = useMemo(() => [
        { headerName: '로그인ID', field: 'loginId',     width: 150 },
        { headerName: '지점',     field: 'centerName',  flex: 1 },
        { headerName: '미디어',   field: 'mediaName',   flex: 1 },
        { headerName: '감시',     field: 'monitorFlag', width: 90 },
        { headerName: '생성일',   field: 'createDate',  width: 150 },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleLoginDelete(p.data?.loginId, p.data?.centerId, p.data?.mediaId)}
                >
                    삭제
                </button>
            ),
        },
    ], [handleLoginDelete]);

    const gridProps = {
        theme: gridTheme,
        rowModelType: 'infinite',
        pagination: true,
        paginationPageSize: pageUnit,
        paginationPageSizeSelector: [10, 20, 50, 100],
        cacheBlockSize: pageUnit,
        maxBlocksInCache: 2,
        domLayout: 'autoHeight',
        overlayNoRowsTemplate: "<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>",
        overlayLoadingTemplate: "<span class='ag-overlay-loading-center'>조회 중..</span>",
    };

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">CTI DN / 로그인 관리</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">인프라 관리</li>
                        <li className="breadcrumb-item">CTI DN / 로그인 관리</li>
                    </ol>
                </div>
            </div>

            {/* 탭 */}
            <div className="col-12" style={{ padding: '0 16px' }}>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button
                            type="button"
                            className={`nav-link${activeTab === 'dn' ? ' active' : ''}`}
                            onClick={() => setActiveTab('dn')}
                        >
                            DN 현황
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            type="button"
                            className={`nav-link${activeTab === 'login' ? ' active' : ''}`}
                            onClick={() => setActiveTab('login')}
                        >
                            로그인 관리
                        </button>
                    </li>
                </ul>
            </div>

            {/* ─── DN 탭 ─── */}
            {activeTab === 'dn' && (
                <>
                    <div className="col-12 content-search">
                        <div className="row g-0 w-100 justify-content-between">
                            <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                                <select
                                    name="searchCondition"
                                    className="form-select" style={{ width: 120 }}
                                    value={dnParams.searchCondition}
                                    onChange={(e) => setDnParams(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                >
                                    <option value="">선택</option>
                                    <option value="dn">DN</option>
                                </select>
                                <input
                                    type="text"
                                    name="searchKeyword"
                                    placeholder="검색어를 입력하세요"
                                    value={dnParams.searchKeyword}
                                    onChange={(e) => setDnParams(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onDnSearch(1); }}
                                />
                            </div>
                            <div className="col-auto content-search__action">
                                <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onDnSearch(1)}>
                                    <SearchIcon />검색
                                </button>
                                <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={resetDn}>
                                    <ResetIcon />검색초기화
                                </button>
                                <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenDnForm()}>
                                    <AddIcon />개별 등록
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 content-table content-table__main">
                        <div className="ag-theme-material" style={{ width: '100%' }}>
                            <AppAgGrid
                                {...gridProps}
                                columnDefs={dnColumnDefs}
                                defaultColDef={dnDefaultColDef}
                                onGridReady={onDnGridReady}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* ─── 로그인 탭 ─── */}
            {activeTab === 'login' && (
                <>
                    <div className="col-12 content-search">
                        <div className="row g-0 w-100 justify-content-between">
                            <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                                <select
                                    name="searchCondition"
                                    className="form-select" style={{ width: 120 }}
                                    value={loginParams.searchCondition}
                                    onChange={(e) => setLoginParams(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                >
                                    <option value="">선택</option>
                                    <option value="loginId">LoginId</option>
                                </select>
                                <input
                                    type="text"
                                    name="searchKeyword"
                                    placeholder="검색어를 입력하세요"
                                    value={loginParams.searchKeyword}
                                    onChange={(e) => setLoginParams(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') onLoginSearch(1); }}
                                />
                            </div>
                            <div className="col-auto content-search__action">
                                <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onLoginSearch(1)}>
                                    <SearchIcon />검색
                                </button>
                                <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={resetLogin}>
                                    <ResetIcon />검색초기화
                                </button>
                                <button type="button" className="btn btn-primary btn-default__blue" onClick={() => setLoginFormOpen(true)}>
                                    <AddIcon />개별 등록
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 content-table content-table__main">
                        <div className="ag-theme-material" style={{ width: '100%' }}>
                            <AppAgGrid
                                {...gridProps}
                                columnDefs={loginColumnDefs}
                                defaultColDef={loginDefaultColDef}
                                onGridReady={onLoginGridReady}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* 모달 */}
            <CtiDnFormModal
                key={dnFormOpen ? (selectedDn ?? 'new') : 'closed'}
                open={dnFormOpen}
                onClose={() => setDnFormOpen(false)}
                dn={selectedDn}
                rowData={selectedRowData}
                onSuccess={() => { setDnFormOpen(false); onDnSearch(1); }}
            />
            <CtiLoginFormModal
                key={loginFormOpen ? 'open' : 'closed'}
                open={loginFormOpen}
                onClose={() => setLoginFormOpen(false)}
                onSuccess={() => { setLoginFormOpen(false); onLoginSearch(1); }}
            />
        </div>
    );
};

export default CtiDnInfo;
