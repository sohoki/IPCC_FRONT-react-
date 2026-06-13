import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const PbxIpFormModal = ({ open, onClose, rowData, onSuccess }) => {
    const [form, setForm] = useState({ extension: '', ipAddress: '', ipUseyn: 'Y', recUseyn: 'Y' });

    useEffect(() => {
        if (!open || !rowData) return;
        setForm({
            extension: rowData.extension || '',
            ipAddress: rowData.ipAddress || '',
            ipUseyn: rowData.ipUseyn === 'Y' ? 'Y' : 'N',
            recUseyn: rowData.recUseyn === 'Y' ? 'Y' : 'N',
        });
    }, [open, rowData]);

    const handleSave = useCallback(async () => {
        if (!form.extension) {
            await Swal.fire({ icon: 'warning', text: '?¥ÏÑ†Î≤àÌò∏Î•??ïÏù∏??Ï£ºÏÑ∏??' });
            return;
        }
        const ok = await Swal.fire({
            icon: 'question', title: 'IP/?¥ÏÑ†Î≤àÌò∏ ?òÏ†ï',
            html: `<b>${form.extension}</b> ?ïÎ≥¥Î•?<b>?òÏ†ï</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.IP_UPDATE,
                method: 'POST',
                data: {
                    extension: form.extension,
                    ipAddress: form.ipAddress,
                    ipUseyn: form.ipUseyn,
                    recUseyn: form.recUseyn,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: '?òÏ†ï', text: json?.MESSAGE || '?òÏ†ï?òÏóà?µÎãà??' });
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
                                <h2 className="modal-title__title">IP/?¥ÏÑ†Î≤àÌò∏ ?òÏ†ï</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="txtExtension" className="form-label">?¥ÏÑ†Î≤àÌò∏</label>
                                            <input
                                                id="txtExtension"
                                                type="text" className="form-control"
                                                value={form.extension}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="txtIpAddress" className="form-label">IP</label>
                                            <input
                                                id="txtIpAddress"
                                                type="text" className="form-control"
                                                value={form.ipAddress}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">?¨Ïö©?†Î¨¥</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.ipUseyn}
                                                    name="ipUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, ipUseyn: payload.ipUseyn }))}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö©?àÌï®"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">?πÏ∑®?¨Ïö©?¨Î?</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.recUseyn}
                                                    name="recUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, recUseyn: payload.recUseyn }))}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö©?àÌï®"
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

export default PbxIpFormModal;
