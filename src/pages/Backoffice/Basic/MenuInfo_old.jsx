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

// ===== ?¨Ìçº =====
const normalize = (s) => (s || '').trim();

const collectAllKeys = (nodes, result = []) => {
    nodes.forEach((n) => {
        result.push(n.key);
        if (n.children?.length) collectAllKeys(n.children, result);
    });
    return result;
};

// ===== Ïª®ÌÖç?§Ìä∏ Î©îÎâ¥ ??(Ïª¥Ìè¨?åÌä∏ ?∏Î?) =====
function useContextMenu() {
    const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, node: null });

    const show = useCallback((e, node) => {
        e.preventDefault();
        // clientX/Y: Î∑∞Ìè¨??Í∏∞Ï? ??position:fixed ?Ä ?ºÏπò (pageX/Y???§ÌÅ¨Î°??¨Ìï®?¥Îùº ?¥Í∏ã??
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

// ===== flat ??tree Î≥Ä??=====
function buildTree(list) {
    const map = new Map();
    const roots = [];

    list.forEach((m) => {
        map.set(String(m.menuNo), {
            key: String(m.menuNo),
            title: (m.upperMenuNo == null ? 'Í¥ÄÎ¶¨Ïûê' : normalize(m.menuNm)) || '(Î¨¥Ï†ú)',
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

const SYSTEM_PARAMS = { systemUseyn: 'Y', systemMenuUse: 'Y' };
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

    // searchSystemCode ?¨Ìï® ??Î¨∏Ïûê?¥Ïù¥ ??Î∞îÎÄåÎ©¥ Í∞ùÏ≤¥ Ï∞∏Ï°∞ ?†Ï? (Î¨¥Ìïú Î£®ÌîÑ Î∞©Ï?)
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

    // searchSystemCode Î≥ÄÍ≤????∏Î¶¨ ?¨Ï°∞??(ÎßàÏö¥??Ï≤??∏Ï∂ú?Ä useMenuTree ?¥Î??êÏÑú Ï≤òÎ¶¨)
    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current) { isFirstRender.current = false; return; }
        loadTree();
    // loadTree??stable ?®Ïàò?¥Î?Î°?deps?êÏÑú ?òÎèÑ?ÅÏúºÎ°??úÏô∏ ??Î¨¥Ìïú Î£®ÌîÑ Î∞©Ï?
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tempParams.searchSystemCode]);

    // ===== ?∏Î¶¨ ?†ÌÉù =====
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

    // ===== Ïª®ÌÖç?§Ìä∏ Î©îÎâ¥ =====
    const { menu, show, hide } = useContextMenu();

    const onRightClick = useCallback(({ event, node }) => {
        show(event, node);
    }, [show]);

    // ===== ?òÏúÑÎ©îÎâ¥ ?ùÏÑ± =====
    const handleCreateChild = useCallback(async () => {
        hide();
        const node = menu.node;
        if (!node) return;
        const data = node.data;

        if (!data) {
            await alert.warning('?Ä?•Îêú Î©îÎâ¥Îß??òÏúÑÎ©îÎâ¥Î•??ùÏÑ±?????àÏäµ?àÎã§.', "Í≤ΩÍ≥†");
            return;
        }
        const level = calcLevel(node.key);
        if (level >= 3) {
            await alert.warning('???¥ÏÉÅ ?òÏúÑÎ©îÎâ¥Î•??ùÏÑ±?????ÜÏäµ?àÎã§.', "Í≤ΩÍ≥†");
            return;
        }

        const newNodeKey = `new-${Date.now()}`;
        const newNode = {
            title: '??Î©îÎâ¥',
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

        // ?ïÏ†ú ?∏Îìú?êÏÑú menuNo ÏµúÎåìÍ∞?+ 1, menuOrdr ÏµúÎåìÍ∞?+ 1 ?êÎèô Í≥ÑÏÇ∞
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
            menuNm: '??Î©îÎâ¥',
            upperMenuNo: String(data.menuNo),
            upperMenuNm: node.title,
            menuOrdr: nextMenuOrdr,
            menuPageTarget: 'PAGE_GUBUN_4',
            usePrivacy: 'N',
            relateImage: null,
        });
        if (fileRef.current) fileRef.current.value = '';
    }, [menu.node, hide, calcLevel, treeData, setTreeData, setExpandedKeys]);

    // ===== Î©îÎâ¥ ??†ú =====
    const handleDeleteNode = useCallback(async () => {
        hide();
        const node = menu.node;
        if (!node) return;
        const data = node.data;

        if (node.children && node.children.length > 0) {
            await alert.warning('?òÏúÑ Î©îÎâ¥Í∞Ä ?àÎäî Î©îÎâ¥???úÍ±∞?????ÜÏäµ?àÎã§.', "Í≤ΩÍ≥†");
            return;
        }
        if (!data) {
            await loadTree();
            return;
        }
        const ok = await Swal.fire({
            icon: 'question',
            title: 'Î©îÎâ¥ ??†ú',
            html: `<b>${normalize(data.menuNm)}</b>??Î•? ??†ú ?òÏãúÍ≤†Ïäµ?àÍπå?`,
            showCancelButton: true,
            confirmButtonText: '??,
            cancelButtonText: '?ÑÎãà??,
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
                await alert.success(json?.resultMessage || '??†ú?òÏóà?µÎãà??', "?±Í≥µ");
                await loadTree();
            } else {
                await alert.warning(json?.resultMessage || '??†ú ?§Ìå®', "Í≤ΩÍ≥†");
            }
        } catch (e) {
            if (e.name !== 'HandledError') await alert.error(e?.message || '??†ú Ï§??§Î•ò', "?§Î•ò");
        }
    }, [menu.node, hide, loadTree, tempParams.searchSystemCode]);

    // ===== ID Ï§ëÎ≥µ Ï≤¥ÌÅ¨ =====
    const { handleIdCheck } = useIdCheck(API_URL.MENU_ID_CHECK, 'Î©îÎâ¥?ÑÏù¥??);

    const onIdCheck = useCallback(async () => {
        // systemCodeÎ•?ÏøºÎ¶¨ ?åÎùºÎØ∏ÌÑ∞Î°??®Íªò ?ÑÏÜ°
        // ??/menuCheck/{menuNo}.do?systemCode=IPCC
        await handleIdCheck(form.menuNo, setForm, { systemCode: tempParams.searchSystemCode });
    }, [form.menuNo, setForm, handleIdCheck, tempParams.searchSystemCode]);

    // ===== ?Ä??=====
    const dynamicCheckFields = useMemo(() => [
        { inputId: 'menuNo',    type: CODE.TEXT, message: 'Î©îÎâ¥?ÑÏù¥?? },
        { inputId: 'menuNm',    type: CODE.TEXT, message: 'Î©îÎâ¥Î™? },
        { inputId: 'menuOrdr',  type: CODE.TEXT, message: 'Î©îÎâ¥ ?úÏÑú' },
        ...((form.menuPageTarget === "PAGE_GUBUN_4" && !normalize(form.progrmFileNm)) ? [
            { inputId: "progrmFileNm", type: CODE.TEXT, message: "?†ÌÉù???ÑÎ°úÍ∑∏Îû® ?ïÎ≥¥Í∞Ä ?ÜÏäµ?àÎã§" }
        ] : [])
    ], [form.menuPageTarget, form.progrmFileNm]);

    const { handleSubmit: handleMenuSubmit } = useCommonSubmit({
        form,
        type: 'file',
        checkField: dynamicCheckFields,
        uploadField: ['relateImage'],
        idFieldMessage: "Î©îÎâ¥ ?ÑÏù¥??Ï§ëÎ≥µ??,
        confirmMessage: 'Î©îÎâ¥ ?ïÎ≥¥Î•?,
        URL: API_URL.MENU_SAVE,
        reloadFunction: () => {
            setForm(INITIAL_MENU_FORM);
            loadTree();
        },
    });

    // ===== ?ÑÎ°úÍ∑∏Îû® ?ùÏóÖ ?†ÌÉù =====
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
                        systemCode: payload.searchSystemCode || p.systemCode, // ?úÏä§??Î≥ÄÍ≤????ºÏóê??Î∞òÏòÅ
        }));
        setTempParams((p) => ({ ...p, ...payload }));
    }, []);

    return (
        <div className="row g-0 main-contents" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="col-12 content-header" style={{ flexShrink: 0 }}>
                <div className="content-header__title">Î©îÎâ¥ Í¥ÄÎ¶?/div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">Í∏∞Ï¥à Í¥ÄÎ¶?/li>
                        <li className="breadcrumb-item">Î©îÎâ¥ Í¥ÄÎ¶?/li>
                    </ol>
                </div>
            </div>
            <div className="col-12 row gx-4 content-table content-table__sub"
                style={{ flex: 1, overflow: 'hidden', minHeight: 0, maxHeight: '760px' }}>

                {/* ?Ä?Ä Ï¢åÏ∏°: ?∏Î¶¨ ?®ÎÑê ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä */}
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
                    {/* ?§Îçî: ?úÏä§???†ÌÉù */}
                    <div style={{
                        padding: '14px 16px 10px',
                        borderBottom: '1px solid #f0f4f8',
                        flexShrink: 0,
                        background: '#f8fafc',
                    }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '.05em', marginBottom: 8, textTransform: 'uppercase' }}>
                            ?úÏä§???†ÌÉù
                        </div>
                        <CommonSelect
                            comboId="searchSystemCode"
                            comboData={systemOptions || []}
                            value={tempParams.searchSystemCode || ''}
                            onChange={(e) => handleSearchChange({ searchSystemCode: e.target.value })}
                            placeholder={isLoadingSystem ? 'Î°úÎî© Ï§?..' : '?úÏä§?úÏùÑ ?†ÌÉù?òÏÑ∏??}
                            style={{ height: 32, fontSize: 15, fontWeight: 600 }}
                        />
                    </div>

                    {/* ?∏Î¶¨ ?Ä?¥Ì? Î∞?*/}
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
                            Î©îÎâ¥ Íµ¨Ï°∞
                        </span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>?∞ÌÅ¥Î¶?úºÎ°?Î©îÎâ¥ Í¥ÄÎ¶?/span>
                    </div>

                    {/* ?∏Î¶¨ Î≥∏Î¨∏ */}
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
                            /* 1??(Î£®Ìä∏) ?¥Îçî ?¨Í≤å */
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

                {/* ?∞ÌÅ¥Î¶?Ïª®ÌÖç?§Ìä∏ Î©îÎâ¥ */}
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
                        width: 'fit-content',   /* ?çÏä§??Í∏∏Ïù¥??ÎßûÍ≤å */
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
                            ?òÏúÑÎ©îÎâ¥ ?ùÏÑ±
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
                            ?¥ÎãπÎ©îÎâ¥ ?úÍ±∞
                        </button>
                    </div>
                )}

                {/* ?Ä?Ä ?∞Ï∏°: ???®ÎÑê ?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä?Ä */}
                <div className="col-7" style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,.07)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* ???§Îçî */}
                    <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid #f0f4f8', background: '#f8fafc', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={form.mode === 'Ins' ? '#10b981' : '#3b82f6'}><path d={form.mode === 'Ins' ? 'M12 5v14M5 12h14' : 'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7'} stroke={form.mode === 'Ins' ? '#10b981' : '#3b82f6'} strokeWidth="2.5" strokeLinecap="round" fill="none"/></svg>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1e293b' }}>{form.mode === 'Ins' ? 'Î©îÎâ¥ ?±Î°ù' : 'Î©îÎâ¥ ?òÏ†ï'}</span>
                    </div>
                    <p id="detail_tit" className="content-table__title" style={{ display: 'none' }}>{form.mode === 'Ins' ? 'Î©îÎâ¥ ?±Î°ù' : 'Î©îÎâ¥ ?òÏ†ï'}</p>
                    <div className="boardlist tableWrap">
                        <div className="input_form">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <table className="main_table w-100">
                                    <tbody>
                                        <tr className="input-box">
                                            <th>Î©îÎâ¥ ?ÑÏù¥??span className="text-danger">*</span></th>
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
                                                                Ï§ëÎ≥µ?ïÏù∏
                                                            </button>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>Î©îÎâ¥Î™?span className="text-danger">*</span></th>
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
                                            <th>?ÅÏúÑÎ©îÎâ¥Î™?/th>
                                            <td>
                                                <div className="input-group">
                                                    <input type="hidden" name="upperMenuNo" id="upperMenuNo" value={form.upperMenuNo} readOnly />
                                                    <input type="text" name="upperMenuNm" id="upperMenuNm" className="form-control" value={form.upperMenuNm} readOnly />
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>Î©îÎâ¥ ?úÏÑú</th>
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
                                            <th>?ÑÎ°úÍ∑∏Îû®</th>
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
                                                            Í≤Ä??                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>?òÏù¥ÏßÄ ?∞Í≤∞ Íµ¨Î∂Ñ</th>
                                            <td>
                                                <div className="input-group">
                                                    <select
                                                        id="menuPageTarget"
                                                        name="menuPageTarget"
                                                        className="form-select"
                                                        value={form.menuPageTarget || ''}
                                                        onChange={(e) => setForm((p) => ({ ...p, menuPageTarget: e.target.value }))}
                                                    >
                                                        <option value="">{isLoading ? 'LOADING Ï§? : 'Î©îÎâ¥ Íµ¨Î∂Ñ???†ÌÉù??Ï£ºÏÑ∏??'}</option>
                                                        {(pageGubun || []).map((item) => (
                                                            <option key={item.code} value={item.code}>{item.codeNm}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>POP ?ïÎ≥¥</th>
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
                                            <th>Í∞úÏù∏?ïÎ≥¥ ?¨Î?</th>
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
                                                        <span>Í∞úÏù∏?ïÎ≥¥</span>
                                                    </label>
                                                    <label className="d-inline-flex align-items-center gap-1 ms-2">
                                                        <input
                                                            type="radio"
                                                            name="usePrivacy"
                                                            value="N"
                                                            checked={form.usePrivacy === 'N'}
                                                            onChange={() => setForm((p) => ({ ...p, usePrivacy: 'N' }))}
                                                        />
                                                        <span>Í∞úÏù∏?ïÎ≥¥ ?ÑÎãò</span>
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="input-box">
                                            <th>Î©îÎâ¥?§Î™Ö</th>
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
                                        Ï∑®ÏÜå
                                    </button>
                                    <button type="button" className="btn btn-primary btn-default__blue" id="btn_save" onClick={handleMenuSubmit}>
                                        ?Ä??                                    </button>
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
