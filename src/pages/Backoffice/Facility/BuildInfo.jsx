import React, { useState, useMemo, useCallback, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import { alert } from '@/lib/alert.js';
import CODE from '@/constants/CODE.jsx';
import URL from '@/constants/URL.jsx';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const BuildFormModal = lazy(() => import('@/pages/Backoffice/Facility/components/BuildFormModal.jsx'));

const INITIAL_FORM = {
    mode: 'Ins',
    centerId: '',
    centerNm: '',
    insttCode: '',
    centerZipcode: '',
    centerAddr1: '',
    centerAddr2: '',
    centerTel: '',
    centerFax: '',
    centerImgFile: null,
    centerUrl: '',
    UseAt: 'Y',
    adminApprovalYn: 'N',
    centerFloor: '',
    centerFloorEnd: '',
    floorInfo: '',
    centerInfo: '',
};

const INITIAL_SEARCH_FORM = {
    searchInsttCode: '',
    searchCondition: '',
    searchKeyword: '',
};

const BuildInfo = () => {
    const [pageUnit] = useState(20);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

    const { options: insttOptions } = useCustomReqDataCombo({
        url: URL.INSTT_COMBO,
        method: 'GET',
        mapping: { id: 'insttCode', text: 'allInsttNm' },
    });

    const fetchData = async (query) => {
        const res = await fnAjaxFetch({
            url: URL.CENTER_LIST,
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
        gridApiRef,
        onGridReady,
        defaultColDef,
        tempParams,
        setTempParams,
        handleSearch,
        refreshGrid,
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

    const handleOpenModal = useCallback((rowData = null) => {
        if (!rowData) {
            setForm(INITIAL_FORM);
        } else {
            setForm({
                ...INITIAL_FORM,
                mode: 'Edt',
                centerId: rowData.centerId || '',
                centerNm: rowData.centerNm || '',
                insttCode: rowData.insttCode || '',
                centerTel: rowData.centerTel || '',
                centerFax: rowData.centerFax || '',
                centerUrl: rowData.centerUrl || '',
                UseAt: rowData.centerUseYn || 'Y',
                adminApprovalYn: rowData.adminApprovalYn || 'N',
            });
        }
        setModalOpen(true);
    }, []);

    const { handleDelete } = useCommonDelete({
        gridApiRef,
        URL: URL.CENTER_DELETE,
        MESSAGE: 'ÏßÄ??,
        reloadFunction: onSearch,
    });

    const handleStateChange = useCallback(async (centerId, newVal) => {
        try {
            const res = await fnAjaxFetch({
                url: `${URL.CENTER_STATE}/${encodeURIComponent(centerId)}.do`,
                method: 'GET',
                data: { adminApprovalYn: newVal },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.resultCodeInfo !== 'SUCCESS') {
                await Swal.fire({ icon: 'warning', title: 'Í≤ΩÍ≥†', text: json?.resultMessage || '?ÅÌÉú Î≥ÄÍ≤ΩÏóê ?§Ìå®?àÏäµ?àÎã§.' });
                refreshGrid();
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '?§Î•ò', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
            refreshGrid();
        }
    }, [refreshGrid]);

    const { handleSubmit: handleSubmitInner } = useCommonSubmit({
        form,
        type: 'multipart',
        checkField: [
            { inputId: 'centerNm', inputType: CODE.TEXT, message: 'ÏßÄ?êÎ™Ö' },
            { inputId: 'insttCode', inputType: CODE.TEXT, message: 'Í∏∞Í?' },
        ],
        uploadField: ['centerImgFile'],
        confirmMessage: `${form.centerNm} ÏßÄ???ïÎ≥¥Î•?,
        gridApiRef,
        setModalOpen,
        URL: URL.CENTER_UPDATE,
        reloadFunction: () => onSearch(1),
    });

    const handleSubmit = useCallback(async () => {
        if (form.centerFloor && form.centerFloorEnd && !form.floorInfo) {
            await alert.warning('?¨Ïö© Ï∏µÏàòÎ•?1Í∞??¥ÏÉÅ ?†ÌÉù??Ï£ºÏÑ∏??', '?ÖÎ†• ?ïÏù∏');
            return;
        }
        handleSubmitInner();
    }, [form.centerFloor, form.centerFloorEnd, form.floorInfo, handleSubmitInner]);

    const columnDefs = useMemo(() => [
        {
            headerName: '?ÑÍ≤Ω?¨ÏßÑ',
            field: 'centerImg',
            width: 110,
            cellRenderer: (p) => p.value
                ? <img src={`/upload/${p.value}`} style={{ width: 80, height: 55, objectFit: 'cover', borderRadius: 4 }} alt="?ÑÍ≤Ω" />
                : <span className="text-muted small">?ÜÏùå</span>,
        },
        { headerName: 'Í∏∞Í?', field: 'allInsttNm', width: 150 },
        { headerName: 'ÏßÄ?êÎ™Ö', field: 'centerNm', flex: 1 },
        { headerName: '?∞ÎùΩÏ≤?, field: 'centerTel', width: 130 },
        { headerName: 'FAX', field: 'centerFax', width: 130 },
        {
            headerName: '?πÏù∏?¨Î?',
            field: 'adminApprovalYn',
            width: 120,
            cellRenderer: (p) => (
                <select
                    value={p.value || 'N'}
                    onChange={(e) => {
                        const newVal = e.target.value;
                        p.node.setDataValue('adminApprovalYn', newVal);
                        handleStateChange(p.data?.centerId, newVal);
                    }}
                    className="form-select form-select-sm"
                    style={{ height: 28, padding: '0 4px' }}
                >
                    <option value="Y">?πÏù∏</option>
                    <option value="N">ÎØ∏Ïäπ??/option>
                </select>
            ),
        },
        {
            headerName: '?¨Ïö©?†Î¨¥',
            field: 'centerUseYn',
            width: 100,
            cellRenderer: (p) => (
                <span className={`badge rounded-pill ${p.value === 'Y' ? 'bg-success' : 'bg-secondary'} px-3 py-2`}
                    style={{ fontSize: '0.82rem' }}>
                    {p.value === 'Y' ? '?¨Ïö©' : 'ÎØ∏ÏÇ¨??}
                </span>
            ),
        },
        { headerName: 'ÏµúÏ¢Ö?òÏ†ï??, field: 'centerUpdateUserId', width: 120 },
        { headerName: 'ÏµúÏ¢Ö?òÏ†ï??, field: 'centerUpdateDate', width: 140 },
        {
            headerName: '?òÏ†ï',
            width: 70,
            sortable: false,
            filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => handleOpenModal(p.data)}>
                    ?òÏ†ï
                </button>
            ),
        },
        {
            headerName: '??†ú',
            width: 70,
            sortable: false,
            filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleDelete({ code: p.data?.centerId, name: p.data?.centerNm })}>
                    ??†ú
                </button>
            ),
        },
    ], [handleOpenModal, handleDelete, handleStateChange]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">ÏßÄ??Í¥ÄÎ¶?/div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">?úÏÑ§ Í¥ÄÎ¶?/li>
                        <li className="breadcrumb-item">ÏßÄ??Í¥ÄÎ¶?/li>
                    </ol>
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                        <select
                            name="searchInsttCode"
                            className="form-select"
                            style={{ width: 160 }}
                            value={tempParams.searchInsttCode}
                            onChange={handleInputChange}
                        >
                            <option value="">?ÑÏ≤¥ Í∏∞Í?</option>
                            {insttOptions.map(o => (
                                <option key={o.code} value={o.code}>{o.codeNm}</option>
                            ))}
                        </select>
                        <select
                            name="searchCondition"
                            className="form-select"
                            style={{ width: 120 }}
                            value={tempParams.searchCondition}
                            onChange={handleInputChange}
                        >
                            <option value="">?†ÌÉù</option>
                            <option value="centerNm">?¥Î¶Ñ</option>
                            <option value="centerId">?ÑÏù¥??/option>
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
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenModal()}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                            </svg>
                            ÏßÄ???±Î°ù
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
            <BuildFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default BuildInfo;
