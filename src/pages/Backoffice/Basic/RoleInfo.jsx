import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gridTheme } from '@/constants/agGridTheme.js';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import RoleFormModal from './components/RoleFormModal.jsx';
import MenuSettingModal from './components/MenuSelectForm.jsx';
import CODE from '@/constants/CODE.jsx';
import { alert } from '@/lib/alert.js';
import Swal from '@/lib/swal.js';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import {useResetForm}  from '@/hooks/use-form.jsx'
import {CommonSelect} from '@/components/Common/Select.jsx';

const normalize = (s) => (s || '').trim();

const INITIAL_ROLE_FORM = {
    mode: "Ins",
    roleId: '',
    systemCode: '',
    roleName: '',
    roleDc: '',
    roleUserGubun: '',
    roleUseyn: 'Y',
    idCheck: 'N',
}

const INITIAL_SEARCH_FORM = {
    searchSystemCode: 'IPCC',
    searchCondition: '',
    searchKeyword: '',
}

/* -------------------------
 * 공통 유틸
 * ------------------------- */
const buildMenuTree = (list) => {
    // list: [{menuNo, upperMenuNo, menuNm, ...}]
    const map = new Map();
    const roots = [];
    list.forEach((m) => {
        map.set(String(m.menuNo), {
            key: String(m.menuNo),
            title: m.upperMenuNo == null ? '관리자' : normalize(m.menuNm),
            children: [],
            data: m,
        });
    });
    list.forEach((m) => {
        const node = map.get(String(m.menuNo));
        if (m.upperMenuNo == null) roots.push(node);
        else {
            const parent = map.get(String(m.upperMenuNo));
            if (parent) parent.children.push(node);
            else roots.push(node);
        }
    });
    return roots;
};


const SYSTEM_PARAMS = { systemUseyn: 'Y', systemMenuUse: 'Y' };
const SYSTEM_MAPPING  = { id: 'systemCode',      text: 'systemName'};
const SEARCH_MENU = { pageIndex: '1', pageUnit: '1000', searchSystemCode : 'IPCC'};



