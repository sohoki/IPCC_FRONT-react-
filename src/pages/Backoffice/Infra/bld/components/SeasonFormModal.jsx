import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = {
    seasonCd: '',
    seasonNm: '',
    useYn: 'Y',
    seasonStartDay: '',
    seasonEndDay: '',
    seasonDc: '',
};

// 'YYYYMMDD' 또는 'YYYY-MM-DD' → input[type=date] 용 'YYYY-MM-DD'
const toDateInput = (v) => {
    if (!v) return '';
    const d = String(v).replace(/[^0-9]/g, '');
    if (d.length !== 8) return '';
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
};
// input 'YYYY-MM-DD' → 저장용 'YYYYMMDD'
const toStore = (v) => (v ? String(v).replace(/-/g, '') : '');

const SeasonFormModal = ({ open, onClose, rowData, centerOptions = [], onSuccess }) => {
    const isEdt = !!(rowData && rowData.season_cd);
    const [form, setForm] = useState(EMPTY_FORM);
    const [selectedCenters, setSelectedCenters] = useState([]);

    // setState를 microtask로 지연 (effect 내 직접 setState 회피)
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        Promise.resolve().then(() => {
            if (cancelled) return;
            if (!isEdt) {
                setForm(EMPTY_FORM);
                setSelectedCenters([]);
                return;
            }
            setForm({
                seasonCd: rowData.season_cd || '',
                seasonNm: rowData.season_nm || '',
                useYn: rowData.use_yn || 'Y',
                seasonStartDay: toDateInput(rowData.season_start_day),
                seasonEndDay: toDateInput(rowData.season_end_day),
                seasonDc: rowData.season_dc || '',
            });
            setSelectedCenters((rowData.season_centerinfo || '').split(',').map(s => s.trim()).filter(Boolean));
        });
        return () => { cancelled = true; };
    }, [open, isEdt, rowData]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const toggleCenter = useCallback((centerCd) => {
        setSelectedCenters(prev => prev.includes(centerCd) ? prev.filter(c => c !== centerCd) : [...prev, centerCd]);
    }, []);

    const handleSave = useCallback(async () => {
        if (!form.seasonNm) { await Swal.fire({ icon: 'warning', text: '시즌명을 입력해 주세요.' }); return; }
        if (!form.seasonStartDay) { await Swal.fire({ icon: 'warning', text: '시즌시작일을 선택해 주세요.' }); return; }
        if (!form.seasonEndDay) { await Swal.fire({ icon: 'warning', text: '시즌종료일을 선택해 주세요.' }); return; }
        if (form.seasonStartDay > form.seasonEndDay) { await Swal.fire({ icon: 'warning', text: '시즌종료일이 시즌시작일보다 빠릅니다.' }); return; }
        if (selectedCenters.length === 0) { await Swal.fire({ icon: 'warning', text: '시즌을 사용할 지점을 선택해 주세요.' }); return; }

        const action = isEdt ? '수정' : '등록';
        const ok = await Swal.fire({
            icon: 'question', title: `시즌 정보 ${action}`, html: `${action} 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.SEASON_UPDATE,
                method: 'POST',
                data: {
                    mode: isEdt ? 'Edt' : 'Ins',
                    seasonCd: form.seasonCd,
                    seasonNm: form.seasonNm,
                    useYn: form.useYn,
                    seasonStartDay: toStore(form.seasonStartDay),
                    seasonEndDay: toStore(form.seasonEndDay),
                    seasonDc: form.seasonDc,
                    seasonCenterinfo: selectedCenters.join(','),
                },
                withCredentials: true,
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
    }, [form, selectedCenters, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: 760, maxWidth: '95%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title"><h2 className="modal-title__title">시즌 정보 {isEdt ? '수정' : '등록'}</h2></div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-8">
                                        <div className="input-box">
                                            <label htmlFor="seasonNm" className="form-label">시즌명 <span className="text-danger">*</span></label>
                                            <input id="seasonNm" name="seasonNm" type="text" className="form-control"
                                                placeholder="시즌명을 입력해주세요." value={form.seasonNm} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="input-box">
                                            <label className="form-label">사용여부</label>
                                            <select name="useYn" className="form-select" value={form.useYn} onChange={updateForm}>
                                                <option value="Y">사용</option>
                                                <option value="N">사용 안함</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="seasonStartDay" className="form-label">시즌시작일 <span className="text-danger">*</span></label>
                                            <input id="seasonStartDay" name="seasonStartDay" type="date" className="form-control"
                                                value={form.seasonStartDay} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label htmlFor="seasonEndDay" className="form-label">시즌종료일 <span className="text-danger">*</span></label>
                                            <input id="seasonEndDay" name="seasonEndDay" type="date" className="form-control"
                                                value={form.seasonEndDay} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">해당지점 <span className="text-danger">*</span></label>
                                            <div className="d-flex flex-wrap gap-3 p-2 border rounded" style={{ maxHeight: 160, overflowY: 'auto' }}>
                                                {centerOptions.map(o => (
                                                    <label key={o.code} className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={selectedCenters.includes(o.code)} onChange={() => toggleCenter(o.code)} />
                                                        {o.codeNm}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label htmlFor="seasonDc" className="form-label">상세설명</label>
                                            <textarea id="seasonDc" name="seasonDc" className="form-control" rows={4}
                                                placeholder="상세설명을 입력해주세요." value={form.seasonDc} onChange={updateForm} />
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

export default SeasonFormModal;
