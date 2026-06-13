import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = {
    floorCd: '',
    centerCd: '',
    floorNm: '',
    floorPartDvsn: '',
    floorSeatRule: '',
    useYn: 'Y',
    floorMap1File: null,
};

const FloorFormModal = ({ open, onClose, rowData, floorPartOptions = [], onSuccess }) => {
    const [form, setForm] = useState(EMPTY_FORM);

    // setState를 microtask로 지연 (effect 내 직접 setState 회피)
    useEffect(() => {
        if (!open || !rowData) return;
        let cancelled = false;
        Promise.resolve().then(() => {
            if (cancelled) return;
            setForm({
                floorCd: rowData.floor_cd || '',
                centerCd: rowData.center_cd || '',
                floorNm: rowData.floor_nm || '',
                floorPartDvsn: rowData.floor_part_dvsn || '',
                floorSeatRule: rowData.floor_seat_rule || '',
                useYn: rowData.use_yn || 'Y',
                floorMap1File: null,
            });
        });
        return () => { cancelled = true; };
    }, [open, rowData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const onFileChange = useCallback((e) => {
        setForm(prev => ({ ...prev, floorMap1File: e.target.files?.[0] || null }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.floorNm) { await Swal.fire({ icon: 'warning', text: '층명을 입력해주세요.' }); return; }
        if (!form.floorPartDvsn) { await Swal.fire({ icon: 'warning', text: '구역 사용 방식을 선택해 주세요.' }); return; }

        const ok = await Swal.fire({
            icon: 'question', title: '층 정보 수정', html: '입력한 정보로 수정하시겠습니까?',
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const fd = new FormData();
            fd.append('mode', 'Edt');
            fd.append('floorCd', form.floorCd);
            fd.append('centerCd', form.centerCd);
            fd.append('floorNm', form.floorNm);
            fd.append('floorPartDvsn', form.floorPartDvsn);
            fd.append('floorSeatRule', form.floorSeatRule);
            fd.append('useYn', form.useYn);
            if (form.floorMap1File instanceof File) {
                fd.append('floorMap1File', form.floorMap1File, form.floorMap1File.name);
            }

            const res = await fnAjaxFetch({
                url: URL.FLOOR_UPDATE,
                method: 'POST',
                data: fd,
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: '완료', text: json?.resultMessage || '수정되었습니다.' });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.resultMessage || '처리 중 문제가 발생했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: 640, maxWidth: '95%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title"><h2 className="modal-title__title">층 정보 수정</h2></div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="floorNm" className="form-label">층 이름 <span className="text-danger">*</span></label>
                                            <input id="floorNm" name="floorNm" type="text" className="form-control"
                                                placeholder="층 이름을 입력해주세요." value={form.floorNm} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">구역 사용 방식 <span className="text-danger">*</span></label>
                                            <select name="floorPartDvsn" className="form-select" value={form.floorPartDvsn} onChange={updateForm}>
                                                <option value="">구역 사용방식</option>
                                                {floorPartOptions.map(o => (<option key={o.code} value={o.code}>{o.codeNm}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="floorMap1File" className="form-label">층 도면 이미지</label>
                                            <input id="floorMap1File" name="floorMap1File" type="file" accept="image/*" className="form-control" onChange={onFileChange} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">사용 여부</label>
                                            <select name="useYn" className="form-select" value={form.useYn} onChange={updateForm}>
                                                <option value="Y">Y</option>
                                                <option value="N">N</option>
                                            </select>
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

export default FloorFormModal;
