import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
    centerId: '',
    tenantId: '',
    dnMajorId: '',
    dnSubId: '',
    mediaId: '',
    submediaId: '',
    dnModelname: '',
    dnIp: '',
    dnKind: '',
    dnType: '',
    dn: '',
    observerFlag: '1',
    monitorFlag: '',
    tag: '',
    dnServicedesc: '0',
    idCheck: 'N',
};

const DN_KIND_OPTIONS = [
    { value: '1', label: 'PSTN' },
    { value: '2', label: 'ARS' },
    { value: '3', label: 'PSTN + VoIP' },
    { value: '4', label: 'PSTN + Chat' },
    { value: '5', label: 'PSTN + eMail' },
    { value: '6', label: 'PSTN + Fax' },
    { value: '7', label: 'CITG' },
    { value: '8', label: 'ARS AUTH' },
];

const DN_TYPE_OPTIONS = [
    { value: '1', label: 'Normal Phone' },
    { value: '2', label: 'Digital Phone' },
    { value: '3', label: 'Virtual Phone' },
    { value: '4', label: 'ChatBot' },
];

// 콤보 fetch 래퍼
const fetchCombo = async (url, params) => {
    const res = await fnAjaxFetch({ url, method: 'GET', data: params, withCredentials: true });
    return res?.data?.result || [];
};

