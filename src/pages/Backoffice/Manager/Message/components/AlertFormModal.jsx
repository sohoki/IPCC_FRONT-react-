import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
    alertMessage: '',
    alertSmsMsg: '',
    alertMsgResult: '',
    alertMsgStarttime: '',
    alertMsgEndtime: '',
    alertMsgExceptionStarttime: '',
    alertMsgExceptionEndtime: '',
    alertMsgUseyn: 'Y',
};

const AlertFormModal = ({ open, onClose, alertSeq, rowData, onSuccess }) => {
    const isEdt = alertSeq !== null && alertSeq !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (!open) return;
        if (!isEdt || !rowData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                alertMessage: rowData.alertMessage || '',
                alertSmsMsg: rowData.alertSmsMsg || '',
                alertMsgResult: rowData.alertMsgResult || '',
                alertMsgStarttime: rowData.alertMsgStarttime || '',
                alertMsgEndtime: rowData.alertMsgEndtime || '',
                alertMsgExceptionStarttime: rowData.alertMsgExceptionStarttime || '',
                alertMsgExceptionEndtime: rowData.alertMsgExceptionEndtime || '',
                alertMsgUseyn: rowData.alertMsgUseyn || 'Y',
            });
        }
    }, [open, isEdt, rowData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.alertMessage) { await Swal.fire({ icon: 'warning', text: '?•Ïï† ?åÎ¶º ?Ä?¥Ì????ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        if (!form.alertMsgResult) { await Swal.fire({ icon: 'warning', text: '?•Ïï† ?åÎ¶º Í≤∞Í≥ºÍ∞íÏùÑ ?ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        if (!form.alertSmsMsg) { await Swal.fire({ icon: 'warning', text: '?•Ïï† ?åÎ¶º SMS Î¨∏Ïûê ?¥Ïö©???ÖÎ†•??Ï£ºÏÑ∏??' }); return; }

        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question', title: `?•Ïï† ?åÎ¶º ${action}`,
            html: `<b>${form.alertMessage}</b> Î•??? ${action} ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.ALERT_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    alertSeq: alertSeq || '',
                    alertMessage: form.alertMessage,
                    alertSmsMsg: form.alertSmsMsg,
                    alertMsgResult: form.alertMsgResult,
                    alertMsgStarttime: form.alertMsgStarttime,
                    alertMsgEndtime: form.alertMsgEndtime,
                    alertMsgExceptionStarttime: form.alertMsgExceptionStarttime,
                    alertMsgExceptionEndtime: form.alertMsgExceptionEndtime,
                    alertMsgUseyn: form.alertMsgUseyn,
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
    }, [form, alertSeq, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 620, maxWidth: '90%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">?•Ïï† ?åÎ¶º {isEdt ? '?òÏ†ï' : '?±Î°ù'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="alertMessage" className="form-label">?åÎûåÎ™?<span className="text-danger">*</span></label>
                                            <input id="alertMessage" name="alertMessage" type="text" className="form-control"
                                                placeholder="?åÎûåÎ™ÖÏùÑ ?ÖÎ†•?¥Ï£º?∏Ïöî." value={form.alertMessage} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="alertSmsMsg" className="form-label">?åÎûå SMS Î¨∏Ïûê <span className="text-danger">*</span></label>
                                            <input id="alertSmsMsg" name="alertSmsMsg" type="text" className="form-control"
                                                placeholder="SMS Î¨∏Ïûê ?¥Ïö©???ÖÎ†•?¥Ï£º?∏Ïöî." value={form.alertSmsMsg} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="alertMsgResult" className="form-label">?•Ïï† ?åÎ¶º ?òÏπò <span className="text-danger">*</span></label>
                                            <input id="alertMsgResult" name="alertMsgResult" type="text" className="form-control"
                                                placeholder="?åÎ¶º ?òÏπòÎ•??ÖÎ†•?¥Ï£º?∏Ïöî." value={form.alertMsgResult} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">?¥ÏòÅ ?úÍ∞Ñ</label>
                                            <div className="d-flex gap-2 align-items-center">
                                                <input name="alertMsgStarttime" type="time" className="form-control"
                                                    value={form.alertMsgStarttime} onChange={updateForm} />
                                                <span>~</span>
                                                <input name="alertMsgEndtime" type="time" className="form-control"
                                                    value={form.alertMsgEndtime} onChange={updateForm} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">?úÏô∏ ?úÍ∞Ñ</label>
                                            <div className="d-flex gap-2 align-items-center">
                                                <input name="alertMsgExceptionStarttime" type="time" className="form-control"
                                                    value={form.alertMsgExceptionStarttime} onChange={updateForm} />
                                                <span>~</span>
                                                <input name="alertMsgExceptionEndtime" type="time" className="form-control"
                                                    value={form.alertMsgExceptionEndtime} onChange={updateForm} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">?¨Ïö© ?†Î¨¥</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.alertMsgUseyn}
                                                    name="alertMsgUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, alertMsgUseyn: payload.alertMsgUseyn }))}
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

export default AlertFormModal;
