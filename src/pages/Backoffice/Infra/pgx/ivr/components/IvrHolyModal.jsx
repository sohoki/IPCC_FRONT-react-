import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const IvrHolyModal = ({ open, onClose, ivrCode }) => {
    const [holyDay, setHolyDay] = useState('');
    const [holyRows, setHolyRows] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [pagination, setPagination] = useState(null);

    const loadList = useCallback(async (page = 1) => {
        if (!ivrCode) return;
        try {
            const res = await fnAjaxFetch({
                url: URL.IVR_HOLY_LIST,
                method: 'POST',
                data: { pageIndex: String(page), ivrCode },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setHolyRows(json.resultList || []);
                setPagination(json.paginationInfo || null);
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [ivrCode]);

    useEffect(() => {
        if (!open || !ivrCode) return;
        setHolyDay('');
        setPageIndex(1);
        loadList(1);
    }, [open, ivrCode, loadList]);

    const handleAdd = useCallback(async () => {
        if (!holyDay) {
            await Swal.fire({ icon: 'warning', text: '?¥Ïùº???ÖÎ†•??Ï£ºÏÑ∏??' });
            return;
        }
        try {
            const res = await fnAjaxFetch({
                url: URL.IVR_HOLY_UPDATE,
                method: 'POST',
                data: {
                    mode: 'Ins',
                    ivrCode,
                    ivrHolyday: holyDay.replaceAll('-', ''),
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '?±Î°ù?òÏóà?µÎãà??' });
                setHolyDay('');
                loadList(pageIndex);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [holyDay, ivrCode, pageIndex, loadList]);

    const handleDelete = useCallback(async (seq) => {
        const ok = await Swal.fire({
            icon: 'question',
            title: '?¥Ïùº ??†ú',
            text: '??†ú?òÏãúÍ≤†Ïäµ?àÍπå?',
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fnAjaxFetch({
                url: `${URL.IVR_HOLY_DELETE}/${encodeURIComponent(seq)}.do`,
                method: 'DELETE',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '??†ú?òÏóà?µÎãà??' });
                loadList(pageIndex);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || 'Ï≤òÎ¶¨ ?ÑÏ§ë Î¨∏Ï†úÍ∞Ä Î∞úÏÉù?òÏ??µÎãà??' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || 'Ï≤òÎ¶¨ Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.' });
        }
    }, [pageIndex, loadList]);

    const handlePageChange = useCallback((page) => {
        setPageIndex(page);
        loadList(page);
    }, [loadList]);

    const totalPages = pagination ? pagination.totalPageCount : 0;

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
            <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 700, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">?¥ÏùºÍ¥ÄÎ¶???{ivrCode}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                {/* ?¥Ïùº ?ÖÎ†• */}
                                <div className="d-flex gap-2 align-items-center mb-3">
                                    <input
                                        type="date"
                                        className="form-control"
                                        style={{ maxWidth: 180 }}
                                        value={holyDay}
                                        onChange={e => setHolyDay(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                    />
                                    <span>??/span>
                                    <button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
                                        ?±Î°ù
                                    </button>
                                </div>
                                {/* ?¥Ïùº Î™©Î°ù */}
                                <div style={{ overflowX: 'auto' }}>
                                    <table
                                        className="content-table__sub"
                                        style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
                                    >
                                        <thead>
                                            <tr>
                                                <th>?¥Ïùº</th>
                                                <th style={{ width: 70 }}>??†ú</th>
                                                <th>?¥Ïùº</th>
                                                <th style={{ width: 70 }}>??†ú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {holyRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center text-muted py-3">
                                                        ?±Î°ù???¥Ïùº???ÜÏäµ?àÎã§.
                                                    </td>
                                                </tr>
                                            ) : (
                                                Array.from({ length: Math.ceil(holyRows.length / 2) }, (_, i) => {
                                                    const left = holyRows[i * 2];
                                                    const right = holyRows[i * 2 + 1];
                                                    return (
                                                        <tr key={left?.ivrHolydaySeq}>
                                                            <td className="text-center">{left?.ivrHolyday}</td>
                                                            <td className="text-center">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(left?.ivrHolydaySeq)}
                                                                >??†ú</button>
                                                            </td>
                                                            <td className="text-center">{right?.ivrHolyday || ''}</td>
                                                            <td className="text-center">
                                                                {right && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => handleDelete(right?.ivrHolydaySeq)}
                                                                    >??†ú</button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {/* ?òÏù¥Ïß?*/}
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center gap-1 mt-2">
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            disabled={pageIndex <= 1}
                                            onClick={() => handlePageChange(pageIndex - 1)}
                                        >?¥Ï†Ñ</button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                            <button
                                                key={p}
                                                className={`btn btn-sm ${p === pageIndex ? 'btn-primary' : 'btn-outline-secondary'}`}
                                                onClick={() => handlePageChange(p)}
                                            >{p}</button>
                                        ))}
                                        <button
                                            className="btn btn-sm btn-outline-secondary"
                                            disabled={pageIndex >= totalPages}
                                            onClick={() => handlePageChange(pageIndex + 1)}
                                        >?§Ïùå</button>
                                    </div>
                                )}
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

export default IvrHolyModal;
