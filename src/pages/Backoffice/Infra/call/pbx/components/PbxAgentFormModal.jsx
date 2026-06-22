import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData, useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';

const EMPTY_ADD_ROW = { pbxSnType: '', pbxSnIndex: '', pbxSrType: '', pbxSrIndex: '' };

const PbxAgentFormModal = ({ open, onClose, loginId, onSuccess }) => {
    const isEdt = loginId !== null && loginId !== undefined;

    const [form, setForm] = useState(
        isEdt ? { loginId, name: '', idCheck: 'Y' } : { loginId: '', name: '', idCheck: 'N' }
    );
    const [scenRows, setScenRows] = useState([]);
    const [addRow, setAddRow] = useState(EMPTY_ADD_ROW);
    const [idSetupMode, setIdSetupMode] = useState(null); // null | 'auto' | 'manual'
    const [insttCode, setInsttCode] = useState('');

    const { options: pbxSnOptions } = useCommonCodeData('PBX_SN');
    const { options: pbxIndexOptions } = useCommonCodeData('PBX_INDEX');
    const { options: insttOptions } = useCustomReqDataCombo({
        url: URL.INSTT_COMBO,
        method: 'POST',
        mapping: { id: 'insttCode', text: 'allInsttNm' },
    });

    useEffect(() => {
        if (!open || !isEdt || !loginId) return;
        let active = true;
        fnAjaxFetch({
            url: `${URL.AGENT_INFO}/${encodeURIComponent(loginId)}.do`,
            method: 'GET',
            withCredentials: true,
        }).then(res => {
            if (!active) return;
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                const detail = json.result || {};
                setForm(prev => ({ ...prev, name: detail.name || '' }));
                const allScen = detail.scenInfos || [];
                const snEntries = allScen.filter(s => s.scenGubun === 'SN');
                const srEntries = allScen.filter(s => s.scenGubun === 'SR');
                setScenRows(snEntries.map(sn => {
                    const sr = srEntries.find(s => s.scenPosition === sn.scenPosition);
                    return {
                        _id: Date.now() + Math.random(),
                        pbxSnType: sn.scenValue || '',
                        pbxSnIndex: sn.scenPosition || '',
                        pbxSrType: sr?.scenValue || '',
                        pbxSrIndex: sr?.scenPosition || '',
                    };
                }));
            }
        }).catch(() => {});
        return () => { active = false; };
    }, [open, loginId, isEdt]);

    const handleShowChoice = useCallback(async () => {
        const result = await Swal.fire({
            title: '번호설정',
            text: '번호 설정 방식을 선택하세요',
            showConfirmButton: true,
            confirmButtonText: '자동생성',
            showDenyButton: true,
            denyButtonText: '중복확인',
            showCancelButton: true,
            cancelButtonText: '취소',
        });
        if (result.isConfirmed) setIdSetupMode('auto');
        else if (result.isDenied) setIdSetupMode('manual');
    }, []);

    const handleAutoGenerate = useCallback(async () => {
        if (!insttCode) {
            await Swal.fire({ icon: 'warning', text: 'Agent를 생성할 기관을 선택해 주세요' });
            return;
        }
        try {
            const res = await fnAjaxFetch({
                url: `${URL.AGENT_RANDOM}/${encodeURIComponent(insttCode)}.do`,
                method: 'GET',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setForm(prev => ({ ...prev, loginId: String(json.result), idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '자동 생성되었습니다' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'error', text: 'Agent 생성이 초과되었습니다. 기관 메뉴에서 Agent 범위 및 에이전트를 확인해 주세요' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [insttCode]);

    const handleManualCheck = useCallback(async () => {
        if (!form.loginId) {
            await Swal.fire({ icon: 'warning', text: '에이전트 번호를 입력해 주세요' });
            return;
        }
        try {
            const res = await fnAjaxFetch({
                url: `${URL.AGENT_ID_CHECK}/${encodeURIComponent(form.loginId)}.do`,
                method: 'GET',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS') {
                setForm(prev => ({ ...prev, idCheck: 'Y' }));
                await Swal.fire({ icon: 'success', text: json?.MESSAGE || '사용 가능한 번호입니다' });
            } else {
                setForm(prev => ({ ...prev, idCheck: 'N' }));
                await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '이미 사용 중인 번호입니다' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form.loginId]);

    const updateAddRow = useCallback((field, value) => {
        setAddRow(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'pbxSnIndex') next.pbxSrIndex = value;
            return next;
        });
    }, []);

    const handleAddScenRow = useCallback(async () => {
        if (!addRow.pbxSnType) { await Swal.fire({ icon: 'warning', text: '시나리오 번호를 선택해 주세요' }); return; }
        if (!addRow.pbxSnIndex) { await Swal.fire({ icon: 'warning', text: '시나리오 인덱스를 선택해 주세요' }); return; }
        if (!addRow.pbxSrType) { await Swal.fire({ icon: 'warning', text: '시나리오 레벨을 선택해 주세요' }); return; }
        if (!addRow.pbxSrIndex) { await Swal.fire({ icon: 'warning', text: '시나리오 레벨 인덱스를 선택해 주세요' }); return; }
        if (scenRows.some(r => r.pbxSnType === addRow.pbxSnType)) {
            await Swal.fire({ icon: 'warning', text: '이미 등록된 시나리오 번호입니다' });
            return;
        }
        setScenRows(prev => [...prev, { ...addRow, _id: Date.now() + Math.random() }]);
        setAddRow(EMPTY_ADD_ROW);
    }, [addRow, scenRows]);

    const handleDeleteScenRow = useCallback((_id) => {
        setScenRows(prev => prev.filter(r => r._id !== _id));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.loginId) {
            await Swal.fire({ icon: 'warning', text: '에이전트 번호를 입력해 주세요' });
            return;
        }
        const action = isEdt ? '수정' : '등록';
        const ok = await Swal.fire({
            icon: 'question',
            title: `에이전트 ${action}`,
            html: `에이전트를 <b>${action}</b> 하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니요',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.AGENT_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    loginId: form.loginId,
                    name: form.name,
                    scenInfos: scenRows.flatMap(r => [
                        { scenGubun: 'SN', scenValue: r.pbxSnType, scenPosition: r.pbxSnIndex },
                        { scenGubun: 'SR', scenValue: r.pbxSrType, scenPosition: r.pbxSrIndex },
                    ]),
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
    }, [form, scenRows, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 800, maxWidth: '95%', backgroundColor: 'var(--bs-body-bg, #fff)' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">
                                    에이전트 {isEdt ? '수정' : '등록'}
                                </h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* Login ID */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="agentLoginId" className="form-label">
                                                Login ID <span className="text-danger">*</span>
                                            </label>
                                            {isEdt ? (
                                                <input
                                                    id="agentLoginId"
                                                    type="text"
                                                    className="form-control"
                                                    value={form.loginId}
                                                    readOnly
                                                />
                                            ) : (
                                                <div className="input-group">
                                                    <input
                                                        id="agentLoginId"
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="숫자 최대 8자리"
                                                        maxLength={8}
                                                        value={form.loginId}
                                                        readOnly={idSetupMode === 'auto' && form.idCheck === 'Y'}
                                                        onChange={(e) => {
                                                            const v = e.target.value.replace(/[^0-9]/g, '');
                                                            setForm(prev => ({ ...prev, loginId: v, idCheck: 'N' }));
                                                        }}
                                                    />
                                                    {idSetupMode === 'auto' && (
                                                        <select
                                                            className="form-select"
                                                            style={{ maxWidth: 130 }}
                                                            value={insttCode}
                                                            onChange={e => setInsttCode(e.target.value)}
                                                        >
                                                            <option value="">기관 선택</option>
                                                            {insttOptions.map(o => (
                                                                <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="btn btn-primary btn-default__blue"
                                                        onClick={
                                                            idSetupMode === null ? handleShowChoice
                                                            : idSetupMode === 'auto' ? handleAutoGenerate
                                                            : handleManualCheck
                                                        }
                                                    >
                                                        {idSetupMode === null ? '번호설정'
                                                            : idSetupMode === 'auto' ? '자동생성'
                                                            : '중복확인'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {/* 이름 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="agentName" className="form-label">이름</label>
                                            <input
                                                id="agentName"
                                                type="text"
                                                className="form-control"
                                                placeholder="이름을 입력해주세요."
                                                value={form.name}
                                                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    {/* 비상 스킬 */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">비상 스킬</label>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table
                                                    className="content-table__sub"
                                                    style={{ width: '100%', minWidth: 600, tableLayout: 'fixed', borderCollapse: 'collapse' }}
                                                >
                                                    <thead>
                                                        <tr>
                                                            <th>SN</th>
                                                            <th>SN INDEX</th>
                                                            <th>SR</th>
                                                            <th>SR INDEX</th>
                                                            <th style={{ width: 70 }}>삭제</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {scenRows.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={5} className="text-center text-muted py-2">
                                                                    등록된 스킬이 없습니다.
                                                                </td>
                                                            </tr>
                                                        ) : scenRows.map(row => (
                                                            <tr key={row._id}>
                                                                <td>{row.pbxSnType}</td>
                                                                <td>{row.pbxSnIndex}</td>
                                                                <td>{row.pbxSrType}</td>
                                                                <td>{row.pbxSrIndex}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger"
                                                                        style={{ width: '80%' }}
                                                                        onClick={() => handleDeleteScenRow(row._id)}
                                                                    >
                                                                        삭제
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            {/* 스킬 추가 행 */}
                                            <div className="d-flex gap-2 mt-2 flex-wrap align-items-center">
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 130 }}
                                                    value={addRow.pbxSnType}
                                                    onChange={e => updateAddRow('pbxSnType', e.target.value)}
                                                >
                                                    <option value="">SN 선택</option>
                                                    {pbxSnOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 130 }}
                                                    value={addRow.pbxSnIndex}
                                                    onChange={e => updateAddRow('pbxSnIndex', e.target.value)}
                                                >
                                                    <option value="">SN INDEX</option>
                                                    {pbxIndexOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 100 }}
                                                    value={addRow.pbxSrType}
                                                    onChange={e => updateAddRow('pbxSrType', e.target.value)}
                                                >
                                                    <option value="">SR 선택</option>
                                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                                        <option key={n} value={String(n)}>{n}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: 130 }}
                                                    value={addRow.pbxSrIndex}
                                                    onChange={e => updateAddRow('pbxSrIndex', e.target.value)}
                                                >
                                                    <option value="">SR INDEX</option>
                                                    {pbxIndexOptions.map(o => (
                                                        <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-primary"
                                                    onClick={handleAddScenRow}
                                                >
                                                    추가
                                                </button>
                                            </div>
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

export default PbxAgentFormModal;
