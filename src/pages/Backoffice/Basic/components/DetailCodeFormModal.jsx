import React, { useCallback } from 'react';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const DetailCodeFormModal = ({
    open,
    form,  
    setForm,            // 상태 객체        // (patch) => void
    onClose,
    onSubmit,    
}) => {
    const setDetailForm = useCallback((payload) => {
         setForm((prev) => ({
         ...prev,
         ...payload
         }));
    }, [setForm]);

    if (!open) return null;
    return (   
        <>
            <div className="modal-backdrop-custom">
                <div className="modal-custom">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                        style={{ width: 830, maxWidth: '55%', backgroundColor: '#fff' }} >
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h5 className="modal-title">상세 코드 {form.mode === 'Ins' ? '등록' : '수정'}</h5>
                                </div>
                                <button
                                    type="button"
                                    className="modal-close"
                                    aria-label="Close"
                                    onClick={onClose}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="modal-body__content">
                                    <div className="row input-box-wrap">
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="codeNm" className="form-label">
                                                    상세코드명 <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        id="codeNm"
                                                        name="codeNm"
                                                        className='form-control'
                                                        placeholder="상세코드명을 넣어 주세요"
                                                        value={form.codeNm}
                                                        onChange={(e) => setDetailForm({codeNm: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="codeDc" className="form-label">
                                                    상세코드설명 
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        id="codeDc"
                                                        name="codeDc"
                                                        className='form-control'
                                                        placeholder="상세코드명 설명"
                                                        value={form.codeDc}
                                                        onChange={(e) => setDetailForm({codeDc: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="codeEtc1">비고</label>
                                                <div className="input-group">
                                                    <input
                                                        id="codeEtc1"
                                                        name="codeEtc1"
                                                        className='form-control'
                                                        placeholder="상세코드명 설명"
                                                        value={form.codeEtc1}
                                                        onChange={(e) => setDetailForm({codeEtc1: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="subUseAt">사용 유무</label>
                                                <div className="input-group">
                                                    <div className="input-group">
                                                        <UseSwitch
                                                            value={form.useAt}
                                                            name="useAt"
                                                            onChange={setDetailForm}
                                                            onText="사용"
                                                            offText="사용안함"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-body">
                                <div className="modal-body__content">
                                    <div className="row input-box-wrap mt-3">
                                        <div className="col-auto ms-auto">
                                            <button type="button" className="btn btn-secondary me-2" aria-label="Close" onClick={onClose}>닫기</button>
                                            <button type="button" className="btn btn-primary" onClick={onSubmit}>저장</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </> 
    )
}
export default DetailCodeFormModal;