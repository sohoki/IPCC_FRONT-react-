import React, { useState, useMemo, useCallback, lazy } from 'react';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCustomReqDataCombo, useCommonCodeData } from '@/hooks/use-combo-data.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import CODE from '@/constants/CODE.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const PartClassFormModal = lazy(() => import('@/pages/Backoffice/Infra/bld/components/PartClassFormModal.jsx'));

const INITIAL_FORM = {
    mode: 'Ins',
    partClassSeq: '',
    centerCd: '',
    centerNm: '',
    partClass: '',
    partPayCost: '',
    partSpeedPayCost: '',
    partClassOrder: '',
    partIcon: null,
    useYn: 'Y',
};

const INITIAL_SEARCH_FORM = { searchCenterCd: '' };

const PartClassInfo = () => {
    const [pageUnit] = useState(20);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);

    const { options: centerOptions } = useCustomReqDataCombo({
        url: URL.CENTER_COMBO,
        method: 'GET',
        mapping: { id: 'centerId', text: 'centerNm' },
    });
    const { options: partClassCodeOptions } = useCommonCodeData('SEAT_CLASS');

    const fetchData = async (query) => {
        const res = await fnAjaxFetch({ url: URL.PARTCLASS_LIST, method: 'POST', data: query });
        const data = res?.data;
        return {
            rows: data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    };

    const {
        gridApiRef, onGridReady, defaultColDef, tempParams, setTempParams, handleSearch,
    } = useGridInfinite({ fetchApi: fetchData, pageUnit, initialFilters: INITIAL_SEARCH_FORM });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempParams((prev) => ({ ...prev, [name]: value }));
    };
    const onSearch = (pageIndex) => handleSearch(pageIndex || 1);
    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    const handleOpenModal = useCallback((rowData = null) => {
        if (!rowData) {
            setForm(INITIAL_FORM);
        } else {
            setForm({
                ...INITIAL_FORM,
                mode: 'Edt',
                partClassSeq: rowData.part_class_seq || '',
                centerCd: rowData.center_cd || '',
                centerNm: rowData.center_nm || '',
                partClass: rowData.part_class || '',
                partPayCost: rowData.part_pay_cost ?? '',
                partSpeedPayCost: rowData.part_speed_pay_cost ?? '',
                partClassOrder: rowData.part_class_order ?? '',
                useYn: rowData.use_yn || 'Y',
            });
        }
        setModalOpen(true);
    }, []);

    const { handleDelete } = useCommonDelete({
        gridApiRef, URL: URL.PARTCLASS_DELETE, MESSAGE: '구역 등급', reloadFunction: onSearch,
    });

    const { handleSubmit } = useCommonSubmit({
        form,
        type: 'multipart',
        checkField: [
            { inputId: 'centerCd', inputType: CODE.SELECT, message: '지점을' },
            { inputId: 'partClass', inputType: CODE.SELECT, message: '구역 등급을' },
            { inputId: 'partPayCost', inputType: CODE.TEXT, message: '일반 금액을' },
            { inputId: 'partClassOrder', inputType: CODE.TEXT, message: '정렬 순서를' },
        ],
        uploadField: ['partIcon'],
        confirmMessage: `${form.centerNm || ''} 구역 등급 정보를`,
        gridApiRef,
        setModalOpen,
        URL: URL.PARTCLASS_UPDATE,
        reloadFunction: () => onSearch(1),
    });

    const columnDefs = useMemo(() => [
        {
            headerName: '구역', field: 'part_icon', width: 130, sortable: false,
            cellRenderer: (p) => p.value
                ? <img src={`/upload/${p.value}`} style={{ width: 100, height: 50, objectFit: 'contain' }} alt="아이콘" />
                : <span className="text-muted small">없음</span>,
        },
        { headerName: '지점명', field: 'center_nm', width: 140 },
        { headerName: '구역 등급', field: 'part_class_nm', flex: 1 },
        { headerName: '일반 금액', field: 'part_pay_cost', width: 110 },
        { headerName: '스피드온 금액', field: 'part_speed_pay_cost', width: 120 },
        { headerName: '사용여부', field: 'use_yn_value', width: 100 },
        { headerName: '수정자', field: 'last_updusr_id', width: 110 },
        { headerName: '수정일자', field: 'last_updt_dtm', width: 120 },
        {
            headerName: '수정', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify" onClick={() => handleOpenModal(p.data)}>수정</button>
            ),
        },
        {
            headerName: '삭제', width: 70, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleDelete({ code: p.data?.part_class_seq, name: `${p.data?.center_nm || ''} ${p.data?.part_class_nm || ''}` })}>삭제</button>
            ),
        },
    ], [handleOpenModal, handleDelete]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">구역 등급 관리</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">시설 관리</li>
                        <li className="breadcrumb-item">구역 등급 관리</li>
                    </ol>
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
                        <select name="searchCenterCd" className="form-select" style={{ width: 180 }}
                            value={tempParams.searchCenterCd} onChange={handleInputChange}>
                            <option value="">전체 지점</option>
                            {centerOptions.map(o => (<option key={o.code} value={o.code}>{o.codeNm}</option>))}
                        </select>
                    </div>
                    <div className="col-auto content-search__action">
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onSearch(1)}>검색</button>
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleReset()}>검색 초기화</button>
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenModal()}>구역 등급 등록</button>
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

            <PartClassFormModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                form={form}
                setForm={setForm}
                centerOptions={centerOptions}
                partClassCodeOptions={partClassCodeOptions}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default PartClassInfo;
