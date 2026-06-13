import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import { CommonSelect } from '@/components/Common/Select.jsx';
import CODE from '@/constants/CODE.jsx';
import Swal from '@/lib/swal.js';
import PartFormModal from './components/PartFormModal.jsx';
import PartInfraModal from './components/PartInfraModal.jsx';

const INITIAL_PART_FORM = {
    mode: 'Ins',
    partId: '',
    partNm: '',
    partDc: '',
    partHeadUserId: '',
    partHeadUserName: '',
    insttCode: '',
    parentPartId: '',
    partOrder: '1',
    partEtc1: '',
    partEtc2: '',
    useAt: 'Y',
    useEndAt: 'N',
    tenantId: '',
};

const INITIAL_SEARCH_FORM = {
    searchInsttCode: '1140100',
    searchCondition: '',
    searchKeyword: '',
};

const INSTT_PARAMS = {};
const INSTT_MAPPING = { id: 'insttCode', text: 'allInsttNm' };

const PartInfo = () => {
    const gridApiRef = useRef(null);
    const [pageUnit] = useState(50);
    const [partForm, setPartForm] = useState(INITIAL_PART_FORM);
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [isInfraModalOpen, setIsInfraModalOpen] = useState(false);
    const [infraTarget, setInfraTarget] = useState({ partId: '', insttCode: '' });
    const [parentPartOptions, setParentPartOptions] = useState([]);

    const { options: insttOptions, isLoading: isLoadingInstt } = useCustomReqDataCombo({
        url: API_URL.INSTT_COMBO,
        method: 'POST',
        params: INSTT_PARAMS,
        mapping: INSTT_MAPPING,
    });

    const loadParentCombo = useCallback(async () => {
        try {
            const res = await fnAjaxFetch({ url: API_URL.PART_PARENT_COMBO, method: 'GET' });
            const list = res?.data?.result?.resultList || [];
            setParentPartOptions(list.map((p) => ({ value: p.partId, label: p.partNmHi })));
        } catch (e) {
            console.error('parentPartCombo error', e);
        }
    }, []);

    useEffect(() => {
        fnAjaxFetch({ url: API_URL.PART_PARENT_COMBO, method: 'GET' })
            .then((res) => {
                const list = res?.data?.result?.resultList || [];
                setParentPartOptions(list.map((p) => ({ value: p.partId, label: p.partNmHi })));
            })
            .catch(() => {});
    }, []);

    const fetchPartList = useCallback(async (query) => {
        const res = await fnAjaxFetch({ url: API_URL.PART_LIST, method: 'POST', data: { ...query } });
        const data = res?.data;
        return {
            rows: data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    }, []);

    const {
        gridApiRef: gridApiFromHook,
        onGridReady,
        defaultColDef,
        tempParams,
        setTempParams,
        handleSearch,
    } = useGridInfinite({ fetchApi: fetchPartList, pageUnit, initialFilters: INITIAL_SEARCH_FORM });

    const effectiveGridApiRef = gridApiFromHook ?? gridApiRef;

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setTempParams((prev) => ({ ...prev, [name]: value }));
    }, [setTempParams]);

    const onSearch = useCallback((pageIndex) => {
        handleSearch(pageIndex || 1);
    }, [handleSearch]);

    const onSearchKeyDown = useCallback((e) => {
        if (e.key === 'Enter') onSearch(1);
    }, [onSearch]);

    const handleSearchChange = useCallback((e) => {
        const { name, value } = e.target;
        setTempParams({ ...INITIAL_SEARCH_FORM, [name]: value });
    }, [setTempParams]);

    const skipFirstRender = useRef(true);
    useEffect(() => {
        if (skipFirstRender.current) { skipFirstRender.current = false; return; }
        handleSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tempParams.searchInsttCode]);

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    const handleOpenPartModal = useCallback((row, p) => {
        if (row) {
            setPartForm({
                mode: 'Edt',
                partId: row.partId || '',
                partNm: row.partNm || '',
                partDc: row.partDc || '',
                partHeadUserId: row.partHeadUserId || '',
                partHeadUserName: row.partHeadUserNm || '',
                insttCode: row.insttCode || '',
                parentPartId: row.parentPartId || '',
                partOrder: row.partOrder || '1',
                partEtc1: row.partEtc1 || '',
                partEtc2: row.partEtc2 || '',
                useAt: row.partUseyn || 'Y',
                useEndAt: row.partEndyn || 'N',
                tenantId: row.tenantId || '',
            });
            p?.node?.setSelected(true);
        } else {
            setPartForm({ ...INITIAL_PART_FORM });
        }
        setIsPartModalOpen(true);
    }, []);

    const { handleSubmit: handlePartSave } = useCommonSubmit({
        form: partForm,
        type: 'json',
        checkField: [
            { inputId: 'partNm', type: CODE.TEXT, message: '부서명을 입력해주세요.' },
            { inputId: 'insttCode', type: CODE.TEXT, message: '기관을 선택해주세요.' },
            { inputId: 'parentPartId', type: CODE.TEXT, message: '상위 부서를 선택해주세요.' },
        ],
        confirmMessage: `${partForm.partNm} 부서 정보를`,
        gridApiRef,
        setModalOpen: setIsPartModalOpen,
        URL: API_URL.PART_UPDATE,
        reloadFunction: () => { onSearch(1); loadParentCombo(); },
    });

    const { handleDelete: handlePartDelete } = useCommonDelete({
        gridApiRef: effectiveGridApiRef,
        URL: API_URL.PART_DELETE,
        MESSAGE: `<b>${partForm.partNm}</b>`,
        reloadFunction: () => { onSearch(1); loadParentCombo(); },
    });

    const handlePartSync = useCallback(async () => {
        try {
            const res = await fnAjaxFetch({ url: API_URL.PART_SYNC, method: 'POST', data: { pageIndex: '1' } });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: '연동 완료', text: json.MESSAGE });
                onSearch(1);
            } else {
                await Swal.fire({ icon: 'info', title: '알림', text: json?.MESSAGE || '연동 처리 중 오류' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '연동 중 오류가 발생했습니다.' });
        }
    }, [onSearch]);

    const columnDefs = useMemo(() => [
        { headerName: '기관명', field: 'allInsttNm', cellStyle: { textAlign: 'left' }, flex: 1 },
        {
            headerName: '부서명', field: 'partNmHi', cellStyle: { textAlign: 'left' }, flex: 1.2,
            cellRenderer: (p) => {
                const raw = p.value || '';
                // PartInfo — 부서명 트리 구조 시각화
                const depth = (raw.match(/└/g) || []).length;
                const name  = raw.replace(/^[└─\u3000\s]+/, '');


                
                if (depth === 0) {
                    return (
                        <span style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ color: '#3b82f6', fontSize: 10 }}>��</span>
                            {name}
                        </span>
                    );
                }
                return (
                    <span style={{ paddingLeft: (depth - 1) * 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#94a3b8', flexShrink: 0, fontFamily: 'monospace', fontSize: 13, letterSpacing: -1 }}>����</span>
                        <span style={{ color: '#334155' }}>{name}</span>
                    </span>
                );
            },
        },
        { headerName: '부서장', field: 'partHeadUserNm', cellStyle: { textAlign: 'center' }, width: 100 },
        { headerName: '부서설명', field: 'partDc', cellStyle: { textAlign: 'left' }, flex: 1.5 },
        { headerName: '정렬', field: 'partOrder', cellStyle: { textAlign: 'center' }, width: 70 },
        { headerName: 'CTI부서', field: 'partEtc1', cellStyle: { textAlign: 'center' }, width: 100 },
        { headerName: 'CTI팀', field: 'partEtc2', cellStyle: { textAlign: 'center' }, width: 100 },
        { headerName: '사용', field: 'partUseyn', cellStyle: { textAlign: 'center' }, width: 70 },
        { headerName: '종료', field: 'partEndyn', cellStyle: { textAlign: 'center' }, width: 70 },
        { headerName: '생성일', field: 'partCreateDe', cellStyle: { textAlign: 'center' }, width: 110 },
        {
            headerName: '인프라', width: 80, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => { setInfraTarget({ partId: p.data?.partId, insttCode: p.data?.insttCode }); setIsInfraModalOpen(true); }}>
                    인프라
                </button>
            ),
        },
        {
            headerName: '수정', width: 80, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => handleOpenPartModal(p.data, p)}>수정</button>
            ),
        },
        {
            headerName: '삭제', width: 80, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handlePartDelete({ code: p.data?.partId, name: p.data?.partNm })}>삭제</button>
            ),
        },
    ], [handleOpenPartModal, handlePartDelete]);

    return (
        <>
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">부서 관리</div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">인사 관리</li>
                            <li className="breadcrumb-item">부서 관리</li>
                        </ol>
                    </div>
                </div>

                <div className="col-12 content-search">
                    <div className="row g-0 w-100 justify-content-between">
                        <div className="col-auto content-search__option">
                            <CommonSelect
                                comboId="searchInsttCode"
                                comboData={insttOptions || []}
                                value={tempParams.searchInsttCode || ''}
                                onChange={handleSearchChange}
                                placeholder={isLoadingInstt ? '로딩 중...' : '기관을 선택하세요'}
                                style={{ height: 32, fontSize: 15 }}
                            />
                            <select name="searchCondition" value={tempParams.searchCondition}
                                onChange={handleInputChange}>
                                <option value="">선택</option>
                                <option value="partId">부서코드</option>
                                <option value="partName">부서명</option>
                            </select>
                            <input type="text" name="searchKeyword" placeholder="검색어를 입력하세요"
                                value={tempParams.searchKeyword}
                                onChange={handleInputChange}
                                onKeyDown={onSearchKeyDown}
                            />
                        </div>
                        <div className="col-auto content-search__action">
                            <button type="button" className="btn btn-outline-dark btn-outline__gray"
                                onClick={() => onSearch(1)}>검색</button>
                            <button type="button" className="btn btn-outline-dark btn-outline__gray"
                                onClick={handleReset}>검색 초기화</button>
                            <button type="button" className="btn btn-outline-secondary btn-outline__gray"
                                onClick={handlePartSync}>부서 연동</button>
                            <button type="button" className="btn btn-primary btn-default__blue"
                                onClick={() => handleOpenPartModal()}>등록</button>
                        </div>
                    </div>
                </div>

                <div className="col-12 content-table content-table__main">
                    <div className="ag-theme-material" style={{ height: 760, width: '100%' }}>
                        <AppAgGrid
                            columnDefs={columnDefs}
                            theme={gridTheme}
                            defaultColDef={defaultColDef}
                            rowModelType="infinite"
                            pagination={true}
                            paginationPageSize={pageUnit}
                            paginationPageSizeSelector={[10, 20, 50, 100, 200, 500]} 
                            cacheBlockSize={pageUnit}
                            maxBlocksInCache={2}
                            rowSelection={{ mode: 'singleSelect' }}
                            onGridReady={onGridReady}
                            overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
                            overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
                        />
                    </div>
                </div>

                <PartFormModal
                    open={isPartModalOpen}
                    form={partForm}
                    setForm={setPartForm}
                    insttOptions={insttOptions || []}
                    parentPartOptions={parentPartOptions}
                    onClose={() => setIsPartModalOpen(false)}
                    onSubmit={handlePartSave}
                />

                <PartInfraModal
                    open={isInfraModalOpen}
                    partId={infraTarget.partId}
                    insttCode={infraTarget.insttCode}
                    onClose={() => setIsInfraModalOpen(false)}
                />
            </div>
        </>
    );
};

export default PartInfo;
