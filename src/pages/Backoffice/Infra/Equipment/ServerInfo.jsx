import React, { useState, useMemo, useCallback, useEffect, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const ServerFormModal   = lazy(() => import('@/pages/Backoffice/Infra/Equipment/components/ServerFormModal.jsx'));
const ServerStatusModal = lazy(() => import('@/pages/Backoffice/Infra/Equipment/components/ServerStatusModal.jsx'));

const INITIAL_SEARCH_FORM = {
    searchSystemCode: '',
    searchKeyword: '',
};

const ServerInfo = () => {
    const [pageUnit] = useState(20);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [selectedServerCode, setSelectedServerCode] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState(null);

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [statusTarget, setStatusTarget] = useState({ serverCode: '', serverName: '' });

    const { options: systemCodeOptions }   = useCommonCodeData('SYSTEM_GUBUN');
    const { options: serverMethodOptions } = useCommonCodeData('SERVER_CON_GUBUN');

    const [systemOptions,  setSystemOptions]  = useState([]);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [summary, setSummary] = useState({ totalCount: '-', normalCount: '-', failCount: '-', unknownCount: '-', activeCount: '-' });

    useEffect(() => {
        let active = true;
        const extractList = (res) => {
            const d = res?.data;
            const raw = d?.result;
            return Array.isArray(raw) ? raw : (raw?.resultList || raw?.result || d?.resultList || []);
        };
        fnAjaxFetch({ url: URL.SERVER_SYSTEM_COMBO, method: 'GET', withCredentials: true, showLoading: false })
            .then(res => {
                if (!active) return;
                setSystemOptions(extractList(res).map(o => ({ code: o.systemCode, codeNm: o.systemName || o.systemCode })));
            }).catch((e) => { console.warn('[ServerInfo] systemOptions fetch blocked:', e?.message); });
        fnAjaxFetch({ url: URL.SERVER_COMPANY_COMBO,
                    method: 'POST',
                    data: { searchUseyn: 'Y' },
                    withCredentials: true,
                    showLoading: false
                    })
            .then(res => {
                if (!active) return;
                setCompanyOptions(extractList(res).map(o => ({ code: o.comCode , codeNm: o.comName })));
            }).catch((e) => { console.warn('[ServerInfo] companyOptions fetch blocked:', e?.message); });
        fnAjaxFetch({ url: URL.SERVER_SUMMARY, method: 'GET', withCredentials: true, showLoading: false })
            .then(res => {
                if (!active) return;
                const d = res?.data?.result?.result ?? res?.data?.result ?? {};
                setSummary({
                    totalCount:   d.totalCount   ?? d.total_count   ?? '-',
                    normalCount:  d.normalCount  ?? d.normal_count  ?? '-',
                    failCount:    d.failCount    ?? d.fail_count    ?? '-',
                    unknownCount: d.unknownCount ?? d.unknown_count ?? '-',
                    activeCount:  d.activeCount  ?? d.active_count  ?? '-',
                });
            }).catch((e) => { console.warn('[ServerInfo] summary fetch error:', e?.message); });
        return () => { active = false; };
    }, []);

    const fetchData = async (query) => {
        const res = await fnAjaxFetch({
            url: URL.SERVER_INFO_LIST,
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
    const onSearchKeyDown = (e) => { if (e.key === 'Enter') onSearch(1); };

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    const handleOpenStatusModal = useCallback((data) => {
        setStatusTarget({ serverCode: data?.serverCode || '', serverName: data?.serverName || '' });
        setStatusModalOpen(true);
    }, []);

    const handleOpenFormModal = useCallback((rowData = null) => {
        setSelectedServerCode(rowData ? rowData.serverCode : null);
        setSelectedRowData(rowData);
        setFormModalOpen(true);
    }, []);

    const handleStatusCheck = useCallback(async (serverCode) => {
        try {
            const res = await fnAjaxFetch({
                url: `${URL.SERVER_STATUS_CHECK}/${encodeURIComponent(serverCode)}.do`,
                method: 'GET',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '서버 상태가 정상입니다.' });
            } else {
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '서버 상태를 확인해 주세요.' });
            }
            handleSearch(1);
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [handleSearch]);

    const handleDelete = useCallback(async (serverCode) => {
        const first = await Swal.fire({
            icon: 'question', title: '서버 정보 삭제',
            html: `<b>${serverCode}</b> 를(을) 삭제 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            icon: 'warning', title: '서버 정보 삭제 확인',
            html: `<b>${serverCode}</b> 를(을) 삭제하시면 시스템에 영향이 있을 수 있습니다.<br>정말로 삭제하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!second.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: `${URL.SERVER_INFO}/${encodeURIComponent(serverCode)}.do`,
                method: 'DELETE',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
                handleSearch(1);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [handleSearch]);

    const columnDefs = useMemo(() => [
        { headerName: '시스템 코드',  field: 'systemName',        width: 130 },
        { headerName: '서버위치',     field: 'serverLocationInfo', flex: 1 },
        {
            headerName: '상태', field: 'serverStatus', width: 95,
            cellStyle: { overflow: 'visible' },
            cellRenderer: (p) => {
                const val = String(p.value || '').toLowerCase();
                const isFail  = val === 'fail';
                const isEmpty = !p.value;
                const color = isFail ? '#dc3545' : isEmpty ? '#adb5bd' : '#0d6efd';
                const label = isFail ? '에러' : isEmpty ? '미확인' : '정상';
                return (
                    <div
                        className="d-flex align-items-center gap-1 h-100"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenStatusModal(p.data)}
                    >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 13, color }}>{label}</span>
                    </div>
                );
            },
        },
        { headerName: '서버명',       field: 'serverName',         flex: 1 },
        { headerName: '서버IP',       field: 'serverIp',           width: 140 },
        { headerName: 'PORT',         field: 'serverPort',         width: 80 },
        {
            headerName: '연동방법', field: 'serverMethodTxt', width: 120,
            cellStyle: { overflow: 'visible' },
            cellRenderer: (p) => (
                <button
                    className="btn btn-outline-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleStatusCheck(p.data?.serverCode)}
                >
                    {p.value || '-'}
                </button>
            ),
        },
        { headerName: '사용유무',   field: 'serverUseyn',   width: 90 },
        { headerName: '최종접속일', field: 'serverEndTime', width: 150 },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellStyle: { overflow: 'visible' },
            cellRenderer: (p) => (
                <button
                    className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleOpenFormModal(p.data)}
                >
                    수정
                </button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellStyle: { overflow: 'visible' },
            cellRenderer: (p) => (
                <button
                    className="btn btn-outline-danger btn-outline__gray btn-delete"
                    style={{ whiteSpace: 'nowrap' }}
                    onClick={() => handleDelete(p.data?.serverCode)}
                >
                    삭제
                </button>
            ),
        },
    ], [handleOpenFormModal, handleOpenStatusModal, handleStatusCheck, handleDelete]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">서버 현황</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">인프라 관리</li>
                        <li className="breadcrumb-item">서버 현황</li>
                    </ol>
                </div>
            </div>
            <div className="col-12" style={{ padding: '12px 20px 4px' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    {[
                        { label: '전체 서버',   sub: 'Total Servers',   value: summary.totalCount,   color: '#6366f1', icon: '🖥' },
                        { label: '정상 서버',   sub: 'Normal',          value: summary.normalCount,  color: '#22c55e', icon: '✅' },
                        { label: '에러 서버',   sub: 'Error',           value: summary.failCount,    color: '#ef4444', icon: '❌' },
                        { label: '미확인 서버', sub: 'Unknown',         value: summary.unknownCount, color: '#f59e0b', icon: '❓' },
                        { label: '사용중 서버', sub: 'Active',          value: summary.activeCount,  color: '#06b6d4', icon: '⚡' },
                    ].map(({ label, sub, value, color, icon }) => (
                        <div
                            key={label}
                            style={{
                                flex: 1,
                                background: 'linear-gradient(145deg, #1e2533 0%, #252d3f 100%)',
                                borderRadius: 10,
                                padding: '16px 18px 14px',
                                border: '1px solid rgba(255,255,255,0.07)',
                                position: 'relative',
                                overflow: 'hidden',
                                minWidth: 0,
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <span style={{ fontSize: 11, color: '#8892a4', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
                                <span style={{ fontSize: 16 }}>{icon}</span>
                            </div>
                            <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-1px' }}>
                                {value}
                            </div>
                            <div style={{ fontSize: 11, color: '#6b7a96', marginTop: 4 }}>{sub}</div>
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '0 0 10px 10px' }} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                        <select
                            name="searchSystemCode"
                            className="form-select" style={{ width: 160 }}
                            value={tempParams.searchSystemCode}
                            onChange={handleInputChange}
                        >
                            <option value="">전체 시스템구분</option>
                            {systemCodeOptions.map(o => (
                                <option key={o.code} value={o.code}>{o.codeNm}</option>
                            ))}
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
                            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.7 5C12.0791 5 13.4018 5.58699 14.377 6.63183C15.3521 7.67668 15.9 9.09379 15.9 10.5714C15.9 11.9514 15.428 13.22 14.652 14.1971L14.868 14.4286H15.5L19.5 18.7143L18.3 20L14.3 15.7143V15.0371L14.084 14.8057C13.172 15.6371 11.988 16.1429 10.7 16.1429C9.32087 16.1429 7.99823 15.5559 7.02304 14.511C6.04786 13.4662 5.5 12.0491 5.5 10.5714C5.5 9.09379 6.04786 7.67668 7.02304 6.63183C7.99823 5.58699 9.32087 5 10.7 5ZM10.7 6.71429C8.7 6.71429 7.1 8.42857 7.1 10.5714C7.1 12.7143 8.7 14.4286 10.7 14.4286C12.7 14.4286 14.3 12.7143 14.3 10.5714C14.3 8.42857 12.7 6.71429 10.7 6.71429Z" fill="currentColor"/>
                            </svg>
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
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenFormModal()}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                            </svg>
                            서버 정보 등록
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
                        overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
                        overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
                        onGridReady={onGridReady}
                    />
                </div>
            </div>

            <ServerFormModal
                open={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                serverCode={selectedServerCode}
                rowData={selectedRowData}
                onSuccess={() => { setFormModalOpen(false); onSearch(1); }}
                serverMethodOptions={serverMethodOptions}
                systemOptions={systemOptions}
                companyOptions={companyOptions}
            />
            <ServerStatusModal
                open={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                serverCode={statusTarget.serverCode}
                serverName={statusTarget.serverName}
            />
        </div>
    );
};

export default ServerInfo;
