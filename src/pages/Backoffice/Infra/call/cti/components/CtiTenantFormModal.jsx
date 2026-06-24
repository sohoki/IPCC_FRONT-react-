import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import URL from '@/constants/URL.jsx';

const SERVICE_LEVEL_OPTIONS = ['1','2','3','4','5','6','7','8','9'];

const EMPTY_FORM = {
    mode: 'Ins',
    centerId: '1',
    tenantId: '',
    tenantName: '',
    servicelevelCalc: '1',
    idCheck: 'N',
};

const CtiTenantFormModal = ({ open, onClose, tenantId, rowData, onSuccess }) => {
    const isEdt = tenantId !== null && tenantId !== undefined;
    const [form, setForm] = useState(
        isEdt && rowData
            ? {
                mode: 'Edt',
                centerId: String(rowData.centerId || '1'),
                tenantId: String(rowData.tenantId || ''),
                tenantName: rowData.tenantName || '',
                servicelevelCalc: String(rowData.servicelevelCalc || '1'),
                idCheck: 'Y',
              }
            : EMPTY_FORM
    );
    const [centerOptions, setCenterOptions] = useState([]);

    useEffect(() => {
        if (!open) return;
        let active = true;
        fnAjaxFetch({ url: URL.CTI_CENTER_COMBO, method: 'GET', withCredentials: true })
            .then(res => {
                if (!active) return;
                const list = res?.data?.result || [];
                setCenterOptions(list.map(o => ({ code: String(o.centerId), codeNm: o.centerName })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value, ...(name === 'tenantId' ? { idCheck: 'N' } : {}) }));
    }, []);

    const handleIdCheck = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: 'center를 선택해 주세요' }); return; }
        if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: 'tenant Id를 입력해 주세요' }); return; }
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_TENANT_ID_CHECK,
                method: 'POST',
                data: { tenantId: form.tenantId, centerId: form.centerId },
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
    }, [form.centerId, form.tenantId]);

    const { handleSubmit } = useCommonSubmit({
        form,
        URL: URL.CTI_TENANT_UPDATE,
        confirmMessage: 'Tenant',
        checkField: [
            { id: 'centerId',    type: 'select', label: '지역' },
            { id: 'tenantId',    type: 'input',  label: 'tenant Id' },
            { id: 'tenantName',  type: 'input',  label: 'tenant Name' },
        ],
        idFieldMessage: 'tenant Id',
        callback: onSuccess,
    });

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered" style={{ width: 560, maxWidth: '90%', backgroundColor: 'var(--bs-body-bg, #fff)' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">TENANT ID {isEdt ? '수정' : '등록'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ctiCenterId" className="form-label">센터</label>
                                            <select
                                                id="ctiCenterId" name="centerId"
                                                className="form-select"
                                                value={form.centerId}
                                                onChange={updateForm}
                                                disabled={isEdt}
                                            >
                                                <option value="">선택</option>
                                                {centerOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="tenantId" className="form-label">
                                                테넌트ID <span className="text-danger">*</span>
                                            </label>
                                            {isEdt ? (
                                                <input id="tenantId" type="text" className="form-control" value={form.tenantId} readOnly />
                                            ) : (
                                                <div className="input-group">
                                                    <input
                                                        id="tenantId" name="tenantId"
                                                        type="text" className="form-control"
                                                        placeholder="숫자 최대 2자리" maxLength={2}
                                                        value={form.tenantId}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/[^0-9]/g, '');
                                                            setForm(prev => ({ ...prev, tenantId: v, idCheck: 'N' }));
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
                                            <label htmlFor="tenantName" className="form-label">
                                                테넌트명 <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="tenantName" name="tenantName"
                                                type="text" className="form-control"
                                                placeholder="테넌트명을 입력해주세요."
                                                value={form.tenantName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="servicelevelCalc" className="form-label">서비스 LEVEL</label>
                                            <select
                                                id="servicelevelCalc" name="servicelevelCalc"
                                                className="form-select"
                                                value={form.servicelevelCalc}
                                                onChange={updateForm}
                                            >
                                                <option value="">없음</option>
                                                {SERVICE_LEVEL_OPTIONS.map(v => (
                                                    <option key={v} value={v}>{v}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
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

export default CtiTenantFormModal;
