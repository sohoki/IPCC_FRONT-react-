import React, { useCallback } from 'react';
import { useIdCheck } from '@/hooks/use-id-check.js';
import URL from '@/constants/URL.jsx';
import CODE from '@/constants/CODE.jsx';
import MarkdownEditor from '@/components/Common/MarkdownEditor.jsx';

const ProgramModal = ({
    open, 
    onClose,
    form,
    setForm,
    onSubmit,
}) => {
    const { handleIdCheck } = useIdCheck(URL.PROGRAM_ID_CHECK, '프로그램 코드');

    const onCheckId = useCallback(async () => {
        await handleIdCheck(form.progrmFileNm, setForm);
    }, [form.progrmFileNm, setForm, handleIdCheck]);
    
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
            <div className="modal-backdrop-custom" >
                <div className="modal-custom">
                    <div
                        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                        style={{ width: 800, maxWidth: '55%', backgroundColor: '#fff' }}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h2 className="modal-title__title">프로그램 {form.mode === 'Ins' ? '등록' :  form.mode === 'Edt'? '수정' : '복사'}</h2>
                                </div>
                                <button type="button" className="modal-close" aria-label="Close" onClick={onClose}></button>
                            </div>
                            <div className="modal-body">
                                <div className="modal-body__content">
                                    <div className="row input-box-wrap">
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="comCode" className="form-label">프로그램명 <span className="text-danger">*</span></label>
                                                <div className="d-flex align-items-center date-range">
                                                    <div className="input-group">
                                                        <input
                                                            id="progrmFileNm"
                                                            name="progrmFileNm"
                                                            placeholder='코드를 입력해주세요.'
                                                            type='text'
                                                            inputMode="email"
                                                            className="form-control"
                                                            value={form.progrmFileNm ?? ''}
                                                            readOnly={form.mode !== 'Ins'}
                                                            onChange={(e) => updateForm({progrmFileNm: e.target.value })}
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
                                                <label htmlFor="progrmKoreannm" className="form-label">한글명<span className="text-danger">*</span></label>
                                                <div className="d-flex align-items-center date-range">
                                                    <input
                                                        id="progrmKoreannm"
                                                        name="progrmKoreannm"
                                                        type='text'
                                                        value={form.progrmKoreannm}
                                                        className="form-control"
                                                        onChange={(e) => updateForm({progrmKoreannm: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="progrmStrePath">저장 경로</label>
                                                <div className="d-flex align-items-center date-range">
                                                    <input
                                                        id="progrmStrePath"
                                                        name="progrmStrePath"
                                                        type='text'
                                                        value={form.progrmStrePath}
                                                        className="form-control"
                                                        onChange={(e) => updateForm({progrmStrePath: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                            <label htmlFor="url">URL</label>
                                                <div className="d-flex align-items-center date-range">
                                                    <input
                                                        id="url"
                                                        name="url"
                                                        type='text'
                                                        className="form-control"
                                                        value={form.url}
                                                        onChange={(e) => updateForm({url: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="input-box">
                                                <MarkdownEditor
                                                    id="progrmDc"
                                                    label="프로그램 설명"
                                                    value={form.progrmDc ?? ''}
                                                    onChange={(val) => updateForm({ progrmDc: val })}
                                                    height={280}
                                                    preview="live"
                                                    placeholder="프로그램 설명에 마크다운 지원 합니다."
                                                />
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
            {/* 스타일(원하면 CSS로 이동) */}
            <style>{`
                .modal-backdrop-custom{ position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1040; }
                .modal-custom{ position:fixed; inset:0; z-index:1050; display:flex; align-items:center; justify-content:center; }
            `}</style>
        </>
    );
};
export default ProgramModal;
