import React, { useCallback, useMemo, useRef, useState, Suspense } from 'react';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import CODE from '@/constants/CODE.jsx';
import {useResetForm}  from '@/hooks/use-form.jsx'

const ProgramFormModal = React.lazy(() => import('./components/ProgramFormModal.jsx'));

const PROGRAM_FORM = {
    mode: "Ins",
    progrmFileNm: '',
    progrmKoreannm: '',
    progrmStrePath: '',
    url : '',
    progrmDc: '',
    idCheck: 'N',
}

const INITIAL_SEARCH_FORM = {
    searchCondition: '',
    searchKeyword: '',
}

const ProgramInfo = () => {
    const gridApiRef = useRef(null);
    const [pageUnit, setPageUnit] = useState(20);
    const [modalOpen, setModalOpen] = useState(false);
    const [programeForm, setProgrameForm] = useState(PROGRAM_FORM);
    const searchRef = useRef(null); //검색

    const handleOpenCodeModal = useCallback( async (rowId, p) => {    
        if (!rowId) {
          setProgrameForm(PROGRAM_FORM);
        } else {
          const rowData = p.data;
          setProgrameForm({
            mode: 'Edt',
            progrmFileNm: rowData.progrmFileNm || '',
            progrmKoreannm: rowData.progrmKoreannm || '',
            progrmStrePath: rowData.progrmStrePath || '',
            url: rowData.url || '',
            testUrl: rowData.testUrl || '',
            progrmDc: rowData.progrmDc || '',
            idCheck: 'Y',
          });
          p.node.setSelected(true); 
        }
        setModalOpen(true);
    }, [setProgrameForm, setModalOpen]);

    //검색 및 Grid 해주기 
    const fetchVenderUsers = useCallback(async (query) => {
        // ✅ params에 필요시 추가  항상 합쳐서 전달
        const req = { ...query }; 

        const res = await fnAjaxFetch({
            url: API_URL.PROGRAM_LIST,
            method: 'POST',
            data: req, // hook 내부에서 구성한 검색/페이징 파라미터
        });
        const data = res?.data;
        return {
            rows: data?.result.resultList || [],
            total: data?.result.paginationInfo?.totalRecordCount || 0,
        };
    }, []);

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
        fetchApi: fetchVenderUsers,
        pageUnit, // 숫자
        initialFilters: { status: '', searchKeyword: '' },
    });

    const effectiveGridApiRef = gridApiFromHook ?? gridApiRef;

    // 검색 입력 변경
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target; // 'status' | 'condition' | 'keyword'
        setTempParams((prev) => ({ ...prev, [name]: value }));
    }, [setTempParams]);

    // 검색 버튼
    const onSearch = useCallback((pageIndex) => {
        handleSearch(pageIndex || 1);
    }, [tempParams, handleSearch]);

    // 엔터 입력
    const onSearchKeyDown = useCallback((e) => {
        if (e.key === 'Enter') onSearch(1);
    }, [onSearch]);


    
    // 삭제
    const { handleDelete } = useCommonDelete({
        gridApiRef: effectiveGridApiRef,
        URL: API_URL.PROGRAM_INFO,
        MESSAGE: `<b>${programeForm.progrmKoreannm}</b>`,
        reloadFunction: () => { // 함수 키워드 또는 화살표 함수 추가
            const api = effectiveGridApiRef.current; // effectiveGridApiRef 사용 권장
            if (api) {
                const currentPage = api.paginationGetCurrentPage(); // 0-based
                onSearch(currentPage + 1); // 1-based로 변환하여 검색 호출
            }
        },
    });
    //저장
    const { handleSubmit } = useCommonSubmit({
        form: programeForm,
        type: 'json',
        checkField: [
            { inputId: "progrmFileNm",   type: CODE.TEXT, message: "프로그램명을" },
            { inputId: "progrmKoreannm", type: CODE.TEXT, message: "한글명을" },
            { inputId: "url",            type: CODE.TEXT, message: "URL을" },
        ],
        confirmMessage: `${programeForm.progrmFileNm} " 프로그램 정보를`,
        gridApiRef : gridApiRef,
        setModalOpen: setModalOpen,
        URL: API_URL.PROGRAME_PROCESS,
        reloadFunction : () => { // 함수 키워드 또는 화살표 함수 추가
            const api = effectiveGridApiRef.current; // effectiveGridApiRef 사용 권장
            if (api) {
                const currentPage = api.paginationGetCurrentPage(); // 0-based
                console.log("currentPage:", currentPage);   
                onSearch(currentPage + 1); // 1-based로 변환하여 검색 호출
            }
        },
    });


    // 컬럼 정의 -----------------------------
    const columnDefs = useMemo(() => 
    [
            { headerName: '프로그램명', field: 'progrmFileNm', width: 180, sortable: true, filter: false },
            { headerName: '한글명', field: 'progrmKoreannm', flex: 1, sortable: true, filter: false },
            { headerName: '저장경로', field: 'progrmStrePath', hide: true },
            { headerName: 'URL', field: 'url', flex: 1, sortable: true, filter: false },
            { headerName: '설명', field: 'progrmDc', flex: 1.2, sortable: false, filter: false },
            {
                headerName: '수정',
                width: 90,
                sortable: false,
                filter: false,
                cellRenderer: (p) => {
                return(
                    <button
                            className='btn btn-outline-secondary btn-outline__gray btn-modify'
                            onClick={()=>handleOpenCodeModal(p.data?.progrmFileNm, p)}
                    >수정 
                    </button>
                )
                },
            },
            {
                headerName: '삭제',
                width: 90,
                sortable: false,
                filter: false,
                cellRenderer: (p) => {
                    return (
                        <button className='btn btn-outline-danger btn-outline__gray btn-delete'
                                    onClick={()=>{handleDelete({
                                        code : p.data?.progrmFileNm,
                                        name: p.data?.progrmKoreannm ,
                                    })}}
                        >삭제
                        </button>
                    )
                    
                },
            },
    ], [handleDelete, handleOpenCodeModal]);
    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);
    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">
                    프로그램 관리
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
                        <select
                                id="searchCondition"
                                name="searchCondition"
                                ref={searchRef}
                                value={tempParams.searchCondition}
                                onChange={handleInputChange}
                            >
                                <option value="" disabled>선택</option>
                                <option value="progrmFileNm">프로그램명</option>
                                <option value="progrmKoreannm">한글명</option>
                                <option value="url">URL</option>
                        </select>
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
                        <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleSearch(1)}>
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
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={()=> handleOpenCodeModal()}>
                            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                            </svg>
                            등록
                        </button>
                    </div>
                </div>
            </div>
            {/* 전체 건수 */}
            {totalCount > 0 && (
                <div className="col-12 content-total">
                    <span>전체 <strong>{totalCount.toLocaleString()}</strong>건</span>
                </div>
            )}
            <div className="col-12 content-table content-table__main">
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
            <Suspense fallback={null}>
                {modalOpen && (
                    <ProgramFormModal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        form={programeForm}
                        setForm={setProgrameForm}
                        onSubmit={handleSubmit}
                    />
                )}
            </Suspense>
        </div>
    );
 
}
export default ProgramInfo;