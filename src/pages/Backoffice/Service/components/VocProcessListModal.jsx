import React, { useState, useCallback, useEffect, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const VocProcessFormModal = lazy(() => import('./VocProcessFormModal.jsx'));

const VocProcessListModal = ({ open, onClose, vocSeq }) => {
    const [rows, setRows] = useState([]);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [processFormOpen, setProcessFormOpen] = useState(false);
    const [editProcessSeq, setEditProcessSeq] = useState(null);

    const loadList = useCallback(async () => {
        if (!vocSeq) return;
        try {
            const res = await fnAjaxFetch({
                url: URL.VOC_PROCESS_LIST, method: 'POST',
                data: { pageIndex: '1', pageUnit: '30', vocSeq },
                withCredentials: true,
            });
            setRows(res?.data?.resultList || res?.data?.result?.resultList || []);
        } catch { setRows([]); }
    }, [vocSeq]);

    useEffect(() => {
        if (!open || !vocSeq) return;
        setExpandedRows(new Set());
        loadList();
    }, [open, vocSeq, loadList]);

    const toggleExpand = useCallback((seq) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(seq)) next.delete(seq); else next.add(seq);
            return next;
        });
    }, []);

    const handleDelete = useCallback(async (processSeq) => {
        const ok = await Swal.fire({
            icon: 'question', title: '?•Ïï† Ï≤òÎ¶¨?¥Ïó≠ ??†ú',
            html: `<b>${processSeq}</b> ??†ú ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true, confirmButtonText: '??, cancelButtonText: '?ÑÎãà??,
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fnAjaxFetch({
                url: `${URL.VOC_PROCESS_INFO}/${encodeURIComponent(processSeq)}.do`,
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
        <>
            <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
                <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                        style={{ width: '80vw', maxWidth: '80vw', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h2 className="modal-title__title">?•Ïï† Ï≤òÎ¶¨ ?ÑÌô©</h2>
                                </div>
                                <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                            </div>
                            <div className="modal-body">
                                <div className="modal-body__content">
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="content-table__sub"
                                            style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
                                        >
                                            <thead>
                                                <tr>
                                                    <th>?¥Îãπ??/th>
                                                    <th>?àÏïΩ?ºÏûê</th>
                                                    <th>Ï≤òÎ¶¨?ºÏûê</th>
                                                    <th>ÏßÑÌñâ?ÅÌÉú</th>
                                                    <th style={{ width: 90 }}>Ï≤òÎ¶¨?ÑÌô©</th>
                                                    <th style={{ width: 120 }}>?òÏ†ï | ??†ú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rows.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="text-center text-muted py-3">
                                                            Ï≤òÎ¶¨ ?¥Ïó≠???ÜÏäµ?àÎã§.
                                                        </td>
                                                    </tr>
                                                ) : rows.map(row => (
                                                    <React.Fragment key={row.vocProcessSeq}>
                                                        <tr>
                                                            <td>{row.adminName}</td>
                                                            <td>{row.vocProcessReservationDay} {row.vocProcessReservationTime}</td>
                                                            <td>{row.vocProcessVisitedDay} {row.vocProcessVisitedTime}</td>
                                                            <td>{row.vocProcessTxt}</td>
                                                            <td>
                                                                <button
                                                                    type="button" className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => toggleExpand(row.vocProcessSeq)}
                                                                >
                                                                    {expandedRows.has(row.vocProcessSeq) ? '?ëÍ∏∞' : '?ÅÏÑ∏Î≥¥Í∏∞'}
                                                                </button>
                                                            </td>
                                                            <td>
                                                                <button type="button" className="btn btn-sm btn-outline-secondary me-1"
                                                                    onClick={() => { setEditProcessSeq(row.vocProcessSeq); setProcessFormOpen(true); }}
                                                                >?òÏ†ï</button>
                                                                <button type="button" className="btn btn-sm btn-danger"
                                                                    onClick={() => handleDelete(row.vocProcessSeq)}
                                                                >??†ú</button>
                                                            </td>
                                                        </tr>
                                                        {expandedRows.has(row.vocProcessSeq) && (
                                                            <tr>
                                                                <td colSpan={6}
                                                                    style={{ backgroundColor: '#f8f9fa', padding: '10px 15px' }}
                                                                    dangerouslySetInnerHTML={{ __html: row.vocProcessDc }}
                                                                />
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-footer__left">
                                    <button type="button" className="btn btn-primary"
                                        onClick={() => { setEditProcessSeq(null); setProcessFormOpen(true); }}
                                    >Ï≤òÎ¶¨?±Î°ù</button>
                                </div>
                                <div className="modal-footer__right">
                                    <button type="button" className="btn btn-action__lightblue" onClick={onClose}>?´Í∏∞</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <VocProcessFormModal
                open={processFormOpen}
                onClose={() => setProcessFormOpen(false)}
                vocSeq={vocSeq}
                processSeq={editProcessSeq}
                onSuccess={() => { setProcessFormOpen(false); loadList(); }}
            />
        </>
    );
};

export default VocProcessListModal;
