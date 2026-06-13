import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import Swal from '@/lib/swal.js';
import ManagerFormModal from './components/ManagerFormModal.jsx';
import ManagerPwdModal from './components/ManagerPwdModal.jsx';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { CommonSelect } from '@/components/Common/Select.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const INITIAL_MANAGER_FORM = {
    mode: 'Ins',
    adminId: '',
    idCheck: 'N',
    insttCode: '',
    partId: '',
    roleGubun: '',
    roleId: '',
    adminName: '',
    adminTel: '',
    adminPwd: '',
    adminPwdConfirm: '',
    passwordHint: '',
    passwordCnsr: '',
    adminEmail: '',
    useAt: 'Y',
    adminState: 'USER_STATE_1',
    consultantUseyn: 'N',
    pbxExtension: '',
    authInfo: [],
};

const INITIAL_SEARCH_FORM = {
    searchInsttCode: '',
    searchPartId: '',
    searchState: '',
    searchRoleId: '',
    searchCondition: '',
    searchKeyword: '',
};

const INSTT_PARAMS = {};
const INSTT_MAPPING = { id: 'insttCode', text: 'allInsttNm' };

const PART_MAPPING = { id: 'partId', text: 'partNmHi' };
const PART_PARAMS = {};

const STATE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#6366f1', '#94a3b8'];

