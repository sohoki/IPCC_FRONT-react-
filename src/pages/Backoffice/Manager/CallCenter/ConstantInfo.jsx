import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Swal from '@/lib/swal.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useResetForm } from '@/hooks/use-form.jsx';
import { useCommonCodeData, useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const INITIAL_SEARCH = {
  searchInsttCode: '',
  searchPartId: '',
  searchCondition: '',
  searchKeyword: '',
};

const INITIAL_FORM = {
  mode: 'Ins',
  consultCode: '',
  insttCode: '',
  partId: '',
  useAt: 'Y',
  consultStatus: '',
  counRemark: '',
  pbxExtension: '',
  pbxLoginId: '',
  ctiCenterId: '',
  ctiTenantId: '',
  ctiEmployeegrpid: '',
  ctiEmployeepartid: '',
  ctiEmployeeid: '',
  ctiName: '',
  ctiPassword: '',
  ctiBlendKind: '3',
  ctiMoniterFlag: '',
  ctiPermitId: '',
  ctiSendFilesize: '10',
  ctiDefaultQueue: '0',
};

const CENTER_ID = '1';

// ── 상담사 등록/수정 모달 ──────────────────────────────────────────────────────
const ConstantFormModal = ({ open, onClose, consultCode, onSuccess }) => {
  const isEdt = !!consultCode;
  const [form, setForm] = useState(INITIAL_FORM);
  const [formPartOptions, setFormPartOptions] = useState([]);
  const [tenantOptions, setTenantOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [permitOptions, setPermitOptions] = useState([]);

  const { options: insttOptions } = useCustomReqDataCombo({
    url: URL.INSTT_COMBO,
    method: 'GET',
    mapping: { id: 'insttCode', text: 'allInsttNm' },
  });
  const { options: statusOptions } = useCommonCodeData('CONSULT_CODE');
  const { options: centerOptions } = useCustomReqDataCombo({
    url: URL.CTI_CENTER_COMBO,
    method: 'POST',
    mapping: { id: 'centerId', text: 'centerName' },
  });

  const fetchPartOptions = useCallback(async (insttCd) => {
    if (!insttCd) { setFormPartOptions([]); return; }
    try {
      const res = await fnAjaxFetch({ url: URL.PART_COMBO, method: 'GET', param: { insttCode: insttCd }, withCredentials: true });
      const list = res?.data?.result?.resultList || res?.data?.result?.result || [];
      setFormPartOptions(list.map(r => ({ code: r.partId || r.code, codeNm: r.partNm || r.codeNm })));
    } catch { setFormPartOptions([]); }
  }, []);

  const fetchTenantOptions = useCallback(async (centerId) => {
    if (!centerId) { setTenantOptions([]); return; }
    try {
      const res = await fnAjaxFetch({ url: `${URL.CTI_TENANT_COMBO}/${encodeURIComponent(centerId)}.do`, method: 'GET', withCredentials: true });
      const list = res?.data?.result?.resultList || res?.data?.result || [];
      setTenantOptions(list.map(r => ({ code: r.tenantId, codeNm: r.tenantName })));
    } catch { setTenantOptions([]); }
  }, []);

  const fetchGroupOptions = useCallback(async (centerId, tenantId) => {
    if (!centerId || !tenantId) { setGroupOptions([]); return; }
    try {
      const res = await fnAjaxFetch({ url: URL.CTI_GROUP_COMBO, method: 'POST', data: { centerId, tenantId }, withCredentials: true });
      const list = res?.data?.result || [];
      setGroupOptions(list.map(r => ({ code: r.employeegrpId, codeNm: r.employeegrpName })));
    } catch { setGroupOptions([]); }
  }, []);

  const fetchTeamOptions = useCallback(async (centerId, tenantId, groupId) => {
    if (!centerId || !tenantId || !groupId) { setTeamOptions([]); return; }
    try {
      const res = await fnAjaxFetch({ url: URL.CTI_TEAM_COMBO, method: 'POST', data: { centerId, tenantId, employeegrpId: groupId }, withCredentials: true });
      const list = res?.data?.result || [];
      setTeamOptions(list.map(r => ({ code: r.employeepartId, codeNm: r.employeepartName })));
    } catch { setTeamOptions([]); }
  }, []);

  const fetchPermitOptions = useCallback(async (centerId, tenantId, selectedPermit) => {
    if (!centerId || !tenantId) { setPermitOptions([]); return; }
    try {
      const res = await fnAjaxFetch({ url: URL.CTI_PERMIT_COMBO, method: 'POST', data: { centerId, tenantId }, withCredentials: true });
      const list = res?.data?.result || [];
      setPermitOptions(list.map(r => ({ code: r.permitId, codeNm: r.permitName })));
      if (selectedPermit) setForm(p => ({ ...p, ctiPermitId: selectedPermit }));
    } catch { setPermitOptions([]); }
  }, []);

  // 폼 초기화
  useEffect(() => {
    if (!open) return;
    setFormPartOptions([]);
    setTenantOptions([]);
    setGroupOptions([]);
    setTeamOptions([]);
    setPermitOptions([]);
    if (!isEdt) {
      setForm({ ...INITIAL_FORM, mode: 'Ins' });
      return;
    }
    setForm(p => ({ ...p, mode: 'CTI', consultCode }));
  }, [open, consultCode, isEdt]);

  // 수정 시 상세 조회
  useEffect(() => {
    if (!open || !isEdt || !consultCode) return;
    let active = true;
    fnAjaxFetch({
      url: `${URL.CONSULTANT_DETAIL}/${encodeURIComponent(consultCode)}.do`,
      method: 'GET',
      withCredentials: true,
    }).then(async (res) => {
      if (!active) return;
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS') {
        const d = json.result || {};
        setForm(p => ({
          ...p,
          insttCode: d.insttCode || '',
          partId: d.partId || '',
          useAt: d.counUseyn || 'Y',
          consultStatus: d.consultStatus || '',
          counRemark: d.counRemark || '',
          pbxExtension: d.pbxExtension || '',
          pbxLoginId: d.pbxLoginId || '',
          ctiCenterId: d.ctiCenterId || '',
          ctiTenantId: d.ctiTenantId || '',
          ctiEmployeegrpid: d.ctiEmployeegrpid || '',
          ctiEmployeepartid: d.ctiEmployeepartid || '',
          ctiEmployeeid: d.ctiEmployeeid || '',
          ctiName: d.ctiName || '',
          ctiPassword: d.ctiPassword || '',
          ctiBlendKind: d.ctiBlendKind || '3',
          ctiMoniterFlag: d.ctiMoniterFlag || '',
          ctiPermitId: d.ctiPermitId || '',
          ctiSendFilesize: d.ctiFileSize || '10',
          ctiDefaultQueue: d.ctiDefaultQueue || '0',
        }));
        if (d.insttCode) await fetchPartOptions(d.insttCode);
        if (d.ctiCenterId) await fetchTenantOptions(d.ctiCenterId);
        if (d.ctiCenterId && d.ctiTenantId) {
          await fetchGroupOptions(d.ctiCenterId, d.ctiTenantId);
          await fetchPermitOptions(d.ctiCenterId, d.ctiTenantId, d.ctiPermitId);
        }
        if (d.ctiCenterId && d.ctiTenantId && d.ctiEmployeegrpid) {
          await fetchTeamOptions(d.ctiCenterId, d.ctiTenantId, d.ctiEmployeegrpid);
        }
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [open, consultCode, isEdt, fetchPartOptions, fetchTenantOptions, fetchGroupOptions, fetchTeamOptions, fetchPermitOptions]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  }, []);

  const handleInsttChange = useCallback(async (e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, insttCode: v, partId: '' }));
    await fetchPartOptions(v);
  }, [fetchPartOptions]);

  const handleCenterChange = useCallback(async (e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, ctiCenterId: v, ctiTenantId: '', ctiEmployeegrpid: '', ctiEmployeepartid: '', ctiPermitId: '' }));
    setGroupOptions([]); setTeamOptions([]); setPermitOptions([]);
    await fetchTenantOptions(v);
  }, [fetchTenantOptions]);

  const handleTenantChange = useCallback(async (e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, ctiTenantId: v, ctiEmployeegrpid: '', ctiEmployeepartid: '', ctiPermitId: '' }));
    setTeamOptions([]);
    await fetchGroupOptions(form.ctiCenterId, v);
    await fetchPermitOptions(form.ctiCenterId, v, '');
  }, [form.ctiCenterId, fetchGroupOptions, fetchPermitOptions]);

  const handleGroupChange = useCallback(async (e) => {
    const v = e.target.value;
    setForm(p => ({ ...p, ctiEmployeegrpid: v, ctiEmployeepartid: '' }));
    await fetchTeamOptions(form.ctiCenterId, form.ctiTenantId, v);
  }, [form.ctiCenterId, form.ctiTenantId, fetchTeamOptions]);

  const handleSave = useCallback(async () => {
    if (!form.insttCode) { await Swal.fire({ icon: 'warning', text: '기관을 선택해 주세요.' }); return; }
    if (!form.partId) { await Swal.fire({ icon: 'warning', text: '부서를 선택해 주세요.' }); return; }
    if (!form.pbxExtension) { await Swal.fire({ icon: 'warning', text: '내선번호를 입력해 주세요.' }); return; }
    if (!form.pbxLoginId) { await Swal.fire({ icon: 'warning', text: 'PBX 로그인 아이디를 입력해 주세요.' }); return; }
    if (!form.ctiCenterId) { await Swal.fire({ icon: 'warning', text: 'CTI 센터를 선택해 주세요.' }); return; }
    if (!form.ctiTenantId) { await Swal.fire({ icon: 'warning', text: 'CTI 테넌트를 선택해 주세요.' }); return; }
    if (!form.consultStatus) { await Swal.fire({ icon: 'warning', text: '상담사 상태를 선택해 주세요.' }); return; }

    const action = isEdt ? '수정' : '등록';
    const ok = await Swal.fire({
      icon: 'question',
      title: `상담사 ${action}`,
      html: `상담사를 <b>${action}</b> 하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!ok.isConfirmed) return;

    try {
      const payload = {
        mode: form.mode,
        consultCode: form.consultCode,
        insttCode: form.insttCode,
        partId: form.partId,
        counUseyn: form.useAt,
        consultStatus: form.consultStatus,
        counRemark: form.counRemark,
        pbxExtension: form.pbxExtension,
        pbxLoginId: form.pbxLoginId,
        ctiCenterId: form.ctiCenterId,
        ctiTenantId: form.ctiTenantId,
        ctiEmployeegrpid: form.ctiEmployeegrpid,
        ctiEmployeepartid: form.ctiEmployeepartid,
        ctiEmployeeid: form.ctiEmployeeid,
        ctiName: form.ctiName,
        ctiPassword: form.ctiPassword,
        ctiBlendKind: form.ctiBlendKind,
        ctiMoniterFlag: form.ctiMoniterFlag,
        ctiPermitId: form.ctiPermitId,
        ctiDefaultQueue: form.ctiDefaultQueue,
        ctiFileSize: form.ctiSendFilesize,
      };
      const res = await fnAjaxFetch({ url: URL.CONSULTANT_UPDATE, method: 'POST', data: payload, withCredentials: true });
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
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          style={{ width: 1000, maxWidth: '98%', backgroundColor: '#fff' }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <h2 className="modal-title__title">상담사 {isEdt ? '수정' : '등록'}</h2>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="modal-body__content">
                <div className="row input-box-wrap">
                  {/* 기관코드 */}
                  <div className="col-4">
                    <div className="input-box">
                      <label className="form-label">기관코드 <span className="text-danger">*</span></label>
                      <select
                        name="insttCode"
                        className="form-select"
                        value={form.insttCode}
                        onChange={handleInsttChange}
                        disabled={isEdt}
                      >
                        <option value="">선택</option>
                        {insttOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* 부서코드 */}
                  <div className="col-4">
                    <div className="input-box">
                      <label className="form-label">부서코드 <span className="text-danger">*</span></label>
                      <select name="partId" className="form-select" value={form.partId} onChange={handleChange}>
                        <option value="">선택</option>
                        {formPartOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* 사용유무 */}
                  <div className="col-4">
                    <div className="input-box">
                      <label className="form-label">사용유무</label>
                      <div className="d-flex gap-3 align-items-center" style={{ height: 38 }}>
                        <label className="d-flex align-items-center gap-1">
                          <input type="radio" name="useAt" value="Y" checked={form.useAt === 'Y'} onChange={handleChange} /> 사용
                        </label>
                        <label className="d-flex align-items-center gap-1">
                          <input type="radio" name="useAt" value="N" checked={form.useAt === 'N'} onChange={handleChange} /> 사용 안함
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* 상태 */}
                  <div className="col-4">
                    <div className="input-box">
                      <label className="form-label">상태 <span className="text-danger">*</span></label>
                      <select name="consultStatus" className="form-select" value={form.consultStatus} onChange={handleChange}>
                        <option value="">선택</option>
                        {statusOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* 비고 */}
                  <div className="col-8">
                    <div className="input-box">
                      <label className="form-label">비고</label>
                      <input type="text" name="counRemark" className="form-control" value={form.counRemark} onChange={handleChange} />
                    </div>
                  </div>

                  {/* ── 내선번호 ── */}
                  <div className="col-12 mt-2">
                    <div className="input-box">
                      <label className="form-label fw-bold">내선번호 정보</label>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label className="form-label">내선번호 <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="pbxExtension"
                        className="form-control"
                        value={form.pbxExtension}
                        onChange={handleChange}
                        readOnly={isEdt}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label className="form-label">PBX 로그인 아이디 <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        name="pbxLoginId"
                        className="form-control"
                        value={form.pbxLoginId}
                        onChange={handleChange}
                        readOnly={isEdt}
                      />
                    </div>
                  </div>

                  {/* ── CTI 정보 ── */}
                  <div className="col-12 mt-2">
                    <div className="input-box">
                      <label className="form-label fw-bold">CTI 정보</label>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">센터 <span className="text-danger">*</span></label>
                      <select
                        name="ctiCenterId"
                        className="form-select"
                        value={form.ctiCenterId}
                        onChange={handleCenterChange}
                        disabled={isEdt}
                      >
                        <option value="">선택</option>
                        {centerOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">테넌트 <span className="text-danger">*</span></label>
                      <select name="ctiTenantId" className="form-select" value={form.ctiTenantId} onChange={handleTenantChange}>
                        <option value="">선택</option>
                        {tenantOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">Group</label>
                      <select name="ctiEmployeegrpid" className="form-select" value={form.ctiEmployeegrpid} onChange={handleGroupChange}>
                        <option value="">없음</option>
                        {groupOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">Team</label>
                      <select name="ctiEmployeepartid" className="form-select" value={form.ctiEmployeepartid} onChange={handleChange}>
                        <option value="">없음</option>
                        {teamOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">CTI 아이디</label>
                      <input
                        type="text"
                        name="ctiEmployeeid"
                        className="form-control"
                        value={form.ctiEmployeeid}
                        onChange={handleChange}
                        readOnly={isEdt}
                      />
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">CTI 이름</label>
                      <input type="text" name="ctiName" className="form-control" value={form.ctiName} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">CTI 비밀번호</label>
                      <input type="password" name="ctiPassword" className="form-control" value={form.ctiPassword} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">Blend</label>
                      <select name="ctiBlendKind" className="form-select" value={form.ctiBlendKind} onChange={handleChange}>
                        <option value="1">IB</option>
                        <option value="2">OB</option>
                        <option value="3">Blend</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">감시</label>
                      <select name="ctiMoniterFlag" className="form-select" value={form.ctiMoniterFlag} onChange={handleChange}>
                        <option value="">없음</option>
                        <option value="1">감시</option>
                        <option value="0">감시안함</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">허용범위</label>
                      <select name="ctiPermitId" className="form-select" value={form.ctiPermitId} onChange={handleChange}>
                        <option value="">없음</option>
                        {permitOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label className="form-label">파일 SIZE</label>
                      <input type="text" name="ctiSendFilesize" className="form-control" value={form.ctiSendFilesize} onChange={handleChange} />
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

// ── 엑셀 업로드 모달 ──────────────────────────────────────────────────────────
const ExcelUploadModal = ({ open, onClose, onSuccess }) => {
  const fileRef = useRef(null);
  const [excelData, setExcelData] = useState(null);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    if (!open) { setExcelData(null); setFileName(''); }
  }, [open]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const XLSX = (await import('xlsx')).default;
        const wb = XLSX.read(ev.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonArr = XLSX.utils.sheet_to_json(ws);
        const mapped = jsonArr.map(row => ({
          pbxLoginId: row['PBX_LOGIN_ID'] || '',
          ctiCenterId: row['CTI_CENTER_ID'] || '',
          ctiTenantId: row['CTI_TENANT_ID'] || '',
          ctiEmployeegrpid: row['CTI_EMPLOYEEGRPID'] || '',
          ctiEmployeepartid: row['CTI_EMPLOYEEPARTID'] || '',
          ctiEmployeeid: row['CTI_EMPLOYEEID'] || '',
          ctiName: row['CTI_NAME'] || '',
          ctiBlendKind: row['CTI_BLEND_KIND'] || '',
          ctiPermitId: row['CTI_PERMIT_ID'] || '',
          ctiMoniterFlag: row['CTI_MONITER_FLAG'] || '',
        }));
        setExcelData(mapped);
      } catch {
        await Swal.fire({ icon: 'error', text: '파일을 읽을 수 없습니다.' });
      }
    };
    reader.readAsBinaryString(file);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!excelData || excelData.length === 0) {
      await Swal.fire({ icon: 'warning', text: '업로드할 파일을 선택해 주세요.' });
      return;
    }
    const ok = await Swal.fire({
      icon: 'question',
      title: '엑셀 업로드',
      html: `<b>${excelData.length}건</b>을 업로드 하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await fnAjaxFetch({
        url: URL.CONSULTANT_EXCEL_UPDATE,
        method: 'POST',
        data: { conExcelUpInfos: excelData },
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
        await Swal.fire({ icon: 'success', text: json?.MESSAGE || '업로드되었습니다.' });
        onSuccess();
      } else {
        await Swal.fire({ icon: 'error', text: json?.MESSAGE || '업로드 중 오류가 발생하였습니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', text: e?.message || '처리 도중 문제가 발생하였습니다.' });
    }
  }, [excelData, onSuccess]);

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
                <h2 className="modal-title__title">상담사 엑셀 업로드</h2>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="modal-body__content">
                <div className="input-box">
                  <label className="form-label">엑셀 파일 선택</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="form-control"
                    onChange={handleFileChange}
                  />
                </div>
                {excelData && (
                  <p className="mt-2 text-muted">{fileName} — {excelData.length}건 파싱됨</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-footer__left" />
              <div className="modal-footer__right">
                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleUpload}>업로드</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 메인 페이지 ───────────────────────────────────────────────────────────────
const ConstantInfo = () => {
  const [pageUnit] = useState(20);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [searchPartOptions, setSearchPartOptions] = useState([]);

  const fetchData = useCallback(async (query) => {
    const res = await fnAjaxFetch({
      url: URL.CONSULTANT_LIST,
      method: 'POST',
      data: { ...query, searchStatus: 'IPCC_CONSULT_CODE_1' },
    });
    const data = res?.data;
    return {
      rows: data?.result?.resultList || [],
      total: data?.result?.paginationInfo?.totalRecordCount || 0,
    };
  }, []);

  const {
    gridApiRef,
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

  const { options: insttOptions } = useCustomReqDataCombo({
    url: URL.INSTT_COMBO,
    method: 'GET',
    mapping: { id: 'insttCode', text: 'allInsttNm' },
  });

  const handleInsttChange = useCallback(async (e) => {
    const v = e.target.value;
    setTempParams(p => ({ ...p, searchInsttCode: v, searchPartId: '' }));
    if (!v) { setSearchPartOptions([]); return; }
    try {
      const res = await fnAjaxFetch({ url: URL.PART_COMBO, method: 'GET', param: { insttCode: v }, withCredentials: true });
      const list = res?.data?.result?.resultList || res?.data?.result?.result || [];
      setSearchPartOptions(list.map(r => ({ code: r.partId || r.code, codeNm: r.partNm || r.codeNm })));
    } catch { setSearchPartOptions([]); }
  }, [setTempParams]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempParams(p => ({ ...p, [name]: value }));
  }, [setTempParams]);

  const onSearch = useCallback((pageIndex) => handleSearch(pageIndex || 1), [handleSearch]);
  const onSearchKeyDown = useCallback((e) => { if (e.key === 'Enter') onSearch(1); }, [onSearch]);

  const handleOpenFormModal = useCallback((code = null) => {
    setSelectedCode(code);
    setFormModalOpen(true);
  }, []);

  const handleRetire = useCallback(async (consultCode) => {
    const ok = await Swal.fire({
      icon: 'warning',
      title: '퇴직자 처리',
      html: `<b>${consultCode}</b> 를(을) 퇴직자 처리 하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!ok.isConfirmed) return;
    try {
      const res = await fnAjaxFetch({
        url: `${URL.CONSULTANT_RETIRE}/${encodeURIComponent(consultCode)}.do`,
        method: 'GET',
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS') {
        await Swal.fire({ icon: 'success', text: '퇴직자 처리되었습니다.' });
        onSearch(1);
      } else {
        await Swal.fire({ icon: 'error', text: json?.MESSAGE || '처리 중 오류가 발생하였습니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', text: e?.message || '처리 도중 문제가 발생하였습니다.' });
    }
  }, [onSearch]);

  const handleDelete = useCallback(async (consultCode) => {
    const first = await Swal.fire({
      icon: 'question',
      title: '상담사 삭제',
      html: `<b>${consultCode}</b> 를(을) 삭제하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!first.isConfirmed) return;
    const second = await Swal.fire({
      icon: 'warning',
      title: '상담사 삭제 확인',
      html: `<b>${consultCode}</b> 를(을) 삭제하시면 시스템에 영향이 있을 수 있습니다.<br>정말로 삭제하시겠습니까?`,
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
      focusCancel: true,
    });
    if (!second.isConfirmed) return;
    try {
      const res = await fnAjaxFetch({
        url: `${URL.CONSULTANT_DELETE}/${encodeURIComponent(consultCode)}.do`,
        method: 'DELETE',
        withCredentials: true,
      });
      const json = res?.data;
      if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
        await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
        onSearch(1);
      } else {
        await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제 중 오류가 발생하였습니다.' });
      }
    } catch (e) {
      await Swal.fire({ icon: 'error', text: e?.message || '처리 도중 문제가 발생하였습니다.' });
    }
  }, [onSearch]);

  const columnDefs = useMemo(() => [
    { headerName: '기관명', field: 'allInsttNm', width: 120 },
    { headerName: '부서명', field: 'partNm', width: 120 },
    { headerName: '내선번호', field: 'pbxExtension', width: 110, cellStyle: { textAlign: 'center' } },
    { headerName: '에이전트', field: 'pbxLoginId', width: 110, cellStyle: { textAlign: 'center' } },
    { headerName: 'CTI ID', field: 'ctiEmployeeid', width: 110, cellStyle: { textAlign: 'center' } },
    { headerName: 'CTI 이름', field: 'ctiName', width: 110 },
    { headerName: 'CTI 센터', field: 'ctiCenterName', width: 100, cellStyle: { textAlign: 'center' } },
    { headerName: 'CTI 테넌트', field: 'ctiTenantName', flex: 1 },
    { headerName: 'CTI 부서', field: 'ctiEmployeegrpName', flex: 1 },
    { headerName: 'CTI 팀', field: 'ctiEmployeepartName', flex: 1 },
    { headerName: '사용유무', field: 'counUseyn', width: 90, cellStyle: { textAlign: 'center' } },
    { headerName: '최종수정일', field: 'lastUpdtPnttm', width: 130, cellStyle: { textAlign: 'center' } },
    {
      headerName: '퇴직자처리',
      width: 90,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-warning btn-outline__gray btn-sm"
          onClick={() => handleRetire(p.data?.consultCode)}
        >
          퇴직처리
        </button>
      ),
    },
    {
      headerName: '수정',
      width: 70,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-secondary btn-outline__gray btn-modify"
          onClick={() => handleOpenFormModal(p.data?.consultCode)}
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
          onClick={() => handleDelete(p.data?.consultCode)}
        >
          삭제
        </button>
      ),
    },
  ], [handleOpenFormModal, handleRetire, handleDelete]);

  return (
    <div className="row g-0 main-contents">
      <div className="col-12 content-header">
        <div className="content-header__title">상담사 관리</div>
        <div className="content-header__breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">콜센터 관리</li>
            <li className="breadcrumb-item">상담사 관리</li>
          </ol>
        </div>
      </div>
      <div className="col-12 content-search">
        <div className="row g-0 w-100 justify-content-between">
          <div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
            {/* 기관 */}
            <select
              name="searchInsttCode"
              className="form-select"
              style={{ width: 140 }}
              value={tempParams.searchInsttCode}
              onChange={handleInsttChange}
            >
              <option value="">기관 전체</option>
              {insttOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
            </select>
            {/* 부서 */}
            <select
              name="searchPartId"
              className="form-select"
              style={{ width: 140 }}
              value={tempParams.searchPartId}
              onChange={handleInputChange}
            >
              <option value="">부서 전체</option>
              {searchPartOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
            </select>
            {/* 검색어 */}
            <select
              name="searchCondition"
              className="form-select"
              style={{ width: 120 }}
              value={tempParams.searchCondition}
              onChange={handleInputChange}
            >
              <option value="">선택</option>
              <option value="conName">이름</option>
              <option value="conExtension">내선번호</option>
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
            <button type="button" className="btn btn-outline-secondary btn-outline__gray" onClick={() => setExcelModalOpen(true)}>
              EXCEL 업로드
            </button>
            <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenFormModal()}>
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
              </svg>
              상담사 등록
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
            overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
            overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
            onGridReady={onGridReady}
          />
        </div>
      </div>

      <ConstantFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        consultCode={selectedCode}
        onSuccess={() => { setFormModalOpen(false); onSearch(1); }}
      />
      <ExcelUploadModal
        open={excelModalOpen}
        onClose={() => setExcelModalOpen(false)}
        onSuccess={() => { setExcelModalOpen(false); onSearch(1); }}
      />
    </div>
  );
};

export default ConstantInfo;
