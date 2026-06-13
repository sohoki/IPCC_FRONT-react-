import React, { useState, useCallback, useEffect, lazy } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const PartFormModal = lazy(() => import('@/pages/Backoffice/Infra/bld/components/PartFormModal.jsx'));

/**
 * 층별 구역(part) 목록 + CRUD 모달.
 * 좌석 위치 GUI(드래그·회전) 는 추후 별도 구현 예정.
 */
const PartListModal = ({ open, onClose, floor }) => {
    const centerCd = floor?.center_cd || '';
    const floorCd = floor?.floor_cd || '';
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);

    const loadList = useCallback(async () => {
        if (!floorCd) { setRows([]); return; }
        setLoading(true);
        try {
            const res = await fnAjaxFetch({
                url: URL.BLD_PART_LIST,
                method: 'POST',
                data: { centerCd, floorCd, pageIndex: 1, pageUnit: 100 },
                withCredentials: true,
                showLoading: false,
            });
            setRows(res?.data?.result?.resultList || []);
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, [centerCd, floorCd]);

    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        Promise.resolve().then(() => { if (!cancelled) loadList(); });
        return () => { cancelled = true; };
    }, [open, loadList]);

    const handleDelete = useCallback(async (part) => {
        const ok = await Swal.fire({
            icon: 'question', title: '구역 삭제',
            html: `<b>${part.part_nm || ''}</b> 구역을 삭제 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;
        try {
            const res = await fnAjaxFetch({
                url: `${URL.BLD_PART_DELETE}/${encodeURIComponent(part.part_cd)}.do`,
                method: 'DELETE',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.resultMessage || '삭제되었습니다.' });
                loadList();
            } else {
                await Swal.fire({ icon: 'error', text: json?.resultMessage || '삭제에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [loadList]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: 920, maxWidth: '97%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">{floor?.floor_nm || ''} 구역 관리</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="d-flex justify-content-end mb-2">
                                <button type="button" className="btn btn-primary btn-default__blue"
                                    onClick={() => { setSelectedPart(null); setFormOpen(true); }}>구역 등록</button>
                            </div>
                            <table className="table table-bordered text-center align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>구역명</th>
                                        <th>구역 등급</th>
                                        <th>좌석수</th>
                                        <th>정렬순서</th>
                                        <th>사용여부</th>
                                        <th>수정일자</th>
                                        <th style={{ width: 70 }}>수정</th>
                                        <th style={{ width: 70 }}>삭제</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={8}>조회 중...</td></tr>
                                    ) : rows.length === 0 ? (
                                        <tr><td colSpan={8}>등록된 구역이 없습니다.</td></tr>
                                    ) : rows.map((r) => (
                                        <tr key={r.part_cd}>
                                            <td>{r.part_nm}</td>
                                            <td>{r.part_class_text}</td>
                                            <td>{r.seat_cnt}</td>
                                            <td>{r.part_order}</td>
                                            <td>{r.use_yn}</td>
                                            <td>{r.last_updt_dtm}</td>
                                            <td>
                                                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                                                    onClick={() => { setSelectedPart(r); setFormOpen(true); }}>수정</button>
                                            </td>
                                            <td>
                                                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                                                    onClick={() => handleDelete(r)}>삭제</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>닫기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <PartFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                centerCd={centerCd}
                floorCd={floorCd}
                rowData={selectedPart}
                onSuccess={() => { setFormOpen(false); loadList(); }}
            />
        </div>
    );
};

export default PartListModal;
