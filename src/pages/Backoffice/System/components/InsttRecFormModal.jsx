import React, { useCallback } from 'react';
import UseSwitch from "@/components/Common/IosSwitch.jsx";

const SETTINGS = [
    {
        name: 'useYn',
        label: '사용 여부',
        desc: '기관 연계 기능의 활성화 여부를 설정합니다.',
        onText: '사용',
        offText: '미사용',
    },
    {
        name: 'recUseyn',
        label: '녹취 사용',
        desc: '통화 녹취 기능의 활성화 여부를 설정합니다.',
        onText: '활성',
        offText: '비활성',
    },
    {
        name: 'sttUseyn',
        label: 'STT 사용',
        desc: '음성-텍스트 변환(STT) 기능의 활성화 여부를 설정합니다.',
        onText: '활성',
        offText: '비활성',
    },
    {
        name: 'smryYn',
        label: '요약 사용',
        desc: '통화 내용 AI 요약 기능의 활성화 여부를 설정합니다.',
        onText: '활성',
        offText: '비활성',
    },
];

const InsttRecFormModal = ({
    open,
    onClose,
    form,
    setForm,
    onSubmit
}) => {

    const updateForm = useCallback((payload) => {
        setForm((prev) => ({ ...prev, ...payload }));
    }, [setForm]);

    if (!open) return null;

    return (
        <>
            <div className="modal-backdrop-custom">
                <div className="modal-custom">
                    <div
                        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                        style={{ width: 560, maxWidth: '90%', backgroundColor: 'var(--bs-body-bg, #fff)' }}
                    >
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="modal-title">
                                    <h2 className="modal-title__title">
                                        {form.insttCode} 기관 연계 설정
                                    </h2>
                                </div>
                                <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                            </div>
                            <div className="modal-body">
                                <div className="modal-body__content" style={{ padding: '4px 0' }}>
                                    {SETTINGS.map((s, i) => (
                                        <div
                                            key={s.name}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '14px 20px',
                                                borderBottom: i < SETTINGS.length - 1 ? '1px solid rgba(128,128,128,0.2)' : 'none',
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'inherit', marginBottom: '3px' }}>
                                                    {s.label}
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'inherit', opacity: 0.6 }}>
                                                    {s.desc}
                                                </div>
                                            </div>
                                            <UseSwitch
                                                value={form[s.name]}
                                                name={s.name}
                                                onChange={updateForm}
                                                onText={s.onText}
                                                offText={s.offText}
                                            />
                                        </div>
                                    ))}
                                    {form.smryYn === 'Y' && (
                                        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(128,128,128,0.2)', background: 'rgba(128,128,128,0.05)' }}>
                                            <label
                                                htmlFor="longCallTime"
                                                style={{ fontSize: '13px', fontWeight: '600', color: 'inherit', marginBottom: '8px', display: 'block' }}
                                            >
                                                긴 통화 시간 허용
                                                <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>
                                                <span style={{ fontSize: '12px', color: 'inherit', opacity: 0.5, fontWeight: '400', marginLeft: '6px' }}>분(min) 단위</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="longCallTime"
                                                name="longCallTime"
                                                className="form-control"
                                                style={{ maxWidth: '220px' }}
                                                placeholder="통화 시간을 입력하세요"
                                                value={form.longCallTime}
                                                onChange={(e) => updateForm({ longCallTime: e.target.value })}
                                                autoComplete="off"
                                                min="0"
                                            />
                                        </div>
                                    )}
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
        </>
    );
};

export default InsttRecFormModal;
