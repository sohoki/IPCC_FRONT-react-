import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useResetForm } from '@/hooks/use-form.jsx';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import SkillEmployeeCellRenderer from './components/SkillEmployeeCellRenderer.jsx';

const CENTER_ID = '1';

const INITIAL_SEARCH = {
  searchTenant: '',
  searchCondition: '',
  searchKeyword: '',
};

const INITIAL_SKILL_FORM = {
  mode: 'Ins',
  centerId: CENTER_ID,
  tenantId: '',
  skillId: '',
  skillName: '',
  skillDesc: '',
  idCheck: 'N',
};

const INITIAL_EMP_FORM = {
  mode: 'Ins',
  centerId: CENTER_ID,
  tenantId: '',
  employeegrpId: '',
  employeepartId: '',
  employeeId: '',
  skillLevel: '',
  skillId: '',
};

// ── SKILL 등록/수정 모달 ───────────────────────────────────────────────────────
const SkillFormModal = ({ open, onClose, skillData, tenantOptions, onSuccess }) => {
  const isEdt = skillData?.mode === 'Edt';
  const [form, setForm] = useState(INITIAL_SKILL_FORM);

  useEffect(() => {
    if (!open) return;
    if (!isEdt) {
      setForm({ ...INITIAL_SKILL_FORM });
      return;
    }
    setForm({
      mode: 'Edt',
      centerId: skillData.centerId || CENTER_ID,
      tenantId: skillData.tenantId || '',
      skillId: skillData.skillId || '',
      skillName: skillData.skillName || '',
      skillDesc: skillData.skillDesc || '',
      idCheck: 'Y',
    });
  }, [open, skillData, isEdt]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value, ...(name === 'skillId' ? { idCheck: 'N' } : {}) }));
  }, []);

  const handleIdCheck = useCallback(async () => {
    if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: 'Tenant를 선택해 주세요.' }); return; }
    if (!form.skillId) { await Swal.fire({ icon: 'warning', text: 'SKILL ID를 입력해 주세요.' }); return; }
    if (parseInt(form.skillId) > 512) { await Swal.fire({ icon: 'warning', text: 'SKILL ID는 512를 초과할 수 없습니다.' }); return; }
    try {
      const res = await fnAjaxFetch({
        url: URL.SKILL_CHECK,
        method: 'POST',
        data: { centerId: form.centerId, tenantId: form.tenantId, skillId: form.skillId },
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS') {
        setForm(p => ({ ...p, idCheck: 'Y' }));
        await Swal.fire({ icon: 'success', text: json?.MESSAGE || '사용 가능한 SKILL ID입니다.' });
      } else {
        setForm(p => ({ ...p, idCheck: 'N' }));
        await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '이미 사용 중인 SKILL ID입니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', text: e?.message || '중복 확인 중 오류가 발생하였습니다.' });
    }
  }, [form]);

  const handleSave = useCallback(async () => {
    if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: 'Tenant를 선택해 주세요.' }); return; }
    if (!form.skillId) { await Swal.fire({ icon: 'warning', text: 'SKILL ID를 입력해 주세요.' }); return; }
    if (parseInt(form.skillId) > 512) { await Swal.fire({ icon: 'warning', text: 'SKILL ID는 512를 초과할 수 없습니다.' }); return; }
    if (!isEdt && form.idCheck !== 'Y') { await Swal.fire({ icon: 'warning', text: '중복 확인이 필요합니다.' }); return; }
    if (!form.skillName) { await Swal.fire({ icon: 'warning', text: 'SKILL 명을 입력해 주세요.' }); return; }

    const action = isEdt ? '수정' : '등록';
    const ok = await Swal.fire({
      icon: 'question',
      title: `SKILL ${action}`,
      html: `<b>${form.skillName}</b> 를(을) ${action} 하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!ok.isConfirmed) return;

    try {
      const res = await fnAjaxFetch({
        url: URL.SKILL_UPDATE,
        method: 'POST',
        data: {
          mode: form.mode,
          centerId: form.centerId,
          tenantId: form.tenantId,
          skillId: form.skillId,
          skillName: form.skillName,
          skillDesc: form.skillDesc,
        },
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
        await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}되었습니다.` });
        onSuccess();
      } else {
        await Swal.fire({ icon: 'error', title: '오류', text: json?.MESSAGE || '처리 중 문제가 발생하였습니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '처리 도중 문제가 발생하였습니다.' });
    }
  }, [form, isEdt, onSuccess]);

  if (!open) return null;
  return (
    <div className="modal-backdrop-custom">
      <div className="modal-custom">
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ width: 520, maxWidth: '95%', backgroundColor: '#fff' }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <h2 className="modal-title__title">SKILL {isEdt ? '수정' : '등록'}</h2>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="modal-body__content">
                <div className="row input-box-wrap">
                  {/* TENANT */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">TENANT <span className="text-danger">*</span></label>
                      <select
                        name="tenantId"
                        className="form-select"
                        value={form.tenantId}
                        onChange={handleChange}
                        disabled={isEdt}
                      >
                        <option value="">선택</option>
                        {tenantOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* SKILL ID */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">SKILL ID <span className="text-danger">*</span></label>
                      {isEdt ? (
                        <input type="text" className="form-control" value={form.skillId} readOnly />
                      ) : (
                        <div className="input-group">
                          <input
                            type="text"
                            name="skillId"
                            className="form-control"
                            maxLength={3}
                            placeholder="숫자 최대 3자리 (512 이하)"
                            value={form.skillId}
                            onChange={(e) => {
                              const v = e.target.value.replace(/[^0-9]/g, '');
                              setForm(p => ({ ...p, skillId: v, idCheck: 'N' }));
                            }}
                          />
                          <button type="button" className="btn btn-outline-secondary" onClick={handleIdCheck}>
                            중복확인
                          </button>
                        </div>
                      )}
                      {!isEdt && (
                        <small className="text-muted">SKILL ID는 512를 초과할 수 없습니다.</small>
                      )}
                    </div>
                  </div>
                  {/* SKILL 명 */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">SKILL 명 <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="skillName"
                        className="form-control"
                        value={form.skillName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  {/* SKILL 설명 */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">SKILL 설명</label>
                      <input
                        type="text"
                        name="skillDesc"
                        className="form-control"
                        value={form.skillDesc}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-footer__left" />
              <div className="modal-footer__right">
                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>저장</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── SKILL 사용자 등록 모달 ────────────────────────────────────────────────────
const SkillEmpFormModal = ({ open, onClose, initialSkillId, initialTenantId, onSuccess }) => {
  const [form, setForm] = useState({ ...INITIAL_EMP_FORM });
  const [groupOptions, setGroupOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [empOptions, setEmpOptions] = useState([]);

  const { options: tenantOptions } = useCustomReqDataCombo({
    url: `${URL.CTI_TENANT_COMBO}/${encodeURIComponent(CENTER_ID)}.do`,
    method: 'GET',
    mapping: { id: 'tenantId', text: 'tenantName' },
  });

  useEffect(() => {
    if (!open) return;
    setGroupOptions([]); setTeamOptions([]); setEmpOptions([]);
    setForm({
      ...INITIAL_EMP_FORM,
      skillId: initialSkillId || '',
      tenantId: initialTenantId || '',
    });
  }, [open, initialSkillId, initialTenantId]);

  const fetchGroups = useCallback(async (tenantId) => {
    if (!tenantId) { setGroupOptions([]); return; }
    try {
      const res = await fnAjaxFetch({
        url: URL.CTI_GROUP_COMBO,
        method: 'POST',
        data: { centerId: CENTER_ID, tenantId },
        withCredentials: true,
      });
      const list = res?.data?.result || [];
      setGroupOptions(list.map(r => ({ code: r.employeegrpId, codeNm: r.employeegrpName })));
    } catch { setGroupOptions([]); }
  }, []);

  const fetchTeams = useCallback(async (tenantId, groupId) => {
    if (!tenantId || !groupId) { setTeamOptions([]); return; }
    try {
      const res = await fnAjaxFetch({
        url: URL.CTI_TEAM_COMBO,
        method: 'POST',
        data: { centerId: CENTER_ID, tenantId, employeegrpId: groupId },
        withCredentials: true,
      });
      const list = res?.data?.result || [];
      setTeamOptions(list.map(r => ({ code: r.employeepartId, codeNm: r.employeepartName })));
    } catch { setTeamOptions([]); }
  }, []);

  const fetchEmps = useCallback(async (tenantId, groupId, teamId, skillId) => {
    if (!tenantId || !groupId || !teamId) { setEmpOptions([]); return; }
    try {
      const res = await fnAjaxFetch({
        url: URL.CTI_EMP_COMBO,
        method: 'POST',
        data: {
          centerId: CENTER_ID,
          tenantId,
          employeegrpId: groupId,
          employeepartId: teamId,
          skill: 'skill',
          skillId,
          searchskill: 'skill',
        },
        withCredentials: true,
      });
      const list = res?.data?.result || [];
      setEmpOptions(list.map(r => ({ code: r.employeeId, codeNm: r.employeeName })));
    } catch { setEmpOptions([]); }
  }, []);

  // 초기 tenant 로드 → 그룹 콤보
  useEffect(() => {
    if (!open || !form.tenantId) return;
    fetchGroups(form.tenantId);
  }, [open, form.tenantId, fetchGroups]);

  const handleTenantChange = useCallback(async (e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, tenantId: v, employeegrpId: '', employeepartId: '', employeeId: '' }));
    setTeamOptions([]); setEmpOptions([]);
    await fetchGroups(v);
  }, [fetchGroups]);

  const handleGroupChange = useCallback(async (e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, employeegrpId: v, employeepartId: '', employeeId: '' }));
    setEmpOptions([]);
    await fetchTeams(form.tenantId, v);
  }, [form.tenantId, fetchTeams]);

  const handleTeamChange = useCallback(async (e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, employeepartId: v, employeeId: '' }));
    await fetchEmps(form.tenantId, form.employeegrpId, v, form.skillId);
  }, [form.tenantId, form.employeegrpId, form.skillId, fetchEmps]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: 'Tenant를 선택해 주세요.' }); return; }
    if (!form.employeeId) { await Swal.fire({ icon: 'warning', text: '상담사를 선택해 주세요.' }); return; }
    if (!form.skillLevel) { await Swal.fire({ icon: 'warning', text: 'SKILL LEVEL을 선택해 주세요.' }); return; }

    const ok = await Swal.fire({
      icon: 'question',
      title: 'SKILL 사용자 등록',
      html: `<b>${form.employeeId}</b> 를(을) 등록 하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!ok.isConfirmed) return;

    try {
      const res = await fnAjaxFetch({
        url: URL.SKILL_EMP_UPDATE,
        method: 'POST',
        data: {
          mode: 'Ins',
          centerId: form.centerId,
          tenantId: form.tenantId,
          employeegrpId: form.employeegrpId,
          employeepartId: form.employeepartId,
          employeeId: form.employeeId,
          skillLevel: form.skillLevel,
          skillId: form.skillId,
        },
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
        await Swal.fire({ icon: 'success', text: json?.MESSAGE || '등록되었습니다.' });
        onSuccess(form.skillId);
      } else {
        await Swal.fire({ icon: 'error', text: json?.MESSAGE || '처리 중 문제가 발생하였습니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', text: e?.message || '처리 도중 문제가 발생하였습니다.' });
    }
  }, [form, onSuccess]);

  if (!open) return null;
  return (
    <div className="modal-backdrop-custom">
      <div className="modal-custom">
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ width: 480, maxWidth: '95%', backgroundColor: '#fff' }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <h2 className="modal-title__title">SKILL 사용자 등록</h2>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="modal-body__content">
                <div className="row input-box-wrap">
                  {/* SKILL ID 표시 */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">SKILL ID</label>
                      <input type="text" className="form-control" value={form.skillId} readOnly />
                    </div>
                  </div>
                  {/* Tenant */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">Tenant <span className="text-danger">*</span></label>
                      <select
                        name="tenantId"
                        className="form-select"
                        value={form.tenantId}
                        onChange={handleTenantChange}
                      >
                        <option value="">선택</option>
                        {tenantOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* 부서(Group) */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">부서(Group)</label>
                      <select
                        name="employeegrpId"
                        className="form-select"
                        value={form.employeegrpId}
                        onChange={handleGroupChange}
                      >
                        <option value="">없음</option>
                        {groupOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* 팀(Team) */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">팀(Team)</label>
                      <select
                        name="employeepartId"
                        className="form-select"
                        value={form.employeepartId}
                        onChange={handleTeamChange}
                      >
                        <option value="">없음</option>
                        {teamOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* 상담사 */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">상담사 <span className="text-danger">*</span></label>
                      <select name="employeeId" className="form-select" value={form.employeeId} onChange={handleChange}>
                        <option value="">없음</option>
                        {empOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* SKILL LEVEL */}
                  <div className="col-12">
                    <div className="input-box">
                      <label className="form-label">SKILL LEVEL <span className="text-danger">*</span></label>
                      <select name="skillLevel" className="form-select" value={form.skillLevel} onChange={handleChange}>
                        <option value="">없음</option>
                        {[1,2,3,4,5,6,7].map(n => <option key={n} value={String(n)}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-footer__left" />
              <div className="modal-footer__right">
                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>저장</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
const ConstantSkillStatus = () => {
  const [pageUnit] = useState(20);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [skillModalData, setSkillModalData] = useState(null);
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [empModalSkillId, setEmpModalSkillId] = useState('');
  const [empModalTenantId, setEmpModalTenantId] = useState('');
  const [subRefresh, setSubRefresh] = useState({});

  const { options: tenantOptions } = useCustomReqDataCombo({
    url: `${URL.CTI_TENANT_COMBO}/${encodeURIComponent(CENTER_ID)}.do`,
    method: 'GET',
    mapping: { id: 'tenantId', text: 'tenantName' },
  });

  const fetchData = useCallback(async (query) => {
    const res = await fnAjaxFetch({
      url: URL.SKILL_LIST,
      method: 'POST',
      data: { ...query, searchCenterId: CENTER_ID },
    });
    const data = res?.data;
    return {
      rows: data?.result?.resultList || [],
      total: data?.result?.paginationInfo?.totalRecordCount || 0,
    };
  }, []);

  const {
    onGridReady,
    defaultColDef,
    tempParams,
    setTempParams,
    handleSearch,
  } = useGridInfinite({
    fetchApi: fetchData,
    pageUnit,
    initialFilters: INITIAL_SEARCH,
  });

  const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempParams(p => ({ ...p, [name]: value }));
  }, [setTempParams]);

  const onSearch = useCallback((pageIndex) => handleSearch(pageIndex || 1), [handleSearch]);
  const onSearchKeyDown = useCallback((e) => { if (e.key === 'Enter') onSearch(1); }, [onSearch]);

  const handleOpenSkillModal = useCallback((rowData = null) => {
    setSkillModalData(rowData ? { ...rowData, mode: 'Edt' } : null);
    setSkillModalOpen(true);
  }, []);

  const handleOpenEmpModal = useCallback(() => {
    setEmpModalSkillId('');
    setEmpModalTenantId('');
    setEmpModalOpen(true);
  }, []);

  const handleSkillDelete = useCallback(async (row) => {
    if (!row) {
      await Swal.fire({ icon: 'warning', text: 'SKILL을 선택해 주세요.' });
      return;
    }
    const ok = await Swal.fire({
      icon: 'question',
      title: 'SKILL 삭제',
      html: `<b>${row.skillId}</b> 를(을) 삭제 하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await fnAjaxFetch({
        url: URL.SKILL_DELETE,
        method: 'POST',
        data: { centerId: row.centerId || CENTER_ID, tenantId: row.tenantId, skillId: row.skillId },
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS') {
        await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
        onSearch(1);
      } else {
        await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제 중 오류가 발생하였습니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', text: e?.message || '처리 도중 문제가 발생하였습니다.' });
    }
  }, [onSearch]);

  const handleSubDelete = useCallback(async ({ skillId, tenantId, centerId, skillLevel, employeeId }) => {
    const ok = await Swal.fire({
      icon: 'warning',
      title: 'SKILL 사용자 삭제',
      html: `<b>${employeeId}</b> 를(을) 삭제 하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await fnAjaxFetch({
        url: URL.SKILL_EMP_DELETE,
        method: 'POST',
        data: { centerId: centerId || CENTER_ID, tenantId, skillId, skillLevel, employeeId },
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS') {
        await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
        // 해당 SKILL 서브그리드 갱신
        setSubRefresh(p => ({ ...p, [skillId]: (p[skillId] || 0) + 1 }));
      } else {
        await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제 중 오류가 발생하였습니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', text: e?.message || '처리 도중 문제가 발생하였습니다.' });
    }
  }, []);

  const gridContext = useMemo(() => ({
    onSubDelete: handleSubDelete,
    subRefresh,
  }), [handleSubDelete, subRefresh]);

  const columnDefs = useMemo(() => [
    {
      headerName: '',
      field: '_expand',
      width: 40,
      sortable: false,
      filter: false,
      cellRenderer: 'agGroupCellRenderer',
    },
    { headerName: '센터명', field: 'centerName', width: 120 },
    { headerName: '테넌트명', field: 'tenantName', width: 140 },
    { headerName: 'SKILL ID', field: 'skillId', width: 100, cellStyle: { textAlign: 'center' } },
    { headerName: 'SKILL 명', field: 'skillName', flex: 1 },
    { headerName: 'SKILL 설명', field: 'skillDesc', flex: 1 },
    {
      headerName: '수정',
      width: 70,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-secondary btn-outline__gray btn-modify"
          onClick={() => handleOpenSkillModal(p.data)}
        >
          수정
        </button>
      ),
    },
    {
      headerName: '삭제',
      width: 70,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-danger btn-outline__gray btn-delete"
          onClick={() => handleSkillDelete(p.data)}
        >
          삭제
        </button>
      ),
    },
  ], [handleOpenSkillModal, handleSkillDelete]);

  return (
    <div className="row g-0 main-contents">
      <div className="col-12 content-header">
        <div className="content-header__title">SKILL 관리</div>
        <div className="content-header__breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">콜센터 관리</li>
            <li className="breadcrumb-item">SKILL 관리</li>
          </ol>
        </div>
      </div>
      <div className="col-12 content-search">
        <div className="row g-0 w-100 justify-content-between">
          <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
            <select
              name="searchTenant"
              className="form-select"
              style={{ width: 160 }}
              value={tempParams.searchTenant}
              onChange={handleInputChange}
            >
              <option value="">Tenant 전체</option>
              {tenantOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
            </select>
            <select
              name="searchCondition"
              className="form-select"
              style={{ width: 140 }}
              value={tempParams.searchCondition}
              onChange={handleInputChange}
            >
              <option value="">선택</option>
              <option value="skillId">스킬아이디</option>
              <option value="skillName">스킬명 또는 설명</option>
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
              검색 초기화
            </button>
            <button type="button" className="btn btn-outline-secondary btn-outline__gray" onClick={handleOpenEmpModal}>
              SKILL 사용자 등록
            </button>
            <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenSkillModal()}>
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
              </svg>
              SKILL 등록
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
            masterDetail={true}
            detailCellRenderer={SkillEmployeeCellRenderer}
            detailRowHeight={280}
            context={gridContext}
            overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
            overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
            onGridReady={onGridReady}
          />
        </div>
      </div>

      <SkillFormModal
        open={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        skillData={skillModalData}
        tenantOptions={tenantOptions}
        onSuccess={() => { setSkillModalOpen(false); onSearch(1); }}
      />
      <SkillEmpFormModal
        open={empModalOpen}
        onClose={() => setEmpModalOpen(false)}
        initialSkillId={empModalSkillId}
        initialTenantId={empModalTenantId}
        onSuccess={(skillId) => {
          setEmpModalOpen(false);
          if (skillId) setSubRefresh(p => ({ ...p, [skillId]: (p[skillId] || 0) + 1 }));
          onSearch(1);
        }}
      />
    </div>
  );
};

export default ConstantSkillStatus;
