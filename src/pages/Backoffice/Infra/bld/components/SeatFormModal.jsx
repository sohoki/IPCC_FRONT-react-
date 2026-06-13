import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = {
    seatCd: '',
    centerCd: '',
    floorCd: '',
    partCd: '',
    seatNm: '',
    useYn: 'Y',
};

const extractList = (res) => {
    const raw = res?.data?.result;
    return Array.isArray(raw) ? raw : (raw?.resultList || raw?.result || []);
};

const SeatFormModal = ({ open, onClose, rowData, centerOptions = [], onSuccess }) => {
    const isEdt = !!(rowData && rowData.seat_cd);
    const [form, setForm] = useState(EMPTY_FORM);
    const [floorOptions, setFloorOptions] = useState([]);
    const [partOptions, setPartOptions] = useState([]);

    const loadFloors = useCallback(async (centerCd) => {
        if (!centerCd) { setFloorOptions([]); return []; }
        try {
            const res = await fnAjaxFetch({ url: `${URL.FLOOR_COMBO}/${encodeURIComponent(centerCd)}.do`, method: 'GET', withCredentials: true, showLoading: false });
            const list = extractList(res); setFloorOptions(list); return list;
        } catch { setFloorOptions([]); return []; }
    }, []);

    const loadParts = useCallback(async (floorCd) => {
        if (!floorCd) { setPartOptions([]); return []; }
        try {
            const res = await fnAjaxFetch({ url: `${URL.BLD_PART_COMBO}/${encodeURIComponent(floorCd)}.do`, method: 'GET', withCredentials: true, showLoading: false });
            const list = extractList(res); setPartOptions(list); return list;
        } catch { setPartOptions([]); return []; }
    }, []);

    // 폼 초기화 (수정 시 종속 콤보 순차 로드) — setState를 microtask로 지연
    useEffect(() => {
        let cancelled = false;
        Promise.resolve().then(async () => {
            if (cancelled) return;
            if (!isEdt) {
                setForm(EMPTY_FORM);
                setFloorOptions([]);
                setPartOptions([]);
                return;
            }
            setForm({
                seatCd: rowData.seat_cd || '',
                centerCd: rowData.center_cd || '',
                floorCd: rowData.floor_cd || '',
                partCd: rowData.part_cd || '',
                seatNm: rowData.seat_nm || '',
                useYn: rowData.use_yn || 'Y',
            });
            await loadFloors(rowData.center_cd);
            await loadParts(rowData.floor_cd);
        });
        return () => { cancelled = true; };
    }, [open, isEdt, rowData, loadFloors, loadParts]);

    const updateForm = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }, []);

    const onCenterChange = async (e) => {
        const centerCd = e.target.value;
        setForm(prev => ({ ...prev, centerCd, floorCd: '', partCd: '' }));
        setPartOptions([]);
        await loadFloors(centerCd);
    };

    const onFloorChange = async (e) => {
        const floorCd = e.target.value;
        setForm(prev => ({ ...prev, floorCd, partCd: '' }));
        await loadParts(floorCd);
    };

    const handleSave = useCallback(async () => {
        if (!form.seatNm) { await Swal.fire({ icon: 'warning', text: '좌석명을 입력해주세요.' }); return; }
        if (!form.floorCd) { await Swal.fire({ icon: 'warning', text: '층을 선택해 주세요.' }); return; }
        if (!form.partCd) { await Swal.fire({ icon: 'warning', text: '구역을 선택해 주세요.' }); return; }

        const action = isEdt ? '수정' : '등록';
        const ok = await Swal.fire({
            icon: 'question', title: `좌석 정보 ${action}`,
            html: `${action} 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: URL.SEAT_UPDATE,
                method: 'POST',
                data: { mode: isEdt ? 'Edt' : 'Ins', ...form },
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
    }, [form, isEdt, onSuccess]);

    if (!open) return null;
    return (
        <div className="modal-backdrop-custom">
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ width: 640, maxWidth: '95%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title"><h2 className="modal-title__title">좌석 정보 {isEdt ? '수정' : '등록'}</h2></div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body">
                            <div className="modal-body__content">
                                <div className="row input-box-wrap">
                                    <div className="col-4">
                                        <div className="input-box">
                                            <label className="form-label">지점</label>
                                            <select name="centerCd" className="form-select" value={form.centerCd} onChange={onCenterChange}>
                                                <option value="">선택</option>
                                                {centerOptions.map(o => (<option key={o.code} value={o.code}>{o.codeNm}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="input-box">
                                            <label className="form-label">층</label>
                                            <select name="floorCd" className="form-select" value={form.floorCd} onChange={onFloorChange}>
                                                <option value="">선택</option>
                                                {floorOptions.map(o => (<option key={o.floor_cd} value={o.floor_cd}>{o.floor_nm}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="input-box">
                                            <label className="form-label">구역</label>
                                            <select name="partCd" className="form-select" value={form.partCd} onChange={updateForm}>
                                                <option value="">선택</option>
                                                {partOptions.map(o => (<option key={o.part_cd} value={o.part_cd}>{o.part_nm}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-8">
                                        <div className="input-box">
                                            <label htmlFor="seatNm" className="form-label">좌석명 <span className="text-danger">*</span></label>
                                            <input id="seatNm" name="seatNm" type="text" className="form-control"
                                                placeholder="좌석명을 입력해주세요." value={form.seatNm} onChange={updateForm} />
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="input-box">
                                            <label className="form-label">사용여부</label>
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

export default SeatFormModal;
