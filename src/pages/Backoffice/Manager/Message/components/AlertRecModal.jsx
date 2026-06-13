import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_ADD = { recTelNm: '', recTelNumber: '', recTelUseyn: 'Y' };

const AlertRecModal = ({ open, onClose, alertSeq }) => {
    const [rows, setRows] = useState([]);
    const [addRow, setAddRow] = useState(EMPTY_ADD);

    const loadList = useCallback(async () => {
        if (!alertSeq) return;
        try {
            const res = await fnAjaxFetch({
                url: URL.ALERT_REC_LIST,
                method: 'POST',
                data: { pageIndex: '1', pageUnit: '100', alertSeq },
                withCredentials: true,
            });
            const json = res?.data;
            setRows(json?.resultList || json?.result?.resultList || []);
        } catch { setRows([]); }
    }, [alertSeq]);

    useEffect(() => {
        if (!open || !alertSeq) return;
        setAddRow(EMPTY_ADD);
        loadList();
    }, [open, alertSeq, loadList]);

    const handleAdd = useCallback(async () => {
        if (!addRow.recTelNm) { await Swal.fire({ icon: 'warning', text: '?¥Îãπ?êÎ? ?ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        if (!addRow.recTelNumber) { await Swal.fire({ icon: 'warning', text: '?∞ÎùΩÏ≤òÎ? ?ÖÎ†•??Ï£ºÏÑ∏??' }); return; }
        try {
            const res = await fnAjaxFetch({
                url: URL.ALERT_REC_UPDATE,
                method: 'POST',
                data: {
                    mode: 'Ins',
                    alertSeq,
                    recTelNm: addRow.recTelNm.replaceAll('-', ''),
                    recTelNumber: addRow.recTelNumber.replaceAll('-', ''),
                    recTelUseyn: addRow.recTelUseyn,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?±Î°ù?òÏóà?µÎãà??' });
                setAddRow(EMPTY_ADD);
                loadList();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [addRow, alertSeq, loadList]);

    const handleDelete = useCallback(async (recPartSeq) => {
        const ok = await Swal.fire({
            icon: 'question', title: '?¥Îãπ????†ú',
            text: '??†ú?òÏãúÍ≤†Ïäµ?àÍπå?',
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fnAjaxFetch({
                url: `${URL.ALERT_REC}/${encodeURIComponent(recPartSeq)}.do`,
                method: 'DELETE', withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                loadList();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '??†ú???§Ìå®?àÏäµ?àÎã§.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [loadList]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
            <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 680, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">Í≤ΩÍ≥† ?¥Îãπ??Î¶¨Ïä§??/h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                {/* Ï∂îÍ? ??*/}
                                <div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
                                    <div className="d-flex gap-1 align-items-center">
                                        <span className="text-muted small">?¥Îãπ??</span>
                                        <input
                                            type="text" className="form-control form-control-sm" style={{ width: 130 }}
                                            value={addRow.recTelNm}
                                            onChange={e => setAddRow(prev => ({ ...prev, recTelNm: e.target.value }))}
                                        />
                                    </div>
                                    <div className="d-flex gap-1 align-items-center">
                                        <span className="text-muted small">?∞ÎùΩÏ≤?</span>
                                        <input
                                            type="text" className="form-control form-control-sm" style={{ width: 140 }}
                                            value={addRow.recTelNumber}
                                            onChange={e => setAddRow(prev => ({ ...prev, recTelNumber: e.target.value }))}
                                        />
                                    </div>
                                    <div className="d-flex gap-2">
                                        {[{ value: 'Y', text: '?¨Ïö©' }, { value: 'N', text: '?¨Ïö© ?àÌï®' }].map(opt => (
                                            <div key={opt.value} className="form-check">
                                                <input className="form-check-input" type="radio" id={`rec_${opt.value}`}
                                                    name="useRecAt" value={opt.value}
                                                    checked={addRow.recTelUseyn === opt.value}
                                                    onChange={e => setAddRow(prev => ({ ...prev, recTelUseyn: e.target.value }))}
                                                />
                                                <label className="form-check-label" htmlFor={`rec_${opt.value}`}>{opt.text}</label>
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" className="btn btn-sm btn-primary" onClick={handleAdd}>?±Î°ù</button>
                                </div>
                                {/* Î™©Î°ù */}
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="content-table__sub" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th>?¥Îãπ??/th>
                                                <th>?∞ÎùΩÏ≤?/th>
                                                <th style={{ width: 90 }}>?¨Ïö©?†Î¨¥</th>
                                                <th style={{ width: 70 }}>??†ú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center text-muted py-3">
                                                        ?±Î°ù???¥Îãπ?êÍ? ?ÜÏäµ?àÎã§.
                                                    </td>
                                                </tr>
                                            ) : rows.map(row => (
                                                <tr key={row.recPartSeq}>
                                                    <td>{row.recTelNm}</td>
                                                    <td>{row.recTelNumber}</td>
                                                    <td>{row.recTelUseyn}</td>
                                                    <td>
                                                        <button type="button" className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(row.recPartSeq)}
                                                        >??†ú</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>?´Í∏∞</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertRecModal;
