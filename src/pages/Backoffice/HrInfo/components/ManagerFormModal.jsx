import React, { useCallback, useEffect, useState } from 'react';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import { useIdCheck } from '@/hooks/use-id-check.js';
import { useCommonCodeData, useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { CommonSelect } from '@/components/Common/Select.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import { usePwdValidate } from '@/hooks/use-pwd-validate.js';
import { useFileUpload } from '@/hooks/use-file-upload.js';
import { useSystemCheckbox } from '@/hooks/use-system-checkbox.js';
import '@/style/DropZone.css';
import Swal from '@/lib/swal.js';

const RuleItem = ({ passed, label }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, color: passed ? '#22c55e' : '#94a3b8', marginRight: 10,
    }}>
        <span style={{ fontSize: 13 }}>{passed ? '✓' : '✕'}</span>
        {label}
    </span>
);

const INSTT_PARAMS = {};
const INSTT_MAPPING = { id: 'insttCode', text: 'insttNm' };
const ROLE_MAPPING = { id: 'roleId', text: 'roleName' };

const ManagerFormModal = ({ open, 
    form, 
    setForm, 
    onData,
    onClose, 
    onSearch, 
    setModalOpen }) => {
    const [partOptions, setPartOptions] = useState([]);
    const [consultantOptions, setConsultantOptions] = useState([]);
    const [photoFile, setPhotoFile] = useState(null);

    const {
        systemOptions,
        authRows,
        setAuthRows,
        isChecked,
        handleSystemCheck,
        updateAuthRow,
    } = useSystemCheckbox();
    const [photoPreview, setPhotoPreview] = useState(null);

    const { handleIdCheck } = useIdCheck(API_URL.MANAGER_ID_CHECK, '아이디');
    const { options: roleOptions } = useCustomReqDataCombo({
        url: API_URL.ROLE_COMBO, params: {}, mapping: ROLE_MAPPING,
    });
    const { options: roleGubunOptions } = useCommonCodeData('AUTH_GUBUN');
    const { options: adminStateOptions } = useCommonCodeData('USER_STATE');

    const { rules: pwdRules, isValid: pwdValid } = usePwdValidate(form.adminPwd);
    const pwdMatch   = form.adminPwdConfirm !== '' && form.adminPwd === form.adminPwdConfirm;
    const pwdNoMatch = form.adminPwdConfirm !== '' && form.adminPwd !== form.adminPwdConfirm;

    const updateForm = useCallback((payload) => {
        setForm((prev) => ({ ...prev, ...payload }));
    }, [setForm]);

    const phoneValid = !form.adminTel || /^01[016789]-\d{3,4}-\d{4}$/.test(form.adminTel);
    const emailValid = !form.adminEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail);

    const handlePhoneChange = useCallback((e) => {
        const d = e.target.value.replace(/\D/g, '').slice(0, 11);
        let formatted = d;
        if (d.length > 7) formatted = `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
        else if (d.length > 3) formatted = `${d.slice(0, 3)}-${d.slice(3)}`;
        updateForm({ adminTel: formatted });
    }, [updateForm]);

    const updatePhoto = useCallback((payload) => {
        const file = payload.managerPic;
        setPhotoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return file ? URL.createObjectURL(file) : null; });
        setPhotoFile(file || null);
    }, []);

    const { getRootProps, getInputProps, isDragActive, clearFile } = useFileUpload({
        fieldName: 'managerPic',
        updateForm: updatePhoto,
        fileValue: photoFile,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    });

    const loadPartOptions = useCallback((insttCode) => {
        if (!insttCode) { setPartOptions([]); return; }
        fnAjaxFetch({ url: API_URL.PART_COMBO, method: 'GET', param: { insttCode } })
            .then((res) => {
                const list = res?.data?.result?.resultList || [];
                setPartOptions(list.map((p) => ({ value: p.partId, label: p.partNmHi || p.partNm })));
            })
            .catch(() => {});
    }, []);

    const loadConsultantCombo = useCallback((pbxExtension = '') => {
        fnAjaxFetch({
            url: API_URL.CONSULTANT_COMBO,
            method: 'GET',
            param: { partId: form.partId, empExtension: pbxExtension },
        }).then((res) => {
            const list = res?.data?.result || [];
            setConsultantOptions(list.map((c) => ({ value: c.pbxExtension, label: c.ctiName })));
        }).catch(() => {});
    }, [form.partId]);

    // 모달 열릴 때 초기화 — 전체를 .then()으로 감싸 effect 내 동기 setState 경고 회피
    useEffect(() => {
        Promise.resolve().then(() => {
            if (!open) {
                setPartOptions([]); setConsultantOptions([]); setAuthRows([]);
                setPhotoFile(null);
                setPhotoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
                return;
            }
            if (form.insttCode) loadPartOptions(form.insttCode);
            if (form.consultantUseyn === 'Y') loadConsultantCombo(form.pbxExtension);

            if (form.mode === 'Edt' && form.authInfo?.length > 0) {
                setAuthRows(form.authInfo.map((m) => ({
                    systemCode: m.systemCode,
                    systemName: m.systemName,
                    authGubun: m.authGubun || '',
                    roleId: m.roleId || '',
                    authDc: m.authDc || '',
                })));
            } else if (form.mode === 'Ins') {
                setAuthRows([]);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleIdCheckClick = useCallback(async () => {
        await handleIdCheck(form.adminId, setForm);
    }, [form.adminId, setForm, handleIdCheck]);

    const handleSubmit = useCallback(async () => {
        if (!form.adminId) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '아이디를 입력해 주세요.' }); return;
        }
        if (form.mode === 'Ins' && form.idCheck === 'N') {
            await Swal.fire({ icon: 'warning', title: '확인 필요', text: '중복 체크가 안되었습니다.' }); return;
        }
        if (!form.insttCode) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '기관을 선택해 주세요.' }); return;
        }
        if (!form.partId) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '부서를 선택해 주세요.' }); return;
        }
        if (!form.roleGubun) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '권한 구분을 선택해 주세요.' }); return;
        }
        if (form.adminPwd && form.adminPwd !== form.adminPwdConfirm) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '패스워드가 일치하지 않습니다.' }); return;
        }

        const action = form.mode === 'Ins' ? '등록' : '수정';
        const ok = await Swal.fire({
            icon: 'question', title: `관리자 ${action}`,
            html: `<b>${form.adminName || form.adminId}</b> ${action} 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
        });
        if (!ok.isConfirmed) return;

        const systemcodeUsecode = authRows.map((r) => r.systemCode).join(',');
        const authInfo = authRows.map((r) => ({
            systemCode: r.systemCode,
            userId: form.adminId,
            authGubun: r.authGubun,
            roleId: r.authGubun === 'AUTH_GUBUN_1' ? r.roleId : '',
            authDc: r.authDc,
        }));

        const payload = {
            mode: form.mode, adminId: form.adminId, idCheck: form.idCheck,
            insttCode: form.insttCode, partId: form.partId,
            roleGubun: form.roleGubun, roleId: form.roleId,
            adminEmail: form.adminEmail, adminName: form.adminName, adminTel: form.adminTel,
            adminPassword: form.adminPwd, passwordHint: form.passwordHint, passwordCnsr: form.passwordCnsr,
            pbxExtension: form.pbxExtension, consultantUseyn: form.consultantUseyn,
            useYn: form.useAt, systemcodeUsecode, adminStatus: form.adminState,
            authInfo,
        };

        let submitData = payload;
        let extraHeaders;
        if (photoFile) {
            submitData = new FormData();
            Object.entries(payload).forEach(([k, v]) => {
                if (v !== undefined && v !== null) {
                    const key = k === 'authInfo' ? 'authInfoJson' : k;
                    submitData.append(key, typeof v === 'object' && !(v instanceof File) ? JSON.stringify(v) : v);
                }
            });
            // 파일 키를 managerPic(String 필드)과 충돌하지 않도록 picFile로 분리
            submitData.append('picFile', photoFile);
            extraHeaders = { 'content-type': undefined };
        }

        const res = await fnAjaxFetch({
            url: API_URL.MANAGER_UPDATE,
            method: 'POST',
            data: submitData,
            ...(extraHeaders ? { headers: extraHeaders } : {}),
        });
        const json = res?.data;
        if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
            await Swal.fire({ icon: 'success', title: '완료', text: json?.MESSAGE || `${action}되었습니다.` });
            setModalOpen(false);
            onSearch(1);
        } else {
            await Swal.fire({ icon: 'error', title: '오류', text: json?.MESSAGE || `${action} 중 오류가 발생했습니다.` });
        }
    }, [form, authRows, setModalOpen, onSearch, pwdValid, photoFile]);

    if (!open) return null;

    return (
        <>
            <div className="modal-backdrop-custom" onClick={onClose} />
            <div className="modal-custom" style={{ alignItems: 'center', justifyContent: 'center', overflowY: 'auto', paddingTop: '4vh', paddingBottom: '4vh' }}>
                <div className="modal-dialog modal-dialog-scrollable"
                    style={{ width: 800, maxWidth: '95%', backgroundColor: '#fff', maxHeight: '92vh', display: 'flex', flexDirection: 'column', margin: 'auto' }}>
                    <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
                        <div className="modal-header" style={{ flexShrink: 0 }}>
                            <div className="modal-title">
                                <h2 className="modal-title__title">
                                     {form.mode === 'Ins' ? '관리자 등록' : '관리자 수정'}
                                </h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>

                        <div className="modal-body tab-content" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                            <div className="modal-body__content tab-pane show active">

                                {/* 관리자 사진 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">관리자 사진</label>
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                                {/* 미리보기 */}
                                                <div style={{
                                                    width: 90, height: 90, flexShrink: 0,
                                                    border: '1px solid #e2e8f0', borderRadius: 6,
                                                    overflow: 'hidden', background: '#f8fafc',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {(photoPreview || form.managerPic) ? (
                                                        <img
                                                            src={photoPreview || form.managerPic}
                                                            alt="관리자 사진"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: 28, color: '#cbd5e1' }}>사진 없음</span>
                                                    )}
                                                </div>
                                                {/* 드롭존 — 파일 없을 때만 업로드 가능 */}
                                                <div style={{ flex: 1 }}>
                                                    {!photoFile ? (
                                                        <div
                                                            {...getRootProps()}
                                                            className={`dropzone-box${isDragActive ? ' active' : ''}`}
                                                            style={{ minHeight: 90, padding: 12 }}
                                                        >
                                                            <input {...getInputProps()} />
                                                            <div className="placeholder-content" style={{ textAlign: 'center' }}>
                                                                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                                                                    <div>파일을 클릭하거나 여기로 드래그하세요</div>
                                                                    <div>JPG, PNG, GIF, WEBP</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="dropzone-box has-file" style={{ minHeight: 90, padding: 12 }}>
                                                            <div className="placeholder-content" style={{ textAlign: 'center' }}>
                                                                <div style={{ fontSize: 12, color: '#475569' }}>
                                                                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{photoFile.name}</div>
                                                                    <div style={{ color: '#94a3b8' }}>{(photoFile.size / 1024).toFixed(1)} KB</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {photoFile && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-danger btn-sm mt-1"
                                                            style={{ fontSize: 11 }}
                                                            onClick={(e) => { clearFile(e); }}
                                                        >사진 제거</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 아이디 + 상담사 여부 */}
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">아이디<span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <input type="text" className="form-control"
                                                    value={form.adminId}
                                                    readOnly={form.mode !== 'Ins'}
                                                    onChange={(e) => updateForm({ adminId: e.target.value, idCheck: 'N' })}
                                                />
                                                {form.mode === 'Ins' && (
                                                    <button type="button"
                                                        className="btn btn-primary btn-action__blue"
                                                        onClick={handleIdCheckClick}>중복체크</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">상담사 여부</label>
                                            <div className="d-flex gap-2 align-items-center flex-wrap" style={{ minHeight: 32 }}>
                                                <UseSwitch
                                                    value={form.consultantUseyn}
                                                    name="consultantUseyn"
                                                    onChange={(payload) => {
                                                        if (payload.consultantUseyn === 'Y') {
                                                            updateForm({ consultantUseyn: 'Y' });
                                                            loadConsultantCombo();
                                                        } else {
                                                            updateForm({ consultantUseyn: 'N', pbxExtension: '' });
                                                        }
                                                    }}
                                                    onText="사용"
                                                    offText="사용안함"
                                                />
                                                {form.consultantUseyn === 'Y' && (
                                                    <select className="form-select form-select-sm"
                                                        style={{ width: 160 }}
                                                        value={form.pbxExtension}
                                                        onChange={(e) => updateForm({ pbxExtension: e.target.value })}>
                                                        <option value="">상담사 선택</option>
                                                        {consultantOptions.map((o) => (
                                                            <option key={o.value} value={o.value}>{o.label}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 기관코드 + 부서명 + 권한 구분 + 권한 등급 */}
                                <div className="row input-box-wrap">
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">기관코드<span className="text-danger">*</span></label>
                                            <CommonSelect
                                                comboId="insttCode"
                                                comboName="insttCode"
                                                readOnly={form.mode !== 'Ins'}
                                                disabled={form.mode !== 'Ins'}
                                                comboData={onData}
                                                value={form.insttCode || ''}
                                                onChange={(e) => {
                                                    updateForm({ insttCode: e.target.value, partId: '' });
                                                    loadPartOptions(e.target.value);
                                                }}
                                                className="form-select"
                                                placeholder="기관 선택"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">부서명<span className="text-danger">*</span></label>
                                            <select className="form-select"
                                                value={form.partId}
                                                onChange={(e) => updateForm({ partId: e.target.value })}>
                                                <option value="">부서 선택</option>
                                                {partOptions.map((p) => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">권한 구분<span className="text-danger">*</span></label>
                                            <select className="form-select"
                                                value={form.roleGubun}
                                                onChange={(e) => updateForm({ roleGubun: e.target.value, roleId: '' })}>
                                                <option value="">선택</option>
                                                {roleGubunOptions.map((o) => (
                                                    <option key={o.codeDetailId || o.code} value={o.codeDetailId || o.code}>
                                                        {o.codeDetailNm || o.codeNm}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {form.roleGubun === 'AUTH_GUBUN_1' && (
                                        <div className="col-3">
                                            <div className="input-box">
                                                <label className="form-label">권한 등급</label>
                                                <select className="form-select"
                                                    value={form.roleId}
                                                    onChange={(e) => updateForm({ roleId: e.target.value })}>
                                                    <option value="">권한 선택</option>
                                                    {roleOptions.map((o) => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* 이름 + 연락처 */}
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">이름</label>
                                            <input type="text" className="form-control"
                                                value={form.adminName}
                                                onChange={(e) => updateForm({ adminName: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">연락처</label>
                                            <input type="text" className={`form-control${form.adminTel ? (phoneValid ? ' is-valid' : ' is-invalid') : ''}`}
                                                placeholder="010-0000-0000"
                                                value={form.adminTel}
                                                onChange={handlePhoneChange} />
                                            {form.adminTel && !phoneValid && (
                                                <small className="text-danger mt-1 d-block">올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)</small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 비밀번호 + 비밀번호 확인 + 힌트 + 정답 (1행) */}
                                <div className="row input-box-wrap">
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">비밀번호</label>
                                            <input type="password"
                                                className={`form-control${form.adminPwd ? (pwdValid ? ' is-valid' : ' is-invalid') : ''}`}
                                                value={form.adminPwd}
                                                onChange={(e) => updateForm({ adminPwd: e.target.value })} />
                                            {form.adminPwd && (
                                                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', rowGap: 2 }}>
                                                    {pwdRules.map((r) => (
                                                        <RuleItem key={r.key} passed={r.passed} label={r.label} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">비밀번호 확인</label>
                                            <input type="password"
                                                className={`form-control${form.adminPwdConfirm ? (pwdMatch ? ' is-valid' : ' is-invalid') : ''}`}
                                                value={form.adminPwdConfirm}
                                                onChange={(e) => updateForm({ adminPwdConfirm: e.target.value })} />
                                            {pwdNoMatch && (
                                                <small style={{ color: '#ef4444', marginTop: 4, display: 'block' }}>불일치</small>
                                            )}
                                            {pwdMatch && (
                                                <small style={{ color: '#22c55e', marginTop: 4, display: 'block' }}>일치</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">비밀번호 힌트</label>
                                            <input type="text" className="form-control"
                                                value={form.passwordHint}
                                                onChange={(e) => updateForm({ passwordHint: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">비밀번호 정답</label>
                                            <input type="text" className="form-control"
                                                value={form.passwordCnsr}
                                                onChange={(e) => updateForm({ passwordCnsr: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {/* 이메일 + 사용여부 + 상태 */}
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">이메일</label>
                                            <input type="text" className={`form-control${form.adminEmail ? (emailValid ? ' is-valid' : ' is-invalid') : ''}`}
                                                placeholder="example@domain.com"
                                                value={form.adminEmail}
                                                onChange={(e) => updateForm({ adminEmail: e.target.value })} />
                                            {form.adminEmail && !emailValid && (
                                                <small className="text-danger mt-1 d-block">올바른 이메일 형식이 아닙니다.</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">사용여부</label>
                                            <div className="d-flex align-items-center" style={{ height: 32 }}>
                                                <UseSwitch
                                                    value={form.useAt}
                                                    name="useAt"
                                                    onChange={updateForm}
                                                    onText="사용"
                                                    offText="사용안함"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-3">
                                        <div className="input-box">
                                            <label className="form-label">상태</label>
                                            <select className="form-select"
                                                value={form.adminState}
                                                onChange={(e) => updateForm({ adminState: e.target.value })}>
                                                {adminStateOptions.map((o) => (
                                                    <option key={o.codeDetailId || o.code} value={o.codeDetailId || o.code}>
                                                        {o.codeDetailNm || o.codeNm}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* 시스템 권한 적용 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">시스템 권한 적용</label>
                                            <div style={{
                                                border: '1px dashed #cbd5e1', borderRadius: 8,
                                                padding: '12px 16px', background: '#f8fafc',
                                                minHeight: 64, display: 'flex', flexWrap: 'wrap',
                                                gap: 10, alignItems: 'center',
                                            }}>
                                                {systemOptions.length === 0 ? (
                                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>시스템 목록 로딩 중...</span>
                                                ) : systemOptions.map((sys) => {
                                                    const checked = isChecked(sys.code);
                                                    return (
                                                        <button
                                                            key={sys.code}
                                                            type="button"
                                                            onClick={() => handleSystemCheck(sys, !checked)}
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                                                                border: checked ? '1.5px solid #3b82f6' : '1.5px solid #cbd5e1',
                                                                background: checked ? '#eff6ff' : '#fff',
                                                                color: checked ? '#2563eb' : '#64748b',
                                                                fontSize: 13, fontWeight: checked ? 600 : 400,
                                                                boxShadow: checked ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                                                                transition: 'all 0.15s',
                                                            }}
                                                        >
                                                            <span style={{ fontSize: 15 }}>⚙️</span>
                                                            {sys.codeNm}
                                                            {checked && (
                                                                <span style={{
                                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                    width: 16, height: 16, borderRadius: '50%',
                                                                    background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 700,
                                                                }}>✓</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 시스템별 권한 설정 */}
                                {authRows.length > 0 && (
                                    <div className="row input-box-wrap">
                                        <div className="col-12">
                                            <table style={{
                                                width: '100%', borderCollapse: 'collapse',
                                                fontSize: 13, border: '1px solid #e2e8f0',
                                            }}>
                                                <thead>
                                                    <tr style={{ background: '#f1f5f9' }}>
                                                        {['시스템명', '권한구분', '권한', '비고'].map((h) => (
                                                            <th key={h} style={{
                                                                padding: '8px 12px', fontWeight: 600,
                                                                color: '#475569', fontSize: 12,
                                                                borderBottom: '2px solid #cbd5e1',
                                                                borderRight: '1px solid #e2e8f0',
                                                                textAlign: 'center', whiteSpace: 'nowrap',
                                                            }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {authRows.map((row, i) => (
                                                        <tr key={row.systemCode}
                                                            style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                                            <td style={{
                                                                padding: '7px 12px', fontWeight: 500, color: '#1e293b',
                                                                borderBottom: '1px solid #e2e8f0',
                                                                borderRight: '1px solid #e2e8f0',
                                                            }}>{row.systemName}</td>
                                                            <td style={{
                                                                padding: '5px 8px', width: 130,
                                                                borderBottom: '1px solid #e2e8f0',
                                                                borderRight: '1px solid #e2e8f0',
                                                            }}>
                                                                <select className="form-select form-select-sm"
                                                                    value={row.authGubun}
                                                                    onChange={(e) => updateAuthRow(row.systemCode, 'authGubun', e.target.value)}>
                                                                    <option value="">선택</option>
                                                                    <option value="AUTH_GUBUN_1">Role</option>
                                                                </select>
                                                            </td>
                                                            <td style={{
                                                                padding: '5px 8px', width: 160,
                                                                borderBottom: '1px solid #e2e8f0',
                                                                borderRight: '1px solid #e2e8f0',
                                                            }}>
                                                                {row.authGubun === 'AUTH_GUBUN_1' ? (
                                                                    <select className="form-select form-select-sm"
                                                                        value={row.roleId}
                                                                        onChange={(e) => updateAuthRow(row.systemCode, 'roleId', e.target.value)}>
                                                                        <option value="">없음</option>
                                                                        {roleOptions.map((o) => (
                                                                            <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span style={{ color: '#94a3b8', fontSize: 12 }}>개인별 권한 설정</span>
                                                                )}
                                                            </td>
                                                            <td style={{
                                                                padding: '5px 8px', width: 160,
                                                                borderBottom: '1px solid #e2e8f0',
                                                            }}>
                                                                <input type="text" className="form-control form-control-sm"
                                                                    value={row.authDc}
                                                                    onChange={(e) => updateAuthRow(row.systemCode, 'authDc', e.target.value)} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        <div className="modal-footer" style={{ flexShrink: 0 }}>
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSubmit}>
                                    {form.mode === 'Ins' ? '등록' : '수정'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManagerFormModal;
