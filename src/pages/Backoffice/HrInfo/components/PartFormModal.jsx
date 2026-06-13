import React, { useCallback, useEffect, useState } from 'react';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import { CommonSelect } from '@/components/Common/Select.jsx';

const PART_ORDER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

/* ── 부서장 검색 모달 (PartFormModal 전용) ── */
const UserSearchModal = ({ open, insttCode, onSelect, onClose }) => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [userList, setUserList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    const fetchUsers = useCallback(() => {
        fnAjaxFetch({
            url: API_URL.EMP_LIST,
            method: 'POST',
            data: { pageIndex: '1', pageUnit: '20', searchKeyword, searchInsttCode: insttCode },
        }).then((res) => {
            setUserList(res?.data?.result?.resultList || []);
        }).catch(() => {});
    }, [searchKeyword, insttCode]);

    useEffect(() => {
        if (open) {
            setSearchKeyword('');
            setSelectedId(null);
            fetchUsers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    if (!open) return null;

    return (
        <>
            <div className="modal-backdrop-custom" onClick={onClose} style={{ zIndex: 1060 }} />
            <div className="modal-custom" style={{ zIndex: 1061 }}>
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 620, maxWidth: '90%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">부서장 선택</h2>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>
                        <div className="modal-body tab-content">
                            <div className="modal-body__content tab-pane show active">
                                <div className="d-flex gap-2 mb-2">
                                    <input type="text" className="form-control form-control-sm"
                                        placeholder="이름 또는 아이디" value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                        style={{ width: 200 }}
                                    />
                                    <button type="button" className="btn btn-outline-dark btn-outline__gray btn-sm"
                                        onClick={fetchUsers}>검색</button>
                                </div>
                                <table className="table table-sm table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>기관명</th><th>부서</th><th>아이디</th><th>이름</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userList.length === 0
                                            ? <tr><td colSpan={4} className="text-center text-muted py-3">데이터가 없습니다.</td></tr>
                                            : userList.map((u) => (
                                                <tr key={u.adminId}
                                                    onClick={() => setSelectedId(u.adminId)}
                                                    onDoubleClick={() => onSelect(u)}
                                                    style={{ cursor: 'pointer', backgroundColor: selectedId === u.adminId ? '#e3f0ff' : '' }}>
                                                    <td>{u.allInsttNm}</td>
                                                    <td>{u.partNm}</td>
                                                    <td>{u.adminId}</td>
                                                    <td>{u.adminName}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue"
                                    onClick={() => { const u = userList.find(x => x.adminId === selectedId); if (u) onSelect(u); }}>
                                    선택
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

/* ── 부서 등록/수정 모달 ── */
const PartFormModal = ({ 
    open, 
    form, 
    setForm, 
    insttOptions, 
    parentPartOptions, 
    onClose, 
    onSubmit 
}) => {
    const [ctiGroupOptions, setCtiGroupOptions] = useState([]);
    const [ctiTeamOptions, setCtiTeamOptions] = useState([]);
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);


    console.log('parentPartOptions', parentPartOptions);
    console.log('form', form);
    console.log('ctiGroupOptions', ctiGroupOptions);
    console.log('ctiTeamOptions', ctiTeamOptions);

    const updateForm = useCallback((payload) => {
        setForm((prev) => ({ ...prev, ...payload }));
    }, [setForm]);

    const loadCtiTeam = useCallback((tenantId, employeegrpId, selectedEtc2 = '') => {
        if (!employeegrpId) { setCtiTeamOptions([]); return; }
        fnAjaxFetch({ url: API_URL.CTI_TEAM_COMBO, method: 'POST',
            data: { centerId: '1', tenantId, employeegrpId } })
            .then((res) => {
                const teams = res?.data?.result || [];
                setCtiTeamOptions([
                    { value: '', label: '?�택' },
                    ...teams.map((t) => ({ value: t.employeepartId, label: t.employeepartName })),
                ]);
            }).catch(() => {});
    }, []);

    const loadCtiGroup = useCallback((insttCode, selectedEtc1 = '', selectedEtc2 = '') => {
        if (!insttCode) { setCtiGroupOptions([]); setCtiTeamOptions([]); return; }
        fnAjaxFetch({ url: `${API_URL.INSTT_INFO}/${insttCode}.do`, method: 'GET' })
            .then((insttRes) => {
                const tenantId = insttRes?.data?.result?.tenantId || '';
                updateForm({ tenantId });
                return fnAjaxFetch({ url: API_URL.CTI_GROUP_COMBO, method: 'POST',
                    data: { centerId: '1', tenantId } })
                    .then((grpRes) => {
                        const groups = grpRes?.data?.result || [];
                        setCtiGroupOptions([
                            { value: '', label: '?�택' },
                            ...groups.map((g) => ({ value: g.employeegrpId, label: g.employeegrpName })),
                        ]);
                        if (selectedEtc1) loadCtiTeam(tenantId, selectedEtc1, selectedEtc2);
                        else setCtiTeamOptions([]);
                    });
            }).catch(() => {});
    }, [updateForm, loadCtiTeam]);

    useEffect(() => {
        if (open && form.insttCode) loadCtiGroup(form.insttCode, form.partEtc1, form.partEtc2);
        if (!open) { setCtiGroupOptions([]); setCtiTeamOptions([]); setIsUserSearchOpen(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, form.insttCode]);

    if (!open) return null;

    return (
        <>
            <div className="modal-backdrop-custom" onClick={onClose} />
            <div className="modal-custom">
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
                    style={{ width: 600, maxWidth: '90%', backgroundColor: '#fff' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2 className="modal-title__title">
                                    {form.mode === 'Ins' ? '부서 등록' : '부서 수정'}
                                </h2>
                                <h3 className="modal-title__subtitle">부서 정보를 관리합니다.</h3>
                            </div>
                            <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
                        </div>

                        <div className="modal-body tab-content">
                            <div className="modal-body__content tab-pane show active">

                                {/* 기관 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">기�?<span className="text-danger">*</span></label>
                                            <CommonSelect
                                                comboId="insttCode" 
                                                comboName="insttCode"
                                                comboData={insttOptions}
                                                value={form.insttCode || ''}
                                                readOnly={form.mode !== 'Ins'}
                                                disabled={form.mode !== 'Ins' ? true : false}
                                                className="form-select"
                                               placeholder="기관을 선택하세요"
                                                onChange={(e) => {
                                                    updateForm({ insttCode: e.target.value, partEtc1: '', partEtc2: '', tenantId: '' });
                                                    loadCtiGroup(e.target.value);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 부서명 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">부서명<span className="text-danger">*</span></label>
                                            <input type="text" className="form-control"
                                                value={form.partNm}
                                                onChange={(e) => updateForm({ partNm: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {/* 부서장 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">부서장</label>
                                            <div className="input-group">
                                                <input type="text" className="form-control"
                                                    value={form.partHeadUserName} readOnly />
                                                <button type="button"
                                                    className="btn btn-outline-secondary btn-outline__gray"
                                                    onClick={() => setIsUserSearchOpen(true)}>검색</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 상세설명 */}
                                <div className="row input-box-wrap">
                                    <div className="col-12">
                                        <div className="input-box">
                                            <label className="form-label">상세설명</label>
                                            <input type="text" className="form-control"
                                                value={form.partDc}
                                                onChange={(e) => updateForm({ partDc: e.target.value })} />
                                        </div>
                                    </div>
                                </div>

                                {/* 상위부서 + 정렬순서 */}
                                <div className="row input-box-wrap">
                                    <div className="col-7">
                                        <div className="input-box">
                                             <label className="form-label">상위부서<span className="text-danger">*</span></label>
                                            <select className="form-select"
                                                value={form.parentPartId}
                                                onChange={(e) => updateForm({ parentPartId: e.target.value })}>
                                                <option value="">선택</option>
                                                {parentPartOptions.map((p) => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-5">
                                        <div className="input-box">
                                            <label className="form-label">정렬순서</label>
                                            <select className="form-select"
                                                value={form.partOrder}
                                                onChange={(e) => updateForm({ partOrder: e.target.value })}>
                                                <option value="">선택</option>
                                                {PART_ORDER_OPTIONS.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* CTI 부서 + CTI team */}
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">CTI 부서</label>
                                            <select className="form-select"
                                                value={form.partEtc1}
                                                onChange={(e) => {
                                                    updateForm({ partEtc1: e.target.value, partEtc2: '' });
                                                    loadCtiTeam(form.tenantId, e.target.value);
                                                }}>
                                                {ctiGroupOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">CTI team</label>
                                            <select className="form-select"
                                                value={form.partEtc2}
                                                onChange={(e) => updateForm({ partEtc2: e.target.value })}>
                                                {ctiTeamOptions.map((o) => (
                                                    <option key={o.value} value={o.value}>{o.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                 {/* 사용유무 + 종료유무 */}
                                <div className="row input-box-wrap">
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">사용 유무</label>
                                            <div className="d-flex gap-3 align-items-center" style={{ height: 32 }}>
                                                <label className="mb-0">
                                                    <input type="radio" name="useAt" value="Y"
                                                        checked={form.useAt === 'Y'}
                                                        onChange={() => updateForm({ useAt: 'Y' })} />{' '}사용
                                                </label>
                                                <label className="mb-0">
                                                    <input type="radio" name="useAt" value="N"
                                                        checked={form.useAt === 'N'}
                                                        onChange={() => updateForm({ useAt: 'N' })} />{' '}사용 안함
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="input-box">
                                            <label className="form-label">종료 유무</label>
                                            <div className="d-flex gap-3 align-items-center" style={{ height: 32 }}>
                                                <label className="mb-0">
                                                    <input type="radio" name="useEndAt" value="N"
                                                        checked={form.useEndAt === 'N'}
                                                        onChange={() => updateForm({ useEndAt: 'N' })} />{' '}사용
                                                </label>
                                                <label className="mb-0">
                                                    <input type="radio" name="useEndAt" value="Y"
                                                        checked={form.useEndAt === 'Y'}
                                                        onChange={() => updateForm({ useEndAt: 'Y' })} />{' '}종료
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="modal-footer">
                            <div className="modal-footer__right">
                                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>
                                    {form.mode === 'Ins' ? '등록' : '수정'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <UserSearchModal
                open={isUserSearchOpen}
                insttCode={form.insttCode}
                onSelect={(user) => {
                    updateForm({ partHeadUserId: user.adminId, partHeadUserName: user.adminName });
                    setIsUserSearchOpen(false);
                }}
                onClose={() => setIsUserSearchOpen(false)}
            />
        </>
    );
};

export default PartFormModal;
