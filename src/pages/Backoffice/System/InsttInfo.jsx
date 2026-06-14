import React, { useState, useRef, useMemo, useCallback, lazy } from 'react';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { alert } from '@/lib/alert.js';
import CODE from '@/constants/CODE.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import {useResetForm}  from '@/hooks/use-form.jsx'



const InsttFormModal = lazy(() => import('@/pages/Backoffice/System/components/InsttFormModal.jsx'));
const InsttRecFormModal = lazy(() => import('@/pages/Backoffice/System/components/InsttRecFormModal.jsx'));
const InsttInfraFormModal = lazy(()=> import('@/pages/Backoffice/System/components/InsttInfraFormModal.jsx'))

const INITIAL_INSTT_INFOFORM = {
    mode : 'Ins',
    insttCode : '',
    allInsttNm : '',
    insttAbrvNm : '',
    telno : '',
    fxnum : '',
    shortInsttNm : '',
    sortOrdr : 0,
    idCheck: 'N',
};

const INITIAL_REC_SETTING_FORM = {
    mode : 'Ins',
    sttUseyn: '',
    recUseyn: '',
    useYn: '',
    smryYn: '',
    etcYn: '',
    longCallTime: '',
    ctiCode: '',
    tenantId: '',
    insttCode : '',
    insttId : '',
    allInsttNm : '',
}

const INITIAL_SEARCH_FORM = {
    searchCondition: '',
    searchKeyword: '',
}

