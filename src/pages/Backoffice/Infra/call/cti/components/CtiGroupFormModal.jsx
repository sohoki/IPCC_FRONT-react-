import React, { useState, useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import URL from '@/constants/URL.jsx';

/**
 * Props:
 *   open, onClose
 *   centerId, tenantId  — 부모 테넌트 정보
 *   groupData           — null = 신규, object = 수정
 *   onSuccess(tenantId, centerId) — 저장 후 호출
 */
const CtiGroupFormModal = ({ open, onClose, centerId, tenantId, groupData, onSuccess }) => {
    const isEdt = groupData !== null && groupData !== undefined;

    const [form, setForm] = useState(
        isEdt && groupData
            ? {
                mode: 'Edt',
                centerId,
                tenantId,
                employeegrpId: String(groupData.employeegrpId || ''),
                employeegrpName: groupData.employeegrpName || '',
                monitorFlag: String(groupData.monitorFlag ?? '1'),
                idCheck: 'Y',
              }
            : {
                mode: 'Ins',
                centerId,
                tenantId,
                employeegrpId: '',
                employeegrpName: '',
                monitorFlag: '1',
                idCheck: 'N',
              }
    );

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleIdCheck = useCallback(async () => {
        if (!form.employeegrpId) { await Swal.fire({ icon: 'warning', text: 'employeegrpId를 입력해 주세요' }); return; }
        if (!centerId) { await Swal.fire({ icon: 'warning', text: '지역을 선택해 주세요' }); return; }
        if (!tenantId) { await Swal.fire({ icon: 'warning', text: 'tenant Id를 선택해주세요.' }); return; }
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_GROUP_ID_CHECK,
                method: 'POST',
                data: { employeegrpId: form.employeegrpId, centerId, tenantId },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                setForm(prev => ({ ...prev, idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '사용 가능합니다.' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '이미 사용 중입니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form.employeegrpId, centerId, tenantId]);

    const { handleSubmit } = useCommonSubmit({
        form,
        URL: URL.CTI_GROUP_UPDATE,
        confirmMessage: 'Group',
        checkField: [
            { id: 'employeegrpId',   type: 'input',  label: 'Group ID' },
            { id: 'employeegrpName', type: 'input',  label: 'Group 명' },
            { id: 'monitorFlag',     type: 'select', label: '감시' },
        ],
        idFieldMessage: 'Group ID',
        callback: () => onSuccess(tenantId, centerId),
    });

    const handleDelete = useCallback(async () => {
        const ok = await Swal.fire({
            icon: 'question', title: '그룹코드 삭제',
            html: `<b>${form.employeegrpId}</b> 를(을) 삭제 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니요',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_GROUP_DELETE,
                method: 'POST',
                data: { employeegrpId: form.employeegrpId, centerId, tenantId },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다' });
                onSuccess(tenantId, centerId);
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form.employeegrpId, centerId, tenantId, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
            <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                <div className="modal-dialog modal-dialog-centered" style={{ width: 560, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: 'var(--bs-body-bg, #fff)' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">GROUP {isEdt ? '수정' : '등록'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="employeegrpId" className="form-label">
                                                Group ID <span className="text-danger">*</span>
                                            </label>
                                            {isEdt ? (
                                                <input id="employeegrpId" type="text" className="form-control" value={form.employeegrpId} readOnly />
                                            ) : (
                                                <div className="input-group">
                                                    <input
                                                        id="employeegrpId" name="employeegrpId"
                                                        type="text" className="form-control"
                                                        placeholder="숫자 최대 10자리" maxLength={10}
                                                        value={form.employeegrpId}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/[^0-9]/g, '');
                                                            setForm(prev => ({ ...prev, employeegrpId: v, idCheck: 'N' }));
                                                        }}
                                                    />
                                                    <button type="button" className="btn btn-primary btn-default__blue" onClick={handleIdCheck}>
                                                        중복확인
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="employeegrpName" className="form-label">
                                                Group 명 <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="employeegrpName" name="employeegrpName"
                                                type="text" className="form-control"
                                                placeholder="그룹명을 입력해주세요."
                                                value={form.employeegrpName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="monitorFlag" className="form-label">감시</label>
                                            <select
                                                id="monitorFlag" name="monitorFlag"
                                                className="form-select"
                                                value={form.monitorFlag}
                                                onChange={updateForm}
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
                            <div className="modal-footer__left">
                                {isEdt && (
                                    <button type="button" className="btn btn-danger" onClick={handleDelete}>삭제</button>
                                )}
                            </div>
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSubmit}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CtiGroupFormModal;