const CtiDnFormModal = ({ open, onClose, dn, rowData, onSuccess }) => {
    const isEdt = dn !== null && dn !== undefined;

    const [form, setForm] = useState(() =>
        isEdt && rowData
            ? {
                centerId: rowData.centerId || '',
                tenantId: rowData.tenantId || '',
                dnMajorId: rowData.dnmajorId || '',
                dnSubId: rowData.dnsubId || '',
                mediaId: rowData.mediaId || '',
                submediaId: rowData.submediaId || '',
                dnModelname: rowData.dnModelname || '',
                dnIp: rowData.dnIp || '',
                dnKind: rowData.dnKind || '',
                dnType: rowData.dnType || '',
                dn: rowData.dn || dn || '',
                observerFlag: String(rowData.observerFlag ?? '1'),
                monitorFlag: String(rowData.monitorFlag ?? ''),
                tag: rowData.tag || '',
                dnServicedesc: rowData.dnServicedesc || '0',
                idCheck: 'Y',
              }
            : EMPTY_FORM
    );

    // 콤보 옵션
    const [centerOptions, setCenterOptions] = useState([]);
    const [tenantOptions, setTenantOptions] = useState([]);
    const [majorOptions, setMajorOptions] = useState([]);
    const [subOptions, setSubOptions] = useState([]);
    const [mediaOptions, setMediaOptions] = useState([]);

    // 센터 콤보
    useEffect(() => {
        if (!open) return;
        let active = true;
        fetchCombo(URL.CTI_CENTER_COMBO, null)
            .then(list => {
                if (!active) return;
                setCenterOptions(list.map(o => ({ code: String(o.centerId), codeNm: o.centerName })));
            }).catch(() => {});
        return () => { active = false; };
    }, [open]);

    // 테넌트 콤보 (centerId 의존)
    useEffect(() => {
        if (!open || !form.centerId) return;
        let active = true;
        fetchCombo(`${URL.CTI_TENANT_COMBO}/${encodeURIComponent(form.centerId)}.do`, null)
            .then(list => {
                if (!active) return;
                setTenantOptions(list.map(o => ({ code: String(o.tenantId), codeNm: o.tenantName })));
            }).catch(() => {});
        return () => { active = false; setTenantOptions([]); };
    }, [open, form.centerId]);

    // 미디어 콤보 (centerId 의존)
    useEffect(() => {
        if (!open || !form.centerId) return;
        let active = true;
        fetchCombo(URL.CTI_MEDIA_COMBO, { centerId: form.centerId })
            .then(list => {
                if (!active) return;
                setMediaOptions(list.map(o => ({ code: String(o.mediaId), codeNm: o.mediaName })));
            }).catch(() => {});
        return () => { active = false; setMediaOptions([]); };
    }, [open, form.centerId]);

    // DN 대분류 콤보 (centerId + tenantId 의존)
    useEffect(() => {
        if (!open || !form.centerId || !form.tenantId) return;
        let active = true;
        fetchCombo(URL.CTI_DN_MAJOR_COMBO, { centerId: form.centerId, tenantId: form.tenantId })
            .then(list => {
                if (!active) return;
                setMajorOptions(list.map(o => ({ code: String(o.dnmajorId), codeNm: o.dnmajorName || o.dnmajorId })));
            }).catch(() => {});
        return () => { active = false; setMajorOptions([]); };
    }, [open, form.centerId, form.tenantId]);

    // DN 소분류 콤보 (centerId + tenantId + majorId 의존)
    useEffect(() => {
        if (!open || !form.centerId || !form.tenantId || !form.dnMajorId) return;
        let active = true;
        fetchCombo(URL.CTI_DN_SUB_COMBO, { centerId: form.centerId, tenantId: form.tenantId, dnmajorId: form.dnMajorId })
            .then(list => {
                if (!active) return;
                setSubOptions(list.map(o => ({ code: String(o.dnsubId), codeNm: o.dnsubName || o.dnsubId })));
            }).catch(() => {});
        return () => { active = false; setSubOptions([]); };
    }, [open, form.centerId, form.tenantId, form.dnMajorId]);

    // 연쇄 onChange 핸들러 (연쇄 초기화 포함)
    const handleCenterChange = useCallback((e) => {
        setForm(prev => ({ ...prev, centerId: e.target.value, tenantId: '', dnMajorId: '', dnSubId: '', mediaId: '' }));
    }, []);

    const handleTenantChange = useCallback((e) => {
        setForm(prev => ({ ...prev, tenantId: e.target.value, dnMajorId: '', dnSubId: '' }));
    }, []);

    const handleMajorChange = useCallback((e) => {
        setForm(prev => ({ ...prev, dnMajorId: e.target.value, dnSubId: '' }));
    }, []);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    // 중복확인
    const handleIdCheck = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: '지역을 선택해 주세요' }); return; }
        if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: '테넌트를 선택해 주세요' }); return; }
        if (!form.dn) { await Swal.fire({ icon: 'warning', text: 'DN을 입력해 주세요' }); return; }
        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_DN_ID_CHECK,
                method: 'POST',
                data: { centerId: form.centerId, tenantId: form.tenantId, dn: form.dn },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setForm(prev => ({ ...prev, idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '사용 가능한 DN입니다' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '이미 사용 중인 DN입니다' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form.centerId, form.tenantId, form.dn]);

    // 저장
    const handleSave = useCallback(async () => {
        if (!form.centerId) { await Swal.fire({ icon: 'warning', text: '지역을 선택해주세요.' }); return; }
        if (!form.tenantId) { await Swal.fire({ icon: 'warning', text: 'Tenant를 선택해주세요.' }); return; }
        if (!form.dnMajorId) { await Swal.fire({ icon: 'warning', text: 'DN 대분류를 선택해주세요.' }); return; }
        if (!form.dnSubId) { await Swal.fire({ icon: 'warning', text: 'DN 소분류를 선택해주세요.' }); return; }
        if (!form.mediaId) { await Swal.fire({ icon: 'warning', text: 'Media를 선택해주세요.' }); return; }
        if (!form.dn) { await Swal.fire({ icon: 'warning', text: 'DN을 입력해주세요.' }); return; }

        const action = isEdt ? '수정' : '등록';
        const ok = await Swal.fire({
            icon: 'question',
            title: `DN ${action}`,
            html: `DN을 <b>${action}</b> 하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니요',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        const nvl = (v, def = '0') => (v === '' || v === null || v === undefined) ? def : v;

        try {
            const res = await fnAjaxFetch({
                url: URL.CTI_DN_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    centerId: form.centerId,
                    tenantId: form.tenantId,
                    dnmajorId: form.dnMajorId,
                    dnsubId: form.dnSubId,
                    dn: form.dn,
                    mediaId: form.mediaId,
                    submediaId: nvl(form.submediaId),
                    dnModelname: form.dnModelname,
                    dnServicedesc: nvl(form.dnServicedesc),
                    dnKind: form.dnKind,
                    dnType: form.dnType,
                    dnIp: form.dnIp,
                    observerFlag: nvl(form.observerFlag),
                    monitorFlag: nvl(form.monitorFlag),
                    tag: nvl(form.tag),
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}되었습니다` });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', title: '오류', text: json?.MESSAGE || '처리 중 문제가 발생했습니다' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 760, maxWidth: '95%', backgroundColor: 'var(--bs-body-bg, #fff)' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">DN {isEdt ? '수정' : '등록'}</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* 센터 / 테넌트 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="ctiCenterId" className="form-label">
                                                센터 <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="ctiCenterId" name="centerId"
                                                className="form-select"
                                                value={form.centerId}
                                                onChange={handleCenterChange}
                                            >
                                                <option value="">선택</option>
                                                {centerOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {form.centerId && (
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="ctiTenantId" className="form-label">
                                                    테넌트ID <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    id="ctiTenantId" name="tenantId"
                                                    className="form-select"
                                                    value={form.tenantId}
                                                    onChange={handleTenantChange}
                                                >
                                                    <option value="">없음</option>
                                                    {tenantOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {/* DN 대분류 / 소분류 */}
                                    {form.tenantId && (
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="dnMajorId" className="form-label">
                                                    DN 대분류 <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    id="dnMajorId" name="dnMajorId"
                                                    className="form-select"
                                                    value={form.dnMajorId}
                                                    onChange={handleMajorChange}
                                                >
                                                    <option value="">없음</option>
                                                    {majorOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {form.dnMajorId && (
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label htmlFor="dnSubId" className="form-label">
                                                    DN 소분류 <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    id="dnSubId" name="dnSubId"
                                                    className="form-select"
                                                    value={form.dnSubId}
                                                    onChange={updateForm}
                                                >
                                                    <option value="">없음</option>
                                                    {subOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    {/* 주 미디어 / 부미디어 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnMediaId" className="form-label">
                                                주 미디어 <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="dnMediaId" name="mediaId"
                                                className="form-select"
                                                value={form.mediaId}
                                                onChange={updateForm}
                                            >
                                                <option value="">없음</option>
                                                {mediaOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="submediaId" className="form-label">부미디어</label>
                                            <input
                                                id="submediaId" name="submediaId"
                                                type="number" className="form-control"
                                                value={form.submediaId}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* 모델명 / IP */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnModelname" className="form-label">모델명</label>
                                            <input
                                                id="dnModelname" name="dnModelname"
                                                type="text" className="form-control"
                                                value={form.dnModelname}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnIp" className="form-label">IP</label>
                                            <input
                                                id="dnIp" name="dnIp"
                                                type="number" className="form-control"
                                                value={form.dnIp}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* DN 종류 / DNType */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnKind" className="form-label">DN 종류</label>
                                            <select
                                                id="dnKind" name="dnKind"
                                                className="form-select"
                                                value={form.dnKind}
                                                onChange={updateForm}
                                            >
                                                <option value="">없음</option>
                                                {DN_KIND_OPTIONS.map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dnType" className="form-label">DNType</label>
                                            <select
                                                id="dnType" name="dnType"
                                                className="form-select"
                                                value={form.dnType}
                                                onChange={updateForm}
                                            >
                                                <option value="">없음</option>
                                                {DN_TYPE_OPTIONS.map(o => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* DN / 감청설정 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="dn" className="form-label">
                                                DN <span className="text-danger">*</span>
                                            </label>
                                            {isEdt ? (
                                                <input
                                                    id="dn" type="text" className="form-control"
                                                    value={form.dn} readOnly
                                                />
                                            ) : (
                                                <div className="input-group">
                                                    <input
                                                        id="dn" name="dn"
                                                        type="text" className="form-control"
                                                        placeholder="숫자만 입력"
                                                        value={form.dn}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/[^0-9]/g, '');
                                                            setForm(prev => ({ ...prev, dn: v, idCheck: 'N' }));
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-default__blue"
                                                        onClick={handleIdCheck}
                                                    >
                                                        중복확인
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">감청설정</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.observerFlag === '1' ? 'Y' : 'N'}
                                                    name="observerFlag"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, observerFlag: payload.observerFlag === 'Y' ? '1' : '0' }))}
                                                    onText="사용"
                                                    offText="사용 안함"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* 감시 / tag */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="monitorFlag" className="form-label">감시</label>
                                            <select
                                                id="monitorFlag" name="monitorFlag"
                                                className="form-select"
                                                value={form.monitorFlag}
                                                onChange={updateForm}
                                            >
                                                <option value="">없음</option>
                                                <option value="1">감시</option>
                                                <option value="0">감시안함</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="tag" className="form-label">tag</label>
                                            <input
                                                id="tag" name="tag"
                                                type="text" className="form-control"
                                                value={form.tag}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/[^0-9]/g, '');
                                                    setForm(prev => ({ ...prev, tag: v }));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CtiDnFormModal;
