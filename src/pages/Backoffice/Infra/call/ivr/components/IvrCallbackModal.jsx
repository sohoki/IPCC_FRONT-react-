import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const IvrCallbackModal = ({ open, onClose, ivrCode, ivrDars, ivrCbk, onSuccess }) => {
    const [form, setForm] = useState({ useDarsAt: 'Y', useCallbackAt: 'Y' });

    useEffect(() => {
        if (!open) return;
        setForm({
            useDarsAt: ivrDars || 'Y',
            useCallbackAt: ivrCbk || 'Y',
        });
    }, [open, ivrDars, ivrCbk]);

    const handleSave = useCallback(async () => {
        const ok = await Swal.fire({
            icon: 'question',
            title: 'IVR ?±Î°ù',
            text: '?±Î°ù ?òÏãúÍ≤†Ïäµ?àÍπå?',
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.IVR_CALLBACK_UPDATE,
                method: 'POST',
                data: {
                    mode: 'Edt',
                    ivrCode,
                    ivrDars: form.useDarsAt,
                    ivrCbk: form.useCallbackAt,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?±Î°ù?òÏóà?µÎãà??' });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '?§Î•ò', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form, ivrCode, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
            <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                <div
                    className="modal-dialog modal-dialog-centered"
                    style={{ width: 560, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">DARS / Callback ?§Ï†ï ??{ivrCode}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">DARS ?¨Ïö© ?¨Î?</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.useDarsAt}
                                                    name="useDarsAt"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, useDarsAt: payload.useDarsAt }))}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö© ?àÌï®"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">Callback ?¨Î?</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.useCallbackAt}
                                                    name="useCallbackAt"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, useCallbackAt: payload.useCallbackAt }))}
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
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>?±Î°ù</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IvrCallbackModal;
