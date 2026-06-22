import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
    notiSeq: '',
    smsModel: '',
    smsFields: '',
    smsName: '',
    smsFieldsDc: '',
    smsOperation: '',
    smsGubun: '',
    smsUseyn: 'Y',
};

const PbxSmsModelFormModal = ({ open, onClose, notiSeq, rowData, onSuccess }) => {
    const isEdt = notiSeq !== null && notiSeq !== undefined;
    const [form, setForm] = useState(
        isEdt && rowData
            ? {
                notiSeq: String(rowData.notiSeq || ''),
                smsModel: rowData.smsModel || '',
                smsFields: '',
                smsName: rowData.smsName || '',
                smsFieldsDc: '',
                smsOperation: rowData.smsOperation || '',
                smsGubun: rowData.smsGubun || '',
                smsUseyn: rowData.smsUseyn || 'Y',
              }
            : EMPTY_FORM
    );

    const { options: smsGubunOptions } = useCommonCodeData('AUTH_GUBUN');

    useEffect(() => {
        if (!open || !isEdt || !notiSeq) return;
        let active = true;
        fnAjaxFetch({
            url: `${URL.SMS_MODEL_INFO}/${encodeURIComponent(notiSeq)}.do`,
            method: 'GET',
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            const result = res?.data?.result || {};
            setForm(prev => ({
                ...prev,
                smsFields: result.smsFields || '',
                smsFieldsDc: result.smsFieldsDc || '',
            }));
        }).catch(() => {});
        return () => { active = false; };
    }, [open, isEdt, notiSeq]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.smsModel) {
            await Swal.fire({ icon: 'warning', text: 'SMS MODEL을 입력해 주세요' });
            return;
        }
        if (!form.smsFields) {
            await Swal.fire({ icon: 'warning', text: 'SMS MODEL FIELD를 입력해 주세요' });
            return;
        }
        const action = isEdt ? '수정' : '등록';
        const ok = await Swal.fire({
            icon: 'question',
            title: `SMS Model ${action}`,
            html: `SMS Model을 <b>${action}</b> 하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니요',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.SMS_MODEL_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    notiSeq: form.notiSeq,
                    smsModel: form.smsModel,
                    smsName: form.smsName,
                    smsFields: form.smsFields,
                    smsFieldsDc: form.smsFieldsDc,
                    smsOperation: form.smsOperation,
                    smsGubun: form.smsGubun,
                    smsUseyn: form.smsUseyn,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}되었습니다` });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '처리 중 문제가 발생했습니다' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 680, maxWidth: '95%', backgroundColor: 'var(--bs-body-bg, #fff)' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">
                                    SMS MODEL {isEdt ? '수정' : '등록'}
                                </h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* SMS_MODEL */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsModel" className="form-label">
                                                SMS_MODEL <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="smsModel" name="smsModel"
                                                type="text" className="form-control"
                                                placeholder="SMS MODEL을 입력해주세요."
                                                value={form.smsModel}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* SMS FIELD */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsFields" className="form-label">
                                                SMS FIELD <span className="text-danger">*</span>
                                            </label>
                                            <textarea
                                                id="smsFields" name="smsFields"
                                                className="form-control"
                                                rows={4}
                                                placeholder="SMS FIELD를 입력해주세요."
                                                value={form.smsFields}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* 명칭 */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsName" className="form-label">명칭</label>
                                            <input
                                                id="smsName" name="smsName"
                                                type="text" className="form-control"
                                                placeholder="명칭을 입력해주세요."
                                                value={form.smsName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* SMS FIELD 명칭 */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsFieldsDc" className="form-label">SMS FIELD 명칭</label>
                                            <textarea
                                                id="smsFieldsDc" name="smsFieldsDc"
                                                className="form-control"
                                                rows={4}
                                                placeholder="SMS FIELD 명칭을 입력해주세요."
                                                value={form.smsFieldsDc}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* SMS 운영 지원 */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="smsOperation" className="form-label">SMS 운영 지원</label>
                                            <input
                                                id="smsOperation" name="smsOperation"
                                                type="text" className="form-control"
                                                placeholder="SMS 운영 지원 정보를 입력해주세요."
                                                value={form.smsOperation}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* 구분 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="smsGubun" className="form-label">구분</label>
                                            <select
                                                id="smsGubun" name="smsGubun"
                                                className="form-select"
                                                value={form.smsGubun}
                                                onChange={updateForm}
                                            >
                                                <option value="">선택</option>
                                                {smsGubunOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* 사용 여부 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">사용 여부</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.smsUseyn}
                                                    name="smsUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, smsUseyn: payload.smsUseyn }))}
                                                    onText="사용"
                                                    offText="사용 안함"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PbxSmsModelFormModal;
