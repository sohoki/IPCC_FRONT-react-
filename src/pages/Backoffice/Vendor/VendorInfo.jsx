import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import Swal from '@/lib/swal.js';
import VenderForm from './components/VenderForm.jsx';

const INITIAL_VENDER_FORM = {
  mode: 'Ins',
  logoImgFile: null,
  comCode: '',
  comName: '',
  comGubun: '',
  comNumberGubun: '',
  comNumber: '',
  originalComNumber: '',
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
  comUseyn: 'Y',
  idCheck: 'N',
};

const INITIAL_SEARCH_FORM = {
  searchCondition: '',
  searchKeyword: '',
};

const VendorInfo = () => {
  const [searchParams] = useSearchParams();
  const comFirstGubun = searchParams.get('comGubun') || 'COM_GUBUN_1';

  const [pageUnit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...INITIAL_VENDER_FORM, comGubun: comFirstGubun });

  const fetchVenderList = useCallback(async (query) => {
    const res = await fnAjaxFetch({
      url: URL.VENDER_LIST,
      method: 'POST',
      data: { ...query, searchGubun: comFirstGubun },
    });
    const data = res?.data;
    return {
      rows: data?.result?.resultList || [],
      total: data?.result?.paginationInfo?.totalRecordCount || 0,
    };
  }, [comFirstGubun]);

  const {
    gridApiRef,
    onGridReady,
    defaultColDef,
    tempParams,
    setTempParams,
    handleSearch,
  } = useGridInfinite({ fetchApi: fetchVenderList, pageUnit, initialFilters: INITIAL_SEARCH_FORM });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempParams((prev) => ({ ...prev, [name]: value }));
  }, [setTempParams]);

  const onSearch = useCallback((page) => handleSearch(page || 1), [handleSearch]);

  const onSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') onSearch(1);
  }, [onSearch]);

  const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

  const openComModal = useCallback(async (comCode) => {
    if (!comCode) {
      setForm({ ...INITIAL_VENDER_FORM, comGubun: comFirstGubun });
      setModalOpen(true);
      return;
    }
    try {
      const res = await fnAjaxFetch({ url: `${URL.VENDER_INFO}/${comCode}.do`, method: 'GET' });
      const obj = res?.data?.result?.result ?? null;
      if (obj) {
        setForm({
          mode: 'Edt',
          logoImgFile: null,
          comCode: obj.comCode || '',
          comName: obj.comName || '',
          comGubun: obj.comGubun || comFirstGubun,
          comNumberGubun: obj.comNumberGubun || '',
          comNumber: obj.comNumber || '',
          originalComNumber: obj.comNumber || '',
          comItem: obj.comItem || '',
          comBuscondition: obj.comBuscondition || '',
          comCeoName: obj.comCeoName || '',
          comZipcode: obj.comZipcode || '',
          comAddr1: obj.comAddr1 || '',
          comAddr2: obj.comAddr2 || '',
          comTel: obj.comTel || '',
          comFax: obj.comFax || '',
          comConnectTel: obj.comConnectTel || '',
          comHomepage: obj.comHomepage || '',
          comRepresentativeEmail: obj.comRepresentativeEmail || '',
          comState: obj.comState || '',
          comUseyn: obj.comUseyn || 'Y',
          idCheck: 'Y',
        });
        setModalOpen(true);
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '상세 조회 중 오류' });
    }
  }, [comFirstGubun]);

  const handleSubmit = useCallback(async () => {
    if (!form.comName?.trim()) {
      await Swal.fire({ icon: 'warning', title: '입력 오류', text: '회사명을 입력해 주세요.' });
      return;
    }
    if (form.mode === 'Ins' && form.idCheck !== 'Y') {
      await Swal.fire({ icon: 'warning', title: '입력 오류', text: '사업자 등록번호 중복체크를 해주세요.' });
      return;
    }
    try {
      const submitData = new FormData();
      submitData.append('mode', form.mode);
      submitData.append('comCode', form.comCode || '');
      submitData.append('comName', form.comName || '');
      submitData.append('comGubun', form.comGubun || comFirstGubun);
      submitData.append('comNumber', form.comNumber || '');
      submitData.append('comBuscondition', form.comBuscondition || '');
      submitData.append('comItem', form.comItem || '');
      submitData.append('comCeoName', form.comCeoName || '');
      submitData.append('comZipcode', form.comZipcode || '');
      submitData.append('comAddr1', form.comAddr1 || '');
      submitData.append('comAddr2', form.comAddr2 || '');
      submitData.append('comTel', form.comTel || '');
      submitData.append('comFax', form.comFax || '');
      submitData.append('comHomepage', form.comHomepage || '');
      submitData.append('comState', form.comState || '');
      submitData.append('comUseyn', form.comUseyn || 'Y');
      if (form.logoImgFile instanceof File) {
        submitData.append('comImgFile', form.logoImgFile);
      }

      const res = await fnAjaxFetch({
        url: URL.VENDER_UPDATE,
        method: 'POST',
        data: submitData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const json = res?.data;
      if (json?.resultCodeInfo === 'SUCCESS') {
        await Swal.fire({ icon: 'success', title: '완료', text: json?.resultMessage || '저장되었습니다.' });
        setModalOpen(false);
        onSearch(1);
      } else {
        await Swal.fire({ icon: 'error', title: '오류', text: json?.resultMessage || '저장에 실패했습니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '저장 중 오류가 발생했습니다.' });
    }
  }, [form, comFirstGubun, onSearch]);

  const { handleDelete } = useCommonDelete({
    gridApiRef,
    URL: URL.VENDER_INFO,
    MESSAGE: comFirstGubun === 'COM_GUBUN_1' ? '공급사' : '판매사',
    reloadFunction: onSearch,
  });

  const columnDefs = useMemo(() => [
    { headerName: '회사코드', field: 'comCode', cellStyle: { textAlign: 'center' }, width: 120 },
    { headerName: '회사명', field: 'comName', cellStyle: { textAlign: 'left' }, flex: 1.5 },
    { headerName: '대표자명', field: 'comCeoName', cellStyle: { textAlign: 'center' }, width: 110 },
    { headerName: '사업자 번호', field: 'comNumber', cellStyle: { textAlign: 'center' }, width: 140 },
    { headerName: '전화번호', field: 'comTel', cellStyle: { textAlign: 'center' }, width: 130 },
    { headerName: '홈페이지', field: 'comHomepage', cellStyle: { textAlign: 'left' }, flex: 1 },
    { headerName: '상태', field: 'comState', cellStyle: { textAlign: 'center' }, width: 90 },
    { headerName: '사용', field: 'comUseyn', cellStyle: { textAlign: 'center' }, width: 70 },
    {
      headerName: '수정', width: 80, sortable: false, filter: false,
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-secondary btn-outline__gray btn-modify"
          onClick={() => openComModal(p.data?.comCode)}
        >
          수정
        </button>
      ),
    },
    {
      headerName: '삭제', width: 80, sortable: false, filter: false,
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-danger btn-outline__gray btn-delete"
          onClick={() => handleDelete({ code: p.data?.comCode, name: p.data?.comName })}
        >
          삭제
        </button>
      ),
    },
  ], [openComModal, handleDelete]);

  const titleLabel = comFirstGubun === 'COM_GUBUN_1' ? '공급사' : '판매사';

  return (
    <>
      <div className="row g-0 main-contents">
        <div className="col-12 content-header">
          <div className="content-header__title">{titleLabel} 관리</div>
          <div className="content-header__breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">거래처 관리</li>
              <li className="breadcrumb-item">{titleLabel} 관리</li>
            </ol>
          </div>
        </div>

        <div className="col-12 content-search">
          <div className="row g-0 w-100 justify-content-between">
            <div className="col-auto content-search__option">
              <select
                name="searchCondition"
                id="searchCondition"
                value={tempParams.searchCondition}
                onChange={handleInputChange}
              >
                <option value="">검색어 구분</option>
                <option value="comName">회사명</option>
                <option value="comCeoName">대표자명</option>
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
              <button
                type="button"
                className="btn btn-outline-dark btn-outline__gray"
                onClick={() => onSearch(1)}
              >
                <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.7 5C12.0791 5 13.4018 5.58699 14.377 6.63183C15.3521 7.67668 15.9 9.09379 15.9 10.5714C15.9 11.9514 15.428 13.22 14.652 14.1971L14.868 14.4286H15.5L19.5 18.7143L18.3 20L14.3 15.7143V15.0371L14.084 14.8057C13.172 15.6371 11.988 16.1429 10.7 16.1429C9.32087 16.1429 7.99823 15.5559 7.02304 14.511C6.04786 13.4662 5.5 12.0491 5.5 10.5714C5.5 9.09379 6.04786 7.67668 7.02304 6.63183C7.99823 5.58699 9.32087 5 10.7 5ZM10.7 6.71429C8.7 6.71429 7.1 8.42857 7.1 10.5714C7.1 12.7143 8.7 14.4286 10.7 14.4286C12.7 14.4286 14.3 12.7143 14.3 10.5714C14.3 8.42857 12.7 6.71429 10.7 6.71429Z" fill="currentColor" />
                </svg>
                검색
              </button>
              <button
                type="button"
                className="btn btn-outline-dark btn-outline__gray"
                onClick={handleReset}
              >
                초기화
              </button>
              <button
                type="button"
                className="btn btn-primary btn-default__blue"
                onClick={() => openComModal()}
              >
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor" />
                </svg>
                등록
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 content-table content-table__main">
          <div className="ag-theme-material" style={{ height: 640, width: '100%' }}>
            <AppAgGrid
              columnDefs={columnDefs}
              theme={gridTheme}
              defaultColDef={defaultColDef}
              rowModelType="infinite"
              pagination={true}
              paginationPageSize={pageUnit}
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

      <VenderForm
        open={modalOpen}
        form={form}
        setForm={setForm}
        onClose={() => setModalOpen(false)}
        onData={[[], []]}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default VendorInfo;
