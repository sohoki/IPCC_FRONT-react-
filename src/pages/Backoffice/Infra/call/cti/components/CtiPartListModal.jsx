import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_PART_FORM = { employeepartId: '', employeepartName: '', monitorFlag: '', idCheck: 'N' };

/**
 * CTI ?åÌä∏ ?ÑÌô© + ?åÌä∏ ?±Î°ù/?òÏ†ï ?µÌï© Î™®Îã¨.
 * view ?ÅÌÉú: 'list' | 'form'
 *
 * Props: open, onClose, employeegrpId, tenantId, centerId
 */
const CtiPartListModal = ({ open, onClose, employeegrpId, tenantId, centerId }) => {
    const [view, setView] = useState('list');
    const [partRows, setPartRows] = useState([]);
    const [partForm, setPartForm] = useState(EMPTY_PART_FORM);
    const [partMode, setPartMode] = useState('Ins');

    const loadParts = useCallback(async () => {
        if (!employeegrpId || !tenantId) return;
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_PART_LIST,
                method: 'POST',
                data: { centerId: centerId || '1', pageUnit: '50', pageIndex: '1', tenantId, employeegrpId },
                withCredentials: true,
            });
            const json = res?.data;
            setPartRows(json?.resultList || json?.result?.resultList || []);
        } catch { setPartRows([]); }
    }, [employeegrpId, tenantId, centerId]);

    useEffect(() => {
        if (!open) { setView('list'); return; }
        loadParts();
    }, [open, loadParts]);

    const openAddForm = useCallback(() => {
        setPartForm(EMPTY_PART_FORM);
        setPartMode('Ins');
        setView('form');
    }, []);

    const openEditForm = useCallback((partData) => {
        setPartForm({
            employeepartId: String(partData.employeepartId || ''),
            employeepartName: partData.employeepartName || '',
            monitorFlag: String(partData.monitorFlag ?? ''),
            idCheck: 'Y',
        });
        setPartMode('Edt');
        setView('form');
    }, []);

    const handleCancelForm = useCallback(() => {
        setView('list');
    }, []);

    const handlePartIdCheck = useCallback(async () => {
        if (!partForm.employeepartId) {
            await Swal.fire({ icon: 'warning', text: 'Part IdÎ•??ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_PART_ID_CHECK,
                method: 'POST',
                data: { employeepartId: partForm.employeepartId, employeegrpId, tenantId, centerId: centerId || '1' },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setPartForm(prev => ({ ...prev, idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?¨Ïö© Í∞Ä?•Ìï©?àÎã§.' });
            } else {
                setPartForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '?¥Î? ?¨Ïö© Ï§ëÏûÖ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [partForm.employeepartId, employeegrpId, tenantId, centerId]);

    const handleSavePart = useCallback(async () => {
        if (!partForm.employeepartId) { await Swal.fire({ icon: 'warning', text: 'Part IDÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.' }); return; }
        if (!partForm.monitorFlag) { await Swal.fire({ icon: 'warning', text: 'Í∞êÏãúÎ•??†ÌÉù??Ï£ºÏÑ∏??' }); return; }
        if (partMode === 'Ins' && partForm.idCheck !== 'Y') { await Swal.fire({ icon: 'warning', text: 'Ï§ëÎ≥µ Ï≤¥ÌÅ¨Î•??¥Ï£º?∏Ïöî.' }); return; }

        const action = partMode === 'Ins' ? '?±Î°ù' : '?òÏ†ï';
        const ok = await Swal.fire({
            icon: 'question', title: `Part ${action}`,
            html: `Part ?ïÎ≥¥Î•?<b>${action}</b> ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_PART_UPDATE,
                method: 'POST',
                data: {
                    mode: partMode,
                    employeegrpId,
                    tenantId,
                    centerId: centerId || '1',
                    employeepartId: partForm.employeepartId,
                    employeepartName: partForm.employeepartName,
                    monitorFlag: partForm.monitorFlag,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}?òÏóà?µÎãà??` });
                setView('list');
                loadParts();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [partForm, partMode, employeegrpId, tenantId, centerId, loadParts]);

    const handleDeletePart = useCallback(async (employeepartId) => {
        const ok = await Swal.fire({
            icon: 'question', title: 'Part ??†ú',
            html: `<b>${employeepartId}</b> Î•??? ??†ú ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_PART_DELETE,
                method: 'POST',
                data: { employeegrpId, tenantId, centerId: centerId || '1', employeepartId },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                loadParts();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '??†ú???§Ìå®?àÏäµ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [employeegrpId, tenantId, centerId, loadParts]);

    if (!open) return null;

    const modalContent = view === 'list' ? (
        <>
            <div className="modal-header">
                <div className="modal-title">
                    <h2 className="modal-title__title">CTI ?åÌä∏ ?ÑÌô© ??{employeegrpId}</h2>
                </div>
                <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
                <div className="modal-body__content">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="content-table__sub" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>?åÌä∏ID</th>
                                    <th>?åÌä∏Î™?/th>
                                    <th>Î™®Îãà?∞ÎßÅ?¨Î?</th>
                                    <th style={{ width: 120 }}>?òÏ†ï / ??†ú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted py-3">?±Î°ù???åÌä∏Í∞Ä ?ÜÏäµ?àÎã§.</td>
                                    </tr>
                                ) : partRows.map(row => (
                                    <tr key={row.employeepartId}>
                                        <td>{row.employeepartId}</td>
                                        <td>{row.employeepartName}</td>
                                        <td>{row.monitorFlag}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEditForm(row)}>?òÏ†ï</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeletePart(row.employeepartId)}>??†ú</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <div className="modal-footer__left">
                    <button type="button" className="btn btn-primary" onClick={openAddForm}>?åÌä∏?±Î°ù</button>
                </div>
                <div className="modal-footer__right">
                    <button type="button" className="btn btn-action__lightblue" onClick={onClose}>?´Í∏∞</button>
                </div>
            </div>
        </>
    ) : (
        <>
            <div className="modal-header">
                <div className="modal-title">
                    <h2 className="modal-title__title">Part {partMode === 'Ins' ? '?±Î°ù' : '?òÏ†ï'}</h2>
                </div>
                <button type="button" className="modal-close" aria-label="Close" onClick={handleCancelForm} />
            </div>
            <div className="modal-body">
                <div className="modal-body__content">
                    <div className="row input-box-wrap">
                        <div className="col-6">
                            <div className="input-box">
                                <label htmlFor="employeepartId" className="form-label">
                                    Part ID <span className="text-danger">*</span>
                                </label>
                                {partMode === 'Edt' ? (
                                    <input type="text" className="form-control" value={partForm.employeepartId} readOnly />
                                ) : (
                                    <div className="input-group">
                                        <input
                                            id="employeepartId"
                                            type="text" className="form-control"
                                            placeholder="?´Ïûê ÏµúÎ? 10?êÎ¶¨" maxLength={10}
                                            value={partForm.employeepartId}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/[^0-9]/g, '');
                                                setPartForm(prev => ({ ...prev, employeepartId: v, idCheck: 'N' }));
                                            }}
                                        />
                                        <button type="button" className="btn btn-primary btn-default__blue" onClick={handlePartIdCheck}>
                                            Ï§ëÎ≥µ?ïÏù∏
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="input-box">
                                <label htmlFor="employeepartName" className="form-label">Part Î™?/label>
                                <input
                                    id="employeepartName"
                                    type="text" className="form-control"
                                    placeholder="?åÌä∏Î™ÖÏùÑ ?ÖÎ†•?¥Ï£º?∏Ïöî."
                                    value={partForm.employeepartName}
                                    onChange={(e) => setPartForm(prev => ({ ...prev, employeepartName: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="input-box">
                                <label htmlFor="monitorFlag_team" className="form-label">Í∞êÏãú</label>
                                <select
                                    id="monitorFlag_team"
                                    className="form-select"
                                    value={partForm.monitorFlag}
                                    onChange={(e) => setPartForm(prev => ({ ...prev, monitorFlag: e.target.value }))}
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
                <div className="modal-footer__left" />
                <div className="modal-footer__right">
                    <button type="button" className="btn btn-action__lightblue" onClick={handleCancelForm}>Ï∑®ÏÜå</button>
                    <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSavePart}>
                        {partMode === 'Ins' ? '?±Î°ù' : '?òÏ†ï'}
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1060 }}>
            <div className="modal-custom" style={{ zIndex: 1061, marginLeft: 0 }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 680, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        {modalContent}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CtiPartListModal;
