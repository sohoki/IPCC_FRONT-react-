import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
    serviceSeq: '',
    serverCode: '',
    serviceName: '',
    servicePort: '',
    serviceUseyn: 'Y',
    serviceHealthGubun: '',
    licenseType: '',
    licenseStartday: '',
    licenseEndday: '',
    licenseKey: '',
    licenseCount: '',
    comCodeNumber: '',
    serviceOidUseyn: 'N',
    serviceSnmpVersion: '',
    serviceSnmpCommunityName: '',
    serviceSnmpId: '',
    serviceSnmpPassword: '',
    serviceSnmpAuthentication: '',
    serviceSnmpPrivacy: '',
    licenseDc: '',
};

const SystemServiceFormModal = ({ open, onClose, serviceSeq, rowData, onSuccess }) => {
    const isEdt = serviceSeq !== null && serviceSeq !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);
    const [serverOptions, setServerOptions] = useState([]);
    const [companyOptions, setCompanyOptions] = useState([]);

    const { options: licenseTypeOptions } = useCommonCodeData('LICENSE_TYPE');
    const { options: healthGubunOptions } = useCommonCodeData('SERVER_CON_GUBUN');
    const { options: snmpVersionOptions } = useCommonCodeData('SNMP_VERSION');

    // ?úÎ≤Ñ ÏΩ§Î≥¥
    useEffect(() => {
        if (!open) return;
        let active = true;
        fnAjaxFetch({ url: URL.SERVICE_SERVER_COMBO, method: 'GET', withCredentials: true })
            .then(res => {
                if (!active) return;
                const list = res?.data?.result || res?.data?.resultList || [];
                setServerOptions(list.map(o => ({ code: o.serverCode, codeNm: o.serverName || o.serverCode })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open]);

    // Í¥ÄÎ¶??ÖÏ≤¥ ÏΩ§Î≥¥
    useEffect(() => {
        if (!open) return;
        let active = true;
        fnAjaxFetch({ url: URL.SERVER_COMPANY_COMBO, method: 'GET', withCredentials: true })
            .then(res => {
                if (!active) return;
                const list = res?.data?.result || res?.data?.resultList || [];
                setCompanyOptions(list.map(o => ({ code: o.comCodeNumber || o.code, codeNm: o.comName || o.codeNm })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open]);

    // ??Ï¥àÍ∏∞??    useEffect(() => {
        if (!open) return;
        if (!isEdt || !rowData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                serviceSeq: String(rowData.serviceSeq || ''),
                serverCode: rowData.serverCode || '',
                serviceName: rowData.serviceName || '',
                servicePort: rowData.servicePort || '',
                serviceUseyn: rowData.serviceUseyn || 'Y',
                serviceHealthGubun: rowData.serviceHealthGubun || '',
                licenseType: rowData.licenseType || '',
                licenseStartday: rowData.licenseStartday || '',
                licenseEndday: rowData.licenseEndday || '',
                licenseKey: rowData.licenseKey || '',
                licenseCount: rowData.licenseCount || '',
                comCodeNumber: rowData.comCodeNumber || '',
                serviceOidUseyn: rowData.serviceOidUseyn || 'N',
                serviceSnmpVersion: rowData.serviceSnmpVersion || '',
                serviceSnmpCommunityName: rowData.serviceSnmpCommunityName || '',
                serviceSnmpId: rowData.serviceSnmpId || '',
                serviceSnmpPassword: rowData.serviceSnmpPassword || '',
                serviceSnmpAuthentication: rowData.serviceSnmpAuthentication || '',
                serviceSnmpPrivacy: rowData.serviceSnmpPrivacy || '',
                licenseDc: rowData.licenseDc || '',
            });
        }
    }, [open, isEdt, rowData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    // licenseType Î≥ÄÍ≤???LICENSE_TYPE_1?¥Î©¥ Í¥Ä???ÑÎìú Ï¥àÍ∏∞??    const handleLicenseTypeChange = useCallback((e) => {
        const value = e.target.value;
        if (value === 'LICENSE_TYPE_1') {
            setForm(prev => ({
                ...prev,
                licenseType: value,
                licenseStartday: '',
                licenseEndday: '',
                licenseKey: '',
                licenseCount: '',
                comCodeNumber: '',
            }));
        } else {
            setForm(prev => ({ ...prev, licenseType: value }));
        }
    }, []);

    // OID ?¨Ïö©?†Î¨¥ Î≥ÄÍ≤???N?¥Î©¥ SNMP ?ÑÎìú Ï¥àÍ∏∞??    const handleOidUseynChange = useCallback((value) => {
        if (value === 'N') {
            setForm(prev => ({
                ...prev,
                serviceOidUseyn: 'N',
                serviceSnmpCommunityName: '',
                serviceSnmpId: '',
                serviceSnmpPassword: '',
                serviceSnmpAuthentication: '',
                serviceSnmpPrivacy: '',
            }));
        } else {
            setForm(prev => ({ ...prev, serviceOidUseyn: value }));
        }
    }, []);

    const showLicenseFields = form.licenseType !== '' && form.licenseType !== 'LICENSE_TYPE_1';
    const showSnmpFields = form.serviceOidUseyn === 'Y';
    const showSnmpV3Fields = showSnmpFields && form.serviceSnmpVersion === 'SNMP_VERSION_3';

    const handleSave = useCallback(async () => {
        if (!form.serverCode) { await Swal.fire({ icon: 'warning', text: '?úÎ≤ÑÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.serviceName) { await Swal.fire({ icon: 'warning', text: '?úÎπÑ?§Î™Ö???ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.servicePort) { await Swal.fire({ icon: 'warning', text: '?úÎπÑ??PORTÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.licenseType) { await Swal.fire({ icon: 'warning', text: 'licenseÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (form.serviceOidUseyn === 'Y') {
            if (!form.serviceSnmpVersion) { await Swal.fire({ icon: 'warning', text: 'SNMP Version???†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
            if (!form.serviceSnmpCommunityName) { await Swal.fire({ icon: 'warning', text: 'SNMP Community Name???ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
            if (!form.serviceSnmpId) { await Swal.fire({ icon: 'warning', text: 'SNMP IDÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
            if (form.serviceSnmpVersion === 'SNMP_VERSION_3') {
                if (!form.serviceSnmpPassword) { await Swal.fire({ icon: 'warning', text: 'SNMP PasswordÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
                if (!form.serviceSnmpAuthentication) { await Swal.fire({ icon: 'warning', text: 'SNMP Authentication???ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
                if (!form.serviceSnmpPrivacy) { await Swal.fire({ icon: 'warning', text: 'SNMP PrivacyÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
            }
        }
        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question', title: `?úÎπÑ???ïÎ≥¥ ${action}`,
            html: `<b>${form.serviceName}</b> ${action} ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.SERVICE_INFO_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    serviceSeq: form.serviceSeq,
                    serverCode: form.serverCode,
                    serviceName: form.serviceName,
                    servicePort: form.servicePort,
                    serviceUseyn: form.serviceUseyn,
                    serviceHealthGubun: form.serviceHealthGubun,
                    licenseType: form.licenseType,
                    licenseStartday: form.licenseStartday.replaceAll('-', ''),
                    licenseEndday: form.licenseEndday.replaceAll('-', ''),
                    licenseKey: form.licenseKey,
                    licenseCount: form.licenseCount || '0',
                    comCodeNumber: form.comCodeNumber,
                    serviceOidUseyn: form.serviceOidUseyn,
                    serviceSnmpVersion: form.serviceSnmpVersion,
                    serviceSnmpCommunityName: form.serviceSnmpCommunityName,
                    serviceSnmpId: form.serviceSnmpId,
                    serviceSnmpPassword: form.serviceSnmpPassword,
                    serviceSnmpAuthentication: form.serviceSnmpAuthentication,
                    serviceSnmpPrivacy: form.serviceSnmpPrivacy,
                    licenseDc: form.licenseDc,
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
                    style={{ width: 900, maxWidth: '95%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">?úÎπÑ???ïÎ≥¥ {isEdt ? '?òÏ†ï' : '?±Î°ù'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* ?úÎ≤Ñ / ?úÎπÑ?§Î™Ö */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serverCode" className="form-label">?úÎ≤Ñ <span className="text-danger">*</span></label>
                                            <select id="serverCode" name="serverCode" className="form-select" value={form.serverCode} onChange={updateForm}>
                                                <option value="">?†ÌÉù</option>
                                                {serverOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serviceName" className="form-label">?úÎπÑ?§Î™Ö <span className="text-danger">*</span></label>
                                            <input id="serviceName" name="serviceName" type="text" className="form-control" value={form.serviceName} onChange={updateForm} />
                                        </div>
                                    </div>
                                    {/* ?úÎπÑ??PORT / ?¨Ïö©?†Î¨¥ */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="servicePort" className="form-label">?úÎπÑ??PORT <span className="text-danger">*</span></label>
                                            <input id="servicePort" name="servicePort" type="text" className="form-control" value={form.servicePort} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">?¨Ïö©?†Î¨¥</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.serviceUseyn}
                                                    name="serviceUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, serviceUseyn: payload.serviceUseyn }))}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö© ?àÌï®"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Health Check / ?ºÏù¥?ºÏä§Type */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serviceHealthGubun" className="form-label">Health Check</label>
                                            <select id="serviceHealthGubun" name="serviceHealthGubun" className="form-select" value={form.serviceHealthGubun} onChange={updateForm}>
                                                <option value="">?†ÌÉù</option>
                                                {healthGubunOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="licenseType" className="form-label">?ºÏù¥?ºÏä§Type <span className="text-danger">*</span></label>
                                            <select id="licenseType" name="licenseType" className="form-select" value={form.licenseType} onChange={handleLicenseTypeChange}>
                                                <option value="">?†ÌÉù</option>
                                                {licenseTypeOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {/* ?ºÏù¥?ºÏä§ Í¥Ä??(LICENSE_TYPE_1???ÑÎãê ?? */}
                                    {showLicenseFields && (<>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label className="form-label">?ºÏù¥?ºÏä§Í∏∞Í∞Ñ</label>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <input name="licenseStartday" type="date" className="form-control" value={form.licenseStartday} onChange={updateForm} />
                                                    <span>~</span>
                                                    <input name="licenseEndday" type="date" className="form-control" value={form.licenseEndday} onChange={updateForm} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="licenseKey" className="form-label">?ºÏù¥?ºÏä§Key</label>
                                                <input id="licenseKey" name="licenseKey" type="password" className="form-control" value={form.licenseKey} onChange={updateForm} />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="licenseCount" className="form-label">?ºÏù¥?ºÏä§?òÎüâ</label>
                                                <input id="licenseCount" name="licenseCount" type="text" className="form-control" value={form.licenseCount} onChange={updateForm} />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="comCodeNumber" className="form-label">?©Ìíà?ÖÏ≤¥</label>
                                                <select id="comCodeNumber" name="comCodeNumber" className="form-select" value={form.comCodeNumber} onChange={updateForm}>
                                                    <option value="">?†ÌÉù</option>
                                                    {companyOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </>)}
                                    {/* OID ?¨Ïö©?†Î¨¥ / SNMP Version */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">OID ?¨Ïö©?†Î¨¥</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.serviceOidUseyn}
                                                    name="serviceOidUseyn"
                                                    onChange={(payload) => handleOidUseynChange(payload.serviceOidUseyn)}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö© ?àÌï®"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {showSnmpFields && (
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="serviceSnmpVersion" className="form-label">SNMP Version</label>
                                                <select id="serviceSnmpVersion" name="serviceSnmpVersion" className="form-select" value={form.serviceSnmpVersion} onChange={updateForm}>
                                                    <option value="">?†ÌÉù</option>
                                                    {snmpVersionOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {/* SNMP Í¥Ä??(OID ?¨Ïö© ?? */}
                                    {showSnmpFields && (<>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="serviceSnmpCommunityName" className="form-label">SNMP Name</label>
                                                <input id="serviceSnmpCommunityName" name="serviceSnmpCommunityName" type="text" className="form-control" value={form.serviceSnmpCommunityName} onChange={updateForm} />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="serviceSnmpId" className="form-label">SNMP ID</label>
                                                <input id="serviceSnmpId" name="serviceSnmpId" type="text" className="form-control" value={form.serviceSnmpId} onChange={updateForm} />
                                            </div>
                                        </div>
                                    </>)}
                                    {/* SNMP V3 ?ÑÏö© */}
                                    {showSnmpV3Fields && (<>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="serviceSnmpPassword" className="form-label">SNMP PWD</label>
                                                <input id="serviceSnmpPassword" name="serviceSnmpPassword" type="password" className="form-control" value={form.serviceSnmpPassword} onChange={updateForm} />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="serviceSnmpAuthentication" className="form-label">SNMP Auth</label>
                                                <input id="serviceSnmpAuthentication" name="serviceSnmpAuthentication" type="text" className="form-control" value={form.serviceSnmpAuthentication} onChange={updateForm} />
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="input-box">
                                                <label htmlFor="serviceSnmpPrivacy" className="form-label">SNMP Privacy</label>
                                                <input id="serviceSnmpPrivacy" name="serviceSnmpPrivacy" type="text" className="form-control" value={form.serviceSnmpPrivacy} onChange={updateForm} />
                                            </div>
                                        </div>
                                    </>)}
                                    {/* ÎπÑÍ≥† */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="licenseDc" className="form-label">ÎπÑÍ≥†</label>
                                            <textarea id="licenseDc" name="licenseDc" className="form-control" rows={5} value={form.licenseDc} onChange={updateForm} />
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

export default SystemServiceFormModal;
