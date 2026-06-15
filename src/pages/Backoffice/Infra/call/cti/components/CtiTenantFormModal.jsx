import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const SERVICE_LEVEL_OPTIONS = ['1','2','3','4','5','6','7','8','9'];

const EMPTY_FORM = {
    centerId: '1',
    tenantId: '',
    tenantName: '',
    servicelevelCalc: '1',
    idCheck: 'N',
};

const CtiTenantFormModal = ({ open, onClose, tenantId, rowData, onSuccess }) => {
    const isEdt = tenantId !== null && tenantId !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);
    const [centerOptions, setCenterOptions] = useState([]);

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

    useEffect(() => {
        if (!open) return;
        if (!isEdt || !rowData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                centerId: String(rowData.centerId || '1'),
                tenantId: String(rowData.tenantId || ''),
                tenantName: rowData.tenantName || '',
                servicelevelCalc: String(rowData.servicelevelCalc || '1'),
                idCheck: 'Y',
            });
        }
    }, [open, isEdt, rowData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value, ...(name === 'tenantId' ? { idCheck: 'N' } : {}) }));
    }, []);

    const handleIdCheck = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: 'centerÎ•??†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: 'tenant IdÎ•??ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_TENANT_ID_CHECK,
                method: 'POST',
                data: { tenantId: form.tenantId, centerId: form.centerId },
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
    }, [form.centerId, form.tenantId]);

    const handleSave = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: 'ÏßÄ?êÏùÑ ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: 'tenant IdÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.tenantName) { await Swal.fire({ icon: 'warning', text: 'tenant Name???ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
        if (!isEdt && form.idCheck !== 'Y') { await Swal.fire({ icon: 'warning', text: 'Ï§ëÎ≥µ Ï≤¥ÌÅ¨Î•??¥Ï£º?∏Ïöî.' }); return; }

        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question', title: `Tenant ${action}`,
            html: `TenantÎ•?<b>${action}</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_TENANT_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    centerId: form.centerId,
                    tenantId: form.tenantId,
                    tenantName: form.tenantName,
                    servicelevelCalc: form.servicelevelCalc,
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
                <div className="modal-dialog modal-dialog-centered" style={{ width: 560, maxWidth: '90%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">TENANT ID {isEdt ? '?òÏ†ï' : '?±Î°ù'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ctiCenterId" className="form-label">?ºÌÑ∞</label>
                                            <select
                                                id="ctiCenterId" name="centerId"
                                                className="form-select"
                                                value={form.centerId}
                                                onChange={updateForm}
                                                disabled={isEdt}
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
                                            <label htmlFor="tenantId" className="form-label">
                                                ?åÎÑå?∏ID <span className="text-danger">*</span>
                                            </label>
                                            {isEdt ? (
                                                <input id="tenantId" type="text" className="form-control" value={form.tenantId} readOnly />
                                            ) : (
                                                <div className="input-group">
                                                    <input
                                                        id="tenantId" name="tenantId"
                                                        type="text" className="form-control"
                                                        placeholder="?´Ïûê ÏµúÎ? 2?êÎ¶¨" maxLength={2}
                                                        value={form.tenantId}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/[^0-9]/g, '');
                                                            setForm(prev => ({ ...prev, tenantId: v, idCheck: 'N' }));
                                                        }}
                                                    />
                                                    <button type="button" className="btn btn-primary btn-default__blue" onClick={handleIdCheck}>
                                                        Ï§ëÎ≥µ?ïÏù∏
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="tenantName" className="form-label">
                                                ?åÎÑå?∏Î™Ö <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="tenantName" name="tenantName"
                                                type="text" className="form-control"
                                                placeholder="?åÎÑå?∏Î™Ö???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.tenantName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="servicelevelCalc" className="form-label">?úÎπÑ??LEVEL</label>
                                            <select
                                                id="servicelevelCalc" name="servicelevelCalc"
                                                className="form-select"
                                                value={form.servicelevelCalc}
                                                onChange={updateForm}
                                            >
                                                <option value="">?ÜÏùå</option>
                                                {SERVICE_LEVEL_OPTIONS.map(v => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
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

export default CtiTenantFormModal;
