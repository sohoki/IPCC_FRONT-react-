import { useCallback, useMemo, useRef, useState } from 'react';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import CODE from '@/constants/CODE.jsx';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { useCommonCodeData, useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import { CommonSelect } from '@/components/Common/Select.jsx';
import Swal from '@/lib/swal.js';
import VenderUserFormModal from './components/VenderUserFormModal.jsx';

const INITIAL_USER_FORM = {
  mode: 'Ins',
  idCheck: 'N',
  comCode: '',
  comUserId: '',
  comUserName: '',
  comPassword: '',
  comPasswordConfirm: '',
  comUserRoleid: '',
  comUserStatus: '',
  comUserPhone: '',
  comUserEmail: '',
  comUserUseyn: 'Y',
  lastUpdtPnttm: '',
};

const INITIAL_SEARCH_FORM = {
  searchStatus: '',
  searchCondition: '',
  searchKeyword: '',
};

const ROLE_PARAMS  = { searchRoleGubun: 'ROLE_GUBUN_2', useYn: 'Y' };
const ROLE_MAPPING = { id: 'roleId', text: 'roleName' };

// ── 메인 탭 컴포넌트 ────────────────────────────────────────────────────────
export default function ManagerTapInfo({ comCode }) {
  const searchRef = useRef(null);
  const [pageUnit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...INITIAL_USER_FORM, comCode: comCode || '' });

  // 상태 콤보
  const { options: statusOptions } = useCommonCodeData('USER_STATE');

  // 권한 콤보
  const { options: roleOptions, isLoading: isRoleLoading } = useCustomReqDataCombo({
    url: API_URL.ROLE_COMBO,
    method: 'GET',
    params: ROLE_PARAMS,
    mapping: ROLE_MAPPING,
  });

  const comboData = useMemo(() => ({
    statusOptions: statusOptions || [],
    roleOptions:   roleOptions   || [],
    isLoaded: !isRoleLoading,
  }), [statusOptions, roleOptions, isRoleLoading]);

  // 목록 조회
  const fetchVenderUsers = useCallback(async (query) => {
    const res = await fnAjaxFetch({
      url: API_URL.VENDER_USER_LIST,
      method: 'POST',
      data: { ...query, comCode },
    });
    const data = res?.data;
    return {
      rows:  data?.result?.resultList || [],
      total: data?.result?.paginationInfo?.totalRecordCount || 0,
    };
  }, [comCode]);

  const {
    gridApiRef,
    onGridReady,
    defaultColDef,
    tempParams,
    setTempParams,
    handleSearch,
  } = useGridInfinite({ fetchApi: fetchVenderUsers, pageUnit, initialFilters: INITIAL_SEARCH_FORM });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempParams((prev) => ({ ...prev, [name]: value }));
  }, [setTempParams]);

  const onSearch = useCallback((pageIndex) => {
    if (tempParams.searchKeyword && !tempParams.searchCondition) {
      Swal.fire({ icon: 'warning', title: '검색 확인', text: '검색 조건을 선택해주세요.' });
      searchRef.current?.focus();
      return;
    }
    handleSearch(pageIndex || 1);
  }, [tempParams, handleSearch]);

  const onSearchKeyDown = useCallback((e) => {
    if (e.key === 'Enter') onSearch(1);
  }, [onSearch]);

  const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

  // 모달 오픈
  const openUserModal = useCallback(async (comUserId) => {
    if (!comUserId) {
      setForm({ ...INITIAL_USER_FORM, comCode: comCode || '' });
      setModalOpen(true);
      return;
    }
    try {
      const res = await fnAjaxFetch({
        url: `${API_URL.VENDER_USER_INFO}/${comUserId}.do`,
        method: 'GET',
        withCredentials: true,
      });
      const obj = res?.data?.result?.result ?? null;
      if (obj) {
        setForm({
          mode: 'Edt',
          idCheck: 'Y',
          comCode: comCode || '',
          comUserId: obj.comUserId || '',
          comUserName: obj.comUserName || '',
          comPassword: '',
          comPasswordConfirm: '',
          comUserRoleid: obj.comUserRoleid || '',
          comUserStatus: obj.comUserStatus || '',
          comUserPhone: obj.comUserPhone || '',
          comUserEmail: obj.comUserEmail || '',
          comUserUseyn: obj.comUserUseyn || 'Y',
          lastUpdtPnttm: obj.lastUpdtPnttm || '',
        });
        setModalOpen(true);
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '상세 조회 중 오류' });
    }
  }, [comCode]);

  // 삭제
  const { handleDelete } = useCommonDelete({
    gridApiRef,
    URL: API_URL.VENDER_USER_INFO,
    MESSAGE: '거래처 관리자',
    reloadFunction: onSearch,
  });

  // 저장
  const { handleSubmit } = useCommonSubmit({
    form,
    type: 'json',
    gridApiRef,
    checkField: [
      { inputId: 'comUserId',     type: CODE.TEXT,   message: '아이디를 입력해주세요.' },
      { inputId: 'comUserName',   type: CODE.TEXT,   message: '관리자명을 입력해주세요.' },
      { inputId: 'comUserRoleid', type: CODE.SELECT, message: '권한을 선택해주세요.' },
      { inputId: 'comUserPhone',  type: CODE.TEXT,   message: '전화번호를 입력해주세요.' },
      { inputId: 'comUserEmail',  type: CODE.EMAIL,  message: '이메일을 입력해주세요.' },
    ],
    compareField: [
      { primaryId: 'comPassword', secondaryId: 'comPasswordConfirm', operator: '==', message: '비밀번호가 일치하지 않습니다.' },
    ],
    confirmMessage: `관리자 ${form.comUserName}`,
    setModalOpen,
    URL: API_URL.VENDER_USER_UPDATE,
    reloadFunction: onSearch,
  });

  // 비밀번호 초기화
  const handlePasswordReset = useCallback(async () => {
    if (!form.comUserId) return;
    const result = await Swal.fire({
      icon: 'question',
      title: '비밀번호 초기화',
      text: `${form.comUserName} 관리자의 비밀번호를 초기화 하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '예',
      cancelButtonText: '아니오',
      focusCancel: true,
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fnAjaxFetch({
        url: `${API_URL.VENDER_USER_PWD_RESET}/${form.comUserId}.do`,
        method: 'GET',
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.resultCodeInfo === 'SUCCESS') {
        await Swal.fire({ icon: 'success', title: '완료', text: json.resultMessage || '비밀번호가 초기화되었습니다.' });
      } else {
        await Swal.fire({ icon: 'warning', title: '실패', text: json?.resultMessage || '' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '초기화 중 오류' });
    }
  }, [form.comUserId, form.comUserName]);

  // 컬럼 정의
  const columnDefs = useMemo(() => [
    { headerName: '아이디',     field: 'comUserId',     cellStyle: { textAlign: 'left' },   width: 160 },
    { headerName: '이름',       field: 'comUserName',   cellStyle: { textAlign: 'center' }, width: 110 },
    { headerName: '권한',       field: 'roleName',      cellStyle: { textAlign: 'center' }, width: 120 },
    { headerName: '상태',       field: 'codeNm',        cellStyle: { textAlign: 'center' }, width: 100 },
    { headerName: '연락처',     field: 'comUserPhone',  cellStyle: { textAlign: 'center' }, width: 140 },
    { headerName: '이메일',     field: 'comUserEmail',  cellStyle: { textAlign: 'left' },   flex: 1 },
    { headerName: '사용유무',   field: 'comUserUseyn',  cellStyle: { textAlign: 'center' }, width: 90 },
    { headerName: '최종수정일', field: 'lastUpdtPnttm', cellStyle: { textAlign: 'center' }, width: 150 },
    {
      headerName: '수정', width: 80, sortable: false, filter: false,
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-secondary btn-outline__gray btn-sm"
          onClick={() => openUserModal(p.data?.comUserId)}
        >수정</button>
      ),
    },
    {
      headerName: '삭제', width: 80, sortable: false, filter: false,
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-danger btn-outline__gray btn-sm"
          onClick={() => handleDelete({ code: p.data?.comUserId, name: p.data?.comUserName })}
        >삭제</button>
      ),
    },
  ], [openUserModal, handleDelete]);

  return (
    <>
      {/* 검색 영역 */}
      <div className="col-12 content-search">
        <div className="row g-0 w-100 justify-content-between">
          <div className="col-auto content-search__option">
            <CommonSelect
              comboId="searchStatus"
              comboData={statusOptions || []}
              value={tempParams.searchStatus || ''}
              onChange={handleInputChange}
              placeholder="상태 선택"
            />
            <select
              name="searchCondition"
              ref={searchRef}
              value={tempParams.searchCondition}
              onChange={handleInputChange}
            >
              <option value="">검색어 구분</option>
              <option value="COM_USER_ID">관리자 ID</option>
              <option value="COM_USER_NAME">관리자명</option>
              <option value="COM_USER_PHONE">전화번호</option>
              <option value="COM_USER_EMAIL">이메일</option>
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
              검색
            </button>
            <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={handleReset}>
              검색 초기화
            </button>
            <button type="button" className="btn btn-primary btn-default__blue" onClick={() => openUserModal()}>
              등록
            </button>
          </div>
        </div>
      </div>

      {/* 그리드 */}
      <div className="col-12 content-table content-table__main">
        <AppAgGrid
          columnDefs={columnDefs}
          theme={gridTheme}
          defaultColDef={defaultColDef}
          rowModelType="infinite"
          pagination={true}
          paginationPageSize={pageUnit}
          paginationPageSizeSelector={[10, 20, 50]}
          cacheBlockSize={pageUnit}
          maxBlocksInCache={2}
          rowSelection={{ mode: 'singleSelect' }}
          overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
          overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
          onGridReady={onGridReady}
        />
      </div>

      {/* 등록/수정 모달 */}
      <VenderUserFormModal
        open={modalOpen}
        form={form}
        setForm={setForm}
        onClose={() => setModalOpen(false)}
        comboData={comboData}
        onPasswordReset={handlePasswordReset}
        onSubmit={handleSubmit}
      />
    </>
  );
}

