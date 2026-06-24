import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import URL from '@/constants/URL.jsx';

/**
 * CTI 파트 현황 + 파트 등록/수정 통합 모달.
 * view 상태: 'list' | 'form'
 *
 * Props: open, onClose, employeegrpId, tenantId, centerId
 */
const CtiPartListModal = ({ open, onClose, employeegrpId, tenantId, centerId }) => {
    const [view, setView] = useState('list');
    const [partRows, setPartRows] = useState([]);
    const [partForm, setPartForm] = useState({
        mode: 'Ins',
        centerId: centerId || '1',
        tenantId,
        employeegrpId,
        employeepartId: '',
        employeepartName: '',
        monitorFlag: '',
        idCheck: 'N',
    });

    useEffect(() => {
        if (!open || !employeegrpId || !tenantId) return;
        let active = true;
        fnAjaxFetch({
            url: URL.CTI_PART_LIST,
            method: 'POST',
            data: { centerId: centerId || '1', pageUnit: '50', pageIndex: '1', tenantId, employeegrpId },
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            const json = res?.data;
            setPartRows(json?.resultList || json?.result?.resultList || []);
        }).catch(() => { if (active) setPartRows([]); });
        return () => { active = false; setView('list'); };
    }, [open, employeegrpId, tenantId, centerId]);

    const reloadParts = useCallback(() => {
        if (!employeegrpId || !tenantId) return;
        fnAjaxFetch({
            url: URL.CTI_PART_LIST,
            method: 'POST',
            data: { centerId: centerId || '1', pageUnit: '50', pageIndex: '1', tenantId, employeegrpId },
            withCredentials: true,
        }).then(res => {
            const json = res?.data;
            setPartRows(json?.resultList || json?.result?.resultList || []);
        }).catch(() => setPartRows([]));
    }, [employeegrpId, tenantId, centerId]);

    const openAddForm = useCallback(() => {
        setPartForm({
            mode: 'Ins',
            centerId: centerId || '1',
            tenantId,
            employeegrpId,
            employeepartId: '',
            employeepartName: '',
            monitorFlag: '',
            idCheck: 'N',
        });
        setView('form');
    }, [centerId, tenantId, employeegrpId]);

    const openEditForm = useCallback((partData) => {
        setPartForm({
            mode: 'Edt',
            centerId: centerId || '1',
            tenantId,
            employeegrpId,
            employeepartId: String(partData.employeepartId || ''),
            employeepartName: partData.employeepartName || '',
            monitorFlag: String(partData.monitorFlag ?? ''),
            idCheck: 'Y',
        });
        setView('form');
    }, [centerId, tenantId, employeegrpId]);

    const handleCancelForm = useCallback(() => {
        setView('list');
    }, []);

    const handlePartIdCheck = useCallback(async () => {
        if (!partForm.employeepartId) {
            await Swal.fire({ icon: 'warning', text: 'Part Id를 입력해 주세요' });
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
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                setPartForm(prev => ({ ...prev, idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '사용 가능합니다.' });
            } else {
                setPartForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '이미 사용 중입니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [partForm.employeepartId, employeegrpId, tenantId, centerId]);

    const { handleSubmit: handleSavePart } = useCommonSubmit({
        form: partForm,
        URL: URL.CTI_PART_UPDATE,
        confirmMessage: 'Part',
        checkField: [
            { id: 'employeepartId', type: 'input',  label: 'Part ID' },
            { id: 'monitorFlag',    type: 'select', label: '감시' },
        ],
        idFieldMessage: 'Part ID',
        callback: () => { setView('list'); reloadParts(); },
    });

    const handleDeletePart = useCallback(async (employeepartId) => {
        const ok = await Swal.fire({
            icon: 'question', title: 'Part 삭제',
            html: `<b>${employeepartId}</b> 를(을) 삭제 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니요',
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
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다' });
                reloadParts();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [employeegrpId, tenantId, centerId, reloadParts]);

    if (!open) return null;

    const modalContent = view === 'list' ? (
        <>
            <div className="modal-header">
                <div className="modal-title">
                    <h2 className="modal-title__title">CTI 파트 현황 — {employeegrpId}</h2>
                </div>
                <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
                <div className="modal-body__content">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="content-table__sub" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', color: 'inherit' }}>
                            <thead>
                                <tr>
                                    <th>파트ID</th>
                                    <th>파트명</th>
                                    <th>모니터링여부</th>
                                    <th style={{ width: 120 }}>수정 / 삭제</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partRows.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted py-3">등록된 파트가 없습니다.</td>
                                    </tr>
                                ) : partRows.map(row => (
                                    <tr key={row.employeepartId}>
                                        <td>{row.employeepartId}</td>
                                        <td>{row.employeepartName}</td>
                                        <td>{row.monitorFlag}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEditForm(row)}>수정</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeletePart(row.employeepartId)}>삭제</button>
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
                    <button type="button" className="btn btn-primary" onClick={openAddForm}>파트등록</button>
                </div>
                <div className="modal-footer__right">
                    <button type="button" className="btn btn-action__lightblue" onClick={onClose}>닫기</button>
                </div>
            </div>
        </>
    ) : (
        <>
            <div className="modal-header">
                <div className="modal-title">
                    <h2 className="modal-title__title">Part {partForm.mode === 'Ins' ? '등록' : '수정'}</h2>
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
                                {partForm.mode === 'Edt' ? (
                                    <input type="text" className="form-control" value={partForm.employeepartId} readOnly />
                                ) : (
                                    <div className="input-group">
                                        <input
                                            id="employeepartId"
                                            type="text" className="form-control"
                                            placeholder="숫자 최대 10자리" maxLength={10}
                                            value={partForm.employeepartId}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/[^0-9]/g, '');
                                                setPartForm(prev => ({ ...prev, employeepartId: v, idCheck: 'N' }));
                                            }}
                                        />
                                        <button type="button" className="btn btn-primary btn-default__blue" onClick={handlePartIdCheck}>
                                            중복확인
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="input-box">
                                <label htmlFor="employeepartName" className="form-label">Part 명</label>
                                <input
                                    id="employeepartName"
                                    type="text" className="form-control"
                                    placeholder="파트명을 입력해주세요."
                                    value={partForm.employeepartName}
                                    onChange={(e) => setPartForm(prev => ({ ...prev, employeepartName: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="input-box">
                                <label htmlFor="monitorFlag_team" className="form-label">감시</label>
                                <select
                                    id="monitorFlag_team"
                                    className="form-select"
                                    value={partForm.monitorFlag}
                                    onChange={(e) => setPartForm(prev => ({ ...prev, monitorFlag: e.target.value }))}
                                >
                                    <option value="">없음</option>
                                    <option value="1">감시</option>
                                    <option value="0">감시안함</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <div className="modal-footer__left" />
                <div className="modal-footer__right">
                    <button type="button" className="btn btn-action__lightblue" onClick={handleCancelForm}>취소</button>
                    <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSavePart}>
                        {partForm.mode === 'Ins' ? '등록' : '수정'}
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1060 }}>
            <div className="modal-custom" style={{ zIndex: 1061, marginLeft: 0 }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 680, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: 'var(--bs-body-bg, #fff)' }}
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
