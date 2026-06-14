import React, { useCallback } from 'react';
import { useIdCheck } from '@/hooks/use-id-check.js';
import URL from '@/constants/URL.jsx';
import Switch from "react-switch";
import {CommonSelect} from '@/components/Common/Select.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
const CodeFormModal = ({
    open,
    form,  
    setForm,            // 상태 객체        // (patch) => void
    onData,
    onClose,
    onSubmit,
}) => {

    const { handleIdCheck } = useIdCheck(URL.CODE_ID_CHECK, '분류코드');

    const onIdCheck = useCallback(async () => {
        await handleIdCheck(form.codeId, setForm, { systemCode: form.systemCode });
    }, [form.codeId, form.systemCode, setForm, handleIdCheck]);

 
    const updateForm = useCallback((payload) => {
         setForm((prev) => ({
         ...prev,
         ...payload
         }));
    }, [setForm]);

    const handleCodeIdChange = useCallback((e) => {
        const filtered = e.target.value.replace(/[^A-Za-z0-9_\-.]/g, "");
        updateForm({ codeId: filtered });
    }, [updateForm]);

    if (!open) return null;


    return(
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 830, maxWidth: '55%', backgroundColor: '#fff' }} >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h5 className="modal-title">분류 코드 {form.mode === 'Ins' ? '등록' : '수정'}</h5>
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
                                            <label htmlFor="roomName" className="form-label">
                                            시스템코드 <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <CommonSelect
                                                    comboId="systemCode"
                                                    comboName="systemCode"
                                                    className="form-select"
                                                    comboData={onData || []}
                                                    readOnly={form.mode !== 'Ins'}
                                                    disabled={form.mode !== 'Ins' ? true : false}
                                                    value={form.systemCode || ''}
                                                    onChange={(e) => updateForm({ systemCode: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="roomName" className="form-label">
                                            코드 <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                            <input
                                                id="codeId"
                                                name="codeId"
                                                placeholder='코드를 입력해주세요.'
                                                type='text'
                                                inputMode="email"
                                                className="form-control"
                                                value={form.codeId}
                                                readOnly={form.mode !== 'Ins'}
                                                disabled={form.mode !== 'Ins' ? true : false}
                                                onChange={handleCodeIdChange}
                                            />
                                            {form.mode === 'Ins' && (
                                                <button
                                                type="button"
                                                className="btn btn-primary btn-default__blue"
                                                onClick={onIdCheck}
                                                >
                                                중복체크
                                                </button>
                                            ) }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="roomName" className="form-label">
                                            코드명 <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    id="codeIdNm"
                                                    name="codeIdNm"
                                                    type='text'
                                                    className="form-control"
                                                    value={form.codeIdNm}
                                                    onChange={(e) => updateForm({codeIdNm: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-6">
                                        <div className="input-box">
                                        <label htmlFor="useAt">사용</label>
                                            <div className="input-group">
                                                <UseSwitch
                                                    value={form.useAt}
                                                    name="useAt"
                                                    onChange={updateForm}
                                                    onText="사용"
                                                    offText="사용안함"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="codeIdDc">설명</label>
                                            <div className="input-group">
                                            <input
                                                id="codeIdDc"
                                                name="codeIdDc"
                                                type='text'
                                                className="form-control"
                                                value={form.codeIdDc}
                                                onChange={(e) => updateForm({codeIdDc: e.target.value })}
                                            />
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
    )
}
export default CodeFormModal;