import React, { useState, useMemo, useCallback, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const IvrFormModal = lazy(() => import('@/pages/Backoffice/Infra/pgx/ivr/components/IvrFormModal.jsx'));
const IvrHolyModal = lazy(() => import('@/pages/Backoffice/Infra/pgx/ivr/components/IvrHolyModal.jsx'));
const IvrWorkModal = lazy(() => import('@/pages/Backoffice/Infra/pgx/ivr/components/IvrWorkModal.jsx'));
const IvrCallbackModal = lazy(() => import('@/pages/Backoffice/Infra/pgx/ivr/components/IvrCallbackModal.jsx'));

const INITIAL_SEARCH_FORM = {
    searchCondition: '0',
    searchKeyword: '',
};

const IvrConfigInfo = () => {
    const [pageUnit] = useState(20);

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [selectedIvrCode, setSelectedIvrCode] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState(null);

    const [holyModalOpen, setHolyModalOpen] = useState(false);
    const [holyIvrCode, setHolyIvrCode] = useState('');

    const [workModalOpen, setWorkModalOpen] = useState(false);
    const [workIvrCode, setWorkIvrCode] = useState('');

    const [callbackModalOpen, setCallbackModalOpen] = useState(false);
    const [callbackData, setCallbackData] = useState({ ivrCode: '', ivrDars: '', ivrCbk: '' });

    const fetchData = async (query) => {
        const res = await fnAjaxFetch({
            url: URL.IVR_LIST,
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
        setSelectedIvrCode(rowData ? rowData.ivrCode : null);
        setSelectedRowData(rowData);
        setFormModalOpen(true);
    }, []);

    const handleOpenCallbackModal = useCallback((rowData) => {
        setCallbackData({
            ivrCode: rowData.ivrCode || '',
            ivrDars: rowData.ivrDars || 'Y',
            ivrCbk: rowData.ivrCbk || 'Y',
        });
        setCallbackModalOpen(true);
    }, []);

    const handleSend = useCallback(async (ivrCode) => {
        const ok = await Swal.fire({
            icon: 'question',
            title: 'IVR ?ÑÏÜ°',
            html: `<b>${ivrCode}</b> IVR ?§Ï†ï???ÑÏÜ°?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fnAjaxFetch({
                url: `${URL.IVR_SEND}/${encodeURIComponent(ivrCode)}.do`,
                method: 'GET',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?ÑÏÜ°?òÏóà?µÎãà??' });
            } else {
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '?ÑÏÜ°???§Ìå®?àÏäµ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, []);

    const handleDelete = useCallback(async (ivrCode) => {
        const first = await Swal.fire({
            icon: 'question',
            title: 'IVR ÏΩîÎìú ??†ú',
            html: `<b>${ivrCode}</b> Î•??? ??†ú ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            icon: 'warning',
            title: 'IVR ÏΩîÎìú ??†ú ?ïÏù∏',
            html: `<b>${ivrCode}</b> Î•??? ??†ú?òÏãúÎ©??úÏä§?úÏóê ?ÅÌñ•???àÏùÑ ???àÏäµ?àÎã§.<br>?ïÎßêÎ°???†ú?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!second.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: `${URL.IVR_INFO}/${encodeURIComponent(ivrCode)}.do`,
                method: 'DELETE',
                data: { ivrCode },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                handleSearch(1);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '??†ú???§Ìå®?àÏäµ?àÎã§.' });
                handleSearch(1);
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
            handleSearch(1);
        }
    }, [handleSearch]);

    const columnDefs = useMemo(() => [
        { headerName: 'Í∏∞Í?Î™?, field: 'codeNm', flex: 1 },
        { headerName: 'IVRÎ™?, field: 'ivrName', flex: 1 },
        {
            headerName: 'DARS?¨Î?', field: 'ivrDars', width: 100,
            cellRenderer: (p) => (
                <button className="btn btn-link btn-sm p-0"
                    onClick={() => handleOpenCallbackModal(p.data)}
                >{p.value}</button>
            ),
        },
        {
            headerName: 'Callback?¨Î?', field: 'ivrCbk', width: 110,
            cellRenderer: (p) => (
                <button className="btn btn-link btn-sm p-0"
                    onClick={() => handleOpenCallbackModal(p.data)}
                >{p.value}</button>
            ),
        },
        { headerName: '?¨Ïö©?†Î¨¥', field: 'ivrUseyn', width: 90 },
        { headerName: 'Î©òÌä∏?¨Ïö©?¨Î?', field: 'ivrMentUseyn', width: 110 },
        { headerName: 'Î©òÌä∏?úÏûë??, field: 'notiSday', width: 110 },
        { headerName: 'Î©òÌä∏Ï¢ÖÎ£å??, field: 'notiEday', width: 110 },
        { headerName: 'ÎπÑÍ≥†', field: 'ivrMeno', flex: 1 },
        { headerName: 'ÏµúÏ¢Ö ?òÏ†ï??, field: 'createDate', width: 130 },
        {
            headerName: '?¥ÏùºÍ¥ÄÎ¶?, width: 90, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={() => { setHolyIvrCode(p.data?.ivrCode); setHolyModalOpen(true); }}
                >?¥ÏùºÍ¥ÄÎ¶?/button>
            ),
        },
        {
            headerName: '?ÖÎ¨¥?úÍ∞Ñ', width: 90, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={() => { setWorkIvrCode(p.data?.ivrCode); setWorkModalOpen(true); }}
                >?ÖÎ¨¥?úÍ∞Ñ</button>
            ),
        },
        {
            headerName: '?òÏ†ï', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => handleOpenFormModal(p.data)}
                >?òÏ†ï</button>
            ),
        },
        {
            headerName: '?ÑÏÜ°', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-primary btn-sm"
                    onClick={() => handleSend(p.data?.ivrCode)}
                >?ÑÏÜ°</button>
            ),
        },
        {
            headerName: '??†ú', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleDelete(p.data?.ivrCode)}
                >??†ú</button>
            ),
        },
    ], [handleOpenFormModal, handleOpenCallbackModal, handleSend, handleDelete]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">IVR ?§Ï†ï Í¥ÄÎ¶?/div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">?∏ÌîÑ??Í¥ÄÎ¶?/li>
                        <li className="breadcrumb-item">IVR ?§Ï†ï Í¥ÄÎ¶?/li>
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
                            <option value="0">?ÑÏ≤¥</option>
                            <option value="ivrName">?¥Î¶Ñ</option>
                            <option value="ivrInsttNm">Í∏∞Í?Î™?/option>
                        </select>
                        <input
                            type="text"
                            name="searchKeyword"
                            placeholder="Í≤Ä?âÏñ¥Î•??ÖÎ†•?òÏÑ∏??
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
                            Í≤Ä??                        </button>
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleReset()}>
                            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 8L15 12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1046 16 14.1046 15.5523 14.8284 14.8284" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Í≤Ä??Ï¥àÍ∏∞??                        </button>
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenFormModal()}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                            </svg>
                            Í∞úÎ≥Ñ ?±Î°ù
                        </button>
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
                        overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>?∞Ïù¥?∞Í? ?ÜÏäµ?àÎã§.</span>"
                        overlayLoadingTemplate="<span class='ag-overlay-loading-center'>Ï°∞Ìöå Ï§?..</span>"
                        onGridReady={onGridReady}
                    />
                </div>
            </div>

            <IvrFormModal
                open={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                ivrCode={selectedIvrCode}
                rowData={selectedRowData}
                onSuccess={() => { setFormModalOpen(false); onSearch(1); }}
            />
            <IvrHolyModal
                open={holyModalOpen}
                onClose={() => setHolyModalOpen(false)}
                ivrCode={holyIvrCode}
            />
            <IvrWorkModal
                open={workModalOpen}
                onClose={() => setWorkModalOpen(false)}
                ivrCode={workIvrCode}
            />
            <IvrCallbackModal
                open={callbackModalOpen}
                onClose={() => setCallbackModalOpen(false)}
                ivrCode={callbackData.ivrCode}
                ivrDars={callbackData.ivrDars}
                ivrCbk={callbackData.ivrCbk}
                onSuccess={() => { setCallbackModalOpen(false); onSearch(1); }}
            />
        </div>
    );
};

export default IvrConfigInfo;
