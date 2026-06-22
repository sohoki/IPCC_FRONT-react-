import React, { useState, useMemo, useCallback, useRef, useEffect, lazy } from 'react';
import { useResetForm } from '@/hooks/use-form.jsx';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import Swal from '@/lib/swal.js';
import MasterDetailGrid from '@/components/Common/MasterDetailGrid.jsx';
import AlertPartDetailRenderer from './components/AlertPartDetailRenderer.jsx';

import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';



const AlertFormModal     = lazy(() => import('./components/AlertFormModal.jsx'));
const AlertPartFormModal = lazy(() => import('./components/AlertPartFormModal.jsx'));
const AlertRecModal      = lazy(() => import('./components/AlertRecModal.jsx'));

const INITIAL_SEARCH_FORM = { searchCondition: '', searchKeyword: '' };
const INSTT_PARAMS = {};
const INSTT_MAPPING = { id: 'insttCode', text: 'allInsttNm' };


const AlertMessageInfo = () => {
    const gridApiRef = useRef(null);
    const [rowData, setRowData] = useState([]);
    const [tempParams, setTempParams] = useState(INITIAL_SEARCH_FORM);
    const [selectedAlertSeq, setSelectedAlertSeq] = useState(null);

    const { options: insttOptions, isLoading: isLoadingInstt } = useCustomReqDataCombo({
        url: URL.INSTT_COMBO,
        method: 'POST',
        params: INSTT_PARAMS,
        mapping: INSTT_MAPPING,
    });


    const [alertFormOpen, setAlertFormOpen] = useState(false);
    const [alertModalData, setAlertModalData] = useState({ alertSeq: null, rowData: null });

    const [partFormOpen, setPartFormOpen] = useState(false);
    const [partModalData, setPartModalData] = useState({ alertSeq: '', alertMessage: null, alertPartSeq: null, partData: null, openAt: 0 });

    const [recModalOpen, setRecModalOpen] = useState(false);
    const [recAlertSeq, setRecAlertSeq] = useState('');

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempParams(prev => ({ ...prev, [name]: value }));
    };

    const fetchAlertList = useCallback(async (query) => {
        const res = await fnAjaxFetch({ url: URL.ALERT_LIST, method: 'POST', data: query });
        return res?.data?.result?.resultList || [];
    }, []);

    const onSearch = useCallback(async () => {
        const rows = await fetchAlertList({ ...tempParams, pageIndex: '1', pageUnit: '200' });
        setRowData(rows);
    }, [tempParams, fetchAlertList]);

    useEffect(() => {
        fetchAlertList({ pageIndex: '1', pageUnit: '200' })
            .then(rows => setRowData(rows))
            .catch(() => {});
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const onSearchKeyDown = (e) => { if (e.key === 'Enter') onSearch(); };

    const refreshCallbacks = useRef({});

    const refreshPartForAlert = useCallback((alertSeq) => {
        refreshCallbacks.current[alertSeq]?.();
    }, []);

    // 장애 알림 메세지 삭제
    const { handleDelete: handleAlertDelete } = useCommonDelete({
        URL: URL.ALERT_INFO,
        MESSAGE: '장애 알림 메세지',
        reloadFunction: onSearch,
    });

    const handleOpenPartAdd = useCallback(async (alertSeq, data) => {
        if (!alertSeq) {
            await Swal.fire({ icon: 'warning', text: '장애 메세지를 선택해 주세요.' });
            return;
        }
        setPartModalData({ alertSeq, alertMessage: data?.alertMessage, alertPartSeq: null, partData: null, openAt: Date.now() });
        setPartFormOpen(true);
    }, []);

    const columnDefs = useMemo(() => [
        { headerName: '알림 메세지', field: 'alertMessage',               flex: 1, cellRenderer: 'agGroupCellRenderer' },
        { headerName: '알림 조건',   field: 'alertMsgResult',             flex: 1 },
        { headerName: '사용 여부',   field: 'alertMsgUseyn',              width: 90 },
        { headerName: '시작 시간',   field: 'alertMsgStarttime',          width: 100 },
        { headerName: '종료 시간',   field: 'alertMsgEndtime',            width: 100 },
        { headerName: '예외 시작',   field: 'alertMsgExceptionStarttime', width: 100 },
        { headerName: '예외 종료',   field: 'alertMsgExceptionEndtime',   width: 100 },
        { headerName: '부서 등록',   width: 100 , sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={() => { handleOpenPartAdd(p.data?.alertSeq, p.data); }}
                >부서등록</button>
            ),
        },
        {
            headerName: '담당자', width: 80, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={() => { setRecAlertSeq(p.data?.alertSeq); setRecModalOpen(true); }}
                >담당자</button>
            ),
        },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => {
                        setAlertModalData({ alertSeq: p.data?.alertSeq, rowData: p.data });
                        setAlertFormOpen(true);
                    }}
                >수정</button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleAlertDelete({ code: p.data?.alertSeq, name: p.data?.alertSeq })}
                >삭제</button>
            ),
        },
    ], [handleAlertDelete]);

    const gridContext = useMemo(() => ({
        onOpenPartAdd: (alertSeq, data) => handleOpenPartAdd(alertSeq, data),
        onOpenPartEdit: (partData, alertSeq) => {
            setPartModalData({ alertSeq, alertMessage: null, alertPartSeq: partData?.alertPartSeq, partData, openAt: Date.now() });
            setPartFormOpen(true);
        },
        registerRefresh:   (alertSeq, fn) => { refreshCallbacks.current[alertSeq] = fn; },
        unregisterRefresh: (alertSeq)     => { delete refreshCallbacks.current[alertSeq]; },
    }), [handleOpenPartAdd]);

    return (
        <>
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">장애 알림 메세지 관리</div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">관리자</li>
                            <li className="breadcrumb-item">장애 알림 메세지 관리</li>
                        </ol>
                    </div>
                </div>
                <div className="col-12 content-search">
                    <div className="row g-0 w-100 justify-content-between">
                        <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                            <select
                                name="searchCondition"
                                className="form-select" style={{ width: 160 }}
                                value={tempParams.searchCondition}
                                onChange={handleInputChange}
                            >
                                <option value="">선택</option>
                                <option value="skillId">알림 코드</option>
                                <option value="skillName">알림명 또는 설명</option>
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
                            <button type="button" className="btn btn-primary btn-default__blue"
                                onClick={() => { setAlertModalData({ alertSeq: null, rowData: null }); setAlertFormOpen(true); }}
                            >
                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                                </svg>
                                장애 알림 메세지 등록
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-12 content-table content-table__main">
                    <MasterDetailGrid
                        columnDefs={columnDefs}
                        rowData={rowData}
                        getRowId={(params) => String(params.data.alertSeq)}
                        isRowMaster={(data) => data?.child_cnt !== '0'}
                        detailCellRenderer={AlertPartDetailRenderer}
                        detailCellRendererParams={{ context: gridContext }}
                        detailRowHeight={220}
                        context={gridContext}
                        onGridReady={(params) => { gridApiRef.current = params.api; }}
                        onRowClicked={(params) => setSelectedAlertSeq(params.data?.alertSeq)}
                    />
                </div>
            </div>

            <AlertFormModal
                open={alertFormOpen}
                onClose={() => setAlertFormOpen(false)}
                alertSeq={alertModalData.alertSeq}
                rowData={alertModalData.rowData}
                onSuccess={() => { setAlertFormOpen(false); onSearch(); }}
            />
            {!isLoadingInstt && insttOptions.length > 0 &&
                <AlertPartFormModal
                    key={partModalData.openAt}
                    open={partFormOpen}
                    onClose={() => setPartFormOpen(false)}
                    alertSeq={partModalData.alertSeq}
                    alertMessage={partModalData.alertMessage}
                    alertPartSeq={partModalData.alertPartSeq}
                    partData={partModalData.partData}
                    onData={insttOptions}
                    onSuccess={(alertSeq) => { setPartFormOpen(false); refreshPartForAlert(alertSeq); }}
                />
            }
            <AlertRecModal
                open={recModalOpen}
                onClose={() => setRecModalOpen(false)}
                alertSeq={recAlertSeq}
            />
        </>
    );
};

export default AlertMessageInfo;
