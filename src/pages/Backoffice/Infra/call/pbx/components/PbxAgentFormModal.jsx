import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData, useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';

const EMPTY_ADD_ROW = { pbxSnType: '', pbxSnIndex: '', pbxSrType: '', pbxSrIndex: '' };

const PbxAgentFormModal = ({ open, onClose, loginId, onSuccess }) => {
    const isEdt = loginId !== null && loginId !== undefined;

    const [form, setForm] = useState({ loginId: '', name: '', idCheck: 'N' });
    const [scenRows, setScenRows] = useState([]);
    const [addRow, setAddRow] = useState(EMPTY_ADD_ROW);
    const [idSetupMode, setIdSetupMode] = useState(null); // null | 'auto' | 'manual'
    const [insttCode, setInsttCode] = useState('');

    const { options: pbxSnOptions } = useCommonCodeData('PBX_SN');
    const { options: pbxIndexOptions } = useCommonCodeData('PBX_INDEX');
    const { options: insttOptions } = useCustomReqDataCombo({
        url: URL.INSTT_COMBO,
        method: 'GET',
        mapping: { id: 'insttCode', text: 'allInsttNm' },
    });

    useEffect(() => {
        if (!open) return;
        setScenRows([]);
        setAddRow(EMPTY_ADD_ROW);
        if (!isEdt) {
            setForm({ loginId: '', name: '', idCheck: 'N' });
            setIdSetupMode(null);
            setInsttCode('');
            return;
        }
        setForm({ loginId, name: '', idCheck: 'Y' });
        setIdSetupMode(null);
    }, [open, loginId, isEdt]);

    useEffect(() => {
        if (!open || !isEdt || !loginId) return;
        let active = true;
        fnAjaxFetch({
            url: `${URL.AGENT_INFO}/${encodeURIComponent(loginId)}.do`,
            method: 'GET',
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                const detail = json.result || {};
                setForm(prev => ({ ...prev, name: detail.name || '' }));
                const allScen = detail.scenInfos || [];
                const snEntries = allScen.filter(s => s.scenGubun === 'SN');
                const srEntries = allScen.filter(s => s.scenGubun === 'SR');
                setScenRows(snEntries.map(sn => {
                    const sr = srEntries.find(s => s.scenPosition === sn.scenPosition);
                    return {
                        _id: Date.now() + Math.random(),
                        pbxSnType: sn.scenValue || '',
                        pbxSnIndex: sn.scenPosition || '',
                        pbxSrType: sr?.scenValue || '',
                        pbxSrIndex: sr?.scenPosition || '',
                    };
                }));
            }
        }).catch(() => {});
        return () => { active = false; };
    }, [open, loginId, isEdt]);

    const handleShowChoice = useCallback(async () => {
        const result = await Swal.fire({
            title: 'Î≤àÌò∏?§Ï†ï',
            text: 'Î≤àÌò∏ ?§Ï†ï Î∞©Ïãù???†ÌÉù?òÏÑ∏??',
            showConfirmButton: true,
            confirmButtonText: '?êÎèô?ùÏÑ±',
            showDenyButton: true,
            denyButtonText: 'Ï§ëÎ≥µ?ïÏù∏',
            showCancelButton: true,
            cancelButtonText: 'Ï∑®ÏÜå',
        });
        if (result.isConfirmed) setIdSetupMode('auto');
        else if (result.isDenied) setIdSetupMode('manual');
    }, []);

    const handleAutoGenerate = useCallback(async () => {
        if (!insttCode) {
            await Swal.fire({ icon: 'warning', text: 'AgentÎ•??ùÏÑ±??Í∏∞Í????†ÌÉù??Ï£ºÏÑ∏??' });
            return;
        }
        try {
            const res = await fnAjaxFetch({
                url: `${URL.AGENT_RANDOM}/${encodeURIComponent(insttCode)}.do`,
                method: 'GET',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setForm(prev => ({ ...prev, loginId: String(json.result), idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?êÎèô ?ùÏÑ±?òÏóà?µÎãà??' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'error', text: 'Agent ?ùÏÑ±??Ï¥àÍ≥º?òÏóà?µÎãà?? Í∏∞Í? Î©îÎâ¥?êÏÑú Agent Î≤îÏúÑ Î∞??ºÏù¥?ºÏä§Î•??ïÏù∏??Ï£ºÏÑ∏??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [insttCode]);

    const handleManualCheck = useCallback(async () => {
        if (!form.loginId) {
            await Swal.fire({ icon: 'warning', text: '?êÏù¥?ÑÌä∏ Î≤àÌò∏Î•??ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        try {
            const res = await fnAjaxFetch({
                url: `${URL.AGENT_ID_CHECK}/${encodeURIComponent(form.loginId)}.do`,
                method: 'GET',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setForm(prev => ({ ...prev, idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?¨Ïö© Í∞Ä?•Ìïú Î≤àÌò∏?ÖÎãà??' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '?¥Î? ?¨Ïö© Ï§ëÏù∏ Î≤àÌò∏?ÖÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [form.loginId]);

    const updateAddRow = useCallback((field, value) => {
        setAddRow(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'pbxSnIndex') next.pbxSrIndex = value;
            return next;
        });
    }, []);

    const handleAddScenRow = useCallback(async () => {
        if (!addRow.pbxSnType) { await Swal.fire({ icon: 'warning', text: '?úÎÇòÎ¶¨Ïò§ Î≤àÌò∏Î•??†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!addRow.pbxSnIndex) { await Swal.fire({ icon: 'warning', text: '?úÎÇòÎ¶¨Ïò§ ?∏Îç±?§Î? ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!addRow.pbxSrType) { await Swal.fire({ icon: 'warning', text: '?úÎÇòÎ¶¨Ïò§ ?àÎ≤®???†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (!addRow.pbxSrIndex) { await Swal.fire({ icon: 'warning', text: '?úÎÇòÎ¶¨Ïò§ ?àÎ≤® ?∏Îç±?§Î? ?†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (scenRows.some(r => r.pbxSnType === addRow.pbxSnType)) {
            await Swal.fire({ icon: 'warning', text: '?¥Î? ?±Î°ù???úÎÇòÎ¶¨Ïò§ Î≤àÌò∏?ÖÎãà??' });
            return;
        }
        setScenRows(prev => [...prev, { ...addRow, _id: Date.now() + Math.random() }]);
        setAddRow(EMPTY_ADD_ROW);
    }, [addRow, scenRows]);

    const handleDeleteScenRow = useCallback((_id) => {
        setScenRows(prev => prev.filter(r => r._id !== _id));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.loginId) {
            await Swal.fire({ icon: 'warning', text: '?êÏù¥?ÑÌä∏ Î≤àÌò∏Î•??ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        const action = isEdt ? '?òÏ†ï' : '?±Î°ù';
        const ok = await Swal.fire({
            icon: 'question',
            title: `?êÏù¥?ÑÌä∏ ${action}`,
            html: `?êÏù¥?ÑÌä∏Î•?<b>${action}</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.AGENT_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    loginId: form.loginId,
                    name: form.name,
                    scenInfos: scenRows.flatMap(r => [
                        { scenGubun: 'SN', scenValue: r.pbxSnType, scenPosition: r.pbxSnIndex },
                        { scenGubun: 'SR', scenValue: r.pbxSrType, scenPosition: r.pbxSrIndex },
                    ]),
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
    }, [form, scenRows, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 800, maxWidth: '95%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">
                                    ?êÏù¥?ÑÌä∏ {isEdt ? '?òÏ†ï' : '?±Î°ù'}
                                </h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* Login ID */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="agentLoginId" className="form-label">
                                                Login ID <span className="text-danger">*</span>
                                            </label>
                                            {isEdt ? (
                                                <input
                                                    id="agentLoginId"
                                                    type="text"
                                                    className="form-control"
                                                    value={form.loginId}
                                                    readOnly
                                                />
                                            ) : (
                                                <div className="input-group">
                                                    <input
                                                        id="agentLoginId"
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="?´Ïûê ÏµúÎ? 8?êÎ¶¨"
                                                        maxLength={8}
                                                        value={form.loginId}
                                                        readOnly={idSetupMode === 'auto' && form.idCheck === 'Y'}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/[^0-9]/g, '');
                                                            setForm(prev => ({ ...prev, loginId: v, idCheck: 'N' }));
                                                        }}
                                                    />
                                                    {idSetupMode === 'auto' && (
                                                        <select
                                                            className="form-select"
                                                            style={{ maxWidth: 130 }}
                                                            value={insttCode}
                                                            onChange={e => setInsttCode(e.target.value)}
                                                        >
                                                            <option value="">Í∏∞Í? ?†ÌÉù</option>
                                                            {insttOptions.map(o => (
                                                                <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-default__blue"
                                                        onClick={
                                                            idSetupMode === null ? handleShowChoice
                                                            : idSetupMode === 'auto' ? handleAutoGenerate
                                                            : handleManualCheck
                                                        }
                                                    >
                                                        {idSetupMode === null ? 'Î≤àÌò∏?§Ï†ï'
                                                            : idSetupMode === 'auto' ? '?êÎèô?ùÏÑ±'
                                                            : 'Ï§ëÎ≥µ?ïÏù∏'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* ?¥Î¶Ñ */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="agentName" className="form-label">?¥Î¶Ñ</label>
                                            <input
                                                id="agentName"
                                                type="text"
                                                className="form-control"
                                                placeholder="?¥Î¶Ñ???ÖÎ†•?¥Ï£º?∏Ïöî."
                                                value={form.name}
                                                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    {/* ÎπÑÏÉÅ ?§ÌÇ¨ */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">ÎπÑÏÉÅ ?§ÌÇ¨</label>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table
                                                    className="content-table__sub"
                                                    style={{ width: '100%', minWidth: 600, tableLayout: 'fixed', borderCollapse: 'collapse' }}
                                                >
                                                    <thead>
                                                        <tr>
                                                            <th>SN</th>
                                                            <th>SN INDEX</th>
                                                            <th>SR</th>
                                                            <th>SR INDEX</th>
                                                            <th style={{ width: 70 }}>??†ú</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {scenRows.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={5} className="text-center text-muted py-2">
                                                                    ?±Î°ù???§ÌÇ¨???ÜÏäµ?àÎã§.
                                                                </td>
                                                            </tr>
                                                        ) : scenRows.map(row => (
                                                            <tr key={row._id}>
                                                                <td>{row.pbxSnType}</td>
                                                                <td>{row.pbxSnIndex}</td>
                                                                <td>{row.pbxSrType}</td>
                                                                <td>{row.pbxSrIndex}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger"
                                                                        style={{ width: '80%' }}
                                                                        onClick={() => handleDeleteScenRow(row._id)}
                                                                    >
                                                                        ??†ú
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* ?§ÌÇ¨ Ï∂îÍ? ??*/}
                                            <div className="d-flex gap-2 mt-2 flex-wrap align-items-center">
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 130 }}
                                                    value={addRow.pbxSnType}
                                                    onChange={e => updateAddRow('pbxSnType', e.target.value)}
                                                >
                                                    <option value="">SN ?†ÌÉù</option>
                                                    {pbxSnOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 130 }}
                                                    value={addRow.pbxSnIndex}
                                                    onChange={e => updateAddRow('pbxSnIndex', e.target.value)}
                                                >
                                                    <option value="">SN INDEX</option>
                                                    {pbxIndexOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 100 }}
                                                    value={addRow.pbxSrType}
                                                    onChange={e => updateAddRow('pbxSrType', e.target.value)}
                                                >
                                                    <option value="">SR ?†ÌÉù</option>
                                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                                        <option key={n} value={String(n)}>{n}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 130 }}
                                                    value={addRow.pbxSrIndex}
                                                    onChange={e => updateAddRow('pbxSrIndex', e.target.value)}
                                                >
                                                    <option value="">SR INDEX</option>
                                                    {pbxIndexOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary"
                                                    onClick={handleAddScenRow}
                                                >
                                                    Ï∂îÍ?
                                                </button>
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

export default PbxAgentFormModal;
