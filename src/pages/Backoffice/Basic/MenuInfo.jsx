import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { alert } from '@/lib/alert.js';
import API_URL from '@/constants/URL.jsx';
import CODE from '@/constants/CODE.jsx';
import { useMenuTree } from '@/hooks/use-menu-tree.js';
import { useCommonCodeData, useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { useIdCheck } from '@/hooks/use-id-check.js';
import {CommonSelect} from '@/components/Common/Select.jsx';


const ProgramSelectModal = React.lazy(() => import('./components/ProgramChoiceModal.jsx'));

// ===== 헬퍼 =====
const normalize = (s) => (s || '').trim();

const collectAllKeys = (nodes, result = []) => {
    nodes.forEach((n) => {
        result.push(n.key);
        if (n.children?.length) collectAllKeys(n.children, result);
    });
    return result;
};

// ===== 컨텍스트 메뉴 훅 (컴포넌트 외부) =====
function useContextMenu() {
    const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, node: null });

    const show = useCallback((e, node) => {
        e.preventDefault();
        setMenu({ visible: true, x: e.clientX, y: e.clientY, node });
    }, []);

    const hide = useCallback(() => {
        setMenu((m) => (m.visible ? { ...m, visible: false, node: null } : m));
    }, []);

    useEffect(() => {
        if (!menu.visible) return;
        const onClick = () => hide();
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, [menu.visible, hide]);

    return { menu, show, hide, setMenu };
}

// ===== flat → tree 변환 =====
function buildTree(list) {
    const map = new Map();
    const roots = [];

    list.forEach((m) => {
        map.set(String(m.menuNo), {
            key: String(m.menuNo),
            title: (m.upperMenuNo == null ? '관리자' : normalize(m.menuNm)) || '(무제)',
            children: [],
            data: m,
        });
    });

    list.forEach((m) => {
        const node = map.get(String(m.menuNo));
        if (m.upperMenuNo == null) {
            roots.push(node);
        } else {
            const parent = map.get(String(m.upperMenuNo));
            if (parent) parent.children.push(node);
            else roots.push(node);
        }
    });

    return roots;
}

const INITIAL_MENU_FORM = {
    mode: 'Ins',
    menuNo: '',
    systemCode: 'IPCC',
    menuNm: '',
    upperMenuNo: '',
    upperMenuNm: '',
    menuOrdr: '0',
    relateImage: null,
    txt_menuClass: '',
    progrmFileNm: '',
    progrmKoreanNm: '',
    menuPageTarget: 'PAGE_GUBUN_4',
    menuPopupnfo: '',
    menuDc: '',
    usePrivacy: 'N',
    menuClass: '',
    idCheck: 'N',
};

const SYSTEM_PARAMS = { systemUseyn: 'Y' };
const SYSTEM_MAPPING  = { id: 'systemCode',      text: 'systemName'};
const SEARCH_MENU = { pageIndex: '1', pageUnit: '1000', searchSystemCode : 'IPCC'};


