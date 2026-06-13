import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
    centerId: '',
    tenantId: '',
    dnMajorId: '',
    dnSubId: '',
    mediaId: '',
    submediaId: '',
    dnModelname: '',
    dnIp: '',
    dnKind: '',
    dnType: '',
    dn: '',
    observerFlag: '1',
    monitorFlag: '',
    tag: '',
    dnServicedesc: '0',
    idCheck: 'N',
};

const DN_KIND_OPTIONS = [
    { value: '1', label: 'PSTN' },
    { value: '2', label: 'ARS' },
    { value: '3', label: 'PSTN + VoIP' },
    { value: '4', label: 'PSTN + Chat' },
    { value: '5', label: 'PSTN + eMail' },
    { value: '6', label: 'PSTN + Fax' },
    { value: '7', label: 'CITG' },
    { value: '8', label: 'ARS AUTH' },
];

const DN_TYPE_OPTIONS = [
    { value: '1', label: 'Normal Phone' },
    { value: '2', label: 'Digital Phone' },
    { value: '3', label: 'Virtual Phone' },
    { value: '4', label: 'ChatBot' },
];

// ÏΩ§Î≥¥ fetch ?¨Ìçº
const fetchCombo = async (url, params) => {
    const res = await fnAjaxFetch({ url, method: 'GET', data: params, withCredentials: true });
    return res?.data?.result || [];
};

