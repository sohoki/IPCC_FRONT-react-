import React, { useState, useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const PbxIpFormModal = ({ open, onClose, rowData, onSuccess }) => {
    const [form, setForm] = useState({
        extension: rowData?.extension || '',
        ipAddress: rowData?.ipAddress || '',
        ipUseyn: rowData?.ipUseyn === 'Y' ? 'Y' : 'N',
        recUseyn: rowData?.recUseyn === 'Y' ? 'Y' : 'N',
    });

    const handleSave = useCallback(async () => {
        if (!form.extension) {
            await Swal.fire({ icon: 'warning', text: '내선번호를 확인해 주세요' });
            return;
        }
        const ok = await Swal.fire({
            icon: 'question', title: 'IP/내선번호 설정',
            html: `<b>${form.extension}</b> 정보를 <b>설정</b> 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니요',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.IP_UPDATE,
                method: 'POST',
                data: {
                    extension: form.extension,
                    ipAddress: form.ipAddress,
                    ipUseyn: form.ipUseyn,
                    recUseyn: form.recUseyn,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: '설정', text: json?.MESSAGE || '설정되었습니다' });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.MESSAGE || '처리 중 문제가 발생했습니다' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered" style={{ width: 560, maxWidth: '90%', backgroundColor: 'var(--bs-body-bg, #fff)' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">IP/내선번호 설정</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="txtExtension" className="form-label">내선번호</label>
                                            <input
                                                id="txtExtension"
                                                type="text" className="form-control"
                                                value={form.extension}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="txtIpAddress" className="form-label">IP</label>
                                            <input
                                                id="txtIpAddress"
                                                type="text" className="form-control"
                                                value={form.ipAddress}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">사용여부</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.ipUseyn}
                                                    name="ipUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, ipUseyn: payload.ipUseyn }))}
                                                    onText="사용"
                                                    offText="사용안함"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">녹취사용여부</label>
                                            <div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
                                                <UseSwitch
                                                    value={form.recUseyn}
                                                    name="recUseyn"
                                                    onChange={(payload) => setForm(prev => ({ ...prev, recUseyn: payload.recUseyn }))}
                                                    onText="사용"
                                                    offText="사용안함"
                                                />
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

export default PbxIpFormModal;
