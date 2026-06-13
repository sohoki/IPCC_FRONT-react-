import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = { partGubun: '', alertPart: '', alertPartUseyn: 'Y' };

/**
 * Props:
 *   open, onClose
 *   alertSeq      ??Î∂ÄÎ™??åÎ¶º ?úÌÄÄ?? *   alertPartSeq  ??null = ?†Í∑ú, string = ?òÏ†ï
 *   partData      ???òÏ†ï ??row ?∞Ïù¥?? *   onSuccess(alertSeq)
 */
const AlertPartFormModal = ({ open, onClose, alertSeq, alertPartSeq, partData, onSuccess }) => {
    const isEdt = alertPartSeq !== null && alertPartSeq !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);
    const { options: partGubunOptions } = useCommonCodeData('PART_GUBUN');

    useEffect(() => {
        if (!open) return;
        if (!isEdt || !partData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                partGubun: partData.partGubun || '',
                alertPart: partData.alertPart || '',
                alertPartUseyn: partData.alertPartUseyn || 'Y',
            });
        }
    }, [open, isEdt, partData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.alertPart) { await Swal.fire({ icon: 'warning', text: 'Î∂Ä??ÏΩîÎìúÎ•??ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        if (!form.partGubun) { await Swal.fire({ icon: 'warning', text: 'Î∂Ä??Íµ¨Î∂Ñ???†ÌÉù??Ï£ºÏÑ∏??' }); return; }

        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question', title: `Î∂Ä??${action}`,
            html: `Î∂Ä?úÎ? <b>${action}</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.ALERT_PART_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    alertSeq,
                    alertPartSeq: alertPartSeq || '',
                    partGubun: form.partGubun,
                    alertPart: form.alertPart,
                    alertPartUseyn: form.alertPartUseyn,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}?òÏóà?µÎãà??` });
                onSuccess(alertSeq);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form, alertSeq, alertPartSeq, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
            <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                <div className="modal-dialog modal-dialog-centered"
                    style={{ width: 500, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">Î∂Ä??{isEdt ? '?òÏ†ï' : '?±Î°ù'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {alertSeq && (
                                        <div className="col-12">
                                            <div className="input-box">
                                                <label className="form-label">Î∂ÑÎ•òÏΩîÎìúID</label>
                                                <div className="form-control bg-light">{alertSeq}</div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="partGubun" className="form-label">Î∂Ä??Íµ¨Î∂Ñ <span className="text-danger">*</span></label>
                                            <select id="partGubun" name="partGubun" className="form-select" value={form.partGubun} onChange={updateForm}>
                                                <option value="">?†ÌÉù</option>
                                                {partGubunOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="alertPart" className="form-label">Î∂Ä??<span className="text-danger">*</span></label>
                                            <input id="alertPart" name="alertPart" type="text" className="form-control"
                                                placeholder="Î∂Ä??ÏΩîÎìúÎ•??ÖÎ†•?¥Ï£º?∏Ïöî." value={form.alertPart} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">?¨Ïö© ?†Î¨¥</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.alertPartUseyn}
                                                    name="alertPartUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, alertPartUseyn: payload.alertPartUseyn }))}
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

export default AlertPartFormModal;
