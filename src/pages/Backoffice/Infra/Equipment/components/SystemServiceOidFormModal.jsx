import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = { oidNumber: '', oidName: '', oidResultType: '' };

/**
 * Props:
 *   open, onClose
 *   serviceSeq   ??Î∂ÄÎ™??úÎπÑ?? *   oidSeq       ??null = ?†Í∑ú, string = ?òÏ†ï
 *   oidData      ???òÏ†ï ??row ?∞Ïù¥?? *   onSuccess(serviceSeq) ???Ä????†ú ???∏Ï∂ú
 */
const SystemServiceOidFormModal = ({ open, onClose, serviceSeq, oidSeq, oidData, onSuccess }) => {
    const isEdt = oidSeq !== null && oidSeq !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);
    const { options: oidResultTypeOptions } = useCommonCodeData('SNMP_VALUE_GUBUN');

    useEffect(() => {
        if (!open) return;
        if (!isEdt || !oidData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                oidNumber: oidData.oidNumber || '',
                oidName: oidData.oidName || '',
                oidResultType: oidData.oidResultType || '',
            });
        }
    }, [open, isEdt, oidData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.oidNumber) { await Swal.fire({ icon: 'warning', text: 'OIDÎ•??ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        if (!form.oidName) { await Swal.fire({ icon: 'warning', text: 'OID Î™ÖÏùÑ ?ÖÎ†•??Ï£ºÏÑ∏??' }); return; }

        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question', title: `OID ${action}`,
            text: `${action} ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.SERVICE_OID_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    oidSeq: oidSeq || '',
                    serviceSeq,
                    oidNumber: form.oidNumber,
                    oidName: form.oidName,
                    oidResultType: form.oidResultType,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}?òÏóà?µÎãà??` });
                onSuccess(serviceSeq);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form, serviceSeq, oidSeq, isEdt, onSuccess]);

    const handleDelete = useCallback(async () => {
        const ok = await Swal.fire({
            icon: 'question', title: 'OID ??†ú',
            html: `<b>${oidSeq}</b> Î•??? ??†ú ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: `${URL.SERVICE_OID}/${encodeURIComponent(oidSeq)}.do`,
                method: 'DELETE',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                onSuccess(serviceSeq);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '??†ú???§Ìå®?àÏäµ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [oidSeq, serviceSeq, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1060 }}>
            <div className="modal-custom" style={{ zIndex: 1061, marginLeft: 0 }}>
                <div className="modal-dialog modal-dialog-centered" style={{ width: 520, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">OID {isEdt ? '?òÏ†ï' : '?±Î°ù'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="oidNumber" className="form-label">
                                                OID <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="oidNumber" name="oidNumber"
                                                type="text" className="form-control"
                                                placeholder="OIDÎ•??ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.oidNumber}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="oidName" className="form-label">
                                                ?ÅÏÑ∏ÏΩîÎìú?§Î™Ö <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="oidName" name="oidName"
                                                type="text" className="form-control"
                                                placeholder="OID Î™ÖÏùÑ ?ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.oidName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="oidResultType" className="form-label">Í≤∞Í≥º?ïÌÉú</label>
                                            <select
                                                id="oidResultType" name="oidResultType"
                                                className="form-select"
                                                value={form.oidResultType}
                                                onChange={updateForm}
                                            >
                                                <option value="">?†ÌÉù</option>
                                                {oidResultTypeOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left">
                                {isEdt && (
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>??†ú</button>
                                )}
                            </div>
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

export default SystemServiceOidFormModal;
