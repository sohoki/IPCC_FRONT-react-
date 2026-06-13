import React, { useCallback, useEffect, useMemo, useState } from 'react';
import URL from '@/constants/URL.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useIdCheck } from '@/hooks/use-id-check.js';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import { useFileUpload } from '@/hooks/use-file-upload.js';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import '@/style/DropZone.css';

const SystemFormModal = ({ open, onClose, form, setForm, onSubmit, queueSystemCode }) => {
    const { handleIdCheck } = useIdCheck(URL.SYSTEM_ID_CHECK, '시스템 코드');

    const { options: systemGubunOptions } = useCommonCodeData('SYSTEM_GUBUN');
    const { options: menuGubunOptions }   = useCommonCodeData('MENU_GUBUN');
    const { options: conLevelOptions }    = useCommonCodeData('CON_LEVEL');

    const [queueOptions, setQueueOptions] = useState([]);
    const [iconFile,    setIconFile]    = useState(null);
    const [iconPreview, setIconPreview] = useState(null);

    useEffect(() => {
        let active = true;
        Promise.resolve().then(() => {
            if (!open) {
                setQueueOptions([]);
                setIconFile(null);
                setIconPreview(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
                return;
            }
            fnAjaxFetch({
                url: URL.QUEUE_COMBO_LIST,
                method: 'POST',
                data: { systemCode: queueSystemCode },
                withCredentials: true,
            }).then(res => {
                if (!active) return;
                const list = res?.data?.resultList || res?.data?.result?.resultList || [];
                setQueueOptions(list.map(q => ({ code: q.queueNm, codeNm: q.queueNm })));
            }).catch(() => {});
        });
        return () => { active = false; };
    }, [open, queueSystemCode]);

    const updateIcon = useCallback((payload) => {
        const file = payload.relateImage;
        setIconPreview(prev => { if (prev) URL.revokeObjectURL(prev); return file ? URL.createObjectURL(file) : null; });
        setIconFile(file || null);
        setForm(prev => ({ ...prev, relateImage: file || null }));
    }, [setForm]);

    const { getRootProps, getInputProps, isDragActive, clearFile } = useFileUpload({
        fieldName: 'relateImage',
        updateForm: updateIcon,
        fileValue: iconFile,
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'] },
    });

    const onCheckId = useCallback(async () => {
        await handleIdCheck(form.systemCode, setForm);
    }, [form.systemCode, setForm, handleIdCheck]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        const filtered = name === 'systemCode' ? value.replace(/[^a-zA-Z0-9]/g, '') : value;
        setForm(prev => ({
            ...prev,
            [name]: filtered,
            ...(name === 'systemCode' ? { idCheck: 'N' } : {}),
        }));
    }, [setForm]);

    const selectedLevels = useMemo(() => {
        if (!form.systemConnLevel) return new Set();
        return new Set(form.systemConnLevel.split(',').filter(Boolean));
    }, [form.systemConnLevel]);

    const handleLevelCheck = useCallback((code) => {
        setForm(prev => {
            const set = new Set((prev.systemConnLevel || '').split(',').filter(Boolean));
            if (set.has(code)) set.delete(code); else set.add(code);
            return { ...prev, systemConnLevel: [...set].join(',') };
        });
    }, [setForm]);

    if (!open) return null;
    return (
        <>
            <div className="modal-backdrop-custom" onClick={onClose} />
            <div className="modal-custom" style={{ paddingTop: '4vh', paddingBottom: '4vh', overflowY: 'auto' }}>
                <div
                    className="modal-dialog modal-dialog-scrollable"
                    style={{ width: 700, maxWidth: '95%', margin: 'auto', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', maxHeight: '92vh' }}
                >
                    <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                        <div className="modal-header" style={{ flexShrink: 0 }}>
                            <div className="modal-title">
                                <h2 className="modal-title__title">
                                    시스템 정보 {form.mode === 'Ins' ? '등록' : '수정'}
                                </h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>

                        <div className="modal-body tab-content" style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
                            <div className="modal-body__content tab-pane show active">
                                <div className="row input-box-wrap">

                                    {/* 시스템 분류 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="systemGubun" className="form-label">
                                                 시스템 분류 <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="systemGubun" name="systemGubun"
                                                className="form-select"
                                                value={form.systemGubun ?? ''}
                                                onChange={updateForm}
                                            >
                                                <option value="">선택</option>
                                                {systemGubunOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 시스템 코드 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="systemCode" className="form-label">
                                                시스템 코드 <span className="text-danger">*</span>
                                            </label>
                                            {form.mode === 'Ins' ? (
                                                <div className="input-group">
                                                    <input
                                                        id="systemCode" name="systemCode"
                                                        type="text" className="form-control"
                                                        placeholder="영문 대문자 최대 4자리"
                                                        maxLength={4}
                                                        readOnly={form.mode !== 'Ins'}
                                                        disabled={form.mode !== 'Ins' ? true : false}
                                                        style={{ textTransform: 'uppercase' }}
                                                        value={form.systemCode ?? ''}
                                                        onChange={updateForm}
                                                    />
                                                    <button type="button" className="btn btn-primary btn-action__blue" onClick={onCheckId}>
                                                        중복확인
                                                    </button>
                                                </div>
                                            ) : (
                                                <input
                                                    id="systemCode" name="systemCode"
                                                    type="text" className="form-control"
                                                    value={form.systemCode ?? ''}
                                                    readOnly
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* 시스템명 */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="systemName" className="form-label">
                                               시스템명 <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="systemName" name="systemName"
                                                type="text" className="form-control"
                                                placeholder="시스템명을 입력해주세요."
                                                value={form.systemName ?? ''}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>

                                    {/* 연동 범위 — 카드 칩 */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">연동 범위</label>
                                            <div style={{
                                                border: '1px dashed #cbd5e1', borderRadius: 8,
                                                padding: '12px 16px', background: '#f8fafc',
                                                minHeight: 56, display: 'flex', flexWrap: 'wrap',
                                                gap: 10, alignItems: 'center',
                                            }}>
                                                {conLevelOptions.length === 0 ? (
                                                    <span style={{ fontSize: 12, color: '#94a3b8' }}>⏳ 로딩 중...</span>
                                                ) : conLevelOptions.map(o => {
                                                    const checked = selectedLevels.has(o.code);
                                                    return (
                                                        <button
                                                            key={o.code}
                                                            type="button"
                                                            onClick={() => handleLevelCheck(o.code)}
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                                                                border: checked ? '1.5px solid #3b82f6' : '1.5px solid #cbd5e1',
                                                                background: checked ? '#eff6ff' : '#fff',
                                                                color: checked ? '#2563eb' : '#64748b',
                                                                fontSize: 13, fontWeight: checked ? 600 : 400,
                                                                boxShadow: checked ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
                                                                transition: 'all 0.15s',
                                                            }}
                                                        >
                                                            <span style={{ fontSize: 15 }}>🔗</span>
                                                            {o.codeNm}
                                                            {checked && (
                                                                <span style={{
                                                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                    width: 16, height: 16, borderRadius: '50%',
                                                                    background: '#3b82f6', color: '#fff', fontSize: 10, fontWeight: 700,
                                                                }}>✓</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 시스템 토큰 Key */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="systemTokenKey" className="form-label">시스템 토큰 Key</label>
                                            <input
                                                id="systemTokenKey" name="systemTokenKey"
                                                type="text" className="form-control"
                                                placeholder="토큰 Key를 입력해주세요."
                                                value={form.systemTokenKey ?? ''}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>

                                    {/* 시스템 ICON / 메뉴 구분 / 사용 유무 — 한 줄 */}
                                    <div className="col-4">
                                        <div className="input-box">
                                            <label className="form-label">시스템 ICON</label>
                                            <div
                                                {...getRootProps()}
                                                className={`dropzone-box${isDragActive ? ' active' : ''}${iconFile ? ' has-file' : ''}`}
                                                style={{ height: 38, minHeight: 'unset', padding: '0 10px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                            >
                                                <input {...getInputProps()} />
                                                <div style={{ width: 26, height: 26, borderRadius: 4, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                                    {(iconPreview || form.relateImage) ? (
                                                        <img src={iconPreview || form.relateImage} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <span style={{ fontSize: 13, color: '#cbd5e1' }}>🖼️</span>
                                                    )}
                                                </div>
                                                <span style={{ flex: 1, fontSize: 11, color: iconFile ? '#475569' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {iconFile ? iconFile.name : '클릭 / 드래그'}
                                                </span>
                                                {iconFile && (
                                                    <button
                                                        type="button"
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 18, lineHeight: 1, padding: 0, cursor: 'pointer', flexShrink: 0 }}
                                                        onClick={(e) => { e.stopPropagation(); clearFile(e); setIconFile(null); setIconPreview(null); setForm(prev => ({ ...prev, relateImage: null })); }}
                                                    >×</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="input-box">
                                            <label htmlFor="systemMenugubun" className="form-label">메뉴 구분</label>
                                            <select
                                                id="systemMenugubun" name="systemMenugubun"
                                                className="form-select"
                                                value={form.systemMenugubun ?? ''}
                                                onChange={updateForm}
                                            >
                                                <option value="">선택</option>
                                                {menuGubunOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="input-box">
                                            <label className="form-label">사용유무</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.systemUseyn ?? 'Y'}
                                                    name="systemUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, systemUseyn: payload.systemUseyn }))}
                                                    onText="사용"
                                                    offText="사용 사함"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 연동 QUEUE */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="systemQueue" className="form-label">연동 QUEUE 정보</label>
                                            <select
                                                id="systemQueue" name="systemQueue"
                                                className="form-select"
                                                value={form.systemQueue ?? ''}
                                                onChange={updateForm}
                                            >
                                                <option value="">없음</option>
                                                {queueOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 설명 */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="systemDc" className="form-label">설명</label>
                                            <textarea
                                                id="systemDc" name="systemDc"
                                                className="form-control"
                                                rows={4}
                                                placeholder="설명을 입력해주세요."
                                                value={form.systemDc ?? ''}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ flexShrink: 0 }}>
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SystemFormModal;
