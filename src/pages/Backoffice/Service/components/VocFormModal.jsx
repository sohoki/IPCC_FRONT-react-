import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = { vocSubject: '', vocLocation: '', vocGubun: '', vocReq: '' };

const VocFormModal = ({ open, onClose, vocSeq, rowData, onSuccess }) => {
    const isEdt = vocSeq !== null && vocSeq !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);
    const { options: vocGubunOptions } = useCommonCodeData('VOC_GUBUN');

    useEffect(() => {
        if (!open) return;
        if (!isEdt || !rowData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                vocSubject: rowData.vocSubject || '',
                vocLocation: rowData.vocLocation || '',
                vocGubun: rowData.vocGubun || '',
                vocReq: rowData.vocReq || '',
            });
        }
    }, [open, isEdt, rowData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.vocSubject) { await Swal.fire({ icon: 'warning', text: '?úÎ™©???ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        if (!form.vocGubun) { await Swal.fire({ icon: 'warning', text: 'VOC Íµ¨Î∂Ñ???†ÌÉù??Ï£ºÏÑ∏??' }); return; }

        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question', title: `?•Ïï† ${action}`,
            html: `<b>${form.vocSubject}</b> ${action} ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.VOC_UPDATE, method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    vocSeq: vocSeq || '',
                    vocSubject: form.vocSubject,
                    vocLocation: form.vocLocation,
                    vocGubun: form.vocGubun,
                    vocReq: form.vocReq,
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
    }, [form, vocSeq, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 720, maxWidth: '95%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">?•Ïï† {isEdt ? '?òÏ†ï' : '?±Î°ù'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="vocSubject" className="form-label">?úÎ™© <span className="text-danger">*</span></label>
                                            <input id="vocSubject" name="vocSubject" type="text" className="form-control"
                                                placeholder="?úÎ™©???ÖÎ†•?¥Ï£º?∏Ïöî." value={form.vocSubject} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="vocLocation" className="form-label">?ÑÏπò</label>
                                            <input id="vocLocation" name="vocLocation" type="text" className="form-control"
                                                placeholder="?ÑÏπòÎ•??ÖÎ†•?¥Ï£º?∏Ïöî." value={form.vocLocation} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="vocGubun" className="form-label">?•Ïï† ?†Ìòï <span className="text-danger">*</span></label>
                                            <select id="vocGubun" name="vocGubun" className="form-select" value={form.vocGubun} onChange={updateForm}>
                                                <option value="">?†ÌÉù</option>
                                                {vocGubunOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="vocReq" className="form-label">?•Ïï† ?ÅÏÑ∏ ?¨Ìï≠</label>
                                            <textarea id="vocReq" name="vocReq" className="form-control" rows={8}
                                                placeholder="?•Ïï† ?ÅÏÑ∏ ?¥Ïö©???ÖÎ†•?¥Ï£º?∏Ïöî." value={form.vocReq} onChange={updateForm} />
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

export default VocFormModal;