const ManagerInfo = () => {
    const gridApiRef = useRef(null);
    const [pageUnit] = useState(20);
    const [managerForm, setManagerForm] = useState(INITIAL_MANAGER_FORM);
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [partOptions, setPartOptions] = useState([]);
    const [loadingPartList, setLoadingPartList] = useState(false);
    const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
    const [pwdTarget, setPwdTarget] = useState({ adminId: '', adminName: '' });

    const { options: adminStateOptions } = useCommonCodeData('USER_STATE');

    const { options: insttOptions, isLoading: isLoadingInstt } = useCustomReqDataCombo({
        url: API_URL.INSTT_COMBO,
        method: 'POST',
        params: INSTT_PARAMS,
        mapping: INSTT_MAPPING,
    });

    


    const fetchManagerList = useCallback(async (query) => {
        const res = await fnAjaxFetch({ url: API_URL.EMP_LIST, method: 'POST', data: { ...query } });
        const data = res?.data;
        return {
            rows: data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    }, []);

    const {
        gridApiRef: gridApiFromHook,
        onGridReady,
        defaultColDef,
        tempParams,
        setTempParams,
        handleSearch,
    } = useGridInfinite({ fetchApi: fetchManagerList, pageUnit, initialFilters: INITIAL_SEARCH_FORM });

    const effectiveGridApiRef = gridApiFromHook ?? gridApiRef;

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setTempParams((prev) => ({ ...prev, [name]: value }));
    }, [setTempParams]);

    const onSearch = useCallback((pageIndex) => {
        handleSearch(pageIndex || 1);
    }, [handleSearch]);

    const onSearchKeyDown = useCallback((e) => {
        if (e.key === 'Enter') onSearch(1);
    }, [onSearch]);

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    const handleOpenManagerModal = useCallback(async (adminId) => {
        if (!adminId) {
            setManagerForm({ ...INITIAL_MANAGER_FORM });
            setIsManagerModalOpen(true);
            return;
        }
        try {
            const res = await fnAjaxFetch({ url: `${API_URL.MANAGER_DETAIL}/${adminId}.do`, method: 'GET' });
            const obj = res?.data?.result.result || null;
           
            if (obj) {
                setManagerForm({
                    mode: 'Edt',
                    adminId: adminId,
                    idCheck: 'Y',
                    insttCode: obj.insttCode || '',
                    partId: obj.partId || '',
                    roleGubun: obj.roleGubun || '',
                    roleId: obj.roleId || '',
                    adminName: obj.adminName || '',
                    adminTel: obj.adminTel || '',
                    adminPwd: '',
                    adminPwdConfirm: '',
                    passwordHint: obj.passwordHint || '',
                    passwordCnsr: obj.passwordCnsr || '',
                    adminEmail: obj.adminEmail || '',
                    useAt: obj.useYn || 'Y',
                    adminState: obj.adminStatus || 'USER_STATE_1',
                    consultantUseyn: obj.consultantUseyn || 'N',
                    pbxExtension: obj.pbxExtension || '',
                    authInfo: obj.authInfo || [],
                });
                console.log('managerForm', managerForm);
                setIsManagerModalOpen(true);
            }
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '상세 조회 중 오류' });
        }
    }, []);

    const handleStateChange = useCallback(async (adminId, newState) => {
        try {
            await fnAjaxFetch({
                url: `${API_URL.MANAGER_STATE_CHANGE}/${adminId}.do`,
                method: 'GET',
                param: { adminState: newState, adminPosition: '' },
            });
            onSearch(1);
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '상태 변경 중 오류' });
        }
    }, [onSearch]);

    const { handleDelete: handleManagerDelete } = useCommonDelete({
        gridApiRef: effectiveGridApiRef,
        URL: API_URL.MANAGER_DETAIL,
        MESSAGE: '관리자',
        reloadFunction: onSearch,
    });

    const columnDefs = useMemo(() => [
        { headerName: '아이디', field: 'adminId', cellStyle: { textAlign: 'center' }, width: 120, key: true },
        { headerName: '이름', field: 'adminName', cellStyle: { textAlign: 'center' }, width: 100 },
        { headerName: '기관명', field: 'allInsttNm', cellStyle: { textAlign: 'left' }, flex: 1 },
        { headerName: '부서명', field: 'partNm', cellStyle: { textAlign: 'left' }, flex: 1 },
        { headerName: '권한구분', field: 'roleGubunTxt', cellStyle: { textAlign: 'center' }, width: 100 },
        { headerName: '권한', field: 'roleName', cellStyle: { textAlign: 'center' }, width: 120 },
        { headerName: '이메일', field: 'adminEmail', cellStyle: { textAlign: 'left' }, flex: 1.2 },
        { headerName: '내선번호', field: 'adminTel', cellStyle: { textAlign: 'center' }, width: 100 },
        {
            headerName: '상태', field: 'adminStatus', width: 150, sortable: false,
            cellRenderer: (params) => {
                const idx = adminStateOptions.findIndex(
                    (o) => (o.codeDetailId || o.code) === params.data?.adminStatus
                );
                const color = STATE_COLORS[idx >= 0 ? idx : STATE_COLORS.length - 1];
                return (
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <select
                            value={params.data?.adminStatus || ''}
                            onChange={(e) => handleStateChange(params.data?.adminId, e.target.value)}
                            style={{
                                width: '100%', height: 26, fontSize: 12,
                                border: `1px solid ${color}`, color,
                                outline: 'none', cursor: 'pointer',
                                background: 'transparent',
                            }}
                        >
                            {adminStateOptions.map((o) => (
                                <option key={o.codeDetailId || o.code} value={o.codeDetailId || o.code}>
                                    {o.codeDetailNm || o.codeNm}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            },
        },
        {
            headerName: '사용유무', field: 'useYn', cellStyle: { textAlign: 'center' }, width: 110,
            cellRenderer: (params) => {
                const handleChange = async (payload) => {
                    const newValue = payload.useYn;
                    try {
                        await fnAjaxFetch({
                            url: `${API_URL.MANAGER_USEYN}/${params.data.adminId}.do`,
                            method: 'GET',
                            param: { useYn: newValue },
                            withCredentials: true,
                        });
                        params.node.setDataValue(params.colDef.field, newValue);
                    } catch (e) {
                        await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '사용유무 변경 중 오류' });
                    }
                };
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <UseSwitch
                            value={params.value}
                            name="useYn"
                            onChange={handleChange}
                            onText="사용"
                            offText="사용안함"
                        />
                    </div>
                );
            },
        },
        { headerName: '최종수정일', field: 'lastUpdtPnttm', cellStyle: { textAlign: 'center' }, width: 120 },
        {
            headerName: '비밀번호', width: 90, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => { setPwdTarget({ adminId: p.data?.adminId, adminName: p.data?.adminName }); setIsPwdModalOpen(true); }}>
                    변경                </button>
            ),
        },
        {
            headerName: '수정', width: 80, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-secondary btn-outline__gray btn-modify"
                    onClick={() => handleOpenManagerModal(p.data?.adminId)}>수정</button>
            ),
        },
        {
            headerName: '삭제', width: 80, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className="btn btn-outline-danger btn-outline__gray btn-delete"
                    onClick={() => handleManagerDelete({ code: p.data?.adminId, name: p.data?.adminName })}>삭제</button>
            ),
        },
    ], [adminStateOptions, handleStateChange, handleOpenManagerModal, handleManagerDelete, setPwdTarget, setIsPwdModalOpen]);
    /* --------------------------------------------------------
    *  기관 코드 클릭 시 부서 조회
    * -------------------------------------------------------- */
    const handleInsttClick = useCallback(async (insttCode) => {
        
        if (!insttCode) return;
        try {
            const res = await fnAjaxFetch({
                url: API_URL.PART_COMBO,
                method: 'GET',
                param: { insttCode },
                withCredentials: true,  
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS') {
                const raw = json.result?.resultList || [];
                setPartOptions(raw.map(p => ({ code: p[PART_MAPPING.id], codeNm: p[PART_MAPPING.text] })));
                setLoadingPartList(true);
            } else {
                 await alert('상품 정보 없음', '해당 상품의 판매 코드 정보를 조회할 수 없습니다.', 'warning');
            }       
        } catch (e) {
            await alert('조회 실패', e?.message || '상품의 판매 코드 정보를 조회하는 중 오류가 발생했습니다.', 'error');
        }   
    }, [tempParams.searchInsttCode]);


    return (
        <>
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">관리자 관리</div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">인사 관리</li>
                            <li className="breadcrumb-item">관리자 관리</li>
                        </ol>
                    </div>
                </div>

                <div className="col-12 content-search">
                    <div className="row g-0 w-100 justify-content-between">
                        <div className="col-auto content-search__option">
                            <CommonSelect
                                comboId="searchInsttCode"
                                comboData={insttOptions || []}
                                value={tempParams.searchInsttCode || ''}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    handleInsttClick(e.target.value);
                                    setLoadingPartList(false);
                                }}
                                placeholder={isLoadingInstt ? '로딩 중...' : '기관을 선택하세요'}
                                style={{ height: 32, fontSize: 15 }}
                            />
                            {/* 부서 콤보 */}
                            { tempParams.searchInsttCode && (
                                <CommonSelect
                                    comboId="searchPartId"
                                    comboData={partOptions || []}
                                    value={tempParams.searchPartId || ''}
                                    onChange={handleInputChange}
                                    placeholder={!loadingPartList ? '로딩 중...' : '부서를 선택하세요'}
                                    style={{ height: 32, fontSize: 15 }}
                                />
                            )}
                            <CommonSelect
                                comboId="searchState"
                                comboData={adminStateOptions || []}
                                value={tempParams.searchState || ''}
                                onChange={handleInputChange}
                                placeholder={isLoadingInstt ? '로딩 중...' : '관리자 상태를 선택하세요'}
                                style={{ height: 32, fontSize: 15 }}
                            />                            
                            <select name="searchRoleId" value={tempParams.searchRoleId}
                                onChange={handleInputChange}>
                                <option value="">관리자 권한 선택</option>
                                <option value="ROLE_ADMIN">통합 관리자</option>
                                <option value="ROLE_TEAM">팀장</option>
                                <option value="ROLE_USER">사용자</option>
                            </select>
                            <select name="searchCondition" value={tempParams.searchCondition}
                                onChange={handleInputChange}>
                                <option value="">선택</option>
                                <option value="adminNm">이름</option>
                                <option value="adminId">아이디</option>
                                <option value="adminEmail">이메일</option>
                            </select>
                            <input type="text" name="searchKeyword" placeholder="검색어를 입력하세요"
                                value={tempParams.searchKeyword}
                                onChange={handleInputChange}
                                onKeyDown={onSearchKeyDown}
                            />
                        </div>
                        <div className="col-auto content-search__action">
                            <button type="button" className="btn btn-outline-dark btn-outline__gray"
                                onClick={() => onSearch(1)}>검색</button>
                            <button type="button" className="btn btn-outline-dark btn-outline__gray"
                                onClick={handleReset}>검색 초기화</button>
                            <button type="button" className="btn btn-primary btn-default__blue"
                                onClick={() => handleOpenManagerModal()}>관리자 등록</button>
                        </div>
                    </div>
                </div>

                <div className="col-12 content-table content-table__main">
                    <div className="ag-theme-quartz" style={{ height: 760, width: '100%' }}>
                        <AgGridReact
                            columnDefs={columnDefs}
                            theme={themeQuartz}
                            defaultColDef={defaultColDef}
                            rowModelType="infinite"
                            pagination={true}
                            paginationPageSize={pageUnit}
                            cacheBlockSize={pageUnit}
                            maxBlocksInCache={2}
                            rowSelection={{ mode: 'singleSelect' }}
                            onGridReady={onGridReady}
							overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>"
                            overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
                        />
                    </div>
                </div>

                <ManagerFormModal
                    open={isManagerModalOpen}
                    form={managerForm}
                    setForm={setManagerForm}
                    onData={insttOptions}
                    onClose={() => setIsManagerModalOpen(false)}
                    onSearch={onSearch}
                    setModalOpen={setIsManagerModalOpen}
                />
                <ManagerPwdModal
                    open={isPwdModalOpen}
                    adminId={pwdTarget.adminId}
                    adminName={pwdTarget.adminName}
                    onClose={() => setIsPwdModalOpen(false)}
                />
            </div>
        </>
    );
};

export default ManagerInfo;
