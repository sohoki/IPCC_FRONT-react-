import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';

const EMPTY_ADD = { ivrTimeGubun: '', ivrStartTime: '', ivrEndTime: '' };

const IvrWorkModal = ({ open, onClose, ivrCode }) => {
    const [workRows, setWorkRows] = useState([]);
    const [addRow, setAddRow] = useState(EMPTY_ADD);

    const { options: timeGubunOptions } = useCommonCodeData('IVR_WEEKGUBUN');

    const loadList = useCallback(async () => {
        if (!ivrCode) return;
        try {
            const res = await fnAjaxFetch({
                url: URL.IVR_WORK_LIST,
                method: 'POST',
                data: { pageIndex: '1', ivrCode },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setWorkRows(json.resultList || []);
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [ivrCode]);

    useEffect(() => {
        if (!open || !ivrCode) return;
        setAddRow(EMPTY_ADD);
        loadList();
    }, [open, ivrCode, loadList]);

    const handleAdd = useCallback(async () => {
        if (!addRow.ivrTimeGubun) {
            await Swal.fire({ icon: 'warning', text: '?ÖÎ¨¥?úÍ∞Ñ???†ÌÉù??Ï£ºÏÑ∏??' });
            return;
        }
        if (!addRow.ivrStartTime) {
            await Swal.fire({ icon: 'warning', text: '?úÏûë?úÍ∞Ñ???ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        if (!addRow.ivrEndTime) {
            await Swal.fire({ icon: 'warning', text: 'Ï¢ÖÎ£å?úÍ∞Ñ???ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        try {
            const res = await fnAjaxFetch({
                url: URL.IVR_WORK_UPDATE,
                method: 'POST',
                data: {
                    mode: 'Ins',
                    ivrCode,
                    ivrTimeGubun: addRow.ivrTimeGubun,
                    ivrStartTime: addRow.ivrStartTime,
                    ivrEndTime: addRow.ivrEndTime,
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
    }, [addRow, ivrCode, loadList]);

    const handleDelete = useCallback(async (seq) => {
        try {
            const res = await fnAjaxFetch({
                url: `${URL.IVR_WORK_DELETE}/${encodeURIComponent(seq)}.do`,
                method: 'DELETE',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                loadList();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [loadList]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
            <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 680, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">?ÖÎ¨¥?úÍ∞Ñ Í¥ÄÎ¶???{ivrCode}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                {/* Ï∂îÍ? ??*/}
                                <div style={{ overflowX: 'auto' }}>
                                    <table
                                        className="content-table__sub"
                                        style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>Íµ¨Î∂Ñ</th>
                                                <th>?úÏûë?úÍ∞Ñ</th>
                                                <th>Ï¢ÖÎ£å?úÍ∞Ñ</th>
                                                <th style={{ width: 70 }}>?±Î°ù</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={addRow.ivrTimeGubun}
                                                        onChange={e => setAddRow(prev => ({ ...prev, ivrTimeGubun: e.target.value }))}
                                                    >
                                                        <option value="">?†ÌÉù</option>
                                                        {timeGubunOptions.map(o => (
                                                            <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="time"
                                                        className="form-control form-control-sm"
                                                        value={addRow.ivrStartTime}
                                                        onChange={e => setAddRow(prev => ({ ...prev, ivrStartTime: e.target.value }))}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <input
                                                        type="time"
                                                        className="form-control form-control-sm"
                                                        value={addRow.ivrEndTime}
                                                        onChange={e => setAddRow(prev => ({ ...prev, ivrEndTime: e.target.value }))}
                                                    />
                                                </td>
                                                <td className="text-center">
                                                    <button type="button" className="btn btn-sm btn-primary" onClick={handleAdd}>
                                                        ?±Î°ù
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* Î™©Î°ù */}
                                <div className="mt-2" style={{ overflowX: 'auto' }}>
                                    <table
                                        className="content-table__sub"
                                        style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>Íµ¨Î∂Ñ</th>
                                                <th>?úÏûë?úÍ∞Ñ</th>
                                                <th>Ï¢ÖÎ£å?úÍ∞Ñ</th>
                                                <th style={{ width: 70 }}>??†ú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {workRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center text-muted py-3">
                                                        ?±Î°ù???ÖÎ¨¥?úÍ∞Ñ???ÜÏäµ?àÎã§.
                                                    </td>
                                                </tr>
                                            ) : workRows.map(row => (
                                                <tr key={row.ivrWorkSeq}>
                                                    <td>{row.codeNm}</td>
                                                    <td className="text-center">{row.ivrStartTime}</td>
                                                    <td className="text-center">{row.ivrEndTime}</td>
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger"
                                                            onClick={() => handleDelete(row.ivrWorkSeq)}
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

export default IvrWorkModal;
