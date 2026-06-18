import React, { useState, useCallback, useEffect } from 'react';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import { CommonSelect } from '@/components/Common/select.jsx';

const EMPTY_FORM = {
    mode:           'Ins',
    alertSeq:       '',
    alertPartSeq:   '',
    alertInsttCode: '',
    partGubun:      '',
    alertPart:      '',
    alertPartUseyn: 'Y',
};

const buildInitialForm = (isEdt, partData, alertSeq) => {
    if (!isEdt || !partData) return { ...EMPTY_FORM, mode: 'Ins', alertSeq };
    return {
        mode:           'Edt',
        alertSeq,
        alertPartSeq:   partData.alertPartSeq   || '',
        alertInsttCode: partData.alertInsttCode || '',
        partGubun:      partData.partGubun      || '',
        alertPart:      partData.alertPart      || '',
        alertPartUseyn: partData.alertPartUseyn || 'Y',
    };
};

const AlertPartFormModal = ({
    open,
    onClose,
    alertSeq,
    alertMessage,
    alertPartSeq,
    partData,
    onData,
    onSuccess,
}) => {
    const isEdt = alertPartSeq !== null && alertPartSeq !== undefined;

    // 부모에서 key={openAt}으로 리마운트하므로 lazy initializer로 최초 1회 초기화
    const [form, setForm]               = useState(() => buildInitialForm(isEdt, partData, alertSeq));
    const [partOptions, setPartOptions] = useState([]);
    const { options: partGubunOptions } = useCommonCodeData('PART_GUBUN');

    const loadPartOptions = useCallback(async (insttCode) => {
        if (!insttCode) { setPartOptions([]); return; }
        try {
            const res = await fnAjaxFetch({
                url: `${URL.PART_PARENT_COMBO}?searchInsttCode=${encodeURIComponent(insttCode)}`,
                method: 'GET',
            });
            const list = res?.data?.result?.resultList || res?.data?.result || [];
            setPartOptions(Array.isArray(list)
                ? list.map(p => ({ code: p.partId , codeNm: p.partNmHi || p.codeNm }))
                : []
            );
        } catch { setPartOptions([]); }
    }, []);

    // React Compiler: useEffect 내 loadPartOptions 직접 호출 불가 (내부 setState를 정적 추적)
    // → .then() 콜백 패턴으로 비동기 처리
    useEffect(() => {
        if (!open || !isEdt || !partData?.alertInsttCode) return;
        const insttCode = partData.alertInsttCode;
        fnAjaxFetch({ url: `${URL.PART_PARENT_COMBO}?searchInsttCode=${encodeURIComponent(insttCode)}`, method: 'GET' })
            .then(res => {
                const list = res?.data?.result?.resultList || res?.data?.result || [];
                setPartOptions(Array.isArray(list)
                    ? list.map(p => ({ code: p.partId || p.code, codeNm: p.partNmHi || p.codeNm }))
                    : []
                );
            })
            .catch(() => setPartOptions([]));
        return () => setPartOptions([]);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleInsttChange = useCallback((e) => {
        const { value } = e.target;
        setForm(prev => ({ ...prev, alertInsttCode: value, alertPart: '' }));
        if (value) loadPartOptions(value);
        else setPartOptions([]);
    }, [loadPartOptions]);

    const handleSuccess = useCallback(() => onSuccess(alertSeq), [onSuccess, alertSeq]);

    const { handleSubmit } = useCommonSubmit({
        form,
        URL: URL.ALERT_PART_UPDATE,
        confirmMessage: '부서',
        checkField: [
            { inputId: 'partGubun', label: '부서 구분', type: 'select' },
            { inputId: 'alertPart', label: '부서',      type: 'select' },
            { inputId: 'alertInsttCode', label: '기관',      type: 'select' },
        ],
        setModalOpen: onClose,
        callback: handleSuccess,
    });

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
            <div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
                <div className="modal-dialog modal-dialog-centered"
                    style={{ width: 500, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">부서 {isEdt ? '수정' : '등록'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">

                                    {alertSeq && alertMessage && (
                                        <div className="col-12">
                                            <div className="input-box">
                                                <label className="form-label">알림메세지</label>
                                                <div className="form-control bg-light">{alertMessage}</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="partGubun" className="form-label">부서 구분 <span className="text-danger">*</span></label>
                                            <select id="partGubun" name="partGubun" className="form-select" value={form.partGubun} onChange={updateForm}>
                                                <option value="">선택</option>
                                                {partGubunOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 기관 선택 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="alertInsttCode" className="form-label">기관</label>
                                            <CommonSelect
                                                comboId="alertInsttCode"
                                                comboData={onData || []}
                                                value={form.alertInsttCode}
                                                onChange={handleInsttChange}
                                                placeholder="기관을 선택하세요"
                                                className="form-select"
                                                style={{ height: 32, fontSize: 15 }}
                                            />
                                        </div>
                                    </div>

                                    {/* 부서 — 기관 선택 시 select, 미선택 시 text input */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="alertPart" className="form-label">부서 <span className="text-danger">*</span></label>
                                            {partOptions.length > 0 ? (
                                                <CommonSelect
                                                    comboId="alertPart"
                                                    comboData={partOptions}
                                                    value={form.alertPart}
                                                    onChange={updateForm}
                                                    placeholder="부서를 선택하세요"
                                                    className="form-select"
                                                    style={{ height: 32, fontSize: 15 }}
                                                />
                                            ) : (
                                                <input id="alertPart" name="alertPart" type="text" className="form-control"
                                                    placeholder="부서 코드를 입력해주세요." value={form.alertPart} onChange={updateForm} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">사용 여부</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.alertPartUseyn}
                                                    name="alertPartUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, alertPartUseyn: payload.alertPartUseyn }))}
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
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSubmit}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AlertPartFormModal;
