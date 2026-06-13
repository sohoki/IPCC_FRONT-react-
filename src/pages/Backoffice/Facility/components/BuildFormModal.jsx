import React, { useCallback, useMemo } from 'react';
import URL from '@/constants/URL.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCustomReqDataCombo, useCommonCodeData } from '@/hooks/use-combo-data.js';
import { usePhoneInput } from '@/hooks/use-input-handlers.js';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const BuildFormModal = ({ open, onClose, form, setForm, onSubmit }) => {
    const { options: insttOptions } = useCustomReqDataCombo({
        url: URL.INSTT_COMBO,
        method: 'GET',
        mapping: { id: 'insttCode', text: 'allInsttNm' },
    });

    const { options: floorCodes } = useCommonCodeData('CENTER_FLOOR');

    React.useEffect(() => {
        if (!open || form.mode !== 'Edt' || !form.centerId) return;
        let active = true;
        fnAjaxFetch({
            url: `${URL.CENTER_DETAIL}/${encodeURIComponent(form.centerId)}.do`,
            method: 'GET',
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            if (res?.data?.resultCodeInfo === 'SUCCESS') {
                const obj = res?.data?.result?.regist || res?.data?.result || {};
                setForm(prev => ({
                    ...prev,
                    centerZipcode: obj.centerZipcode || '',
                    centerAddr1: obj.centerAddr1 || '',
                    centerAddr2: obj.centerAddr2 || '',
                    UseAt: obj.centerUseYn || 'Y',
                    adminApprovalYn: obj.adminApprovalYn || 'N',
                    centerFloor: obj.centerFloor || '',
                    centerFloorEnd: obj.centerFloorEnd || '',
                    floorInfo: obj.floorInfo || '',
                    centerInfo: obj.centerInfo || '',
                }));
            }
        }).catch(() => {});
        return () => { active = false; };
    }, [open, form.centerId, form.mode]);

    const updateForm = useCallback((e) => {
        const { name, type, value, files } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'file' ? (files?.[0] || null) : value,
        }));
    }, [setForm]);

    const updateFormValue = useCallback((payload) => {
        setForm(prev => ({ ...prev, ...payload }));
    }, [setForm]);

    const { handleTelChange, handleFaxChange } = usePhoneInput(updateFormValue);

    const floorRange = useMemo(() => {
        if (!form.centerFloor || !form.centerFloorEnd || !floorCodes.length) return [];
        const startIdx = floorCodes.findIndex(f => f.code === form.centerFloor);
        const endIdx = floorCodes.findIndex(f => f.code === form.centerFloorEnd);
        if (startIdx < 0 || endIdx < 0) return [];
        const min = Math.min(startIdx, endIdx);
        const max = Math.max(startIdx, endIdx);
        return floorCodes.slice(min, max + 1);
    }, [floorCodes, form.centerFloor, form.centerFloorEnd]);

    const selectedFloors = useMemo(() => {
        if (!form.floorInfo) return new Set();
        return new Set(form.floorInfo.split(',').filter(Boolean));
    }, [form.floorInfo]);

    const handleFloorCheck = useCallback((code, checked) => {
        setForm(prev => {
            const set = new Set((prev.floorInfo || '').split(',').filter(Boolean));
            if (checked) set.add(code);
            else set.delete(code);
            return { ...prev, floorInfo: [...set].join(',') };
        });
    }, [setForm]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 860, maxWidth: '92%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">ÏßÄ??{form.mode === 'Ins' ? '?±Î°ù' : '?òÏ†ï'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* ÏßÄ?êÎ™Ö */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="centerNm" className="form-label">
                                                ÏßÄ?êÎ™Ö <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="centerNm" name="centerNm"
                                                type="text" className="form-control"
                                                placeholder="ÏßÄ?êÎ™Ö???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.centerNm ?? ''}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* Í∏∞Í?Î™?*/}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="insttCode" className="form-label">
                                                Í∏∞Í?Î™?<span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="insttCode" name="insttCode"
                                                className="form-select"
                                                value={form.insttCode ?? ''}
                                                onChange={updateForm}
                                            >
                                                <option value="">Í∏∞Í? ?†ÌÉù</option>
                                                {insttOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* Ï£ºÏÜå */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">Ï£ºÏÜå</label>
                                            <input
                                                name="centerZipcode" type="text"
                                                className="form-control mb-1"
                                                style={{ width: 140 }}
                                                placeholder="?∞Ìé∏Î≤àÌò∏"
                                                value={form.centerZipcode ?? ''}
                                                onChange={updateForm}
                                            />
                                            <input
                                                name="centerAddr1" type="text"
                                                className="form-control mb-1"
                                                placeholder="Í∏∞Î≥∏ Ï£ºÏÜå"
                                                value={form.centerAddr1 ?? ''}
                                                onChange={updateForm}
                                            />
                                            <input
                                                name="centerAddr2" type="text"
                                                className="form-control"
                                                placeholder="?ÅÏÑ∏ Ï£ºÏÜå"
                                                value={form.centerAddr2 ?? ''}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* ?Ä?úÎ≤à??/ Fax */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="centerTel" className="form-label">?Ä?úÎ≤à??/label>
                                            <input
                                                id="centerTel" name="centerTel"
                                                type="text" className="form-control"
                                                placeholder="?Ä?úÎ≤à??
                                                value={form.centerTel ?? ''}
                                                onChange={handleTelChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="centerFax" className="form-label">Fax</label>
                                            <input
                                                id="centerFax" name="centerFax"
                                                type="text" className="form-control"
                                                placeholder="Fax"
                                                value={form.centerFax ?? ''}
                                                onChange={handleFaxChange}
                                            />
                                        </div>
                                    </div>
                                    {/* ?ÑÍ≤Ω?¨ÏßÑ / URL */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="centerImgFile" className="form-label">?ÑÍ≤Ω?¨ÏßÑ</label>
                                            <input
                                                id="centerImgFile" name="centerImgFile"
                                                type="file"
                                                className="form-control"
                                                accept="image/*"
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="centerUrl" className="form-label">URL</label>
                                            <input
                                                id="centerUrl" name="centerUrl"
                                                type="text" className="form-control"
                                                placeholder="URL???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.centerUrl ?? ''}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* ?¨Ïö©?†Î¨¥ / Í¥ÄÎ¶¨Ïûê ?πÏù∏?¨Î? */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">?¨Ïö© ?†Î¨¥</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.UseAt}
                                                    name="UseAt"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, UseAt: payload.UseAt }))}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö©?àÌï®"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">Í¥ÄÎ¶¨Ïûê ?πÏù∏?¨Î?</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.adminApprovalYn}
                                                    name="adminApprovalYn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, adminApprovalYn: payload.adminApprovalYn }))}
                                                    onText="?πÏù∏"
                                                    offText="ÎØ∏Ïäπ??
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* ?ÑÏ≤¥ ?¨Ïö© Ï∏?*/}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">?ÑÏ≤¥ ?¨Ïö© Ï∏?/label>
                                            <div className="d-flex gap-2 align-items-center">
                                                <select
                                                    name="centerFloor"
                                                    className="form-select"
                                                    value={form.centerFloor ?? ''}
                                                    onChange={updateForm}
                                                >
                                                    <option value="">?úÏûë Ï∏µÏàò</option>
                                                    {floorCodes.map(f => (
                                                        <option key={f.code} value={f.code}>{f.codeNm}</option>
                                                    ))}
                                                </select>
                                                <span className="px-1">~</span>
                                                <select
                                                    name="centerFloorEnd"
                                                    className="form-select"
                                                    value={form.centerFloorEnd ?? ''}
                                                    onChange={updateForm}
                                                >
                                                    <option value="">Ï¢ÖÎ£å Ï∏µÏàò</option>
                                                    {floorCodes.map(f => (
                                                        <option key={f.code} value={f.code}>{f.codeNm}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ?¨Ïö© Ï∏µÏàò Ï≤¥ÌÅ¨Î∞ïÏä§ */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">?¨Ïö© Ï∏µÏàò</label>
                                            <div className="d-flex flex-wrap gap-2" style={{ minHeight: 38 }}>
                                                {floorRange.length === 0 ? (
                                                    <span className="text-muted small align-self-center">?úÏûë/Ï¢ÖÎ£å Ï∏µÏàòÎ•?Î®ºÏ? ?†ÌÉù?¥Ï£º?∏Ïöî.</span>
                                                ) : floorRange.map(f => (
                                                    <div key={f.code} className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`floor_${f.code}`}
                                                            checked={selectedFloors.has(f.code)}
                                                            onChange={e => handleFloorCheck(f.code, e.target.checked)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`floor_${f.code}`}>
                                                            {f.codeNm}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {/* ?§Î™Ö */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="centerInfo" className="form-label">?§Î™Ö</label>
                                            <textarea
                                                id="centerInfo" name="centerInfo"
                                                className="form-control"
                                                rows={4}
                                                placeholder="?§Î™Ö???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.centerInfo ?? ''}
                                                onChange={updateForm}
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
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>?Ä??/button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuildFormModal;
