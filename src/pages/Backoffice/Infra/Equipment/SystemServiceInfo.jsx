import React, { useState, useMemo, useCallback, useRef, useEffect, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import MasterDetailGrid from '@/components/Common/MasterDetailGrid.jsx';
import SystemServiceOidDetailRenderer from './components/SystemServiceOidDetailRenderer.jsx';

const SystemServiceFormModal = lazy(() => import('./components/SystemServiceFormModal.jsx'));
const SystemServiceOidFormModal = lazy(() => import('./components/SystemServiceOidFormModal.jsx'));

const INITIAL_SEARCH_FORM = { searchSystemCode: '', searchKeyword: '' };

const SystemServiceInfo = () => {
    const gridApiRef = useRef(null);
    const [rowData, setRowData] = useState([]);
    const [tempParams, setTempParams] = useState(INITIAL_SEARCH_FORM);
    const [selectedServiceSeq, setSelectedServiceSeq] = useState(null);

    const [serviceFormOpen, setServiceFormOpen] = useState(false);
    const [serviceModalData, setServiceModalData] = useState({ serviceSeq: null, rowData: null });

    const [oidFormOpen, setOidFormOpen] = useState(false);
    const [oidModalData, setOidModalData] = useState({ serviceSeq: '', oidSeq: null, oidData: null });

    const { options: systemCodeOptions } = useCommonCodeData('SYSTEM_GUBUN');
    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempParams(prev => ({ ...prev, [name]: value }));
    };

    const fetchServiceList = useCallback(async (query) => {
        const res = await fnAjaxFetch({ url: URL.SERVICE_INFO_LIST, method: 'POST', data: query });
        return res?.data?.result?.resultList || [];
    }, []);

    const onSearch = useCallback(async () => {
        const rows = await fetchServiceList({ ...tempParams, pageIndex: '1', pageUnit: '200' });
        setRowData(rows);
    }, [tempParams, fetchServiceList]);

    useEffect(() => {
        fetchServiceList({ pageIndex: '1', pageUnit: '200' })
            .then(rows => setRowData(rows))
            .catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onSearchKeyDown = (e) => { if (e.key === 'Enter') onSearch(); };

    const refreshOidForService = useCallback(async (serviceSeq) => {
        const api = gridApiRef.current;
        if (!api) return;
        const info = api.getDetailGridInfo(`detail_${serviceSeq}`);
        if (!info) return;
        try {
            const res = await fnAjaxFetch({
                url: URL.SERVICE_OID_LIST,
                method: 'POST',
                data: { searchServiceSeq: serviceSeq, pageIndex: '1', pageUnit: '100' },
                withCredentials: true,
            });
            const rows = res?.data?.result?.resultList || [];
            info.api.setGridOption('rowData', rows.map(r => ({ ...r, __serviceSeq: serviceSeq })));
        } catch { /* ignore */ }
    }, []);

    const handleOidView = useCallback(async (oidSeq) => {
        try {
            const res = await fnAjaxFetch({
                url: `${URL.SERVICE_OID_VIEW}/${encodeURIComponent(oidSeq)}.do`,
                method: 'GET', withCredentials: true,
            });
            const json = res?.data;
            const messages = Array.isArray(json?.MESSAGE) ? json.MESSAGE : [];
            if (json?.STATUS === 'SUCCESS' && messages.length > 0) {
                const first = messages[0];
                const valid = first?.oid?.valid;
                const text = valid
                    ? (first?.variable?.syntaxString === 'NoSuchObject' ? '일치되는 OID값입니다.' : String(first?.variable?.value))
                    : 'OID값이 잘못되었습니다.';
                await Swal.fire({ icon: valid ? 'success' : 'error', text });
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'OID값이 잘못되었습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, []);

    const handleServiceDelete = useCallback(async (serviceSeq) => {
        const first = await Swal.fire({
            icon: 'question', title: '서비스 정보 삭제',
            html: `<b>${serviceSeq}</b> 를(을) 삭제 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            icon: 'warning', title: '서비스 정보 삭제 확인',
            html: `<b>${serviceSeq}</b> 를(을) 삭제하시면 시스템에 영향이 있을 수 있습니다.<br>정말로 삭제하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!second.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: `${URL.SERVICE_INFO}/${encodeURIComponent(serviceSeq)}.do`,
                method: 'DELETE', withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
                onSearch();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [onSearch]);

    const handleOpenOidAdd = useCallback(async () => {
        if (!selectedServiceSeq) {
            await Swal.fire({ icon: 'warning', text: '서비스를 선택해 주세요.' });
            return;
        }
        setOidModalData({ serviceSeq: selectedServiceSeq, oidSeq: null, oidData: null });
        setOidFormOpen(true);
    }, [selectedServiceSeq]);

    const columnDefs = useMemo(() => [
        { headerName: '서버명',       field: 'serverName',          width: 130, cellRenderer: 'agGroupCellRenderer' },
        { headerName: '서버IP',       field: 'serverIp',            width: 130 },
        { headerName: '서비스명',     field: 'serviceName',         flex: 1 },
        { headerName: '상태',         field: 'serverEndTime',       width: 90 },
        { headerName: 'PORT',         field: 'servicePort',         width: 80 },
        { headerName: '라이센스구분', field: 'licenseTypeTxt',      width: 110 },
        { headerName: 'Health Check', field: 'serviceHealthGubunTxt', width: 120 },
        { headerName: '사용유무',     field: 'serviceUseyn',        width: 90 },
        { headerName: 'SNMP사용',     field: 'serviceOidUseyn',     width: 90 },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => { setServiceModalData({ serviceSeq: p.data?.serviceSeq, rowData: p.data }); setServiceFormOpen(true); }}
                >수정</button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleServiceDelete(p.data?.serviceSeq)}
                >삭제</button>
            ),
        },
    ], [handleServiceDelete]);

    const gridContext = useMemo(() => ({
        onOidView: handleOidView,
        onOpenOidEdit: (oidData, serviceSeq) => {
            setOidModalData({ serviceSeq, oidSeq: oidData?.oidSeq, oidData });
            setOidFormOpen(true);
        },
        refreshRows: refreshOidForService,
    }), [handleOidView, refreshOidForService]);

    return (
        <>
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">서비스 현황</div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">인프라 관리</li>
                            <li className="breadcrumb-item">서비스 현황</li>
                        </ol>
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
                                <option value="">전체 서버</option>
                                {systemCodeOptions.map(o => (
                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                ))}
                            </select>
                            <input
                                type="text" name="searchKeyword"
                                placeholder="검색어를 입력하세요"
                                value={tempParams.searchKeyword}
                                onChange={handleInputChange}
                                onKeyDown={onSearchKeyDown}
                            />
                        </div>
                        <div className="col-auto content-search__action">
                            <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={onSearch}>
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
                            <button type="button" className="btn btn-outline-secondary btn-outline__gray" onClick={handleOpenOidAdd}>
                                OID 등록
                            </button>
                            <button type="button" className="btn btn-primary btn-default__blue"
                                onClick={() => { setServiceModalData({ serviceSeq: null, rowData: null }); setServiceFormOpen(true); }}
                            >
                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                                </svg>
                                서비스 정보 등록
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-12 content-table content-table__main">
                    <MasterDetailGrid
                        columnDefs={columnDefs}
                        rowData={rowData}
                        getRowId={(params) => String(params.data.serviceSeq)}
                        isRowMaster={(data) => data?.serviceOidUseyn === 'Y' && data?.child_cnt !== '0'}
                        detailCellRenderer={SystemServiceOidDetailRenderer}
                        detailRowHeight={260}
                        context={gridContext}
                        onGridReady={(params) => { gridApiRef.current = params.api; }}
                        onRowClicked={(params) => setSelectedServiceSeq(params.data?.serviceSeq)}
                    />
                </div>
            </div>

            <SystemServiceFormModal
                open={serviceFormOpen}
                onClose={() => setServiceFormOpen(false)}
                serviceSeq={serviceModalData.serviceSeq}
                rowData={serviceModalData.rowData}
                onSuccess={() => { setServiceFormOpen(false); onSearch(); }}
            />
            <SystemServiceOidFormModal
                open={oidFormOpen}
                onClose={() => setOidFormOpen(false)}
                serviceSeq={oidModalData.serviceSeq}
                oidSeq={oidModalData.oidSeq}
                oidData={oidModalData.oidData}
                onSuccess={(serviceSeq) => {
                    setOidFormOpen(false);
                    refreshOidForService(serviceSeq);
                }}
            />
        </>
    );
};

export default SystemServiceInfo;
