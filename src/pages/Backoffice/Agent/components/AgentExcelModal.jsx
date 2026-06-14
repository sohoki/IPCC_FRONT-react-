import React, { useState, useCallback, useRef } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const AgentExcelModal = ({ open, onClose, onSuccess }) => {
    const [basicNumber, setBasicNumber] = useState('');
    const [parsedAgents, setParsedAgents] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // xlsx 라이브러리를 window.XLSX 또는 import로 사용 가능한지 확인
        try {
            const XLSX = window.XLSX || (await import('xlsx'));
            const reader = new FileReader();
            reader.onload = (evt) => {
                const wb = XLSX.read(evt.target.result, { type: 'binary' });
                const sheet = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(sheet);
                const agents = json.map(row => ({ extension: row['Agent'] })).filter(a => a.extension);
                setParsedAgents(agents);
            };
            reader.readAsBinaryString(file);
        } catch {
            await Swal.fire({ icon: 'error', text: 'Excel 다운로드에 실패 해였습니다.' });
        }
    }, []);

    const handleSave = useCallback(async () => {
        if (!basicNumber.trim()) {
            await Swal.fire({ icon: 'warning', text: '복사할 기본번호를 입력해주세요.' });
            return;
        }
        if (parsedAgents.length === 0) {
            await Swal.fire({ icon: 'warning', text: 'Excel 파일을 먼저 업로드해주세요.' });
            return;
        }
        const ok = await Swal.fire({
            icon: 'question',
            title: '저장',
            text: '저장하시겠습니까?',
            showCancelButton: true,
            confirmButtonText: '저장',
            cancelButtonText: '취소',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.AGENT_EXCEL_UPDATE,
                method: 'POST',
                data: {
                    basicNumber: basicNumber.replaceAll(' ', ''),
                    copyNumber: parsedAgents,
                },
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: '저장', text: json?.MESSAGE || '저장되었습니다.' });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', title: '오류', text: json?.MESSAGE || '저장에 실패했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [basicNumber, parsedAgents, onSuccess]);

    const handleClose = useCallback(() => {
        setBasicNumber('');
        setParsedAgents([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    }, [onClose]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div
                    className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 520, maxWidth: '90%', backgroundColor: '#fff' }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">엑셀 파일 업로드</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={handleClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">엑셀 파일</label>
                                            <div className="d-flex gap-2 align-items-center">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="form-control"
                                                    accept=".xlsx,.xls,.csv"
                                                    onChange={handleFileChange}
                                                />
                                            </div>
                                            {parsedAgents.length > 0 && (
                                                <div className="mt-1 text-muted small">
                                                    {parsedAgents.length}개의 에이전트가 성공적으로 파싱되었습니다.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="txt_basicNumber" className="form-label">복사할 기본번호</label>
                                            <input
                                                id="txt_basicNumber"
                                                type="text"
                                                className="form-control"
                                                placeholder="복사할 기본번호를 입력하세요"
                                                value={basicNumber}
                                                onChange={e => setBasicNumber(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__left" />
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={handleClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>저장</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentExcelModal;
