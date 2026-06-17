import React, { useState, useMemo, useCallback, lazy } from 'react';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const ExchangeFormModal = lazy(() => import('./ExchangeFormModal.jsx'));

const INITIAL_FORM = {
  mode: 'Ins',
  gubun: 'exchange',
  processNm: '',
  routingKey: 'Y',
  autoDel: 'N',
  type: 'direct',
  idCheck: 'N',
};

const INITIAL_SEARCH = { searchKeyword: '' };

const ExchangeTab = () => {
  const [pageUnit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchData = useCallback(async (query) => {
    const res = await fnAjaxFetch({ url: URL.EXCHANGE_LIST, method: 'POST', data: query });
    const data = res?.data;
    return {
      rows: data?.result?.resultList || [],
      total: data?.result?.paginationInfo?.totalRecordCount || 0,
    };
  }, []);

  const { gridApiRef, onGridReady, defaultColDef, tempParams, setTempParams, handleSearch } =
    useGridInfinite({ fetchApi: fetchData, pageUnit, initialFilters: INITIAL_SEARCH });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempParams(prev => ({ ...prev, [name]: value }));
  }, [setTempParams]);

  const onSearch = useCallback((page) => handleSearch(page || 1), [handleSearch]);
  const onSearchKeyDown = useCallback((e) => { if (e.key === 'Enter') onSearch(1); }, [onSearch]);
  const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH);

  const handleOpenModal = useCallback(() => {
    setForm(INITIAL_FORM);
    setModalOpen(true);
  }, []);

  const { handleDelete } = useCommonDelete({
    gridApiRef,
    URL: URL.EXCHANGE_DELETE,
    MESSAGE: 'Exchange',
    reloadFunction: () => onSearch(1),
  });

  const { handleSubmit } = useCommonSubmit({
    form, type: 'json', checkField: [],
    confirmMessage: `Exchange [${form.processNm}]를 저장하시겠습니까?`,
    gridApiRef, setModalOpen, URL: URL.EXCHANGE_CREATE,
    reloadFunction: () => onSearch(1),
  });

  const columnDefs = useMemo(() => [
    { headerName: 'Exchange 이름', field: 'exchangeName', flex: 1 },
    {
      headerName: '유형', field: 'exchangeType', width: 110,
      cellRenderer: (p) => (
        <span className="badge rounded-pill bg-info text-dark px-3 py-2" style={{ fontSize: '0.82rem' }}>
          {p.value || '-'}
        </span>
      ),
    },
    {
      headerName: '내구성', field: 'exchangeDurability', width: 110,
      cellRenderer: (p) => (
        <span className={`badge rounded-pill ${p.value === 'Y' ? 'bg-success' : 'bg-secondary'} px-3 py-2`} style={{ fontSize: '0.82rem' }}>
          {p.value === 'Y' ? '영구' : '일시'}
        </span>
      ),
    },
    {
      headerName: '자동삭제', field: 'exchangeAutodelete', width: 110,
      cellRenderer: (p) => (
        <span className={`badge rounded-pill ${p.value === 'Y' ? 'bg-warning text-dark' : 'bg-secondary'} px-3 py-2`} style={{ fontSize: '0.82rem' }}>
          {p.value === 'Y' ? '자동' : '수동'}
        </span>
      ),
    },
    { headerName: '최종 수정자', field: 'lastUpdusrId', width: 130 },
    { headerName: '최종 수정일', field: 'lastUpdtPnttm', width: 150 },
    {
      headerName: '삭제', width: 80, sortable: false, filter: false,
      cellRenderer: (p) => (
        <button className="btn btn-outline-danger btn-outline__gray btn-delete"
          onClick={() => handleDelete({ code: p.data?.exchangeName, name: p.data?.exchangeName })}>삭제</button>
      ),
    },
  ], [handleDelete]);

  return (
    <>
      <div className="col-12 content-search">
        <div className="row g-0 w-100 justify-content-between">
          <div className="col-auto content-search__option">
            <input type="text" name="searchKeyword" placeholder="Exchange 이름으로 검색"
              value={tempParams.searchKeyword} onChange={handleInputChange} onKeyDown={onSearchKeyDown} />
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
            <button type="button" className="btn btn-primary btn-default__blue" onClick={handleOpenModal}>
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
              </svg>
              등록
            </button>
          </div>
        </div>
      </div>
      <div className="col-12 content-table content-table__main">
        <div className="ag-theme-material" style={{ width: '100%' }}>
          <AppAgGrid
            columnDefs={columnDefs} theme={gridTheme} defaultColDef={defaultColDef}
            rowModelType="infinite" pagination={true} paginationPageSize={pageUnit}
            paginationPageSizeSelector={[10, 20, 50, 100]} cacheBlockSize={pageUnit}
            maxBlocksInCache={2} domLayout="autoHeight"
            overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
            overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
            onGridReady={onGridReady}
          />
        </div>
      </div>
      <ExchangeFormModal open={modalOpen} onClose={() => setModalOpen(false)}
        form={form} setForm={setForm} onSubmit={handleSubmit} />
    </>
  );
};

export default ExchangeTab;
