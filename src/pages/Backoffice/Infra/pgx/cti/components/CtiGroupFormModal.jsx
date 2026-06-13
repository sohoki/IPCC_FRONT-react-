import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = {
    employeegrpId: '',
    employeegrpName: '',
    monitorFlag: '1',
    idCheck: 'N',
};

/**
 * Props:
 *   open, onClose
 *   centerId, tenantId  ??Î∂ÄÎ™??åÎÑå???ïÎ≥¥
 *   groupData           ??null = ?†Í∑ú, object = ?òÏ†ï
 *   onSuccess(tenantId, centerId) ???Ä????†ú ???∏Ï∂ú
 */
const CtiGroupFormModal = ({ open, onClose, centerId, tenantId, groupData, onSuccess }) => {
    const isEdt = groupData !== null && groupData !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (!open) return;
        if (!isEdt || !groupData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                employeegrpId: String(groupData.employeegrpId || ''),
                employeegrpName: groupData.employeegrpName || '',
                monitorFlag: String(groupData.monitorFlag ?? '1'),
                idCheck: 'Y',
            });
        }
    }, [open, isEdt, groupData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleIdCheck = useCallback(async () => {
        if (!form.employeegrpId) { await Swal.fire({ icon: 'warning', text: 'employeegrpIdÎ•??ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        if (!centerId) { await Swal.fire({ icon: 'warning', text: 'ÏßÄ?êÏùÑ ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!tenantId) { await Swal.fire({ icon: 'warning', text: 'tenant IdÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_GROUP_ID_CHECK,
                method: 'POST',
                data: { employeegrpId: form.employeegrpId, centerId, tenantId },
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
    }, [form.employeegrpId, centerId, tenantId]);

    const handleSave = useCallback(async () => {
        if (!centerId) { await Swal.fire({ icon: 'warning', text: 'ÏßÄ?êÏùÑ ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!tenantId) { await Swal.fire({ icon: 'warning', text: 'tenant IdÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.employeegrpId) { await Swal.fire({ icon: 'warning', text: 'Group IDÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.employeegrpName) { await Swal.fire({ icon: 'warning', text: 'GroupÎ™ÖÏùÑ ?ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
        if (!form.monitorFlag) { await Swal.fire({ icon: 'warning', text: 'Í∞êÏãúÎ•??†ÌÉù?¥Ï£º?∏Ïöî.' }); return; }
        if (!isEdt && form.idCheck !== 'Y') { await Swal.fire({ icon: 'warning', text: 'Ï§ëÎ≥µ Ï≤¥ÌÅ¨Î•??¥Ï£º?∏Ïöî.' }); return; }

        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question', title: `Group ${action}`,
            html: `GroupÎ•?<b>${action}</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_GROUP_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    centerId,
                    tenantId,
                    employeegrpId: form.employeegrpId,
                    employeegrpName: form.employeegrpName,
                    monitorFlag: form.monitorFlag,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}?òÏóà?µÎãà??` });
                onSuccess(tenantId, centerId);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form, centerId, tenantId, isEdt, onSuccess]);

    const handleDelete = useCallback(async () => {
        const ok = await Swal.fire({
            icon: 'question', title: 'Í∑∏Î£πÏΩîÎìú ??†ú',
            html: `<b>${form.employeegrpId}</b> Î•??? ??†ú ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_GROUP_DELETE,
                method: 'POST',
                data: { employeegrpId: form.employeegrpId, centerId, tenantId },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                onSuccess(tenantId, centerId);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '??†ú???§Ìå®?àÏäµ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form.employeegrpId, centerId, tenantId, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
            <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                <div className="modal-dialog modal-dialog-centered" style={{ width: 560, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">GROUP {isEdt ? '?òÏ†ï' : '?±Î°ù'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="employeegrpId" className="form-label">
                                                Group ID <span className="text-danger">*</span>
                                            </label>
                                            {isEdt ? (
                                                <input id="employeegrpId" type="text" className="form-control" value={form.employeegrpId} readOnly />
                                            ) : (
                                                <div className="input-group">
                                                    <input
                                                        id="employeegrpId" name="employeegrpId"
                                                        type="text" className="form-control"
                                                        placeholder="?´Ïûê ÏµúÎ? 10?êÎ¶¨" maxLength={10}
                                                        value={form.employeegrpId}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/[^0-9]/g, '');
                                                            setForm(prev => ({ ...prev, employeegrpId: v, idCheck: 'N' }));
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
                                            <label htmlFor="employeegrpName" className="form-label">
                                                Group Î™?<span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="employeegrpName" name="employeegrpName"
                                                type="text" className="form-control"
                                                placeholder="Í∑∏Î£πÎ™ÖÏùÑ ?ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.employeegrpName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
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

export default CtiGroupFormModal;
