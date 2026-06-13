import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = {
    partCd: '',
    partNm: '',
    partOrder: '',
    partClassSeq: '',
    useYn: 'Y',
    partMap1File: null,
};

const extractList = (res) => {
    const raw = res?.data?.result;
    return Array.isArray(raw) ? raw : (raw?.resultList || raw?.result || []);
};

const PartFormModal = ({ open, onClose, centerCd, floorCd, rowData, onSuccess }) => {
    const isEdt = !!(rowData && rowData.part_cd);
    const [form, setForm] = useState(EMPTY_FORM);
    const [partClassOptions, setPartClassOptions] = useState([]);

    // setState를 microtask로 지연 (effect 내 직접 setState 회피)
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        Promise.resolve().then(async () => {
            if (cancelled) return;
            setForm(isEdt ? {
                partCd: rowData.part_cd || '',
                partNm: rowData.part_nm || '',
                partOrder: rowData.part_order ?? '',
                partClassSeq: rowData.part_class_seq || '',
                useYn: rowData.use_yn || 'Y',
                partMap1File: null,
            } : EMPTY_FORM);

            if (centerCd) {
                try {
                    const res = await fnAjaxFetch({ url: `${URL.PARTCLASS_COMBO}/${encodeURIComponent(centerCd)}.do`, method: 'GET', withCredentials: true, showLoading: false });
                    if (!cancelled) setPartClassOptions(extractList(res));
                } catch { if (!cancelled) setPartClassOptions([]); }
            }
        });
        return () => { cancelled = true; };
    }, [open, isEdt, rowData, centerCd]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const onFileChange = useCallback((e) => {
        setForm(prev => ({ ...prev, partMap1File: e.target.files?.[0] || null }));
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.partNm) { await Swal.fire({ icon: 'warning', text: '구역 명을 입력해주세요.' }); return; }
        if (!form.partClassSeq) { await Swal.fire({ icon: 'warning', text: '구역 등급을 선택해 주세요.' }); return; }

        const action = isEdt ? '수정' : '등록';
        const ok = await Swal.fire({
            icon: 'question', title: `구역 정보 ${action}`, html: `${action} 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const fd = new FormData();
            fd.append('mode', isEdt ? 'Edt' : 'Ins');
            fd.append('partCd', form.partCd);
            fd.append('centerCd', centerCd || '');
            fd.append('floorCd', floorCd || '');
            fd.append('partNm', form.partNm);
            fd.append('partOrder', form.partOrder ?? '');
            fd.append('partClassSeq', form.partClassSeq);
            fd.append('useYn', form.useYn);
            if (form.partMap1File instanceof File) {
                fd.append('partMap1File', form.partMap1File, form.partMap1File.name);
            }

            const res = await fnAjaxFetch({
                url: URL.BLD_PART_UPDATE,
                method: 'POST',
                data: fd,
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: 'success', title: action, text: json?.resultMessage || `${action}되었습니다.` });
                onSuccess();
            } else {
                await Swal.fire({ icon: 'error', text: json?.resultMessage || '처리 중 문제가 발생했습니다.' });
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
        }
    }, [form, isEdt, centerCd, floorCd, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom" style={{ zIndex: 1060 }}>
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: 640, maxWidth: '95%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title"><h2 className="modal-title__title">구역 정보 {isEdt ? '수정' : '등록'}</h2></div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="partNm" className="form-label">구역 명 <span className="text-danger">*</span></label>
                                            <input id="partNm" name="partNm" type="text" className="form-control"
                                                placeholder="구역 명을 입력해주세요." value={form.partNm} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="partOrder" className="form-label">정렬 순서</label>
                                            <input id="partOrder" name="partOrder" type="number" className="form-control"
                                                placeholder="정렬 순서" value={form.partOrder} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">구역 등급 <span className="text-danger">*</span></label>
                                            <select name="partClassSeq" className="form-select" value={form.partClassSeq} onChange={updateForm}>
                                                <option value="">구역 등급 선택</option>
                                                {partClassOptions.map(o => (<option key={o.part_class_seq} value={o.part_class_seq}>{o.part_class_nm}</option>))}
                                            </select>
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
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="partMap1File" className="form-label">층 도면 이미지</label>
                                            <input id="partMap1File" name="partMap1File" type="file" accept="image/*" className="form-control" onChange={onFileChange} />
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

export default PartFormModal;
