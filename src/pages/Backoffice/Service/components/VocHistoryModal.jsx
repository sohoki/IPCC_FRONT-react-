import React, { useState, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const VocHistoryModal = ({ open, onClose, vocSeq }) => {
    const [header, setHeader] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!open || !vocSeq) return;
        let active = true;
        fnAjaxFetch({
            url: `${URL.VOC_HISTORY}/${encodeURIComponent(vocSeq)}.do`,
            method: 'GET', withCredentials: true,
        }).then(res => {
            if (!active) return;
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setHeader(json.regist || null);
                setItems(json.resultList || []);
            } else {
                Swal.fire({ icon: 'warning', text: json?.MESSAGE || '조회???�패?�습?�다.' });
            }
        }).catch(() => {});
        return () => { active = false; };
    }, [open, vocSeq]);

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
                                <h2 className="modal-title__title">처리 ?�황</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                {/* ?�더 ?�보 */}
                                {header && (
                                    <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f0f4ff', border: '1px solid #d0d9ff' }}>
                                        <div className="d-flex gap-3 flex-wrap small">
                                            <span><strong>?�청??</strong> {header.vocReqNm}({header.vocReqUserid})</span>
                                            <span><strong>?�치:</strong> {header.vocLocation}</span>
                                            <span><strong>?�형:</strong> {header.vocGubunTxt}</span>
                                            <span><strong>최종처리?�황:</strong> {header.vocProcessTxt}</span>
                                        </div>
                                    </div>
                                )}
                                {/* 처리 ?�력 */}
                                {items.length === 0 ? (
                                    <p className="text-muted text-center py-3">처리 ?�력???�습?�다.</p>
                                ) : (
                                    <ul className="list-unstyled">
                                        {items.map((item, idx) => (
                                            <li key={idx} className="mb-3 pb-3" style={{ borderBottom: '1px solid #eee' }}>
                                                <div className="d-flex gap-3 small mb-1">
                                                    <span><strong>방문??</strong> {item.vocProcessVisitedDay} {item.vocProcessVisitedTime}</span>
                                                    <span><strong>방문??</strong> {item.adminName}</span>
                                                    <span><strong>?�태:</strong> {item.vocProcessTxt}</span>
                                                </div>
                                                {item.vocProcessDc && (
                                                    <div className="small text-muted ps-2"
                                                        dangerouslySetInnerHTML={{ __html: item.vocProcessDc }}
                                                    />
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>?�기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VocHistoryModal;
