import React, { useState, useCallback, useEffect, useRef } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData, useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
    ivrCreatefileCode: '',
    ivrName: '',
    workStime: '',
    workEtime: '',
    ivrUseyn: 'Y',
    sel_MentUseyn: '',
    ivrMent: '',
    notiSday: '',
    notiEday: '',
    ivrMeno: '',
    insttCode: '',
};

const IvrFormModal = ({ open, onClose, ivrCode, rowData, onSuccess }) => {
    const isEdt = ivrCode !== null && ivrCode !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);
    const [ivrInsttOptions, setIvrInsttOptions] = useState([]);
    const audioRef = useRef(null);

    const { options: insttOptions } = useCustomReqDataCombo({
        url: URL.INSTT_COMBO,
        method: 'GET',
        mapping: { id: 'insttCode', text: 'allInsttNm' },
    });

    useEffect(() => {
        if (!open) return;
        let active = true;
        fnAjaxFetch({
            url: `${URL.IVR_INSTT_COMBO}/IVR_INSTT.do`,
            method: 'GET',
            data: { systemCode: 'IPCC' },
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            const list = res?.data?.result || [];
            setIvrInsttOptions(list.map(o => ({ code: o.codeDc, codeNm: o.codeNm })));
        }).catch(() => {});
        return () => { active = false; };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        if (!isEdt || !rowData) {
            setForm(EMPTY_FORM);
        } else {
            setForm({
                ivrCreatefileCode: rowData.ivrCreatefileCode || '',
                ivrName: rowData.ivrName || '',
                workStime: rowData.workStime || '',
                workEtime: rowData.workEtime || '',
                ivrUseyn: rowData.ivrUseyn || 'Y',
                sel_MentUseyn: rowData.ivrMentUseyn || '',
                ivrMent: rowData.ivrMent || '',
                notiSday: rowData.notiSday || '',
                notiEday: rowData.notiEday || '',
                ivrMeno: rowData.ivrMeno || '',
                insttCode: rowData.insttCode || '',
            });
        }
    }, [open, isEdt, rowData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handlePreview = useCallback(async () => {
        if (!form.ivrMent) {
            await Swal.fire({ icon: 'warning', text: 'Î©òÌä∏ ?¥Ïö©???ÜÏäµ?àÎã§.' });
            return;
        }
        try {
            const res = await fnAjaxFetch({
                url: 'https://tts.call110.go.kr:8443/soundSearch.do',
                method: 'POST',
                data: { pageText: form.ivrMent, pageIndex: '1', pageUrl: 'IPCC_IVR_MENT' },
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                const soundFile = json?.DATA?.DATA?.pageSoundfile;
                if (soundFile?.length > 1 && audioRef.current) {
                    audioRef.current.src = `https://tts.call110.go.kr:8443/webFile/${soundFile}`;
                    audioRef.current.volume = 0.8;
                    setTimeout(() => audioRef.current?.play(), 100);
                }
            } else {
                await Swal.fire({ icon: 'error', text: '?úÏä§???•Ïï†?ÖÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form.ivrMent]);

    const handleSave = useCallback(async () => {
        if (!form.ivrName) {
            await Swal.fire({ icon: 'warning', text: 'IVR ?¥Î¶Ñ???ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        if (!form.ivrCreatefileCode) {
            await Swal.fire({ icon: 'warning', text: 'Í∏∞Í? ÏΩîÎìúÎ•??†ÌÉù??Ï£ºÏÑ∏??' });
            return;
        }
        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question',
            title: `IVR ${action}`,
            html: `IVRÎ•?<b>${action}</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.IVR_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    ivrCode: ivrCode || '',
                    ivrCreatefileCode: form.ivrCreatefileCode,
                    insttCode: form.insttCode,
                    ivrName: form.ivrName,
                    ivrUseyn: form.ivrUseyn,
                    ivrMentUseyn: form.sel_MentUseyn,
                    ivrMeno: form.ivrMeno,
                    workStime: form.workStime,
                    workEtime: form.workEtime,
                    notiSday: form.notiSday.replaceAll('-', ''),
                    notiEday: form.notiEday.replaceAll('-', ''),
                    ivrMent: form.ivrMent,
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
    }, [form, ivrCode, isEdt, onSuccess]);

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
                                <h2 className="modal-title__title">
                                    Í∏∞Í?Î≥?IVR ?§Ï†ï {isEdt ? '?òÏ†ï' : '?±Î°ù'}
                                </h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* Í∏∞Í?ÏΩîÎìú / IVRÎ™?*/}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ivrCreatefileCode" className="form-label">
                                                Í∏∞Í?ÏΩîÎìú <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="ivrCreatefileCode" name="ivrCreatefileCode"
                                                className="form-select"
                                                value={form.ivrCreatefileCode}
                                                onChange={updateForm}
                                            >
                                                <option value="">?ÜÏùå</option>
                                                {ivrInsttOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ivrName" className="form-label">
                                                IVRÎ™?<span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="ivrName" name="ivrName"
                                                type="text" className="form-control"
                                                placeholder="IVRÎ™ÖÏùÑ ?ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.ivrName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* ?ÖÎ¨¥?úÍ∞Ñ */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">?ÖÎ¨¥?úÍ∞Ñ</label>
                                            <div className="d-flex gap-2 align-items-center">
                                                <input
                                                    id="workStime" name="workStime"
                                                    type="time" className="form-control"
                                                    value={form.workStime}
                                                    onChange={updateForm}
                                                />
                                                <span>~</span>
                                                <input
                                                    id="workEtime" name="workEtime"
                                                    type="time" className="form-control"
                                                    value={form.workEtime}
                                                    onChange={updateForm}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* ?¨Ïö©?†Î¨¥ / Í≥µÏ?Î©òÌä∏ ?¨Î? */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">?¨Ïö© ?†Î¨¥</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.ivrUseyn}
                                                    name="ivrUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, ivrUseyn: payload.ivrUseyn }))}
                                                    onText="?¨Ïö©"
                                                    offText="?¨Ïö© ?àÌï®"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="sel_MentUseyn" className="form-label">Í≥µÏ?Î©òÌä∏ ?¨Î?</label>
                                            <select
                                                id="sel_MentUseyn" name="sel_MentUseyn"
                                                className="form-select"
                                                value={form.sel_MentUseyn}
                                                onChange={updateForm}
                                            >
                                                <option value="">?ÜÏùå</option>
                                                <option value="Y">?¨Ïö©</option>
                                                <option value="N">?¨Ïö©?àÌï®</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Î©òÌä∏ (Í≥µÏ?Î©òÌä∏ ?¨Ïö©???åÎßå) */}
                                    {form.sel_MentUseyn === 'Y' && (
                                        <div className="col-12">
                                            <div className="input-box">
                                                <label htmlFor="ivrMent" className="form-label">Î©òÌä∏</label>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <input
                                                        id="ivrMent" name="ivrMent"
                                                        type="text" className="form-control"
                                                        placeholder="Î©òÌä∏ ?¥Ïö©???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                        value={form.ivrMent}
                                                        onChange={updateForm}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        style={{ whiteSpace: 'nowrap' }}
                                                        onClick={handlePreview}
                                                    >
                                                        ??ÎØ∏Î¶¨?£Í∏∞
                                                    </button>
                                                </div>
                                                <audio ref={audioRef} style={{ display: 'none' }} />
                                            </div>
                                        </div>
                                    )}
                                    {/* ?úÏûë??/ Ï¢ÖÎ£å??*/}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="notiSday" className="form-label">Î©òÌä∏ ?úÏûë??/label>
                                            <input
                                                id="notiSday" name="notiSday"
                                                type="date" className="form-control"
                                                value={form.notiSday}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="notiEday" className="form-label">Î©òÌä∏ Ï¢ÖÎ£å??/label>
                                            <input
                                                id="notiEday" name="notiEday"
                                                type="date" className="form-control"
                                                value={form.notiEday}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* ÎπÑÍ≥† / Í∏∞Í? ?¨Ïö© */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ivrMeno" className="form-label">ÎπÑÍ≥†</label>
                                            <input
                                                id="ivrMeno" name="ivrMeno"
                                                type="text" className="form-control"
                                                placeholder="ÎπÑÍ≥†Î•??ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.ivrMeno}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="insttCode" className="form-label">Í∏∞Í? ?¨Ïö©</label>
                                            <select
                                                id="insttCode" name="insttCode"
                                                className="form-select"
                                                value={form.insttCode}
                                                onChange={updateForm}
                                            >
                                                <option value="">?†ÌÉù</option>
                                                {insttOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
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

export default IvrFormModal;
