import React, { useState, useCallback, useEffect } from 'react';
import Swal from 'sweetalert2';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
    serverCode: '',
    systemCode: '',
    serverName: '',
    serverIp: '',
    serverPort: '',
    serverMethod: '',
    comCodeNumber: '',
    serverId: '',
    serverPassword: '',
    serverUseyn: 'Y',
    serverLocationInfo: '',
    serverDc: '',
};

const ServerFormModal = ({
    open, 
    onClose, 
    serverCode, 
    rowData, 
    onSuccess,
    serverMethodOptions = [], systemOptions = [], companyOptions = [],
}) => {
    const isEdt = serverCode !== null && serverCode !== undefined;
    const [form, setForm] = useState(EMPTY_FORM);

    //console.log('ServerFormModal rendered with props:', { open, serverCode, rowData, serverMethodOptions, systemOptions, companyOptions });
    // 폼 초기화
    useEffect(() => {
        if (!open) return;
        Promise.resolve().then(() => {
            if (!isEdt || !rowData) {
                setForm(EMPTY_FORM);
            } else {
                setForm({
                    serverCode: rowData.serverCode || '',
                    systemCode: rowData.systemCode || '',
                    serverName: rowData.serverName || '',
                    serverIp: rowData.serverIp || '',
                    serverPort: rowData.serverPort || '',
                    serverMethod: rowData.serverMethod || '',
                    comCodeNumber: rowData.comCodeNumber || '',
                    serverId: rowData.serverId || '',
                    serverPassword: rowData.serverPassword || '',
                    serverUseyn: rowData.serverUseyn || 'Y',
                    serverLocationInfo: rowData.serverLocationInfo || '',
                    serverDc: rowData.serverDc || '',
                });
            }
        });
    }, [open, isEdt, rowData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.systemCode) { await Swal.fire({ icon: 'warning', text: '시스템 코드를 입력해주세요.' }); return; }
        if (!form.serverName) { await Swal.fire({ icon: 'warning', text: '서버명을 입력해주세요.' }); return; }
        if (!form.serverIp) { await Swal.fire({ icon: 'warning', text: '서버 IP를 입력해주세요.' }); return; }
        if (!form.serverPort) { await Swal.fire({ icon: 'warning', text: '서버 PORT를 입력해주세요.' }); return; }

        const action = isEdt ? '수정' : '등록';
        const ok = await Swal.fire({
            icon: 'question',
            title: `서버 정보 ${action}`,
            html: isEdt
                ? `<b>${form.serverName}</b> 을(를) ${action} 하시겠습니까?`
                : `${action} 하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.SERVER_INFO_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    serverCode: form.serverCode,
                    systemCode: form.systemCode,
                    serverName: form.serverName,
                    serverIp: form.serverIp,
                    serverPort: form.serverPort,
                    serverMethod: form.serverMethod,
                    comCodeNumber: form.comCodeNumber,
                    serverId: form.serverId,
                    serverLocationInfo: form.serverLocationInfo,
                    serverPassword: form.serverPassword,
                    serverUseyn: form.serverUseyn,
                    serverDc: form.serverDc,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}되었습니다.` });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '처리 도중 문제가 발생하였습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 860, maxWidth: '95%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">
                                    서버 정보 {isEdt ? '수정' : '등록'}
                                </h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    {/* 시스템 코드 / 서버명 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="systemCode" className="form-label">
                                                시스템<span className="text-danger">*</span>
                                            </label>
                                            <select
                                                id="systemCode" name="systemCode"
                                                className="form-select"
                                                value={form.systemCode}
                                                onChange={updateForm}
                                            >
                                                <option value="">선택</option>
                                                {systemOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serverName" className="form-label">
                                                서버명 <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="serverName" name="serverName"
                                                type="text" className="form-control"
                                                placeholder="서버명을 입력해주세요."
                                                value={form.serverName}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* 서버IP / SSH PORT */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serverIp" className="form-label">
                                                서버IP <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="serverIp" name="serverIp"
                                                type="text" className="form-control"
                                                placeholder="서버 IP를 입력해주세요."
                                                value={form.serverIp}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serverPort" className="form-label">
                                                SSH PORT <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                id="serverPort" name="serverPort"
                                                type="text" className="form-control"
                                                placeholder="SSH PORT를 입력해주세요."
                                                value={form.serverPort}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* Health Check / 관리 업체 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serverMethod" className="form-label">Health Check</label>
                                            <select
                                                id="serverMethod" name="serverMethod"
                                                className="form-select"
                                                value={form.serverMethod}
                                                onChange={updateForm}
                                            >
                                                <option value="">선택</option>
                                                {serverMethodOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="comCodeNumber" className="form-label">관리 업체</label>
                                            <select
                                                id="comCodeNumber" name="comCodeNumber"
                                                className="form-select"
                                                value={form.comCodeNumber}
                                                onChange={updateForm}
                                            >
                                                <option value="">선택</option>
                                                {companyOptions.map(o => (
                                                    <option key={o.code} value={o.code}>{o.codeNm}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {/* 서버 ID / 서버 PASSWORD */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serverId" className="form-label">서버 ID</label>
                                            <input
                                                id="serverId" name="serverId"
                                                type="text" className="form-control"
                                                placeholder="서버 ID를 입력해주세요."
                                                value={form.serverId}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serverPassword" className="form-label">서버 PASSWORD</label>
                                            <input
                                                id="serverPassword" name="serverPassword"
                                                type="password" className="form-control"
                                                placeholder="서버 PASSWORD를 입력해주세요."
                                                value={form.serverPassword}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* 사용유무 / 서버 위치 */}
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">사용유무</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.serverUseyn}
                                                    name="serverUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, serverUseyn: payload.serverUseyn }))}
                                                    onText="사용"
                                                    offText="사용 안함"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="serverLocationInfo" className="form-label">서버 위치</label>
                                            <input
                                                id="serverLocationInfo" name="serverLocationInfo"
                                                type="text" className="form-control"
                                                placeholder="서버 위치를 입력해주세요."
                                                value={form.serverLocationInfo}
                                                onChange={updateForm}
                                            />
                                        </div>
                                    </div>
                                    {/* 설명 */}
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="serverDc" className="form-label">설명</label>
                                            <textarea
                                                id="serverDc" name="serverDc"
                                                className="form-control"
                                                rows={5}
                                                placeholder="설명을 입력해주세요."
                                                value={form.serverDc}
                                                onChange={updateForm}
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

export default ServerFormModal;