const InsttInfo = () => {

    const gridApiRef = useRef(null);
    const searchRef = useRef(null);
    const [pageUnit] = useState(20);
    // 기본폼
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_INSTT_INFOFORM);

    const [modalRecOpen, setModalRecOpen] = useState(false);
    const [recForm, setRecForm] = useState(INITIAL_REC_SETTING_FORM);

    const [modalInfraOpen, setModalInfraOpen] = useState(false);
    const [insttInfo, setInsttInfo] = useState(null);

    //검색폼
    const sortState = useRef({ field: 'insttCode', sort: 'asc' });

        const handleOpenModal = useCallback((insttCode, p) => {
        if (!insttCode) {
            setForm(INITIAL_INSTT_INFOFORM);
        } else {
            setForm({
                mode: 'Edt',
                insttCode:    p.data?.insttCode    || '',
                allInsttNm:   p.data?.allInsttNm   || '',
                insttAbrvNm:  p.data?.insttAbrvNm  || '',
                telno:        p.data?.telno        || '',
                fxnum:        p.data?.fxnum        || '',
                shortInsttNm: p.data?.shortInsttNm || '',
                idCheck: 'N',
            });
        }
        setModalOpen(true);
    }, [setForm, setModalOpen]);




    const handleOpenCodeModal = useCallback((p) => {
        if (!p?.data) return;
        setRecForm({
            mode:         'Edt',
            sttUseyn:     p.data?.sttUseyn     || 'N',
            recUseyn:     p.data?.recUseyn     || 'N',
            useYn:        p.data?.useYn        || 'N',
            smryYn:       p.data?.smryYn       || 'N',
            etcYn:        p.data?.etcYn        || 'N',
            longCallTime: p.data?.longCallTime || '',
            insttCode:    p.data?.insttCode    || '',
            insttId:      p.data?.insttId      || '',
            allInsttNm:   p.data?.allInsttNm    || '',
        });
        setModalRecOpen(true);
    }, [setRecForm, setModalRecOpen]);

    
    const handleInfraModal = useCallback((insttCode) => {
        if (!insttCode) return;
        setInsttInfo(insttCode);
        setModalInfraOpen(true);
    }, [setInsttInfo, setModalInfraOpen]);


    const fetchData = async (query) => {
        const req = { ...query, sortField: sortState.current.field, sortOrder: sortState.current.sort };
        const res = await fnAjaxFetch({
            url: URL.INSTT_LIST,
            method: 'POST',
            data: req,
        });
        const data = res?.data;
        return {
            rows: data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    };

    // ✅ 그리드 무한 스크롤 커스텀 훅 (최상위에서 호출)
    const {
        gridApiRef: gridApiFromHook,
        onGridReady,
        defaultColDef,
        tempParams,
        setTempParams,
        handleSearch,
        refreshGrid,
        totalCount,
    } = useGridInfinite({
        fetchApi: fetchData,
        pageUnit, // 페이지 단위
        initialFilters: INITIAL_SEARCH_FORM,
        enableSort: true, // 정렬 기능 활성화
    });

    // 만약 hook이 제공하는 gridApiRef를 쓰기로 했다면, 외부 ref와 동기화(선택)
    const effectiveGridApiRef = gridApiFromHook ?? gridApiRef;



    // 검색 입력 변경
    const handleInputChange = (e) => {
        const { name, value } = e.target; // 'status' | 'condition' | 'keyword'
        setTempParams((prev) => ({ ...prev, [name]: value }));
    };

    // 검색 버튼
    const onSearch = async (pageIndex) => {
        if (tempParams.keyword && !tempParams.condition) {
            searchRef.current?.focus();
            searchRef.current.classList.add('input-focus-highlight');
            setTimeout(() => {
                searchRef.current.classList.remove('input-focus-highlight');
            }, 2000);
            await alert.warning('조건을 선택하세요.', '검색 확인');
            return;
        }
        handleSearch(pageIndex || 1);
    };

    // 엔터 입력
    const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') onSearch(1);
    };




   /* ----- 삭제 ----- */
    const { handleDelete } = useCommonDelete({
        gridApiRef: effectiveGridApiRef,
        URL: URL.INSTT_INFO,
        MESSAGE: '사용자 정보',
        reloadFunction: onSearch,
    });

    const { handleSubmit } = useCommonSubmit({
        form,
        type: 'json',
        checkField: [
             { inputId: "insttCode",    inputType: CODE.TEXT, message: "기관 코드" },
            { inputId: "allInsttNm",   inputType: CODE.TEXT, message: "기관명" },
            { inputId: "shortInsttNm", inputType: CODE.TEXT, message: "기관명(약어)" },
        ],
        confirmMessage: `${form.shortInsttNm} 정보를`,
        gridApiRef: effectiveGridApiRef,
        setModalOpen,
        URL: URL.INSTT_UPDATE,
        reloadFunction: () => onSearch(1),
    });

    const { handleSubmit: handleRecSubmitInner } = useCommonSubmit({
        form: recForm,
        type: 'json',
        checkField: [],
        confirmMessage: `${recForm.insttCode} 녹취 설정 정보를`,
        gridApiRef: effectiveGridApiRef,
        setModalOpen: setModalRecOpen,
        URL: URL.INSTT_INFRA_UPDATE,
        reloadFunction: () => onSearch(1),
    });

    const handleRecSubmit = useCallback(async () => {
        if (!recForm.insttCode) {
            await alert.warning('기관 코드가 없습니다. 기관을 선택해주세요.', '입력 확인');
            return;
        }
        handleRecSubmitInner();
    }, [recForm.insttCode, handleRecSubmitInner]);

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    // 컬럼 정의 -----------------------------
    const columnDefs = useMemo(() => 
    [
            { headerName: '기관코드', field: 'insttCode', width: 120, sortable: true, filter: true },
            { headerName: '기관명', field: 'allInsttNm', flex: 1, sortable: true, filter: true },
            { headerName: '기관약어', field: 'insttAbrvNm', width: 120, sortable: false, filter: false},
            { headerName: '전화번호', field: 'telno', flex: 1, sortable: false, filter: false },
            { headerName: '팩스번호', field: 'fxnum', flex: 1, sortable: false, filter: false },
            { headerName: '변경일자', field: 'setChangede', flex: 1, sortable: false, filter: false },
            { headerName: '녹취설정', field: 'setChangede', flex: 2.3,  
                cellRenderer:(p)=>{
                const isSttUse = (p.data?.sttUseyn || 'N') === 'Y';
                const isRecUse = (p.data?.recUseyn || 'N') === 'Y';
                const isSmryUse = (p.data?.smryUseYn || 'N') === 'Y';
                    return (
                        <div className="d-flex align-items-center gap-2 mt-2">
                            <span 
                            className={`badge rounded-pill ${isSttUse ? 'bg-danger' : 'bg-success'} px-3 py-2`}
                            style={{ fontSize: '0.85rem', fontWeight: '500' }}
                            >
                                STT {isSttUse ? ' 미사용' : '사용'}
                            </span>
                            <span 
                            className={`badge rounded-pill ${isRecUse ? 'bg-danger' : 'bg-success'} px-3 py-2`}
                            style={{ fontSize: '0.85rem', fontWeight: '500' }}
                            >
                                녹취 {isRecUse ? ' 미사용' : '사용'}
                            </span>
                            <span 
                            className={`badge rounded-pill ${isSmryUse ? 'bg-danger' : 'bg-success'} px-3 py-2`}
                            style={{ fontSize: '0.85rem', fontWeight: '500' }}
                            >
                                요약 {isSttUse ? ' 미사용' : '사용'}
                            </span>
                        </div>
                    );
                }

            },
            { headerName: '폐지구분', field: 'ablEnnc', 
                width: 100, sortable: false, filter: false,
                cellRenderer:(p)=>{
                const useYn = p.data?.ablEnnc || 'N';
                const isUse = useYn === 'Y';
                return (
                    <span 
                    className={`badge rounded-pill ${isUse ? 'bg-danger' : 'bg-success'} px-3 py-2`}
                    style={{ fontSize: '0.85rem', fontWeight: '500' }}
                    >
                        {isUse ? '폐지' : '사용'}
                    </span>
                );
            }
            },
            {
                headerName: 'AI 녹취 설정',
                width: 120,
                sortable: false,
                filter: false,
                cellRenderer: (p) => (
                    <button
                        className='btn btn-outline-secondary btn-outline__gray btn-modify'
                        onClick={() => handleOpenCodeModal(p)}
                    >설정</button>
                ),
            },
            {
                headerName: 'INFRA 설정',
                width: 120,
                sortable: false,
                filter: false,
                cellRenderer: (p) => {
                return(
                    <button
                            className='btn btn-outline-secondary btn-outline__gray btn-modify'
                            onClick={()=>handleInfraModal(p.data?.insttCode, p.data)}
                    >설정 
                    </button>
                )
                },
            },
            {
                headerName: '수정',
                width: 80,
                sortable: false,
                filter: false,
                cellRenderer: (p) => {
                return(
                    <button
                            className='btn btn-outline-secondary btn-outline__gray btn-modify'
                            onClick={()=>handleOpenModal(p.data?.insttCode, p)}
                    >수정 
                    </button>
                )
                },
            },
            {
                headerName: '삭제',
                width: 80,
                sortable: false,
                filter: false,
                cellRenderer: (p) => {
                    return (
                        <button className='btn btn-outline-danger btn-outline__gray btn-delete'
                                    onClick={()=>{handleDelete({
                                        code : p.data?.insttCode,
                                        name: p.data?.insttAbrvNm ,
                                    })}}
                        >삭제
                        </button>
                    )
                    
                },
            },
    ], [handleDelete, handleOpenModal, handleOpenCodeModal, handleInfraModal]);


    const handleInsttInterface = async()=>{
        const res  = await fnAjaxFetch({
            url: URL.INSTT_INTERFACE,
            method: 'POST',
            data: { },
            withCredentials: true,
        });
        if (res?.data?.resultCodeInfo === 'SUCCESS') {
            await alert.success(res?.data?.resultMessage);
            onSearch(1);
        } else {
             // 2. data -> res.data로 수정, await 중복 제거
            await alert.error(res?.data?.resultMessage || '조회 중 문제가 발생하였습니다.');
        }
    }

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">
                    연계 기관 관리
                </div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">기초 관리</li>
                        <li className="breadcrumb-item">프로그램 관리</li>
                    </ol>
                </div>
            </div>
            <div className="col-12 content-search">
                <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option">
                        <input
                            type="text"
                            name="searchKeyword"
                            id="searchKeyword"
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
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={()=> handleInsttInterface()}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                            </svg>
                            기관 연동
                        </button>
                    </div>
                </div>
            </div>
            <div className="ol-12 content-table content-table__main">
                <div className="ag-theme-material" style={{ height: 760, width: '100%' }}>
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
                         domLayout='autoHeight' // 데이터 양에 맞춰 그리드 높이 자동 조절
                        overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
                        overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
                        onGridReady={onGridReady}
                    />
                </div>
            </div>
            <InsttFormModal
                open={modalOpen}
                onClose={()=>setModalOpen(false)}
                form={form}
                setForm={setForm}
                onSubmit={handleSubmit}
            />
            <InsttRecFormModal
                open={modalRecOpen}
                onClose={()=>setModalRecOpen(false)}
                form={recForm}
                setForm={setRecForm}
                onSubmit={handleRecSubmit}
             />
             <InsttInfraFormModal
                open={modalInfraOpen}
                onClose={()=>setModalInfraOpen(false)}
                insttInfo={insttInfo}
             />
        </div>
    );
}
export default InsttInfo;
