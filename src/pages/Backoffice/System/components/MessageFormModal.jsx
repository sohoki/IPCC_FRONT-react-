import React, { useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import URL from '@/constants/URL.jsx';
import { useIdCheck } from '@/hooks/use-id-check.js';
import { useRadioGroup } from '@/hooks/use-form.jsx';

const EXCHANGE_TYPES = [
    { value: 'direct',  label: 'Direct' },
    { value: 'fanout',  label: 'Fanout' },
    { value: 'topic',   label: 'Topic' },
    { value: 'headers', label: 'Headers' },
];

const MessageFormModal = ({ open, onClose, form, setForm, onSubmit }) => {
    const { handleIdCheck } = useIdCheck(URL.QUEUE_ID_CHECK, 'Queue 이름');
    const { renderRadioGroup } = useRadioGroup(form, setForm);

    // gubun 변경 시 type 기본값 리셋 (queue: 'N' / exchange: 'direct')
    useEffect(() => {
        if (!open) return;
        setForm(prev => ({
            ...prev,
            type: prev.gubun === 'exchange'
                ? (['direct', 'fanout', 'topic', 'headers'].includes(prev.type) ? prev.type : 'direct')
                : ((prev.type === 'Y' || prev.type === 'N') ? prev.type : 'N'),
        }));
    }, [form.gubun, open]); // eslint-disable-line react-hooks/exhaustive-deps

    const onCheckId = useCallback(async () => {
        await handleIdCheck(form.queue, setForm);
    }, [form.queue, setForm, handleIdCheck]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'queue' ? { idCheck: 'N' } : {}),
        }));
    }, [setForm]);

    const handleValidatedSubmit = useCallback(async () => {
        if (form.gubun === 'queue') {
            if (!form.queue?.trim()) {
                await Swal.fire({ icon: 'warning', text: 'Queue 이름을 입력해 주세요.' });
                return;
            }
            if (form.idCheck !== 'Y') {
                await Swal.fire({ icon: 'warning', text: 'Queue 이름 중복확인을 해주세요.' });
                return;
            }
        } else {
            if (!form.processNm?.trim()) {
                await Swal.fire({ icon: 'warning', text: 'Exchange 이름을 입력해 주세요.' });
                return;
            }
        }
        onSubmit();
    }, [form, onSubmit]);

    if (!open) return null;

    const isQueue = form.gubun === 'queue';
    const modalTitle = isQueue ? 'Queue 등록' : 'Exchange 등록';

    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 500, maxWidth: '90%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">{modalTitle}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* 유형: Queue / Exchange */}
                                    {renderRadioGroup({
                                        label: '유형',
                                        name: 'gubun',
                                        options: [
                                            { value: 'queue',    text: 'Queue' },
                                            { value: 'exchange', text: 'Exchange' },
                                        ],
                                        col: 'col-12',
                                        useSwitch: false,
                                    })}

                                    {/* 이름 입력 — gubun에 따라 다름 */}
                                    {isQueue ? (
                                        <div className="col-12">
                                            <div className="input-box">
                                                <label htmlFor="queue" className="form-label">
                                                    Queue 이름 <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        id="queue"
                                                        name="queue"
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Queue 이름을 입력해 주세요."
                                                        value={form.queue ?? ''}
                                                        onChange={updateForm}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-default__blue"
                                                        onClick={onCheckId}
                                                    >
                                                        중복확인
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="col-12">
                                            <div className="input-box">
                                                <label htmlFor="processNm" className="form-label">
                                                    Exchange 이름 <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    id="processNm"
                                                    name="processNm"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Exchange 이름을 입력해 주세요."
                                                    value={form.processNm ?? ''}
                                                    onChange={updateForm}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* 내구성 (Durable) */}
                                    {renderRadioGroup({
                                        label: '내구성(Durable)',
                                        name: 'routingKey',
                                        options: [
                                            { value: 'Y', text: '영구' },
                                            { value: 'N', text: '일시' },
                                        ],
                                        col: 'col-12',
                                        useSwitch: true,
                                    })}

                                    {/* 자동삭제 — queue: type 필드 / exchange: autoDel 필드 */}
                                    {renderRadioGroup({
                                        label: '자동삭제(Auto Delete)',
                                        name: isQueue ? 'type' : 'autoDel',
                                        options: [
                                            { value: 'Y', text: '자동' },
                                            { value: 'N', text: '수동' },
                                        ],
                                        col: 'col-12',
                                        useSwitch: true,
                                    })}

                                    {/* Exchange 유형 — exchange일 때만 */}
                                    {!isQueue && (
                                        <div className="col-12">
                                            <div className="input-box">
                                                <label htmlFor="type" className="form-label">Exchange 유형</label>
                                                <select
                                                    id="type"
                                                    name="type"
                                                    className="form-select"
                                                    value={form.type ?? 'direct'}
                                                    onChange={updateForm}
                                                >
                                                    {EXCHANGE_TYPES.map(({ value, label }) => (
                                                        <option key={value} value={value}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* 사용여부 */}
                                    {renderRadioGroup({
                                        label: '사용여부',
                                        name: 'useAt',
                                        options: [
                                            { value: 'Y', text: '사용' },
                                            { value: 'N', text: '미사용' },
                                        ],
                                        col: 'col-12',
                                        useSwitch: true,
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleValidatedSubmit}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageFormModal;
