import React, { useState, useMemo, useCallback, useRef, useEffect, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import MasterDetailGrid from '@/components/Common/MasterDetailGrid.jsx';
import AlertPartDetailRenderer from './components/AlertPartDetailRenderer.jsx';

const AlertFormModal     = lazy(() => import('./components/AlertFormModal.jsx'));
const AlertPartFormModal = lazy(() => import('./components/AlertPartFormModal.jsx'));
const AlertRecModal      = lazy(() => import('./components/AlertRecModal.jsx'));

const INITIAL_SEARCH_FORM = { searchCondition: '', searchKeyword: '' };

const AlertMessageInfo = () => {
    const gridApiRef = useRef(null);
    const [rowData, setRowData] = useState([]);
    const [tempParams, setTempParams] = useState(INITIAL_SEARCH_FORM);
    const [selectedAlertSeq, setSelectedAlertSeq] = useState(null);

    const [alertFormOpen, setAlertFormOpen] = useState(false);
    const [alertModalData, setAlertModalData] = useState({ alertSeq: null, rowData: null });

    const [partFormOpen, setPartFormOpen] = useState(false);
    const [partModalData, setPartModalData] = useState({ alertSeq: '', alertPartSeq: null, partData: null });

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

    const refreshPartForAlert = useCallback(async (alertSeq) => {
        const api = gridApiRef.current;
        if (!api) return;
        const info = api.getDetailGridInfo(`detail_${alertSeq}`);
        if (!info) return;
        try {
            const res = await fnAjaxFetch({
                url: URL.ALERT_PART_LIST, method: 'POST',
                data: { alertSeq, pageIndex: '1', pageUnit: '100' },
                withCredentials: true,
            });
            const rows = res?.data?.result?.resultList || [];
            info.api.setGridOption('rowData', rows.map(r => ({ ...r, __alertSeq: alertSeq })));
        } catch { /* ignore */ }
    }, []);

    const handlePartDelete = useCallback(async (alertPartSeq, alertSeq) => {
        const ok = await Swal.fire({
            icon: 'question', title: 'Î∂Ä????†ú',
            html: `<b>${alertPartSeq}</b> Î•??? ??†ú ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fnAjaxFetch({
                url: `${URL.ALERT_PART}/${encodeURIComponent(alertPartSeq)}.do`,
                method: 'DELETE', withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                refreshPartForAlert(alertSeq);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '??†ú???§Ìå®?àÏäµ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [refreshPartForAlert]);

    const handleAlertDelete = useCallback(async (alertSeq) => {
        const ok = await Swal.fire({
            icon: 'question', title: 'Message ??†ú',
            html: `<b>${alertSeq}</b> Î•??? ??†ú ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fnAjaxFetch({
                url: `${URL.ALERT_INFO}/${encodeURIComponent(alertSeq)}.do`,
                method: 'DELETE', withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                onSearch();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '??†ú???§Ìå®?àÏäµ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [onSearch]);

    const handleOpenPartAdd = useCallback(async () => {
        if (!selectedAlertSeq) {
            await Swal.fire({ icon: 'warning', text: '?•Ïï† Î©îÏÑ∏ÏßÄÎ•??†ÌÉù??Ï£ºÏÑ∏??' });
            return;
        }
        setPartModalData({ alertSeq: selectedAlertSeq, alertPartSeq: null, partData: null });
        setPartFormOpen(true);
    }, [selectedAlertSeq]);

    const columnDefs = useMemo(() => [
        { headerName: '?åÎ¶º Î©îÏÑ∏ÏßÄ', field: 'alertMessage',              flex: 1, cellRenderer: 'agGroupCellRenderer' },
        { headerName: '?åÎ¶º Ï°∞Í±¥',   field: 'alertMsgResult',            flex: 1 },
        { headerName: '?¨Ïö© ?†Î¨¥',   field: 'alertMsgUseyn',             width: 90 },
        { headerName: '?úÏûë ?úÍ∞Ñ',   field: 'alertMsgStarttime',         width: 100 },
        { headerName: 'Ï¢ÖÎ£å ?úÍ∞Ñ',   field: 'alertMsgEndtime',           width: 100 },
        { headerName: '?úÏô∏ ?úÏûë',   field: 'alertMsgExceptionStarttime', width: 100 },
        { headerName: '?úÏô∏ Ï¢ÖÎ£å',   field: 'alertMsgExceptionEndtime',   width: 100 },
        {
            headerName: '?¥Îãπ??, width: 80, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={() => { setRecAlertSeq(p.data?.alertSeq); setRecModalOpen(true); }}
                >?¥Îãπ??/button>
            ),
        },
        {
            headerName: '?òÏ†ï', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => {
                        setAlertModalData({ alertSeq: p.data?.alertSeq, rowData: p.data });
                        setAlertFormOpen(true);
                    }}
                >?òÏ†ï</button>
            ),
        },
        {
            headerName: '??†ú', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleAlertDelete(p.data?.alertSeq)}
                >??†ú</button>
            ),
        },
    ], [handleAlertDelete]);

    const gridContext = useMemo(() => ({
        onOpenPartEdit: (partData, alertSeq) => {
            setPartModalData({ alertSeq, alertPartSeq: partData?.alertPartSeq, partData });
            setPartFormOpen(true);
        },
        onDeletePart: handlePartDelete,
        refreshRows: refreshPartForAlert,
    }), [handlePartDelete, refreshPartForAlert]);

    return (
        <>
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">?•Ïï† ?åÎ¶º Î©îÏÑ∏ÏßÄ Í¥ÄÎ¶?/div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">Í¥ÄÎ¶¨Ïûê</li>
                            <li className="breadcrumb-item">?•Ïï† ?åÎ¶º Î©îÏÑ∏ÏßÄ Í¥ÄÎ¶?/li>
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
                                <option value="">?†ÌÉù</option>
                                <option value="skillId">?§ÌÇ¨?ÑÏù¥??/option>
                                <option value="skillName">?§ÌÇ¨Î™??êÎäî ?§Î™Ö</option>
                            </select>
                            <input
                                type="text" name="searchKeyword"
                                placeholder="Í≤Ä?âÏñ¥Î•??ÖÎ†•?òÏÑ∏??
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
                                Í≤Ä??                            </button>
                            <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleReset()}>
                                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 8L15 12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1046 16 14.1046 15.5523 14.8284 14.8284" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Í≤Ä??Ï¥àÍ∏∞??                            </button>
                            <button type="button" className="btn btn-outline-secondary btn-outline__gray" onClick={handleOpenPartAdd}>
                                Î∂Ä???±Î°ù
                            </button>
                            <button type="button" className="btn btn-primary btn-default__blue"
                                onClick={() => { setAlertModalData({ alertSeq: null, rowData: null }); setAlertFormOpen(true); }}
                            >
                                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                                </svg>
                                ?•Ïï† ?åÎ¶º Î©îÏÑ∏ÏßÄ ?±Î°ù
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
            <AlertPartFormModal
                open={partFormOpen}
                onClose={() => setPartFormOpen(false)}
                alertSeq={partModalData.alertSeq}
                alertPartSeq={partModalData.alertPartSeq}
                partData={partModalData.partData}
                onSuccess={(alertSeq) => { setPartFormOpen(false); refreshPartForAlert(alertSeq); }}
            />
            <AlertRecModal
                open={recModalOpen}
                onClose={() => setRecModalOpen(false)}
                alertSeq={recAlertSeq}
            />
        </>
    );
};

export default AlertMessageInfo;
