import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = {
    centerId: '1',
    mediaId: '',
    loginId: '',
    monitorFlag: '',
    idCheck: 'N',
};

const CtiLoginFormModal = ({ open, onClose, onSuccess }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [centerOptions, setCenterOptions] = useState([]);
    const [mediaOptions, setMediaOptions] = useState([]);

    // 센터 콤보
    useEffect(() => {
        if (!open) return;
        let active = true;
        fnAjaxFetch({ url: URL.CTI_CENTER_COMBO, method: 'GET', withCredentials: true })
            .then(res => {
                if (!active) return;
                const list = res?.data?.result || [];
                setCenterOptions(list.map(o => ({ code: String(o.centerId), codeNm: o.centerName })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open]);

    // 미디어 콤보 (centerId 변경 시)
    useEffect(() => {
        if (!open || !form.centerId) return;
        let active = true;
        fnAjaxFetch({
            url: URL.CTI_MEDIA_COMBO,
            method: 'GET',
            data: { centerId: form.centerId },
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            const list = res?.data?.result || [];
            setMediaOptions(list.map(o => ({ code: String(o.mediaId), codeNm: o.mediaName })));
        }).catch(() => {});
        return () => { active = false; setMediaOptions([]); };
    }, [open, form.centerId]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'centerId' ? { mediaId: '', idCheck: 'N' } : {}),
            ...(name === 'loginId' ? { idCheck: 'N' } : {}),
        }));
    }, []);

    const handleIdCheck = useCallback(async () => {
        if (!form.loginId) { await Swal.fire({ icon: 'warning', text: 'LoginId를 입력해 주세요' }); return; }
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: '지역을 선택해 주세요' }); return; }
        if (!form.mediaId) { await Swal.fire({ icon: 'warning', text: 'Media를 선택해주세요.' }); return; }
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_LOGIN_ID_CHECK,
                method: 'POST',
                data: { loginId: form.loginId, centerId: form.centerId, mediaId: form.mediaId },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setForm(prev => ({ ...prev, idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '사용 가능합니다.' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '이미 사용 중입니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form.loginId, form.centerId, form.mediaId]);

    const handleSave = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: '지역을 선택해 주세요' }); return; }
        if (!form.mediaId) { await Swal.fire({ icon: 'warning', text: 'Media를 선택해주세요.' }); return; }
        if (!form.loginId) { await Swal.fire({ icon: 'warning', text: 'LoginId를 입력해주세요.' }); return; }
        if (form.idCheck !== 'Y') { await Swal.fire({ icon: 'warning', text: '중복 체크를 해주세요.' }); return; }

        const ok = await Swal.fire({
            icon: 'question', title: 'LoginId 등록',
            html: `loginId를 <b>등록</b> 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니요',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_LOGIN_ID_UPDATE,
                method: 'POST',
                data: {
                    mode: 'Ins',
                    loginId: form.loginId,
                    mediaId: form.mediaId,
                    centerId: form.centerId,
                    monitorFlag: form.monitorFlag,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: '등록', text: json?.MESSAGE || '등록되었습니다' });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '처리 중 문제가 발생했습니다' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered" style={{ width: 560, maxWidth: '90%', backgroundColor: 'var(--bs-body-bg, #fff)' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">LoginId 등록</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* 센터 / 주 미디어 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ctiCenterId" className="form-label">센터</label>
                                            <select
                                                id="ctiCenterId" name="centerId"
                                                className="form-select"
                                                value={form.centerId}
                                                onChange={updateForm}
                                            >
                                                <option value="">선택</option>
                                                {centerOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnMediaId" className="form-label">
                                                주 미디어 <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="dnMediaId" name="mediaId"
                                                className="form-select"
                                                value={form.mediaId}
                                                onChange={updateForm}
                                            >
                                                <option value="">선택</option>
                                                {mediaOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Login ID */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="loginId" className="form-label">
                                                Login ID <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    id="loginId" name="loginId"
                                                    type="text" className="form-control"
                                                    placeholder="LoginId를 입력해주세요."
                                                    value={form.loginId}
                                                    onChange={updateForm}
                                                />
                                                <button type="button" className="btn btn-primary btn-default__blue" onClick={handleIdCheck}>
                                                    중복확인
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 감시 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="monitorFlag" className="form-label">감시</label>
                                            <select
                                                id="monitorFlag" name="monitorFlag"
                                                className="form-select"
                                                value={form.monitorFlag}
                                                onChange={updateForm}
                                            >
                                                <option value="">없음</option>
                                                <option value="1">감시</option>
                                                <option value="0">감시안함</option>
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

export default CtiLoginFormModal;
