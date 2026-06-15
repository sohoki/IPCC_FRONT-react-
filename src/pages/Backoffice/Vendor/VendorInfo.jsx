import { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import Swal from '@/lib/swal.js';
import VenderForm from './components/VenderForm.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const STATE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1', '#94a3b8'];

// 로고 없음 / 로드 실패 시 사용하는 SVG 플레이스홀더 data URI
const NO_IMG_SRC = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
  '<rect width="24" height="24" rx="4" fill="#f1f5f9"/>' +
  '<rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>' +
  '<circle cx="9" cy="9" r="1.5" fill="#94a3b8"/>' +
  '<path d="M4 17l4-4 4 4 2-2 4 3" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>' +
  '</svg>'
)}`;


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
  comMemo: '',
  idCheck: 'N',
};

const INITIAL_SEARCH_FORM = {
  searchCondition: '',
  searchKeyword: '',
};

const VendorInfo = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const comFirstGubun = searchParams.get('comGubun') || 'COM_GUBUN_1';


  const { options: comStateOptions } = useCommonCodeData('COMPANY_STATE');
  const { options: comGubunOptions } = useCommonCodeData('COMPANY_GUBUN');

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

  const handleNameClick = useCallback((comCode) => {
    navigate(`/sub/client/detail/${comCode}?comGubun=${comFirstGubun}`);
  }, [navigate, comFirstGubun]);

  const openComModal = useCallback(async (comCode) => {
    console.log("comCode:" + comCode);

    if (!comCode) {
      setForm({ ...INITIAL_VENDER_FORM, comGubun: comFirstGubun });
      setModalOpen(true);
      return;
    }
    try {
      const res = await fnAjaxFetch({
        url: `${URL.VENDER_INFO}/${comCode}.do`, 
        method: 'GET' ,
        withCredentials: true,
      });
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
          comMemo : obj.comUseyn || '',
          idCheck: 'Y',
        });
        setModalOpen(true);
      } else {
        await Swal.fire({ icon: 'warning', title: '조회 실패', text: '거래처 정보를 불러오지 못했습니다.' });
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
    MESSAGE: comFirstGubun === 'COM_GUBUN_1' ? '거래처' : '판매사',
    reloadFunction: onSearch,
  });

  const handleStateChange = useCallback(async (comCode, newState, node, colDef) => {
    try {
      await fnAjaxFetch({
        url: URL.VENDER_STATE_UPDATE,
        method: 'POST',
        data: { comCode, comState: newState },
        withCredentials: true,
      });
      node.setDataValue(colDef.field, newState);
    } catch (e) {
      await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '상태 변경 중 오류' });
    }
  }, []);

  const handleUseynChange = useCallback(async (comCode, newValue, node, colDef) => {
    try {
      await fnAjaxFetch({
        url: URL.VENDER_USEYN_UPDATE,
        method: 'POST',
        data: { comCode, comUseyn: newValue },
        withCredentials: true,
      });
      node.setDataValue(colDef.field, newValue);
    } catch (e) {
      await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '사용유무 변경 중 오류' });
    }
  }, []);

  const columnDefs = useMemo(() => [
    {
      headerName: '회사명', field: 'comName', flex: 1.2,
      cellRenderer: (params) => {
        const logo = params.data?.comLogo;
        const IMG_URL = import.meta.env.VITE_REACT_APP_IMG_URL;
        const imgSrc = logo ? `${IMG_URL}${logo}` : NO_IMG_SRC;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: '100%' }}>
            <img
              src={imgSrc}
              alt=""
              style={{ width: 22, height: 22, objectFit: 'contain', borderRadius: 3, flexShrink: 0 }}
              onError={(e) => { e.currentTarget.src = NO_IMG_SRC; }}
            />
            <span
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', color: '#0d6efd', textDecoration: 'underline' }}
              onClick={() => handleNameClick(params.data?.comCode)}
            >{params.value}
            </span>
          </div>
        );
      },
    },
    { headerName: '구분', field: 'comGubunNm', cellStyle: { textAlign: 'left' }, width: 140 },
    { headerName: '대표자명', field: 'comCeoName', cellStyle: { textAlign: 'center' }, width: 110 },
    { headerName: '사업자 번호', field: 'comNumber', cellStyle: { textAlign: 'center' }, width: 140 },
    { headerName: '전화번호', field: 'comTel', cellStyle: { textAlign: 'center' }, width: 130 },
    { headerName: '홈페이지', field: 'comHomepage', cellStyle: { textAlign: 'left' }, flex: 1 },
    {
      headerName: '상태', field: 'comState', width: 150, sortable: false,
      cellRenderer: (params) => {
        const idx = comStateOptions.findIndex(
          (o) => (o.codeDetailId || o.code) === params.data?.comState
        );
        const color = STATE_COLORS[idx >= 0 ? idx : STATE_COLORS.length - 1];
        return (
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <select
              value={params.data?.comState || ''}
              onChange={(e) => handleStateChange(params.data?.comCode, e.target.value, params.node, params.colDef)}
              style={{
                width: '100%', height: 26, fontSize: 12,
                border: `1px solid ${color}`, color,
                outline: 'none', cursor: 'pointer',
                background: 'transparent',
              }}
            >
              {comStateOptions.map((o) => (
                <option key={o.codeDetailId || o.code} value={o.codeDetailId || o.code}>
                  {o.codeDetailNm || o.codeNm}
                </option>
              ))}
            </select>
          </div>
        );
      },
    },
    {
      headerName: '사용유무', field: 'comUseyn', cellStyle: { textAlign: 'center' }, width: 110,
      cellRenderer: (params) => {
        const handleChange = async (payload) => {
          await handleUseynChange(params.data?.comCode, payload.comUseyn, params.node, params.colDef);
        };
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <UseSwitch
              value={params.value}
              name="comUseyn"
              onChange={handleChange}
              onText="사용"
              offText="사용안함"
            />
          </div>
        );
      },
    },
    {
      headerName: '수정', width: 80, sortable: false, filter: false,
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-secondary btn-outline__gray btn-modify"
          onClick={()=>openComModal(p.data?.comCode)}
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
  ], [comStateOptions, handleStateChange, handleUseynChange, handleNameClick, openComModal, handleDelete]);

  const titleLabel = comFirstGubun === 'COM_GUBUN_1' ? '거래처' : '판매사';

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
        onData={[comStateOptions, comGubunOptions]}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default VendorInfo;
