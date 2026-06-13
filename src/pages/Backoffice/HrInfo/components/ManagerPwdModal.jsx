import React, { useState, useCallback } from 'react';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import Swal from '@/lib/swal.js';
import { usePwdValidate } from '@/hooks/use-pwd-validate.js';

const INITIAL = { newPwd: '', confirmPwd: '' };

const RuleItem = ({ passed, label }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, color: passed ? '#22c55e' : '#94a3b8', marginRight: 10,
    }}>
        <span style={{ fontSize: 13 }}>{passed ? '✓' : '✕'}</span>
        {label}
    </span>
);

const ManagerPwdModal = ({ open, adminId, adminName, onClose }) => {
    const [form, setForm] = useState(INITIAL);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { rules: ruleStatus, isValid: pwdValid } = usePwdValidate(form.newPwd);
    const pwdMatch   = form.confirmPwd !== '' && form.newPwd === form.confirmPwd;
    const pwdNoMatch = form.confirmPwd !== '' && form.newPwd !== form.confirmPwd;

    const handleClose = useCallback(() => {
        setForm(INITIAL);
        setShowNew(false);
        setShowConfirm(false);
        onClose();
    }, [onClose]);

    const handleSubmit = useCallback(async () => {
        if (!form.newPwd) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '새 비밀번호를 입력해 주세요.' });
            return;
        }
        if (!pwdValid) {
            await Swal.fire({
                icon: 'warning', title: '비밀번호 검증오류',
                text: '비밀번호는 8자리 이상 대문자 특수문자 포함 입니다.',
            });
            return;
        }
        if (form.newPwd !== form.confirmPwd) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '비밀번호가 일치하지 않습니다.' });
            return;
        }

        const ok = await Swal.fire({
            icon: 'question',
            title: '비밀번호 변경',
            html: `<b>${adminName || adminId}</b> 비밀번호를 변경 하겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '변경',
            cancelButtonText: '취소',
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: API_URL.MANAGER_PASS_CHANGE,
                method: 'POST',
                data: { adminId, adminPassword: form.newPwd },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS' || json?.STATUS === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: '완료', text: '비밀번호가 변경되었습니다.' });
                handleClose();
            } else {
                await Swal.fire({ icon: 'error', title: '오류', text: json?.resultMessage || json?.MESSAGE || '비밀번호 변경 중 오류가 발생했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '비밀번호 변경 중 오류가 발생했습니다.' });
        }
    }, [form, adminId, adminName, handleClose, pwdValid]);

    if (!open) return null;

    return (
        <>
            <div className="modal-backdrop-custom" onClick={handleClose} />
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered"
                    style={{ width: 420, maxWidth: '95%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">비밀번호 변경</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={handleClose} />
                        </div>

                        <div className="modal-body tab-content">
                            <div className="modal-body__content tab-pane show active">

                                {/* 현재 관리자 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">관리자</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={`${adminName || ''} (${adminId || ''})`}
                                                readOnly
                                                style={{ background: '#f8fafc', color: '#64748b' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 새 비밀번호 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">새 비밀번호<span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type={showNew ? 'text' : 'password'}
                                                    className={`form-control${form.newPwd ? (pwdValid ? ' is-valid' : ' is-invalid') : ''}`}
                                                    value={form.newPwd}
                                                    placeholder="새 비밀번호 입력"
                                                    onChange={(e) => setForm((p) => ({ ...p, newPwd: e.target.value }))}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    style={{ fontSize: 13, padding: '0 10px' }}
                                                    onClick={() => setShowNew((v) => !v)}
                                                >{showNew ? '숨기기' : '보기'}</button>
                                            </div>
                                            {/* 규칙 충족 가이드 */}
                                            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', rowGap: 2 }}>
                                                {ruleStatus.map((r) => (
                                                    <RuleItem key={r.key} passed={r.passed} label={r.label} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 비밀번호 확인 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">비밀번호 확인<span className="text-danger">*</span></label>
                                            <div className="input-group">
                                                <input
                                                    type={showConfirm ? 'text' : 'password'}
                                                    className={`form-control${form.confirmPwd ? (pwdMatch ? ' is-valid' : ' is-invalid') : ''}`}
                                                    value={form.confirmPwd}
                                                    placeholder="비밀번호 재입력"
                                                    onChange={(e) => setForm((p) => ({ ...p, confirmPwd: e.target.value }))}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    style={{ fontSize: 13, padding: '0 10px' }}
                                                    onClick={() => setShowConfirm((v) => !v)}
                                                >{showConfirm ? '숨기기' : '보기'}</button>
                                            </div>
                                            {pwdNoMatch && (
                                                <small style={{ color: '#ef4444', marginTop: 4, display: 'block' }}>
                                                    비밀번호가 일치하지 않습니다.
                                                </small>
                                            )}
                                            {pwdMatch && (
                                                <small style={{ color: '#22c55e', marginTop: 4, display: 'block' }}>
                                                    비밀번호가 일치합니다.
                                                </small>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={handleClose}>취소</button>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-action__blue"
                                    disabled={!pwdValid || !pwdMatch}
                                    onClick={handleSubmit}
                                >변경</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManagerPwdModal;
