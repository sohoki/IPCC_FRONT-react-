import React, { useCallback } from 'react';

const PartClassFormModal = ({
    open, onClose, form, setForm, centerOptions = [], partClassCodeOptions = [], onSubmit,
}) => {
    const isEdt = form.mode === 'Edt';

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, [setForm]);

    const onFileChange = useCallback((e) => {
        setForm(prev => ({ ...prev, partIcon: e.target.files?.[0] || null }));
    }, [setForm]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: 760, maxWidth: '95%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title"><h2 className="modal-title__title">구역 등급 정보 {isEdt ? '수정' : '등록'}</h2></div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">지점명 <span className="text-danger">*</span></label>
                                            <select name="centerCd" className="form-select" value={form.centerCd} onChange={updateForm} disabled={isEdt}>
                                                <option value="">지점 선택</option>
                                                {centerOptions.map(o => (<option key={o.code} value={o.code}>{o.codeNm}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">구역등급 <span className="text-danger">*</span></label>
                                            <select name="partClass" className="form-select" value={form.partClass} onChange={updateForm} disabled={isEdt}>
                                                <option value="">선택</option>
                                                {partClassCodeOptions.map(o => (<option key={o.code} value={o.code}>{o.codeNm}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="partPayCost" className="form-label">일반 금액 <span className="text-danger">*</span></label>
                                            <input id="partPayCost" name="partPayCost" type="number" className="form-control"
                                                placeholder="일반 금액(원)" value={form.partPayCost} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="partSpeedPayCost" className="form-label">스피드온 금액</label>
                                            <input id="partSpeedPayCost" name="partSpeedPayCost" type="number" className="form-control"
                                                placeholder="스피드온 금액(원)" value={form.partSpeedPayCost} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="partIcon" className="form-label">아이콘</label>
                                            <input id="partIcon" name="partIcon" type="file" accept="image/*" className="form-control" onChange={onFileChange} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="partClassOrder" className="form-label">정렬순서 <span className="text-danger">*</span></label>
                                            <input id="partClassOrder" name="partClassOrder" type="number" className="form-control"
                                                placeholder="정렬 순서" value={form.partClassOrder} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">사용 여부</label>
                                            <select name="useYn" className="form-select" value={form.useYn} onChange={updateForm}>
                                                <option value="Y">사용</option>
                                                <option value="N">사용 안함</option>
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
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartClassFormModal;
