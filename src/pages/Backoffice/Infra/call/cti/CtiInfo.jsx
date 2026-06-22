import React, { useState, useMemo, useCallback, useRef, useEffect, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import MasterDetailGrid from '@/components/Common/MasterDetailGrid.jsx';
import CtiGroupDetailRenderer from './components/CtiGroupDetailRenderer.jsx';

const CtiTenantFormModal = lazy(() => import('./components/CtiTenantFormModal.jsx'));
const CtiGroupFormModal  = lazy(() => import('./components/CtiGroupFormModal.jsx'));
const CtiPartListModal   = lazy(() => import('./components/CtiPartListModal.jsx'));

const INITIAL_SEARCH_FORM = { searchCondition: '', searchKeyword: '' };

const CtiInfo = () => {
    const gridApiRef = useRef(null);

    // 메인 그리드 데이터 (client-side)
    const [rowData, setRowData] = useState([]);
    const [tempParams, setTempParams] = useState(INITIAL_SEARCH_FORM);

    // 현재 선택된 테넌트 (Group 등록 버튼용)
    const [selectedTenant, setSelectedTenant] = useState(null);

    // Tenant 모달
    const [tenantModalOpen, setTenantModalOpen] = useState(false);
    const [tenantModalData, setTenantModalData] = useState({ tenantId: null, rowData: null });

    // Group 모달
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [groupModalData, setGroupModalData] = useState({ centerId: '', tenantId: '', groupData: null });

    // Part 모달
    const [partListOpen, setPartListOpen] = useState(false);
    const [partListData, setPartListData] = useState({ employeegrpId: '', tenantId: '', centerId: '' });

    // 테넌트 목록 조회
    const fetchTenantList = useCallback(async (query) => {
        const res = await fnAjaxFetch({ url: URL.CTI_TENANT_LIST, method: 'POST', data: query });
        const data = res?.data;
        return data?.result?.resultList || data?.resultList || [];
    }, []);

    const onSearch = useCallback(async () => {
        const rows = await fetchTenantList({ ...tempParams, pageIndex: '1', pageUnit: '200' });
        setRowData(rows);
    }, [tempParams, fetchTenantList]);

    useEffect(() => {
        let active = true;
        fetchTenantList({ pageIndex: '1', pageUnit: '200' })
            .then(rows => { if (active) setRowData(rows); })
            .catch(() => {});
        return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearchKeyDown = (e) => { if (e.key === 'Enter') onSearch(); };

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempParams(prev => ({ ...prev, [name]: value }));
    };

    // 그룹 서브 그리드 fetch (ref 고정)
    const fetchGroupStable = useCallback(async ({ tenantId, centerId, pageUnit = '100' }) => {
        const res = await fnAjaxFetch({
            url: URL.CTI_GROUP_LIST,
            method: 'POST',
            data: { tenantId, centerId, pageUnit },
            withCredentials: true,
        });
        return res?.data?.result?.resultList || res?.data?.rows || [];
    }, []);

    const fetchGroupRef = useRef(fetchGroupStable);
    useEffect(() => { fetchGroupRef.current = fetchGroupStable; }, [fetchGroupStable]);

    // 특정 테넌트의 서브 그리드 새로고침
    const refreshGroupForTenant = useCallback(async (tenantId, centerId) => {
        const api = gridApiRef.current;
        if (!api) return;
        const info = api.getDetailGridInfo(`detail_${tenantId}`);
        if (!info) return;
        try {
            const rows = await fetchGroupRef.current({ tenantId, centerId, pageUnit: '100' });
            info.api.setGridOption('rowData', rows.map(r => ({ ...r, __tenantId: tenantId, __centerId: centerId })));
        } catch { /* ignore */ }
    }, []);

    // 테넌트 삭제
    const handleTenantDelete = useCallback(async (tenantId, centerId) => {
        const ok = await Swal.fire({
            icon: 'warning', title: '테넌트 삭제',
            html: `<b>${tenantId}</b> 를(을) 삭제하시면 시스템에 영향이 있을 수 있습니다.<br>정말로 삭제하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니요',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_TENANT_DELETE,
                method: 'POST',
                data: { centerId, tenantId },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다' });
                onSearch();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [onSearch]);

    // Group 등록 (메인 버튼 클릭)
    const handleOpenGroupAdd = useCallback(async () => {
        if (!selectedTenant) {
            await Swal.fire({ icon: 'warning', text: '테넌트를 선택해 주세요' });
            return;
        }
        setGroupModalData({
            centerId: selectedTenant.centerId,
            tenantId: selectedTenant.tenantId,
            groupData: null,
        });
        setGroupModalOpen(true);
    }, [selectedTenant]);

    // 메인 그리드 컬럼
    const columnDefs = useMemo(() => [
        { headerName: '지역',          field: 'centerName',       width: 130, cellRenderer: 'agGroupCellRenderer' },
        { headerName: 'TENANT ID',     field: 'tenantId',         width: 120 },
        { headerName: 'TENANT 명',     field: 'tenantName',       flex: 1 },
        { headerName: '서비스 LEVEL',  field: 'servicelevelCalc', width: 120 },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => {
                        setTenantModalData({ tenantId: p.data?.tenantId, rowData: p.data });
                        setTenantModalOpen(true);
                    }}
                >수정</button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleTenantDelete(p.data?.tenantId, p.data?.centerId)}
                >삭제</button>
            ),
        },
    ], [handleTenantDelete]);

    // MasterDetailGrid context
    const gridContext = useMemo(() => ({
        fetchGroups: (params) => fetchGroupRef.current(params),
        onOpenGroupEdit: (groupData, tenantData) => {
            setGroupModalData({
                centerId: tenantData?.centerId || groupData?.centerId || '',
                tenantId: tenantData?.tenantId || groupData?.tenantId || '',
                groupData,
            });
            setGroupModalOpen(true);
        },
        onOpenPartList: (employeegrpId, tenantId, tenantCenterId) => {
            setPartListData({ employeegrpId, tenantId, centerId: tenantCenterId || '1' });
            setPartListOpen(true);
        },
        refreshRows: refreshGroupForTenant,
    }), [refreshGroupForTenant]);

    return (
        <>
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">CTI 직원관리</div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">인프라 관리</li>
                            <li className="breadcrumb-item">CTI 직원관리</li>
                        </ol>
                    </div>
                </div>
                <div className="col-12 content-search">
                    <div className="row g-0 w-100 justify-content-between">
                        <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                            <select
                                name="searchCondition"
                                className="form-select" style={{ width: 120 }}
                                value={tempParams.searchCondition}
                                onChange={handleInputChange}
                            >
                                <option value="">선택</option>
                                <option value="tenantId">아이디</option>
                                <option value="tenantName">테넌트명</option>
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
                                검색초기화
                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-outline__gray" onClick={handleOpenGroupAdd}>
                                Group 등록
                            </button>
                            <button type="button" className="btn btn-primary btn-default__blue"
                                onClick={() => { setTenantModalData({ tenantId: null, rowData: null }); setTenantModalOpen(true); }}
                            >
                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                                </svg>
                                Tenant 등록
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-12 content-table content-table__main">
                    <MasterDetailGrid
                        columnDefs={columnDefs}
                        rowData={rowData}
                        getRowId={(params) => String(params.data.tenantId)}
                        isRowMaster={(data) => data?.child_cnt !== '0'}
                        detailCellRenderer={CtiGroupDetailRenderer}
                        detailRowHeight={250}
                        context={gridContext}
                        onGridReady={(params) => { gridApiRef.current = params.api; }}
                        onRowClicked={(params) => setSelectedTenant(params.data)}
                    />
                </div>
            </div>

            <CtiTenantFormModal
                key={tenantModalOpen ? (tenantModalData.tenantId ?? 'new') : 'closed'}
                open={tenantModalOpen}
                onClose={() => setTenantModalOpen(false)}
                tenantId={tenantModalData.tenantId}
                rowData={tenantModalData.rowData}
                onSuccess={() => { setTenantModalOpen(false); onSearch(); }}
            />
            <CtiGroupFormModal
                key={groupModalOpen ? (groupModalData.groupData?.employeegrpId ?? 'new') : 'closed'}
                open={groupModalOpen}
                onClose={() => setGroupModalOpen(false)}
                centerId={groupModalData.centerId}
                tenantId={groupModalData.tenantId}
                groupData={groupModalData.groupData}
                onSuccess={(tenantId, centerId) => {
                    setGroupModalOpen(false);
                    refreshGroupForTenant(tenantId, centerId);
                }}
            />
            <CtiPartListModal
                open={partListOpen}
                onClose={() => setPartListOpen(false)}
                employeegrpId={partListData.employeegrpId}
                tenantId={partListData.tenantId}
                centerId={partListData.centerId}
            />
        </>
    );
};

export default CtiInfo;
