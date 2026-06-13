import React, { useCallback } from 'react';
import { useIdCheck } from '@/hooks/use-id-check.js';
import Switch from 'react-ios-switch';
import {CommonSelect} from '@/components/Common/Select.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import URL from '@/constants/URL.jsx';

const RoleFormModal = ({
    open, 
    form, 
    setForm,
    onData,
    onClose, 
    onSubmit
}) => {
     //ID 체크 
    const { handleIdCheck } = useIdCheck(URL.ROLE_ID_CHECK, '권한 코드를 입력해주세요.');
    const handleRoleIdCheck = useCallback(async () => {
        await handleIdCheck(form.roleId, setForm, { systemCode: form.systemCode });
    }, [form.roleId, form.systemCode, setForm, handleIdCheck]);

    // 1. 부모 컴포넌트 내부에서 상태 업데이트 함수 정의
    const updateForm = useCallback((payload) => {
        // 🔥 중요: 'prev'를 사용하여 기존의 모든 필드(아이디, 이름 등)를 유지함
        setForm((prev) => ({
            ...prev,    // 기존 값 복사
            ...payload  // 변경된 값(전화번호 등)만 덮어쓰기
        }));
    }, []); // 참조 고정

    if (!open) return null;

    return (
        <>
            <div className="modal-backdrop-custom" onClick={onClose} />
                <div className="modal-custom">
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: 560, maxWidth: '90%', backgroundColor:"#FFF" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h2 className="modal-title__title">{form.mode === 'Ins' ? '권한분류 등록' : '권한분류 수정'}</h2>
                                    <h3 className="modal-title__subtitle">관리자 및 사용자에 부여될 권한을 관리 합니다.</h3>
                                </div>
                                <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                            </div>

                            <div className="modal-body tab-content">
                                <div className="modal-body__content tab-pane show active">
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="roleId" className="form-label">
                                            권한 코드<span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                            <input
                                                type="text"
                                                id="roleId"
                                                name="roleId"
                                                className="form-control"
                                                value={form.roleId}
                                                readOnly={form.mode != 'Ins'}
                                                onChange={(e) => {
                                                    const filteredValue = e.target.value.replace(/[^a-zA-Z0-9`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g, '');
                                                    updateForm({ roleId: filteredValue });
                                                }}
                                                style={{ imeMode: 'inactive' }}
                                            />
                                            {  form.mode === "Ins" &&
                                                <button
                                                    type="button"
                                                    className="btn btn-primary btn-default__blue"
                                                    onClick={handleRoleIdCheck}
                                                    disabled={form.mode !== 'Ins'}
                                                >
                                                중복확인
                                                </button>
                                            }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="roleName" className="form-label">
                                            권한명<span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="roleName"
                                                name="roleName"
                                                className="form-control"
                                                value={form.roleName}
                                                onChange={(e) => updateForm({ roleName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="roleUserGubun" className="form-label">시스템 구분</label>
                                            <div className="input-group gap-2">
                                                <CommonSelect
                                                    comboId="systemCode"
                                                    comboName="systemCode"
                                                    className="form-select"
                                                    comboData={onData || []}
                                                    readOnly={form.mode != 'Ins'}
                                                    value={form.systemCode || ''}
                                                    onChange={(e) => updateForm({ systemCode: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">사용 유무</label>
                                            <div className="input-group gap-3 align-items-center">
                                                <UseSwitch
                                                    value={form.roleUseyn}
                                                    name="roleUseyn"
                                                    onChange={updateForm}
                                                    onText="사용"
                                                    offText="사용안함"
                                                />
                                                
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="roleDc" className="form-label">상세설명</label>
                                            <input
                                                type="text"
                                                id="roleDc"
                                                name="roleDc"
                                                className="form-control"
                                                value={form.roleDc}
                                                onChange={(e) => updateForm({ roleDc: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>
                                    취소
                                </button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>
                                    {form.mode === 'Ins' ? '등록' : '수정'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default RoleFormModal;