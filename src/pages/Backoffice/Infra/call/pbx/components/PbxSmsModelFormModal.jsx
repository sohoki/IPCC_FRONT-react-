import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
    notiSeq: '',
    smsModel: '',
    smsFields: '',
    smsName: '',
    smsFieldsDc: '',
    smsOperation: '',
    smsGubun: '',
    smsUseyn: 'Y',
};

const PbxSmsModelFormModal = ({ open, onClose, notiSeq, rowData, onSuccess }) => {
    const isEdt = notiSeq !== null && notiSeq !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);

    const { options: smsGubunOptions } = useCommonCodeData('AUTH_GUBUN');

    // Í∏∞Î≥∏ ?ÑÎìú??rowData?êÏÑú, smsFields/smsFieldsDc???ÅÏÑ∏ API?êÏÑú Î°úÎìú
    useEffect(() => {
        if (!open) return;
        if (!isEdt || !rowData) {
            setForm(EMPTY_FORM);
            return;
        }
        setForm({
            notiSeq: String(rowData.notiSeq || ''),
            smsModel: rowData.smsModel || '',
            smsFields: '',
            smsName: rowData.smsName || '',
            smsFieldsDc: '',
            smsOperation: rowData.smsOperation || '',
            smsGubun: rowData.smsGubun || '',
            smsUseyn: rowData.smsUseyn || 'Y',
        });
    }, [open, isEdt, rowData]);

    useEffect(() => {
        if (!open || !isEdt || !notiSeq) return;
        let active = true;
        fnAjaxFetch({
            url: `${URL.SMS_MODEL_INFO}/${encodeURIComponent(notiSeq)}.do`,
            method: 'GET',
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            const result = res?.data?.result || {};
            setForm(prev => ({
                ...prev,
                smsFields: result.smsFields || '',
                smsFieldsDc: result.smsFieldsDc || '',
            }));
        }).catch(() => {});
        return () => { active = false; };
    }, [open, isEdt, notiSeq]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.smsModel) {
            await Swal.fire({ icon: 'warning', text: 'SMS MODEL???ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        if (!form.smsFields) {
            await Swal.fire({ icon: 'warning', text: 'SMS MODEL FIELDÎ•??ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question',
            title: `SMS Model ${action}`,
            html: `SMS Model??<b>${action}</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.SMS_MODEL_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    notiSeq: form.notiSeq,
                    smsModel: form.smsModel,
                    smsName: form.smsName,
                    smsFields: form.smsFields,
                    smsFieldsDc: form.smsFieldsDc,
                    smsOperation: form.smsOperation,
                    smsGubun: form.smsGubun,
                    smsUseyn: form.smsUseyn,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}?òÏóà?µÎãà??` });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 680, maxWidth: '95%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">
                                    SMS MODEL {isEdt ? '?òÏ†ï' : '?±Î°ù'}
                                </h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* SMS_MODEL */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsModel" className="form-label">
                                                SMS_MODEL <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="smsModel" name="smsModel"
                                                type="text" className="form-control"
                                                placeholder="SMS MODEL???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.smsModel}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* SMS FIELD */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsFields" className="form-label">
                                                SMS FIELD <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                id="smsFields" name="smsFields"
                                                className="form-control"
                                                rows={4}
                                                placeholder="SMS FIELDÎ•??ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.smsFields}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* ?§Î™Ö?úÍ? */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsName" className="form-label">?§Î™Ö?úÍ?</label>
                                            <input
                                                id="smsName" name="smsName"
                                                type="text" className="form-control"
                                                placeholder="?§Î™Ö???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.smsName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* SMS FIELD ?§Î™Ö?úÍ? */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsFieldsDc" className="form-label">SMS FIELD ?§Î™Ö?úÍ?</label>
                                            <textarea
                                                id="smsFieldsDc" name="smsFieldsDc"
                                                className="form-control"
                                                rows={4}
                                                placeholder="SMS FIELD ?§Î™Ö???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.smsFieldsDc}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* SMS ?¥ÏòÅ ÏßÄ??*/}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsOperation" className="form-label">SMS ?¥ÏòÅ ÏßÄ??/label>
                                            <input
                                                id="smsOperation" name="smsOperation"
                                                type="text" className="form-control"
                                                placeholder="SMS ?¥ÏòÅ ÏßÄ???ïÎ≥¥Î•??ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.smsOperation}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* Íµ¨Î∂Ñ */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="smsGubun" className="form-label">Íµ¨Î∂Ñ</label>
                                            <select
                                                id="smsGubun" name="smsGubun"
                                                className="form-select"
                                                value={form.smsGubun}
                                                onChange={updateForm}
                                            >
                                                <option value="">?†ÌÉù</option>
                                                {smsGubunOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* ?¨Ïö© ?†Î¨¥ */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">?¨Ïö© ?†Î¨¥</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.smsUseyn}
                                                    name="smsUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, smsUseyn: payload.smsUseyn }))}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö© ?àÌï®"
                                                />
                                            </div>
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

export default PbxSmsModelFormModal;
