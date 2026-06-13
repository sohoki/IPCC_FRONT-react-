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

    // ?ºÌÑ∞ ÏΩ§Î≥¥
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

    // ÎØ∏Îîî??ÏΩ§Î≥¥ (centerId Î≥ÄÍ≤???
    useEffect(() => {
        if (!open || !form.centerId) { setMediaOptions([]); return; }
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
        return () => { active = false; };
    }, [open, form.centerId]);

    // ?¥Î¶¥ ??Ï¥àÍ∏∞??    useEffect(() => {
        if (open) setForm(EMPTY_FORM);
    }, [open]);

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
        if (!form.loginId) { await Swal.fire({ icon: 'warning', text: 'LoginIdÎ•??ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: 'ÏßÄ?êÏùÑ ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!form.mediaId) { await Swal.fire({ icon: 'warning', text: 'MediaÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
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
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?¨Ïö© Í∞Ä?•Ìï©?àÎã§.' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '?¥Î? ?¨Ïö© Ï§ëÏûÖ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form.loginId, form.centerId, form.mediaId]);

    const handleSave = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: 'ÏßÄ?êÏùÑ ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!form.mediaId) { await Swal.fire({ icon: 'warning', text: 'MediaÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.loginId) { await Swal.fire({ icon: 'warning', text: 'LoginIdÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
        if (form.idCheck !== 'Y') { await Swal.fire({ icon: 'warning', text: 'Ï§ëÎ≥µ Ï≤¥ÌÅ¨Î•??¥Ï£º?∏Ïöî.' }); return; }

        const ok = await Swal.fire({
            icon: 'question', title: 'LoginId ?±Î°ù',
            html: `loginIdÎ•?<b>?±Î°ù</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
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
                await Swal.fire({ icon: 'success', title: '?±Î°ù', text: json?.MESSAGE || '?±Î°ù?òÏóà?µÎãà??' });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered" style={{ width: 560, maxWidth: '90%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">LoginId ?±Î°ù</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* ?ºÌÑ∞ / Ï£ºÎ??îÏñ¥ */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ctiCenterId" className="form-label">?ºÌÑ∞</label>
                                            <select
                                                id="ctiCenterId" name="centerId"
                                                className="form-select"
                                                value={form.centerId}
                                                onChange={updateForm}
                                            >
                                                <option value="">?†ÌÉù</option>
                                                {centerOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnMediaId" className="form-label">
                                                Ï£ºÎ??îÏñ¥ <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="dnMediaId" name="mediaId"
                                                className="form-select"
                                                value={form.mediaId}
                                                onChange={updateForm}
                                            >
                                                <option value="">?†ÌÉù</option>
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
                                                    placeholder="LoginIdÎ•??ÖÎ†•?¥Ï£º?∏Ïöî."
                                                    value={form.loginId}
                                                    onChange={updateForm}
                                                />
                                                <button type="button" className="btn btn-primary btn-default__blue" onClick={handleIdCheck}>
                                                    Ï§ëÎ≥µ?ïÏù∏
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Í∞êÏãú */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="monitorFlag" className="form-label">Í∞êÏãú</label>
                                            <select
                                                id="monitorFlag" name="monitorFlag"
                                                className="form-select"
                                                value={form.monitorFlag}
                                                onChange={updateForm}
                                            >
                                                <option value="">?ÜÏùå</option>
                                                <option value="1">Í∞êÏãú</option>
                                                <option value="0">Í∞êÏãú?àÌï®</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>Ï∑®ÏÜå</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>?Ä??/button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CtiLoginFormModal;