const CtiDnFormModal = ({ open, onClose, dn, rowData, onSuccess }) => {
    const isEdt = dn !== null && dn !== undefined;

    const [form, setForm] = useState(EMPTY_FORM);

    // ÏΩ§Î≥¥ ?µÏÖò
    const [centerOptions, setCenterOptions] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [majorOptions, setMajorOptions] = useState([]);
    const [subOptions, setSubOptions] = useState([]);
    const [mediaOptions, setMediaOptions] = useState([]);

    // ?Ä?Ä Ï¥àÍ∏∞???Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    useEffect(() => {
        if (!open) return;
        if (!isEdt || !rowData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                centerId: rowData.centerId || '',
                tenantId: rowData.tenantId || '',
                dnMajorId: rowData.dnmajorId || '',
                dnSubId: rowData.dnsubId || '',
                mediaId: rowData.mediaId || '',
                submediaId: rowData.submediaId || '',
                dnModelname: rowData.dnModelname || '',
                dnIp: rowData.dnIp || '',
                dnKind: rowData.dnKind || '',
                dnType: rowData.dnType || '',
                dn: rowData.dn || dn || '',
                observerFlag: String(rowData.observerFlag ?? '1'),
                monitorFlag: String(rowData.monitorFlag ?? ''),
                tag: rowData.tag || '',
                dnServicedesc: rowData.dnServicedesc || '0',
                idCheck: 'Y',
            });
        }
    }, [open, isEdt, dn, rowData]);

    // ?Ä?Ä ?ºÌÑ∞ ÏΩ§Î≥¥ ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    useEffect(() => {
        if (!open) return;
        let active = true;
        fetchCombo(URL.CTI_CENTER_COMBO, null)
            .then(list => {
                if (!active) return;
                setCenterOptions(list.map(o => ({ code: String(o.centerId), codeNm: o.centerName })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open]);

    // ?Ä?Ä ?åÎÑå??ÏΩ§Î≥¥ (centerId ?òÏ°¥) ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    useEffect(() => {
        if (!open || !form.centerId) { setTenantOptions([]); return; }
        let active = true;
        fetchCombo(`${URL.CTI_TENANT_COMBO}/${encodeURIComponent(form.centerId)}.do`, null)
            .then(list => {
                if (!active) return;
                setTenantOptions(list.map(o => ({ code: String(o.tenantId), codeNm: o.tenantName })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open, form.centerId]);

    // ?Ä?Ä ÎØ∏Îîî??ÏΩ§Î≥¥ (centerId ?òÏ°¥) ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    useEffect(() => {
        if (!open || !form.centerId) { setMediaOptions([]); return; }
        let active = true;
        fetchCombo(URL.CTI_MEDIA_COMBO, { centerId: form.centerId })
            .then(list => {
                if (!active) return;
                setMediaOptions(list.map(o => ({ code: String(o.mediaId), codeNm: o.mediaName })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open, form.centerId]);

    // ?Ä?Ä DN ?ÄÎ∂ÑÎ•ò ÏΩ§Î≥¥ (centerId + tenantId ?òÏ°¥) ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    useEffect(() => {
        if (!open || !form.centerId || !form.tenantId) { setMajorOptions([]); return; }
        let active = true;
        fetchCombo(URL.CTI_DN_MAJOR_COMBO, { centerId: form.centerId, tenantId: form.tenantId })
            .then(list => {
                if (!active) return;
                setMajorOptions(list.map(o => ({ code: String(o.dnmajorId), codeNm: o.dnmajorName || o.dnmajorId })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open, form.centerId, form.tenantId]);

    // ?Ä?Ä DN ?åÎ∂ÑÎ•?ÏΩ§Î≥¥ (centerId + tenantId + majorId ?òÏ°¥) ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    useEffect(() => {
        if (!open || !form.centerId || !form.tenantId || !form.dnMajorId) { setSubOptions([]); return; }
        let active = true;
        fetchCombo(URL.CTI_DN_SUB_COMBO, { centerId: form.centerId, tenantId: form.tenantId, dnmajorId: form.dnMajorId })
            .then(list => {
                if (!active) return;
                setSubOptions(list.map(o => ({ code: String(o.dnsubId), codeNm: o.dnsubName || o.dnsubId })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open, form.centerId, form.tenantId, form.dnMajorId]);

    // ?Ä?Ä onChange ?∏Îì§??(?∞ÏáÑ Ï¥àÍ∏∞???¨Ìï®) ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    const handleCenterChange = useCallback((e) => {
        setForm(prev => ({ ...prev, centerId: e.target.value, tenantId: '', dnMajorId: '', dnSubId: '', mediaId: '' }));
    }, []);

    const handleTenantChange = useCallback((e) => {
        setForm(prev => ({ ...prev, tenantId: e.target.value, dnMajorId: '', dnSubId: '' }));
    }, []);

    const handleMajorChange = useCallback((e) => {
        setForm(prev => ({ ...prev, dnMajorId: e.target.value, dnSubId: '' }));
    }, []);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    // ?Ä?Ä Ï§ëÎ≥µ?ïÏù∏ ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    const handleIdCheck = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: 'ÏßÄ?êÏùÑ ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: '?åÎÑå?∏Î? ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!form.dn) { await Swal.fire({ icon: 'warning', text: 'DN???ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_DN_ID_CHECK,
                method: 'POST',
                data: { centerId: form.centerId, tenantId: form.tenantId, dn: form.dn },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setForm(prev => ({ ...prev, idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?¨Ïö© Í∞Ä?•Ìïú DN?ÖÎãà??' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '?¥Î? ?¨Ïö© Ï§ëÏù∏ DN?ÖÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form.centerId, form.tenantId, form.dn]);

    // ?Ä?Ä ?Ä???Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä
    const handleSave = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: 'ÏßÄ?êÏùÑ ?†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: 'TenantÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.dnMajorId) { await Swal.fire({ icon: 'warning', text: 'DN ?ÄÎ∂ÑÎ•òÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.dnSubId) { await Swal.fire({ icon: 'warning', text: 'DN ?åÎ∂ÑÎ•òÎ? ?†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.mediaId) { await Swal.fire({ icon: 'warning', text: 'MediaÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.dn) { await Swal.fire({ icon: 'warning', text: 'DN???ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }

        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question',
            title: `DN ${action}`,
            html: `DN??<b>${action}</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        const nvl = (v, def = '0') => (v === '' || v === null || v === undefined) ? def : v;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_DN_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    centerId: form.centerId,
                    tenantId: form.tenantId,
                    dnmajorId: form.dnMajorId,
                    dnsubId: form.dnSubId,
                    dn: form.dn,
                    mediaId: form.mediaId,
                    submediaId: nvl(form.submediaId),
                    dnModelname: form.dnModelname,
                    dnServicedesc: nvl(form.dnServicedesc),
                    dnKind: form.dnKind,
                    dnType: form.dnType,
                    dnIp: form.dnIp,
                    observerFlag: nvl(form.observerFlag),
                    monitorFlag: nvl(form.monitorFlag),
                    tag: nvl(form.tag),
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}?òÏóà?µÎãà??` });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', title: '?§Î•ò', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '?§Î•ò', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 760, maxWidth: '95%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">DN {isEdt ? '?òÏ†ï' : '?±Î°ù'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* ?ºÌÑ∞ / ?åÎÑå??*/}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ctiCenterId" className="form-label">
                                                ?ºÌÑ∞ <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="ctiCenterId" name="centerId"
                                                className="form-select"
                                                value={form.centerId}
                                                onChange={handleCenterChange}
                                            >
                                                <option value="">?†ÌÉù</option>
                                                {centerOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {form.centerId && (
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="ctiTenantId" className="form-label">
                                                    ?åÎÑå?∏ID <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    id="ctiTenantId" name="tenantId"
                                                    className="form-select"
                                                    value={form.tenantId}
                                                    onChange={handleTenantChange}
                                                >
                                                    <option value="">?ÜÏùå</option>
                                                    {tenantOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {/* DN ?ÄÎ∂ÑÎ•ò / ?åÎ∂ÑÎ•?*/}
                                    {form.tenantId && (
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="dnMajorId" className="form-label">
                                                    DN ?ÄÎ∂ÑÎ•ò <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    id="dnMajorId" name="dnMajorId"
                                                    className="form-select"
                                                    value={form.dnMajorId}
                                                    onChange={handleMajorChange}
                                                >
                                                    <option value="">?ÜÏùå</option>
                                                    {majorOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {form.dnMajorId && (
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="dnSubId" className="form-label">
                                                    DN ?åÎ∂ÑÎ•?<span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    id="dnSubId" name="dnSubId"
                                                    className="form-select"
                                                    value={form.dnSubId}
                                                    onChange={updateForm}
                                                >
                                                    <option value="">?ÜÏùå</option>
                                                    {subOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {/* Ï£ºÎ??îÏñ¥ / Î∂ÄÎØ∏Îîî??*/}
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
                                                <option value="">?ÜÏùå</option>
                                                {mediaOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="submediaId" className="form-label">Î∂ÄÎØ∏Îîî??/label>
                                            <input
                                                id="submediaId" name="submediaId"
                                                type="number" className="form-control"
                                                value={form.submediaId}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* Î™®Îç∏Î™?/ IP */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnModelname" className="form-label">Î™®Îç∏Î™?/label>
                                            <input
                                                id="dnModelname" name="dnModelname"
                                                type="text" className="form-control"
                                                value={form.dnModelname}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnIp" className="form-label">IP</label>
                                            <input
                                                id="dnIp" name="dnIp"
                                                type="number" className="form-control"
                                                value={form.dnIp}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* DN Ï¢ÖÎ•ò / DNType */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnKind" className="form-label">DN Ï¢ÖÎ•ò</label>
                                            <select
                                                id="dnKind" name="dnKind"
                                                className="form-select"
                                                value={form.dnKind}
                                                onChange={updateForm}
                                            >
                                                <option value="">?ÜÏùå</option>
                                                {DN_KIND_OPTIONS.map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnType" className="form-label">DNType</label>
                                            <select
                                                id="dnType" name="dnType"
                                                className="form-select"
                                                value={form.dnType}
                                                onChange={updateForm}
                                            >
                                                <option value="">?ÜÏùå</option>
                                                {DN_TYPE_OPTIONS.map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* DN / Í∞êÏ≤≠?§Ï†ï */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dn" className="form-label">
                                                DN <span className="text-danger">*</span>
                                            </label>
                                            {isEdt ? (
                                                <input
                                                    id="dn" type="text" className="form-control"
                                                    value={form.dn} readOnly
                                                />
                                            ) : (
                                                <div className="input-group">
                                                    <input
                                                        id="dn" name="dn"
                                                        type="text" className="form-control"
                                                        placeholder="?´ÏûêÎß??ÖÎ†•"
                                                        value={form.dn}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/[^0-9]/g, '');
                                                            setForm(prev => ({ ...prev, dn: v, idCheck: 'N' }));
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-default__blue"
                                                        onClick={handleIdCheck}
                                                    >
                                                        Ï§ëÎ≥µ?ïÏù∏
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">Í∞êÏ≤≠?§Ï†ï</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.observerFlag === '1' ? 'Y' : 'N'}
                                                    name="observerFlag"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, observerFlag: payload.observerFlag === 'Y' ? '1' : '0' }))}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö© ?àÌï®"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Í∞êÏãú / tag */}
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
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="tag" className="form-label">tag</label>
                                            <input
                                                id="tag" name="tag"
                                                type="text" className="form-control"
                                                value={form.tag}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/[^0-9]/g, '');
                                                    setForm(prev => ({ ...prev, tag: v }));
                                                }}
                                            />
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

export default CtiDnFormModal;
