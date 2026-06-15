import React, { useCallback, useEffect, useState } from 'react';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import Swal from '@/lib/swal.js';


const INITIAL_INFRA_FORM = {
    mode: 'Ins',
    partInfraCode: '',
    stationMeno: '',
    stationStartNumber: '',
    stationEndNumber: '',
    agentStartNumber: '',
    agentEndNumber: '',
    ctiStartNumber: '',
    ctiEndNumber: ''
};

const PartInfraModal = ({ open, partId, insttCode, onClose }) => {
    const [infraList, setInfraList] = useState([]);
    const [infraForm, setInfraForm] = useState(INITIAL_INFRA_FORM);


    const updateInfra = useCallback((payload) => {
        setInfraForm((prev) => ({ ...prev, ...payload }));
    }, []);

    const loadInfraList = useCallback(() => {
        if (!partId) return;
        fnAjaxFetch({ url: API_URL.INSTT_INFRA_LIST, method: 'POST', data: { insttCode, partId } })
            .then((res) => setInfraList(res?.data?.resultList || []))
            .catch(() => {});
    }, [partId, insttCode]);

    useEffect(() => {
        if (!open) return;
        loadInfraList();
        queueMicrotask(() => setInfraForm({ ...INITIAL_INFRA_FORM }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleSubmit = useCallback(async () => {
        if (!infraForm.stationStartNumber) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '내선번호를 입력해 주세요.' }); return;
        }
        if (!infraForm.agentStartNumber) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '에이전트 번호를 입력해 주세요.' }); return;
        }
        if (!infraForm.ctiStartNumber) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: 'CTI 번호를 입력해 주세요.' }); return;
        }

        const infraData = {
            mode: infraForm.mode, insttCode, partId,
            partInfraCode: infraForm.partInfraCode,
            stationStartNumber: infraForm.stationStartNumber,
            stationEndNumber: infraForm.stationEndNumber,
            agentStartNumber: infraForm.agentStartNumber,
            agentEndNumber: infraForm.agentEndNumber,
            ctiStartNumber: infraForm.ctiStartNumber,
            ctiEndNumber: infraForm.ctiEndNumber,
            stationMeno: infraForm.stationMeno,
        };

        const checkRes = await fnAjaxFetch({ url: API_URL.PART_AGENT_CHECK, method: 'POST', data: infraData });
        if (checkRes?.data?.STATUS !== 'SUCCESS') {
            await Swal.fire({ icon: 'info', title: '확인', text: checkRes?.data?.MESSAGE || '중복 체크 실패' }); return;
        }

        const action = infraForm.mode === 'Ins' ? '등록' : '수정';
        const ok = await Swal.fire({
            icon: 'question', title: `인프라 ${action}`, text: `${action} 하시겠습니까?`,
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
        });
        if (!ok.isConfirmed) return;

        const res = await fnAjaxFetch({ url: API_URL.INSTT_CALL_INFRA_UPDATE, method: 'POST', data: infraData });
        if (res?.data?.STATUS === 'SUCCESS') {
            setInfraForm({ ...INITIAL_INFRA_FORM });
            loadInfraList();
        } else {
            await Swal.fire({ icon: 'error', title: '오류', text: res?.data?.MESSAGE || '처리 중 오류가 발생했습니다.' });
        }
    }, [infraForm, partId, insttCode, loadInfraList]);

    const handleDetail = useCallback(async (partInfraCode) => {
        const res = await fnAjaxFetch({
            url: `${API_URL.INSTT_CALL_INFRA_INFO}/${partInfraCode}.do`, method: 'GET',
        });
        const obj = res?.data?.result;
        if (obj) {
            setInfraForm({
                mode: 'Edt', partInfraCode,
                stationMeno: obj.stationMeno || '',
                stationStartNumber: obj.stationStartNumber || '',
                stationEndNumber: obj.stationEndNumber || '',
                agentStartNumber: obj.agentStartNumber || '',
                agentEndNumber: obj.agentEndNumber || '',
                ctiStartNumber: obj.ctiStartNumber || '',
                ctiEndNumber: obj.ctiEndNumber || ''
            });
        }
    }, []);

    const handleDelete = useCallback(async (partInfraCode) => {
        const ok = await Swal.fire({
            icon: 'question', title: '인프라 삭제', text: '삭제 하시겠습니까?',
            showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
        });
        if (!ok.isConfirmed) return;
        await fnAjaxFetch({ url: `${API_URL.INSTT_CALL_INFRA_INFO}/${partInfraCode}.do`, method: 'DELETE' });
        loadInfraList();
    }, [loadInfraList]);

    if (!open) return null;

    return (
        <>
            <div className="modal-backdrop-custom" onClick={onClose} />
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 860, maxWidth: '95%', backgroundColor: 'var(--ipcc-card-bg)' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">INFRA 관리</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>

                        <div className="modal-body tab-content">
                            <div className="modal-body__content tab-pane show active">

                                {/* 인프라 목록 */}
                                <table className="table table-sm table-bordered align-middle mb-3">
                                    <thead className="table-light">
                                        <tr>
                                            <th>제목</th>
                                            <th>내선번호</th>
                                            <th>에이전트</th>
                                            <th>CTI</th>
                                            <th style={{ width: 60 }}>삭제</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {infraList.length === 0
                                            ? <tr><td colSpan={5} className="text-center text-muted py-3">데이터가 없습니다.</td></tr>
                                            : infraList.map((r) => (
                                                <tr key={r.partInfraCode}>
                                                    <td>
                                                        <button type="button" className="btn btn-link btn-sm p-0"
                                                            onClick={() => handleDetail(r.partInfraCode)}>
                                                            {r.stationMeno}
                                                        </button>
                                                    </td>
                                                    <td>{r.stationStartNumber}<br />{r.stationEndNumber}</td>
                                                    <td>{r.agentStartNumber}<br />{r.agentEndNumber}</td>
                                                    <td>{r.ctiStartNumber}<br />{r.ctiEndNumber}</td>
                                                    <td>
                                                        <button type="button"
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDelete(r.partInfraCode)}>삭제</button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>

                               
                                {/* 추가/수정 폼 */}
                                <div className="row g-2 align-items-end">
                                    <div className="col-3">
                                        <label className="form-label form-label-sm mb-1">제목</label>
                                        <input type="text" className="form-control form-control-sm"
                                            value={infraForm.stationMeno}
                                            onChange={(e) => updateInfra({ stationMeno: e.target.value })} />
                                    </div>
                                    <div className="col-2">
                                        <label className="form-label form-label-sm mb-1">내선 시작/종료</label>
                                        <input type="text" className="form-control form-control-sm"
                                            placeholder="시작"
                                            value={infraForm.stationStartNumber}
                                            onChange={(e) => updateInfra({ stationStartNumber: e.target.value })} />
                                        <input type="text" className="form-control form-control-sm mt-1"
                                            placeholder="종료"
                                            value={infraForm.stationEndNumber}
                                            onChange={(e) => updateInfra({ stationEndNumber: e.target.value })} />
                                    </div>
                                    <div className="col-2">
                                        <label className="form-label form-label-sm mb-1">에이전트 시작/종료</label>
                                        <input type="text" className="form-control form-control-sm"
                                            placeholder="시작"
                                            value={infraForm.agentStartNumber}
                                            onChange={(e) => updateInfra({
                                                agentStartNumber: e.target.value,
                                                ctiStartNumber: e.target.value,
                                            })} />
                                        <input type="text" className="form-control form-control-sm mt-1"
                                            placeholder="종료"
                                            value={infraForm.agentEndNumber}
                                            onChange={(e) => updateInfra({
                                                agentEndNumber: e.target.value,
                                                ctiEndNumber: e.target.value,
                                            })} />
                                    </div>
                                    <div className="col-2">
                                        <label className="form-label form-label-sm mb-1">CTI 시작/종료</label>
                                        <input type="text" className="form-control form-control-sm"
                                            placeholder="시작"
                                            value={infraForm.ctiStartNumber}
                                            onChange={(e) => updateInfra({ ctiStartNumber: e.target.value })} />
                                        <input type="text" className="form-control form-control-sm mt-1"
                                            placeholder="종료"
                                            value={infraForm.ctiEndNumber}
                                            onChange={(e) => updateInfra({ ctiEndNumber: e.target.value })} />
                                    </div>
                                    <div className="col-2">
                                        <button type="button"
                                            className="btn btn-primary btn-default__blue w-100"
                                            onClick={handleSubmit}>
                                            {infraForm.mode === 'Ins' ? '등록' : '수정'}
                                        </button>
                                        {infraForm.mode === 'Edt' && (
                                            <button type="button"
                                                className="btn btn-outline-secondary btn-outline__gray w-100 mt-1"
                                                onClick={() => setInfraForm({ ...INITIAL_INFRA_FORM })}>
                                                초기화
                                            </button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-cancel" onClick={onClose}>닫기</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PartInfraModal;