const MenuInfo = () => {
    const [form, setForm] = useState(INITIAL_MENU_FORM);

    const [tempParams, setTempParams] = useState(SEARCH_MENU);

    const [programModalOpen, setProgramModalOpen] = useState(false);
    const fileRef = useRef(null);

    const { options, isLoading } = useCommonCodeData(["PAGE_GUBUN"]);

    const {options: systemOptions, isLoading: isLoadingSystem} = useCustomReqDataCombo({
        url: API_URL.SERVER_SYSTEM_COMBO,
        params: SYSTEM_PARAMS,
        mapping: SYSTEM_MAPPING,
    });

    const [pageGubun] = options;

    // searchSystemCode 포함 — 문자열이 안 바뀌면 객체 참조 유지 (무한 루프 방지)
    const params = React.useMemo(() => ({
        pageIndex: '1',
        pageUnit: '1000',
        searchSystemCode: tempParams.searchSystemCode,
    }), [tempParams.searchSystemCode]);

    const {
        treeData, setTreeData,
        expandedKeys, setExpandedKeys,
        autoExpandParent, setAutoExpandParent,
        selectedKey, setSelectedKey,
        loadTree, calcLevel,
    } = useMenuTree(fnAjaxFetch, API_URL.MENU_LIST, CODE, buildTree, collectAllKeys, params);

    // searchSystemCode 변경 시 트리 재조회 (마운트 첫 호출은 useMenuTree 내부에서 처리)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        loadTree();
    // loadTree는 stable 함수이므로 deps에서 의도적으로 제외 — 무한 루프 방지
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tempParams.searchSystemCode]);

    // ===== 트리 선택 =====
    const onSelect = useCallback((keys, info) => {
        const node = info.node;
        const ret = node?.data;
        if (!ret) return;

        setSelectedKey(keys?.[0] ?? null);

        let parentTitle = '';
        if (ret?.upperMenuNo != null) {
            const findNode = (arr, key) => {
                for (const n of arr) {
                    if (n.key === String(key)) return n;
                    const f = findNode(n.children || [], key);
                    if (f) return f;
                }
                return null;
            };
            parentTitle = findNode(treeData, String(ret.upperMenuNo))?.title || '';
        }

        setForm((p) => ({
            ...p,
            mode: 'Edt',
            idCheck: 'Y',
            menuNo: String(ret.menuNo),
            menuNm: normalize(ret.menuNm),
            upperMenuNo: ret.upperMenuNo != null ? String(ret.upperMenuNo) : '',
            upperMenuNm: parentTitle,
            menuOrdr: String(ret.menuOrdr ?? '0'),
            progrmFileNm: ret.progrmFileNm || '',
            progrmKoreanNm: ret.progrmKoreanNm || '',
            menuPageTarget: ret.menuPageTarget || 'PAGE_GUBUN_4',
            menuPopupnfo: ret.menuPopupnfo || '',
            menuDc: ret.menuDc || '',
            txt_menuClass: ret.menuClass || '',
            usePrivacy: ret.menuPrivacy || 'N',
            relateImage: null,
        }));
        if (fileRef.current) fileRef.current.value = '';
    }, [treeData, setSelectedKey]);

    // ===== 컨텍스트 메뉴 =====
    const { menu, show, hide } = useContextMenu();

    const onRightClick = useCallback(({ event, node }) => {
        show(event, node);
    }, [show]);

    // ===== 하위메뉴 생성 =====
    const handleCreateChild = useCallback(async () => {
        hide();
        const node = menu.node;
        if (!node) return;
        const data = node.data;

        if (!data) {
            await alert.warning('저장된 메뉴만 하위메뉴를 생성할 수 있습니다.', "경고");
            return;
        }
        const level = calcLevel(node.key);
        if (level >= 3) {
            await alert.warning('더 이상 하위메뉴를 생성할 수 없습니다.', "경고");
            return;
        }

        const newNodeKey = `new-${Date.now()}`;
        const newNode = {
            title: '새 메뉴',
            key: newNodeKey,
            isNew: true,
            data: null,
            level: node.data.level + 1,
        };
        const targetKey = node.key;
        const updateTreeData = (list) =>
            list.map((item) => {
                if (item.key === targetKey) {
                    return { ...item, children: [...(item.children || []), newNode] };
                }
                if (item.children) {
                    return { ...item, children: updateTreeData(item.children) };
                }
                return item;
            });

        setTreeData(updateTreeData(treeData));
        setExpandedKeys((prev) => [...new Set([...prev, node.key])]);

        // ?�제 ?�드?�서 menuNo 최댓�?+ 1, menuOrdr 최댓�?+ 1 ?�동 계산
        const siblings = node.children || [];
        const siblingNos   = siblings.map(s => Number(s.data?.menuNo)).filter(n => Number.isFinite(n));
        const siblingOrdrs = siblings.map(s => Number(s.data?.menuOrdr)).filter(n => Number.isFinite(n));
        const nextMenuNo   = siblingNos.length   > 0 ? String(Math.max(...siblingNos)   + 1) : '';
        const nextMenuOrdr = siblingOrdrs.length > 0 ? String(Math.max(...siblingOrdrs) + 1) : '1';

        setForm({
            ...INITIAL_MENU_FORM,
            mode: 'Ins',
            idCheck: 'N',
            menuNo: nextMenuNo,
            menuNm: '새 메뉴',
            upperMenuNo: String(data.menuNo),
            upperMenuNm: node.title,
            menuOrdr: nextMenuOrdr,
            menuPageTarget: 'PAGE_GUBUN_4',
            usePrivacy: 'N',
            relateImage: null,
        });
        if (fileRef.current) fileRef.current.value = '';
    }, [menu.node, hide, calcLevel, treeData, setTreeData, setExpandedKeys]);

    // ===== 메뉴 삭제 =====
    const handleDeleteNode = useCallback(async () => {
        hide();
        const node = menu.node;
        if (!node) return;
        const data = node.data;

        if (node.children && node.children.length > 0) {
            await alert.warning('하위 메뉴가 있는 메뉴는 제거할 수 없습니다.', "경고");
            return;
        }
        if (!data) {
            await loadTree();
            return;
        }
        const ok = await Swal.fire({
            icon: 'question',
            title: '메뉴 삭제',
            html: `<b>${normalize(data.menuNm)}</b>을(를) 삭제 하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
            focusCancel: true,
        });
        if (!ok.isConfirmed) return;

        try {
            const res = await fnAjaxFetch({
                url: `${API_URL.MENU_DELETE}/${encodeURIComponent(String(data.menuNo))}.do?systemCode=${encodeURIComponent(tempParams.searchSystemCode || '')}`,
                method: 'DELETE',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS') {
                await alert.success(json?.resultMessage || '삭제되었습니다.', "성공");
                await loadTree();
            } else {
                await alert.warning(json?.resultMessage || '삭제 실패', "경고");
            }
        } catch (e) {
            if (e.name !== 'HandledError') await alert.error(e?.message || '삭제 중 오류', "오류");
        }
    }, [menu.node, hide, loadTree, tempParams.searchSystemCode]);

    // ===== ID 중복 체크 =====
    const { handleIdCheck } = useIdCheck(API_URL.MENU_ID_CHECK, '메뉴아이디');

    const onIdCheck = useCallback(async () => {

        await handleIdCheck(form.menuNo, setForm, { systemCode: tempParams.searchSystemCode });
    }, [form.menuNo, setForm, handleIdCheck, tempParams.searchSystemCode]);

    // ===== ?�??=====
    const dynamicCheckFields = useMemo(() => [
         { inputId: 'menuNo',    type: CODE.TEXT, message: '메뉴아이디' },
        { inputId: 'menuNm',    type: CODE.TEXT, message: '메뉴명' },
        { inputId: 'menuOrdr',  type: CODE.TEXT, message: '메뉴 순서' },
        ...((form.menuPageTarget === "PAGE_GUBUN_4" && !normalize(form.progrmFileNm)) ? [
            { inputId: "progrmFileNm", type: CODE.TEXT, message: "선택된 프로그램 정보가 없습니다" }
        ] : [])
    ], [form.menuPageTarget, form.progrmFileNm]);

    const { handleSubmit: handleMenuSubmit } = useCommonSubmit({
        form,
        type: 'file',
        checkField: dynamicCheckFields,
        uploadField: ['relateImage'],
        idFieldMessage: "메뉴 아이디 중복을",
        confirmMessage: '메뉴 정보를',
        URL: API_URL.MENU_SAVE,
        reloadFunction: () => {
            setForm(INITIAL_MENU_FORM);
            loadTree();
        },
    });

    // ===== 프로그램 팝업 선택 =====
    const handleProgramSelect = useCallback((row) => {
        setForm((p) => ({
            ...p,
            progrmFileNm: row.progrmFileNm || '',
            progrmKoreanNm: row.progrmKoreannm || '',
            menuPageTarget: 'PAGE_GUBUN_4',
        }));
        setProgramModalOpen(false);
    }, []);

    const handleSearchChange = useCallback((payload) => {
        setForm((p) => ({ ...p, ...payload, 
                        systemCode: payload.searchSystemCode || p.systemCode, // 시스템 변경 시 폼에도 반영
        }));
        setTempParams((p) => ({ ...p, ...payload }));
    }, []);

    return (
        <div className="row g-0 main-contents" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="col-12 content-header" style={{ flexShrink: 0 }}>
                <div className="content-header__title">메뉴 관리</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">기초 관리</li>
                        <li className="breadcrumb-item">메뉴 관리</li>
                    </ol>
                </div>
            </div>
            <div className="col-12 row gx-4 content-table content-table__sub"
                style={{ flex: 1, overflow: 'hidden', minHeight: 0, maxHeight: '760px' }}>

                {/* ── 좌측: 트리 패널 ─────────────────────────────────── */}
                <div
                    className="col-5"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: 0,
                        maxHeight: '760px',
                        background: '#fff',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                        overflow: 'hidden',
                    }}
                >
                    {/* 헤더: 시스템 선택 */}
                    <div style={{
                        padding: '14px 16px 10px',
                        borderBottom: '1px solid #f0f4f8',
                        flexShrink: 0,
                        background: '#f8fafc',
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                            시스템 선택
                        </div>
                        <CommonSelect
                            comboId="searchSystemCode"
                            comboData={systemOptions || []}
                            value={tempParams.searchSystemCode || ''}
                            onChange={(e) => handleSearchChange({ searchSystemCode: e.target.value })}
                            placeholder={isLoadingSystem ? '로딩 중...' : '시스템을 선택하세요'}
                            style={{ height: 28, fontSize: 12, fontWeight: 600 }}
                        />
                    </div>

                    {/* 트리 타이틀 바 */}
                    <div style={{
                        padding: '10px 16px 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #f0f4f8',
                        flexShrink: 0,
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6"><path d="M4 6C4 4.9 4.9 4 6 4H10L12 6H18C19.1 6 20 6.9 20 8V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6Z"/></svg>
                            메뉴 구조
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>우클릭으로 메뉴 관리</span>
                    </div>

                    {/* 트리 본문 */}
                    <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 12px 12px' }}>
                        <style>{`
                            .menu-tree .rc-tree-node-content-wrapper {
                                padding: 5px 8px;
                                border-radius: 6px;
                                transition: background .15s;
                                font-size: 14px;
                                font-weight: 500;
                                color: #334155;
                            }
                            .menu-tree .rc-tree-node-content-wrapper:hover {
                                background: #eff6ff !important;
                                color: #1d4ed8;
                            }
                            .menu-tree .rc-tree-node-content-wrapper.rc-tree-node-selected {
                                background: #dbeafe !important;
                                color: #1d4ed8;
                                font-weight: 700;
                            }
                            .menu-tree .rc-tree-title { font-size: 14px; }
                            .menu-tree .rc-tree-switcher { color: #94a3b8; font-size: 13px; }
                            .menu-tree .rc-tree-treenode { margin-bottom: 2px; }
                            /* 1단 (루트) 폴더 크게 */
                            .menu-tree > ul > .rc-tree-treenode > .rc-tree-node-content-wrapper .rc-tree-title {
                                font-size: 15px;
                                font-weight: 700;
                                color: #1e293b;
                            }
                        `}</style>
                        <Tree
                            className="menu-tree"
                            treeData={treeData}
                            expandedKeys={expandedKeys}
                            selectedKeys={selectedKey ? [selectedKey] : []}
                            autoExpandParent={autoExpandParent}
                            onExpand={(keys) => {
                                setExpandedKeys(keys);
                                setAutoExpandParent(false);
                            }}
                            onSelect={onSelect}
                            onRightClick={onRightClick}
                            defaultExpandAll
                        />
                    </div>
                </div>

                {/* 우클릭 컨텍스트 메뉴 */}
                {menu.visible && (
                    <div style={{
                        position: 'fixed',
                        top: menu.y,
                        left: menu.x,
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        zIndex: 2000,
                        boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                        padding: '4px 0',
                        width: 'fit-content',   /* 텍스트 길이에 맞게 */
                        whiteSpace: 'nowrap',
                        transform: menu.y > window.innerHeight * 0.8 ? 'translateY(-100%)' : 'none',
                    }}>
                        <button
                            type="button"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 30px 9px 14px', width: '100%', textAlign: 'left', border: 'none', background: 'none', fontSize: 13, color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            onClick={handleCreateChild}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="#3b82f6"><path d="M12 5v14M5 12h14" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"/></svg>
                            하위메뉴 생성
                        </button>
                        <div style={{ height: 1, background: '#f1f5f9', margin: '2px 0' }} />
                        <button
                            type="button"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 30px 9px 14px', width: '100%', textAlign: 'left', border: 'none', background: 'none', fontSize: 13, color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#fff1f2'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                            onClick={handleDeleteNode}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                            해당메뉴 제거
                        </button>
                    </div>
                )}

                {/* ── 우측: 폼 패널 ───────────────────────────────────── */}
                <div className="col-7" style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* 폼 헤더 */}
                    <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #f0f4f8', background: '#f8fafc', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={form.mode === 'Ins' ? '#10b981' : '#3b82f6'}><path d={form.mode === 'Ins' ? 'M12 5v14M5 12h14' : 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7'} stroke={form.mode === 'Ins' ? '#10b981' : '#3b82f6'} strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{form.mode === 'Ins' ? '메뉴 등록' : '메뉴 수정'}</span>
                    </div>
                    <p id="detail_tit" className="content-table__title" style={{ display: 'none' }}>{form.mode === 'Ins' ? '메뉴 등록' : '메뉴 수정'}</p>
                    <div className="boardlist tableWrap">
                        <div className="input_form">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <table className="main_table w-100">
                                    <tbody>
                                        <tr className="input-box">
                                            <th>메뉴 아이디<span className="text-danger">*</span></th>
                                            <td>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        name="menuNo"
                                                        id="menuNo"
                                                        className="form-control"
                                                        value={form.menuNo}
                                                        readOnly={form.mode !== 'Ins'}
                                                        onChange={(e) => setForm((p) => ({ ...p, menuNo: e.target.value, idCheck: 'N' }))}
                                                    />
                                                    {form.mode === 'Ins' && (
                                                        <span>
                                                            <button type="button" onClick={onIdCheck} className="btn btn-primary btn-default__blue">
                                                                중복확인
                                                            </button>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>메뉴명<span className="text-danger">*</span></th>
                                            <td>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        name="menuNm"
                                                        id="menuNm"
                                                        className="form-control"
                                                        value={form.menuNm}
                                                        onChange={(e) => setForm((p) => ({ ...p, menuNm: e.target.value }))}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>상위메뉴명</th>
                                            <td>
                                                <div className="input-group">
                                                    <input type="hidden" name="upperMenuNo" id="upperMenuNo" value={form.upperMenuNo} readOnly />
                                                    <input type="text" name="upperMenuNm" id="upperMenuNm" className="form-control" value={form.upperMenuNm} readOnly />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>메뉴 순서</th>
                                            <td>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        name="menuOrdr"
                                                        id="menuOrdr"
                                                        inputMode="numeric"
                                                        className="form-control"
                                                        value={form.menuOrdr}
                                                        onChange={(e) => setForm((p) => ({ ...p, menuOrdr: e.target.value.replace(/[^\d]/g, '') }))}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>ICON</th>
                                            <td>
                                                <input
                                                    type="file"
                                                    name="relateImage"
                                                    id="relateImage"
                                                    className="form-control"
                                                    ref={fileRef}
                                                    onChange={(e) => setForm((p) => ({ ...p, relateImage: e.target.files?.[0] || null }))}
                                                />
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>MENU CLASS</th>
                                            <td>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        name="txt_menuClass"
                                                        id="txt_menuClass"
                                                        className="form-control"
                                                        value={form.txt_menuClass}
                                                        onChange={(e) => setForm((p) => ({ ...p, txt_menuClass: e.target.value }))}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>프로그램</th>
                                            <td>
                                                <div className="input-group">
                                                    <input type="hidden" name="progrmFileNm" id="progrmFileNm" value={form.progrmFileNm} readOnly />
                                                    <input
                                                        type="text"
                                                        name="progrmKoreanNm"
                                                        id="progrmKoreanNm"
                                                        className="form-control"
                                                        value={form.progrmKoreanNm}
                                                        readOnly
                                                    />
                                                    {form.menuPageTarget === 'PAGE_GUBUN_4' && (
                                                        <button
                                                            type="button"
                                                            id="btn_ProgramSearch"
                                                            className="btn btn-outline-secondary ms-2"
                                                            onClick={() => setProgramModalOpen(true)}
                                                        >
                                                            검색                                                     
														</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>페이지 연결 구분</th>
                                            <td>
                                                <div className="input-group">
                                                    <select
                                                        id="menuPageTarget"
                                                        name="menuPageTarget"
                                                        className="form-select"
                                                        value={form.menuPageTarget || ''}
                                                        onChange={(e) => setForm((p) => ({ ...p, menuPageTarget: e.target.value }))}
                                                    >
                                                        <option value="">{isLoading ? 'LOADING 중' : '메뉴 구분을 선택해 주세요.'}</option>
                                                        {(pageGubun || []).map((item) => (
                                                            <option key={item.code} value={item.code}>{item.codeNm}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>POP 정보</th>
                                            <td>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        id="menuPopupnfo"
                                                        name="menuPopupnfo"
                                                        className="form-control"
                                                        value={form.menuPopupnfo}
                                                        onChange={(e) => setForm((p) => ({ ...p, menuPopupnfo: e.target.value }))}
                                                        style={{ display: form.menuPageTarget === 'PAGE_GUBUN_4' ? 'none' : undefined }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>개인정보 여부</th>
                                            <td>
                                                <div className="input-group gap-3 align-items-center">
                                                    <label className="d-inline-flex align-items-center gap-1">
                                                        <input
                                                            type="radio"
                                                            name="usePrivacy"
                                                            value="Y"
                                                            checked={form.usePrivacy === 'Y'}
                                                            onChange={() => setForm((p) => ({ ...p, usePrivacy: 'Y' }))}
                                                        />
                                                        <span>개인정보</span>
                                                    </label>
                                                    <label className="d-inline-flex align-items-center gap-1 ms-2">
                                                        <input
                                                            type="radio"
                                                            name="usePrivacy"
                                                            value="N"
                                                            checked={form.usePrivacy === 'N'}
                                                            onChange={() => setForm((p) => ({ ...p, usePrivacy: 'N' }))}
                                                        />
                                                        <span>개인정보 아님</span>
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>메뉴설명</th>
                                            <td>
                                                <textarea
                                                    name="menuDc"
                                                    id="menuDc"
                                                    cols={50}
                                                    rows={5}
                                                    className="form-control"
                                                    value={form.menuDc}
                                                    onChange={(e) => setForm((p) => ({ ...p, menuDc: e.target.value }))}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className="content-search__action justify-content-end p-2 d-flex gap-2">
                                    <button type="button" onClick={loadTree} className="btn btn-outline-dark btn-outline__gray">
                                        취소
                                    </button>
                                    <button type="button" className="btn btn-primary btn-default__blue" id="btn_save" onClick={handleMenuSubmit}>
                                        저장
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Suspense fallback={null}>
                {programModalOpen && (
                    <ProgramSelectModal
                        open={programModalOpen}
                        onClose={() => setProgramModalOpen(false)}
                        onSelect={handleProgramSelect}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default MenuInfo;
