

const INITIAL_VENDER_FORM = {
    mode : '',
    logoImgFile: null,          // File
    comCode: '',
    comName: '',
    comGubun: '',
    comNumberGubun: '',
    comNumber: '',
    originalComNumber:'',
    comItem: '',
    comBuscondition: '',
    comCeoName: '',
    comZipcode: '',
    comAddr1: '',
    comAddr2: '',
    comTel: '',
    comFax: '',
    comConnectTel: '',
    comHomepage: '',
    comRepresentativeEmail: '',
    comState: '',
    comUseyn: '',
    idCheck: 'N',
}


const VenderInfo = () =>{

    const [searchParams] = useSearchParams();
    const comFirstGubun = searchParams.get('comGubun') || 'COM_GUBUN_1';
    const gridApiRef = useRef(null);

    const [pageIndex, setPageIndex] = useState(1);
    const [pageUnit, setPageUnit] = useState(20);

    // 검색 조건 ref
    const searchRef = useRef(null);
    //벤더사 모달오픈 체크
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_VENDER_FORM);

    return(
        <>
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">
                        {comFirstGubun === "COM_GUBUN_1" ? "공급사" : "판매사"}
                        관리
                    </div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">거래처 관리</li>
                            <li className="breadcrumb-item"> {comFirstGubun === "COM_GUBUN_1" ? "공급사" : "판매사"} 관리</li>
                        </ol>
                    </div>
                </div>
                <div className="col-12 content-search">
                    <div className="row g-0 w-100 justify-content-between">
                    <div className="col-auto content-search__option">
                        {/* 조건 */}
                        <select
                            name="searchCondition"
                            id="searchCondition"
                            ref={searchRef}
                            value={tempParams.condition}
                            onChange={handleInputChange}
                            >
                            <option value="">검색어 구분</option> {/* ✅ selected 속성 제거 (제어 컴포넌트) */}
                            <option value="comName">회사명</option>
                            <option value="comCeoName">대표자명</option>
                        </select>
                        {/* 키워드 */}
                        <input
                            type="text"
                            name="searchKeyword"
                            id="searchKeyword"
                            placeholder="검색어를 입력하세요"
                            value={tempParams.keyword}
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
                        <button type="button" className="btn btn-primary btn-default__blue" onClick={()=> openComModal()}>
                        <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
                        </svg>
                        등록
                        </button>
                    </div>
                    </div>
                </div>
                <div className="ol-12 content-table content-table__main">
                    <div className="ag-theme-alpine" style={{ height: 640, width: '100%' }}>
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
                                rowSelection={{ mode: 'singleSelect' }} 
                                overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
                                overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
                                onGridReady={onGridReady}
                            />
                        </div>
                </div>
            </div>
            {!isLoading &&
                <VenderFormModal
                    open={modalOpen}
                    form={form}
                    setForm={setForm}
                    onClose={()=>{setModalOpen(false)}}
                    onData={options}
                    onSubmit={handleSubmit}
                />
            }           
        </>
    );
}
export default VenderInfo;