const RoleInfo = () => {
    const gridApiRef = useRef(null)
    //검색 조건 
    const searchRef = useRef(null);
   // 검색 상태
    const [systemCode, setSystemCode] = useState('IPCC'); // 필요시 select 추가
    const [pageUnit] = useState(20);

// 목록 상태

    // 메뉴 설정 모달
    const [menuModalOpen, setMenuModalOpen] = useState(false);
    const [menuGubun, setMenuGubun] = useState('MENU_GUBUN_1'); // 'MENU_GUBUN_1' | 'MENU_GUBUN_2'
    const [menuRoleId, setMenuRoleId] = useState('');
    const [menuTreeData, setMenuTreeData] = useState([]);
    const [menuFlatList, setMenuFlatList] = useState([]); //메뉴 전체 list
    const [menuCheckedKeys, setMenuCheckedKeys] = useState([]); // gubun_1
    const [menuDetailedRows, setMenuDetailedRows] = useState([]); // gubun_2
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    // 권한 폼 모달
    const [roleForm, setRoleForm] = useState(INITIAL_ROLE_FORM);


    const {options: systemOptions, isLoading: isLoadingSystem} = useCustomReqDataCombo({
        url: API_URL.SERVER_SYSTEM_COMBO,
        params: SYSTEM_PARAMS,
        mapping: SYSTEM_MAPPING,
    });

    // 권한 등록/수정 모달 오픈
    const handleOpenRoleModal = useCallback((row, p) => {
        if (row) {
            // 수정 모드
            const rowData = p.data;
            setRoleForm({
                mode: "Edt",
                roleId: rowData.roleId || '',
                systemCode: rowData.systemCode || '',
                roleName: rowData.roleName || '',
                roleDc: rowData.roleDc || '',
                roleUserGubun: rowData.roleUserGubun || '',
                roleUseyn: rowData.roleUseyn || 'Y',
                idCheck: 'Y',
            });
            //grid 선택
            p.node.setSelected(true); 
        } else {
            setRoleForm({
                ...INITIAL_ROLE_FORM,
                systemCode: '',
                roleUseyn: 'Y',
                idCheck: 'N',
            });
            
        }
        setIsRoleModalOpen(true);
    }, [setRoleForm, setIsRoleModalOpen]);



    //검색 및 Grid 해주기 
    const fetchRoleList = useCallback(async (query) => {
       // ✅ params에 필요시 추가  항상 합쳐서 전달
        const req = { ...query }; 

        const res = await fnAjaxFetch({
            url: API_URL.ROLE_LIST,
            method: 'POST',
            data: req, // hook 내부에서 구성한 검색/페이징 파라미터
        });
        const data = res?.data;
        return {
            rows: data?.result.resultList || [],
            total: data?.result.paginationInfo?.totalRecordCount || 0,
        };
    }, []);

    // ✅ 그리드 무한 스크롤 커스텀 훅 (최상위에서 호출)
    const {
        gridApiRef: gridApiFromHook,
        onGridReady,
        defaultColDef,
        tempParams,
        setTempParams,
        handleSearch,
    } = useGridInfinite({
        fetchApi: fetchRoleList,
        pageUnit, // 숫자
        initialFilters: INITIAL_SEARCH_FORM,
    });

    const effectiveGridApiRef = gridApiFromHook ?? gridApiRef;

    // 검색 입력 변경    
	const handleInputChange = useCallback((e) => {
        const { name, value } = e.target; // 'status' | 'condition' | 'keyword'
        setTempParams((prev) => ({ ...prev, [name]: value }));
    }, [setTempParams]);

    // 검색 버튼
    const onSearch = useCallback((pageIndex) => {
        handleSearch(pageIndex || 1);
    }, [tempParams, handleSearch]);

    // 엔터 입력
    const onSearchKeyDown = useCallback((e) => {
        if (e.key === 'Enter') onSearch(1);
    }, [onSearch]);

    // 권한 저장    
	const { handleSubmit : handleRoleSave } = useCommonSubmit({
        form: roleForm,
        type: 'json',
        checkField: [
            { inputId: "roleId",   type: CODE.TEXT, message: "권한 코드를 입력해주세요." },
            { inputId: "roleName", type: CODE.TEXT, message: "권한 이름을 입력해 주세요." },
            { inputId: "systemCode", type: CODE.TEXT, message: "시스템 코드를 선택해 주세요." },
        ],
        confirmMessage: `${roleForm.roleName} " 권한 정보를`,
        gridApiRef : gridApiRef,
        setModalOpen: setIsRoleModalOpen,
        URL: API_URL.ROLE_UPDATE,
        reloadFunction : onSearch
    });

    const { handleReset } = useResetForm(setTempParams, INITIAL_SEARCH_FORM);

    
    // 메뉴 설정 모달 오픈
    const openMenuSetting = useCallback(async (roleId, data) => {
        if (!roleId) {
            await Swal.fire({ icon: CODE.WARNING, title: '입력확인', text: '권한을 선택해 주세요.' });
            return;
        }
        setMenuRoleId(roleId);
        setSystemCode(data?.systemCode || 'IPCC');
        const currentGubun = data?.menuGubun || 'MENU_GUBUN_1';
        setMenuGubun(currentGubun);
        try {
            // 메뉴 트리 로드
            const resMenu = await fnAjaxFetch({
                url: API_URL.MENU_LIST,
                method: 'POST',
                data: { pageIndex: '1', pageUnit: '1000', searchSystemCode: data?.systemCode || 'IPCC' },
                withCredentials: true,
            });
            const jsonMenu = resMenu?.data;
            const list = jsonMenu?.result?.resultList || [];
            setMenuFlatList(list);
            const built = buildMenuTree(list);
            setMenuTreeData(built);

            // 권한-메뉴 매핑 로드
            const resMapping = await fnAjaxFetch({
                url: `${API_URL.ROLE_MENU}/${encodeURIComponent(roleId)}.do`,
                method: 'GET',
                param: { hidMenuGubun: currentGubun, systemCode: data?.systemCode || 'IPCC' },
                withCredentials: true,
            });
            const jsonMap = resMapping?.data;

            if (currentGubun === 'MENU_GUBUN_1') {
                // 체크된 메뉴만 받아서 checkedKeys에 반영
                const checked = (jsonMap?.result?.resultList || []).map((m) => String(m.menuNo));
                setMenuCheckedKeys(checked);
            } else {
                // 상세 권한 (S/I/E/D/X)
                // 서버에서 전체 메뉴와 매핑 권한을 내려준다고 가정
                const rows = (jsonMap?.result?.resultList || []).map((x) => ({
                menuNo: String(x.menuNo),
                menuNm: x.menuNm,
                S: x.menuS ? String(x.menuS) : '0',
                I: x.menuI ? String(x.menuI) : '0',
                E: x.menuE ? String(x.menuE) : '0',
                D: x.menuD ? String(x.menuD) : '0',
                X: x.menuX ? String(x.menuX) : '0',
                }));
                setMenuDetailedRows(rows);
            }

            setMenuModalOpen(true);
        } catch (e) {
            await Swal.fire({ icon: CODE.ERROR, title: 'ERROR', text: e?.message || '메뉴 설정 로드 오류' });
        }
    }, []);

    // 메뉴 설정 변경 핸들러    
	const onChangeDetailedCell = (menuNo, field, value) => {
        setMenuDetailedRows((prev) =>
            prev.map((r) => (r.menuNo === menuNo ? { ...r, [field]: value } : r))
        );
    };
    // 부모 ID를 포함한 전체 키 리스트를 반환하는 함수
    const getAllKeysWithParents = (flatList, checkedKeys) => {
        // id -> { menuNo, upperMenuNo }
        const byId = new Map(flatList.map(m => [String(m.menuNo), m]));
        const all = new Set((checkedKeys || []).map(String));

        const addParentChain = (id) => {
            const node = byId.get(String(id));
            if (!node) return;
            const parentId = node.upperMenuNo == null ? null : String(node.upperMenuNo);
            if (parentId && !all.has(parentId)) {
                all.add(parentId);
                addParentChain(parentId);
            }
        };

        (checkedKeys || []).forEach(k => addParentChain(k));
        return Array.from(all);
    };

    // 메뉴 설정 저장    
	const handleMenuSave = useCallback(async () => {
        if (!menuRoleId) return;
        let payload = {};
        if (menuGubun === 'MENU_GUBUN_1') {
            if (!menuCheckedKeys?.length) {
                await Swal.fire({ icon: CODE.WARNING, title: '메뉴 체크', text: '체크된 값이 없습니다.' });
                return;
            }
            // 부모 포함이 필요하면 여기서 상위 key들을 추가하는 로직을 넣어 주세요.
            const finalKeys = getAllKeysWithParents(menuFlatList, menuCheckedKeys);
            payload = {
                roleId: menuRoleId,
                menuGubun : menuGubun,
                systemCode : systemCode,
                checkedMenuNo: finalKeys.join(','), // 부모 ID가 포함된 문자열            
			};
        } else {
            const anyChecked = menuDetailedRows.some(
                (r) => r.S === '1' || r.I === '1' || r.E === '1' || r.D === '1' || r.X === '1'
            );
            if (!anyChecked) {
                await Swal.fire({ icon: CODE.WARNING, title: '메뉴 체크', text: '체크된 값이 없습니다.' });
                return;
            }
            payload = {
                roleId: menuRoleId,
                menuGubun : menuGubun,
                systemCode : systemCode,
                checkedMenuNo: menuDetailedRows
                .filter((r) => r.S === '1' || r.I === '1' || r.E === '1' || r.D === '1' || r.X === '1')
                .map((r) => r.menuNo)
                .join(','),
                checkedMenuBasic: menuDetailedRows.map((r) => ({
                id: r.menuNo,
                basicMenu: `${r.S}${r.I}${r.E}${r.D}${r.X}`,
                })),
            };
        }

        const ok = await Swal.fire({
            icon: 'question',
            title: '메뉴설정 저장',
            html: `<b>${menuRoleId}</b> 메뉴설정 저장 하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: API_URL.MENU_CREATE_UPDATE, 
                method: 'POST',
                data: payload,
                withCredentials: true,
            });
            const json = res?.data;

            if (json && String(json.resultCode) === "200") {
                if (json?.resultCodeInfo === 'SUCCESS') {
                    setMenuModalOpen(false);
                    await onSearch();
                } else {
                    await Swal.fire({ icon: CODE.WARNING, title: '저장 실패', text: json?.resultMessage || '' });
                }
            }else {
                // ---- 서버 오류/예외: 모달 유지 ----
                await Swal.fire({
                    icon: CODE.ERROR,
                    title: 'ERROR',
                    text: json?.resultMessage || '처리 중 오류가 발생했습니다.',
                });
            }
        } catch (e) {
            await Swal.fire({ icon: CODE.ERROR, title: 'ERROR', text: e?.message || '저장 중 오류' });
        }
    }, [menuRoleId, menuGubun, systemCode, menuCheckedKeys, menuDetailedRows, menuFlatList, onSearch]);


    // 권한 삭제
    const { handleDelete : handleRoleDelete } = useCommonDelete({
        gridApiRef: effectiveGridApiRef,
        URL: API_URL.ROLE_DELETE,
        MESSAGE: `<b>${roleForm.roleName}</b>`,
        reloadFunction: onSearch,
    });

    const updateApi = async (id, newValue) => {
        try {
            const res = await fnAjaxFetch({
            url: API_URL.ROLE_USEYN_UPDATE,
            method: 'POST',
            data: { 
                 roleId: id,   // params.data.roleId와 매칭
                roleUseyn: newValue // 'Y' 또는 'N'
            },
            withCredentials: true
            });
            return res;
        } catch (error) {
            console.error("업데이트 실패:", error);
            throw error;
        }
    };

    // 컬럼 정의 -----------------------------
    const columnDefs = useMemo(() => [
        { headerName: "권한코드",     field: "roleId",      cellStyle: { textAlign: 'left' }, key: true },
        { headerName: "시스템명",       field: "systemName",    cellStyle: { textAlign: 'left' }, flex: 1 },
        { headerName: "권한명",       field: "roleName",    cellStyle: { textAlign: 'left' }, flex: 1 },
        { headerName: "상세설명",     field: "roleDc",      cellStyle: { textAlign: 'left' }, flex: 1.2 },
        { headerName: "사용유무",     field: "roleUseyn",   cellStyle: { textAlign: 'center' }, width: 110,
            cellRenderer: (params) => {
                const handleChange = async (payload) => {
                    const newValue = payload.roleUseyn;
                    try {
                        await updateApi(params.data.roleId, newValue);
                        params.node.setDataValue(params.colDef.field, newValue);
                    } catch (err) {
                        alert.error("수정에 실패했습니다.", "error");
                    }
                };
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <UseSwitch
                            value={params.value}
                            name="roleUseyn"
                            onChange={handleChange}
                            onText="사용"
                            offText="사용안함"
                        />
                    </div>
                );
            }
        },
        { headerName: "생성일자",     field: "frstRegistPnttm", cellStyle: { textAlign: 'left' } ,width: 120,},
        {
            headerName: '메뉴설정여부', field: "chkMenu",
            width: 130, sortable: false, filter: false,
            cellRenderer: (p) => p.data?.chkMenu === 0 ? "미생성" : "생성",
        },
        {
            headerName: '메뉴 설정',
            width: 100, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className='btn btn-outline-secondary btn-outline__gray btn-modify'
                        onClick={() => openMenuSetting(p.data?.roleId, p.data)}
                >메뉴 설정</button>
            ),
        },
        {
            headerName: '수정',
            width: 90, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className='btn btn-outline-secondary btn-outline__gray btn-modify'
                        onClick={() => handleOpenRoleModal(p.data?.roleId, p)}
                >수정</button>
            ),
        },
        {
            headerName: '삭제',
            width: 90, sortable: false, filter: false,
            cellRenderer: (p) => (
                <button className='btn btn-outline-danger btn-outline__gray btn-delete'
                        onClick={() => handleRoleDelete(
                            { code: p.data?.roleId, 
                              name: p.data?.roleName 
                            }, [
                                {
                                    key:"systemCode",
                                    value: p.data?.systemCode
                                }
                            ]
                        )}
                >삭제</button>
            ),
        },
    ], [handleRoleDelete, handleOpenRoleModal, openMenuSetting]);


    const handleSearchChange = useCallback((e) => {
        const { name, value } = e.target;
        setTempParams({ ...INITIAL_SEARCH_FORM, [name]: value });
    }, []);

    const skipFirstRender = useRef(true);
    useEffect(() => {
        if (skipFirstRender.current) { skipFirstRender.current = false; return; }
        handleSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tempParams.searchSystemCode]);

    return (
        <>  
            {/* 본문 */}
            <div className="row g-0 main-contents">
                <div className="col-12 content-header">
                    <div className="content-header__title">
                        권한 관리
                    </div>
                    <div className="content-header__breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">기초 관리</li>
                            <li className="breadcrumb-item">권한 관리</li>
                        </ol>
                    </div>
                </div>

                {/* 검색영역 */}
                <div className="col-12 content-search">
                    <div className="row g-0 w-100 justify-content-between">
                        <div className="col-auto content-search__option">
                            <CommonSelect
                                comboId="searchSystemCode"
                                comboData={systemOptions || []}
                                value={tempParams.searchSystemCode || ''}
                                onChange={handleSearchChange}
                                placeholder={isLoadingSystem ? '로딩 중...' : '시스템을 선택하세요'}
                                style={{ height: 32, fontSize: 15 }}
                            />
                            <select id="searchCondition" 
                                    name="searchCondition"
                                    ref={searchRef} 
                                    value={tempParams.searchCondition} 
                                    onChange={handleInputChange}
                            >
                                <option value="">선택</option>
                                <option value="roleId">권한 ID</option>
                                <option value="roledName">권한명</option>
                            </select>
                            <input
                                type="text"
                                name="searchKeyword"
                                id="searchKeyword"
                                placeholder="검색어를 입력하세요"
                                value={tempParams.searchKeyword}
                                onChange={handleInputChange}
                                onKeyDown={onSearchKeyDown}
                            />
                        </div>

                        <div className="col-auto content-search__action">
                            <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onSearch(1)}>
                                검색
                            </button>
                            <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => handleReset()}>
                                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 8L15 12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1046 16 14.1046 15.5523 14.8284 14.8284" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                검색 초기화
                            </button>
                            <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenRoleModal()}>
                                등록
                            </button>
                        </div>
                    </div>
                </div>

                {/* 목록 */}
                <div className="ol-12 content-table content-table__main">
                    <div className="ag-theme-material" style={{ height: 760, width: '100%' }}>
                        <AppAgGrid
                            columnDefs={columnDefs}
                            theme={gridTheme}
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

                {/* 모달들 */}
                { !isLoadingSystem && (
                    <RoleFormModal
                        open={isRoleModalOpen}
                        form={roleForm}
                        setForm = {setRoleForm}
                        onData={systemOptions}
                        onSubmit={handleRoleSave}
                        onClose={() => setIsRoleModalOpen(false)}
                    />
                )}

                <MenuSettingModal
                    open={menuModalOpen}
                    roleId={menuRoleId}
                    menuGubun={menuGubun}
                    treeData={menuTreeData}
                    checkedKeys={menuCheckedKeys}
                    onCheck={(keys, info) => {
                        const checkedArr = Array.isArray(keys) ? keys : (keys?.checked || []);
                        // half-checked 키는 info.halfCheckedKeys 또는 keys.halfChecked로 접근
                        const halfArr =
                        Array.isArray(keys)
                            ? (info?.halfCheckedKeys || [])
                            : (keys?.halfChecked || []);

                        const merged = Array.from(new Set([...checkedArr, ...halfArr]));
                        setMenuCheckedKeys(merged);
                    }}
                    onChangeCheckedKeys={(keys) => setMenuCheckedKeys(keys)}
                    detailedRows={menuDetailedRows}
                    onChangeDetailedCell={onChangeDetailedCell}
                    onClose={() => setMenuModalOpen(false)}
                    onSave={handleMenuSave}
                />
            </div>
        </>
    );
};
export default RoleInfo;
