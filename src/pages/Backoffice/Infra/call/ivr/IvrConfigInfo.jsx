import React, { useState, useMemo, useCallback, lazy } from 'react';
import IosSwitch from '@/components/Common/IosSwitch.jsx';
import Swal from '@/lib/swal.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { CommonSelect } from '@/components/Common/Select.jsx';

const IvrFormModal = lazy(() => import('@/pages/Backoffice/Infra/call/ivr/components/IvrFormModal.jsx'));
const IvrHolyModal = lazy(() => import('@/pages/Backoffice/Infra/call/ivr/components/IvrHolyModal.jsx'));
const IvrWorkModal = lazy(() => import('@/pages/Backoffice/Infra/call/ivr/components/IvrWorkModal.jsx'));
const IvrCallbackModal = lazy(() => import('@/pages/Backoffice/Infra/call/ivr/components/IvrCallbackModal.jsx'));

const INITIAL_SEARCH_FORM = {
    searchInsttCode : '',
    searchCondition: '',
    searchKeyword: '',
};
const INSTT_PARAMS = {};
const INSTT_MAPPING = { id: 'insttCode', text: 'allInsttNm' };

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
    const [callbackKey, setCallbackKey] = useState(0);
    const [formKey, setFormKey] = useState(0);
    const [mentModal, setMentModal] = useState(null);


    const { options: insttOptions, isLoading: isLoadingInstt } = useCustomReqDataCombo({
        url: URL.INSTT_COMBO,
        method: 'POST',
        params: INSTT_PARAMS,
        mapping: INSTT_MAPPING,
    });

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
        setFormKey(k => k + 1);
        setFormModalOpen(true);
    }, []);

    const handleOpenCallbackModal = useCallback((rowData) => {
        setCallbackData({
            ivrCode: rowData.ivrCode || '',
            ivrDars: rowData.ivrDars === 'Y' ? 'Y' : 'N',
            ivrCbk: rowData.ivrCbk === 'Y' ? 'Y' : 'N',
        });
        setCallbackKey(k => k + 1);
        setCallbackModalOpen(true);
    }, []);

    const handleSend = useCallback(async (ivrCode) => {
        const ok = await Swal.fire({
            icon: 'question',
            title: 'IVR 전송',
            html: `<b>${ivrCode}</b> IVR 설정을 전송하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
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
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '전송되었습니다.' });
            } else {
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '전송에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, []);

    const handleMentModalSave = useCallback(async () => {
        if (!mentModal) return;
        const { ivrCode, rowData, node, inputs } = mentModal;
        try {
            const res = await fnAjaxFetch({
                url: URL.IVR_UPDATE,
                method: 'POST',
                data: {
                    mode: 'Edt',
                    insttCode: rowData.insttCode,
                    ivrCode,
                    ivrName: rowData.ivrName,
                    ivrUseyn: rowData.ivrUseyn,
                    ivrMentUseyn: 'Y',
                    ivrMent: inputs.ivrMent,
                    notiSday: inputs.notiSday,
                    notiEday: inputs.notiEday,
                    workStime: inputs.workStime,
                    workEtime: inputs.workEtime,
                    ivrMeno: rowData.ivrMeno,
                    ivrCreatefileCode: rowData.ivrCreatefileCode,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS') {
                node.setDataValue('ivrMentUseyn', 'Y');
                setMentModal(null);
            } else {
                await Swal.fire({ icon: 'error', text: json?.resultMessage || '저장 실패' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다.' });
        }
    }, [mentModal]);

    const handleDelete = useCallback(async (ivrCode) => {
        const first = await Swal.fire({
            icon: 'question',
            title: 'IVR 코드 삭제',
            html: `<b>${ivrCode}</b> 를 삭제 하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            icon: 'warning',
            title: 'IVR 코드 삭제 확인',
            html: `<b>${ivrCode}</b> 를 삭제하시면 시스템에 영향이 있을 수 있습니다.<br>정말로 삭제하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
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
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
                handleSearch(1);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
                handleSearch(1);
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
            handleSearch(1);
        }
    }, [handleSearch]);

    const columnDefs = useMemo(() => [
        { headerName: '기관명', field: 'codeNm', width: 140, },
        { headerName: 'IVR명', field: 'ivrName', width: 140, },
        {
            headerName: 'DARS여부', field: 'ivrDars', width: 100,
            cellRenderer: (p) => {
                const val = String(p.value || '').toUpperCase();
                const color = val === 'Y' ? '#0d6efd' : val === 'FAIL' ? '#dc3545' : '#adb5bd';
                const label = val === 'Y' ? '사용' : val === 'FAIL' ? '에러' : '미사용';
                return (
                    <div
                        className="d-flex align-items-center gap-1 h-100"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenCallbackModal(p.data)}
                    >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 13, color }}>{label}</span>
                    </div>
                );
            },
        },
        {
            headerName: 'Callback여부', field: 'ivrCbk', width: 110,
            cellRenderer: (p) => {
                const val = String(p.value || '').toUpperCase();
                const color = val === 'Y' ? '#0d6efd' : val === 'FAIL' ? '#dc3545' : '#adb5bd';
                const label = val === 'Y' ? '사용' : val === 'FAIL' ? '에러' : '미사용';
                return (
                    <div
                        className="d-flex align-items-center gap-1 h-100"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleOpenCallbackModal(p.data)}
                    >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontSize: 13, color }}>{label}</span>
                    </div>
                );
            },
            
        },
        {
            headerName: '사용여부', field: 'ivrUseyn', width: 110,
            cellRenderer: (params) => {
                const handleChange = async (payload) => {
                    const newValue = payload.ivrUseyn;
                    try {
                        const res = await fnAjaxFetch({
                            url: `${URL.IVR_USEYN}/${params.data.ivrCode}.do`,
                            method: 'PATCH',
                            data: { ivrUseyn: newValue },
                            withCredentials: true,
                        });
                        const json = res?.data;
                        if (json?.resultCodeInfo === 'SUCCESS') {
                            params.node.setDataValue(params.colDef.field, newValue);
                        } else {
                            await Swal.fire({ icon: 'error', text: json?.resultMessage || '변경 실패' });
                        }
                    } catch (e) {
                        await Swal.fire({ icon: 'error', text: e?.message || '사용유무 변경 중 오류' });
                    }
                };
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <IosSwitch value={params.value} name="ivrUseyn" onChange={handleChange} onText="사용" offText="미사용" />
                    </div>
                );
            },
        },
        {
            headerName: '멘트사용여부', field: 'ivrMentUseyn', width: 120,
            cellRenderer: (params) => {
                const handleChange = async (payload) => {
                    const newValue = payload.ivrMentUseyn;
                    if (newValue === 'Y') {
                        setMentModal({
                            ivrCode: params.data.ivrCode,
                            rowData: params.data,
                            node: params.node,
                            inputs: {
                                ivrMent: params.data.ivrMent || '',
                                notiSday: params.data.notiSday.replace(/-/g, "") || '',
                                notiEday: params.data.notiEday.replace(/-/g, "") || '',
                                workStime: params.data.workStime || '',
                                workEtime: params.data.workEtime || '',
                            },
                        });
                    } else {
                        try {
                            const res = await fnAjaxFetch({
                                url: `${URL.IVR_MENT_USEYN}/${params.data.ivrCode}.do`,
                                method: 'PATCH',
                                data: { ivrMentUseyn: 'N' },
                                withCredentials: true,
                            });
                            const json = res?.data;
                            if (json?.resultCodeInfo === 'SUCCESS') {
                                params.node.setDataValue(params.colDef.field, 'N');
                            } else {
                                await Swal.fire({ icon: 'error', text: json?.resultMessage || '변경 실패' });
                            }
                        } catch (e) {
                            await Swal.fire({ icon: 'error', text: e?.message || '오류' });
                        }
                    }
                };
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <IosSwitch value={params.value} name="ivrMentUseyn" onChange={handleChange} onText="사용" offText="미사용" />
                    </div>
                );
            },
        },
        { headerName: '멘트시작일', field: 'notiSday', width: 110 },
        { headerName: '멘트종료일', field: 'notiEday', width: 110 },
        { headerName: '비고', field: 'ivrMeno', flex: 1 },
        { headerName: '최종 수정일', field: 'createDate', width: 130 },
        {
            headerName: '휴일관리', width: 90, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={() => { setHolyIvrCode(p.data?.ivrCode); setHolyModalOpen(true); }}
                >휴일관리</button>
            ),
        },
        {
            headerName: '업무시간', width: 90, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-sm"
                    onClick={() => { setWorkIvrCode(p.data?.ivrCode); setWorkModalOpen(true); }}
                >업무시간</button>
            ),
        },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => handleOpenFormModal(p.data)}
                >수정</button>
            ),
        },
        {
            headerName: '전송', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-primary btn-sm"
                    onClick={() => handleSend(p.data?.ivrCode)}
                >전송</button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleDelete(p.data?.ivrCode)}
                >삭제</button>
            ),
        },
    ], [handleOpenFormModal, handleOpenCallbackModal, handleSend, handleDelete]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">IVR 설정 관리</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">인프라 관리</li>
                        <li className="breadcrumb-item">IVR 설정 관리</li>
                    </ol>
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                        <CommonSelect
                            comboId="searchInsttCode"
                            comboData={insttOptions || []}
                            value={tempParams.searchInsttCode || ''}
                            onChange={(e) => {
                                handleInputChange(e);
                            }}
                            placeholder={isLoadingInstt ? '로딩 중...' : '기관을 선택하세요'}
                            style={{ height: 32, fontSize: 15 }}
                        />
                        <select
                            name="searchCondition"
                            className="form-select"
                            style={{ width: 120 }}
                            value={tempParams.searchCondition}
                            onChange={handleInputChange}
                        >
                            <option value="0">전체</option>
                            <option value="ivrName">이름</option>
                            <option value="ivrInsttNm">기관명</option>
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
                            검색초기화                        
                        </button>
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenFormModal()}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                            </svg>
                            개별 등록
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
                        overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중..</span>"
                        onGridReady={onGridReady}
                    />
                </div>
            </div>

            <IvrFormModal
                key={`form-${formKey}`}
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
                key={`callback-${callbackKey}`}
                open={callbackModalOpen}
                onClose={() => setCallbackModalOpen(false)}
                ivrCode={callbackData.ivrCode}
                ivrDars={callbackData.ivrDars}
                ivrCbk={callbackData.ivrCbk}
                onSuccess={() => { setCallbackModalOpen(false); onSearch(1); }}
            />

            {mentModal && (
                <div className="modal-backdrop-custom">
                    <div className="modal-custom">
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: 560, maxWidth: '90%', backgroundColor: '#fff' }}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="modal-title">
                                        <h2 className="modal-title__title">멘트 입력</h2>
                                    </div>
                                    <button type="button" className="modal-close" aria-label="Close" onClick={() => setMentModal(null)} />
                                </div>
                                <div className="modal-body">
                                    <div className="modal-body__content">
                                        <div className="row input-box-wrap">
                                            <div className="col-6">
                                                <div className="input-box">
                                                    <label className="form-label">업무 시작시간</label>
                                                    <input
                                                        type="time"
                                                        className="form-control"
                                                        value={mentModal.inputs.workStime}
                                                        onChange={(e) => setMentModal(prev => ({ ...prev, inputs: { ...prev.inputs, workStime: e.target.value } }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="input-box">
                                                    <label className="form-label">업무 종료시간</label>
                                                    <input
                                                        type="time"
                                                        className="form-control"
                                                        value={mentModal.inputs.workEtime}
                                                        onChange={(e) => setMentModal(prev => ({ ...prev, inputs: { ...prev.inputs, workEtime: e.target.value } }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="input-box">
                                                    <label className="form-label">멘트 시작일</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={mentModal.inputs.notiSday}
                                                        onChange={(e) => setMentModal(prev => ({ ...prev, inputs: { ...prev.inputs, notiSday: e.target.value } }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="input-box">
                                                    <label className="form-label">멘트 종료일</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={mentModal.inputs.notiEday}
                                                        onChange={(e) => setMentModal(prev => ({ ...prev, inputs: { ...prev.inputs, notiEday: e.target.value } }))}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="input-box">
                                                    <label className="form-label">멘트 내용</label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={4}
                                                        placeholder="멘트 내용을 입력해주세요"
                                                        value={mentModal.inputs.ivrMent}
                                                        onChange={(e) => setMentModal(prev => ({ ...prev, inputs: { ...prev.inputs, ivrMent: e.target.value } }))}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <div className="modal-footer__left" />
                                    <div className="modal-footer__right">
                                        <button type="button" className="btn btn-action__lightblue" onClick={() => setMentModal(null)}>취소</button>
                                        <button type="button" className="btn btn-primary btn-action__blue" onClick={handleMentModalSave}>저장</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IvrConfigInfo;
