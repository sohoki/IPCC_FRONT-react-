import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import URL from '@/constants/URL.jsx';

const makeRow = () => ({
    _id: Date.now() + Math.random(),
    isNew: true,
    messageType: '',
    messageExchangeName: '',
    messageRoutingKey: '',
    messageUseyn: 'Y',
    messageDc: '',
});

const SystemQueueModal = ({ open, onClose, systemCode, msgTypeOptions = [] }) => {
    const [rows, setRows] = useState([]);

    useEffect(() => {
        if (!open || !systemCode) return;
        let active = true;
        fnAjaxFetch({
            url: URL.SYSTEM_AMQP_LIST,
            method: 'POST',
            data: { searchSystem: systemCode },
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            const list = res?.data?.resultList || res?.data?.result?.resultList || [];
            setRows(list.map(r => ({ ...r, _id: Date.now() + Math.random(), isNew: false })));
        }).catch(() => {});
        return () => { active = false; };
    }, [open, systemCode]);

    const addRow = useCallback(() => {
        setRows(prev => [...prev, makeRow()]);
    }, []);

    const updateRow = useCallback((_id, field, value) => {
        setRows(prev => prev.map(r => r._id === _id ? { ...r, [field]: value } : r));
    }, []);

    const deleteRow = useCallback(async (row) => {
        if (!row.isNew) {
            try {
                await fnAjaxFetch({
                    url: URL.SYSTEM_AMQP_DELETE,
                    method: 'DELETE',
                    data: {
                        systemCode,
                        messageType: row.messageType,
                        messageExchangeName: row.messageExchangeName,
                    },
                    withCredentials: true,
                });
            } catch { /* 삭제 실패 시 그냥 제거 */ }
        }
        setRows(prev => prev.filter(r => r._id !== row._id));
    }, [systemCode]);

    const handleSave = useCallback(async () => {
        const ok = await Swal.fire({
            icon: 'question',
            title: 'EXCHANGE INFO 저장',
            html: `<b>${systemCode}</b> AMQP 설정을 저장하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const systemQueueInfos = rows.map(r => ({
                systemCode,
                messageType: r.messageType,
                messageExchangeName: r.messageExchangeName,
                messageRoutingKey: r.messageRoutingKey,
                messageUseyn: r.messageUseyn,
                messageDc: r.messageDc,
            }));
            const res = await fnAjaxFetch({
                url: URL.SYSTEM_AMQP_UPDATE,
                method: 'POST',
                data: { systemQueueInfos },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS' || json?.STATUS === 'SUCCESS') {
                 await Swal.fire({ icon: 'success', title: '저장', text: json?.resultMessage || '저장되었습니다.' });
                onClose();
            } else {
                await Swal.fire({ icon: 'warning', title: '경고', text: json?.resultMessage || '저장에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [rows, systemCode, onClose]);

    if (!open) return null;
    return (
        <>
            <div className="modal-backdrop-custom" onClick={onClose} />
            <div className="modal-custom" style={{ paddingTop: '4vh', paddingBottom: '4vh', overflowY: 'auto', zIndex: 1060 }}>
                <div
                    className="modal-dialog modal-dialog-scrollable"
                    style={{ width: 920, maxWidth: '95%', margin: 'auto', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
                >
                    <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <div className="modal-header" style={{ flexShrink: 0 }}>
                            <div className="modal-title">
                                <h2 className="modal-title__title">EXCHANGE INFO ??{systemCode}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                            <div className="modal-body__content">
                                <div className="d-flex justify-content-end mb-2">
                                    <button type="button" className="btn btn-sm btn-primary" onClick={addRow}>
                                        Queue 추가
                                    </button>
                                </div>
                                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                    <table
                                        className="content-table__sub"
                                        style={{ width: '100%', minWidth: 820, tableLayout: 'fixed', borderCollapse: 'collapse' }}
                                    >
                                        <thead>
                                            <tr>
                                                <th style={{ width: 160 }}>메세지 타입</th>
                                                <th>Exchange</th>
                                                <th>routingKey</th>
                                                <th style={{ width: 110 }}>사용유무</th>
                                                <th>비고</th>
                                                <th style={{ width: 70 }}>삭제</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center text-muted py-3">
                                                        데이터가 없습니다. Queue 추가 버튼으로 행을 추가하세요.
                                                    </td>
                                                </tr>
                                            ) : rows.map(row => (
                                                <tr key={row._id} style={{ backgroundColor: 'transparent' }}>
                                                    <td>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            value={row.messageType}
                                                            onChange={e => updateRow(row._id, 'messageType', e.target.value)}
                                                        >
                                                            <option value="">선택</option>
                                                            {msgTypeOptions.map(o => (
                                                                <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={row.messageExchangeName}
                                                            onChange={e => updateRow(row._id, 'messageExchangeName', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={row.messageRoutingKey}
                                                            onChange={e => updateRow(row._id, 'messageRoutingKey', e.target.value)}
                                                        />
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>
                                                        <UseSwitch
                                                            value={row.messageUseyn}
                                                            name="messageUseyn"
                                                            onChange={(payload) => updateRow(row._id, 'messageUseyn', payload.messageUseyn)}
                                                            onText="사용"
                                                            offText="미사용"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            value={row.messageDc}
                                                            onChange={e => updateRow(row._id, 'messageDc', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-danger"
                                                            style={{ width: '80%' }}
                                                            onClick={() => deleteRow(row)}
                                                        >
                                                            삭제
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer" style={{ flexShrink: 0 }}>
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>닫기</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SystemQueueModal;
