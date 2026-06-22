import React, { useCallback } from 'react';
import URL from "@/constants/URL.jsx";
import { useIdCheck } from '@/hooks/use-id-check.js';
import { usePhoneInput } from '@/hooks/use-input-handlers.js';
// 기관 등록/수정 모달 컴포넌트
const InsttFormModal = ({ 
    open, 
    onClose, 
    form, 
    setForm, 
    onSubmit 
}) => {

    const { handleIdCheck } = useIdCheck(URL.INSTT_ID_CHECK, '기관 코드');

    const onCheckId = useCallback(async () => {
        await handleIdCheck(form.insttCode, setForm);
    }, [form.insttCode, setForm, handleIdCheck]);

    const updateForm = useCallback((payload) => {
        setForm((prev) => ({ ...prev, ...payload }));
    }, [setForm]);
    const { handleTelChange } = usePhoneInput(updateForm);
    const { handleFaxChange } = usePhoneInput(updateForm);

    if (!open) return null;
    return (
        <>
            <div className="modal-backdrop-custom" >
                <div className="modal-custom">
                    <div
                        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                        style={{ width: 800, maxWidth: '55%', backgroundColor: 'var(--bs-body-bg, #fff)' }}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h2 className="modal-title__title">기관 {form.mode === 'Ins' ? '등록' :  form.mode === 'Edt'? '수정' : '복사'}</h2>
                                </div>
                                <button type="button" className="modal-close" aria-label="Close" onClick={onClose}></button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-body__content">
                                    <div className="row input-box-wrap">
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="comCode" className="form-label">기관 코드 <span className="text-danger">*</span></label>
                                                <div className="d-flex align-items-center date-range">
                                                    <div className="input-group">
                                                        <input
                                                            id="insttCode"
                                                            name="insttCode"
                                                            placeholder='코드를 입력해주세요.'
                                                            type='text'
                                                            inputMode="number"
                                                            className="form-control"
                                                            value={form.insttCode ?? ''}
                                                            readOnly={form.mode !== 'Ins'}
                                                            onChange={(e) => updateForm({insttCode: e.target.value })}
                                                        />
                                                        {form.mode === 'Ins' && (
                                                            <button
                                                            type="button"
                                                            className="btn btn-primary btn-default__blue"
                                                            onClick={onCheckId} // ✅ 불필요 인자 제거
                                                            >
                                                            중복체크
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="comCode" className="form-label">기관명 <span className="text-danger">*</span></label>
                                                <div className="d-flex align-items-center date-range">
                                                    <input
                                                        id="allInsttNm"
                                                        name="allInsttNm"
                                                        placeholder='기관명을 입력해주세요.'
                                                        type='text'
                                                        inputMode="email"
                                                        className="form-control"
                                                        value={form.allInsttNm ?? ''}
                                                        onChange={(e) => updateForm({allInsttNm: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="comCode" className="form-label">기관 약어명 <span className="text-danger">*</span></label>
                                                <div className="d-flex align-items-center date-range">
                                                    <input
                                                        id="insttAbrvNm"
                                                        name="insttAbrvNm"
                                                        placeholder='기관명을 입력해주세요.'
                                                        type='text'
                                                        inputMode="email"
                                                        className="form-control"
                                                        value={form.insttAbrvNm ?? ''}
                                                        onChange={(e) => updateForm({insttAbrvNm: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="comCode" className="form-label">기관명(약어) <span className="text-danger">*</span></label>
                                                <div className="d-flex align-items-center date-range">
                                                    <input
                                                        id="shortInsttNm"
                                                        name="shortInsttNm"
                                                        placeholder='기관명을 입력해주세요.'
                                                        type='text'
                                                        inputMode="email"
                                                        className="form-control"
                                                        value={form.shortInsttNm ?? ''}
                                                        onChange={(e) => updateForm({shortInsttNm: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="comCode" className="form-label">기관대표 전화 
                                                </label>
                                                <div className="d-flex align-items-center date-range">
                                                    <input
                                                        id="telno"
                                                        name="telno"
                                                        placeholder='기관명을 입력해주세요.'
                                                        type='text'
                                                        inputMode="email"
                                                        className="form-control"
                                                        value={form.telno ?? ''}
                                                        onChange={handleTelChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="comCode" className="form-label">기관대표 fax 
                                                </label>
                                                <div className="d-flex align-items-center date-range">
                                                    <input
                                                        id="fxnum"
                                                        name="fxnum"
                                                        placeholder='기관명을 입력해주세요.'
                                                        type='text'
                                                        inputMode="email"
                                                        className="form-control"
                                                        value={form.fxnum ?? ''}
                                                        onChange={handleFaxChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-footer__left">
                                    
                                </div>
                                <div className="modal-footer__right">
                                    <button type="button" className="btn btn-action__lightblue" aria-label="Close" onClick={onClose}>취소</button>
                                    <button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>저장</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
export default InsttFormModal;