import { useState, useEffect, useCallback, useRef } from 'react';
import Swal from '@/lib/swal.js';

export function useMenuTree(fnAjaxFetch, URL, CODE, buildTree, collectAllKeys, params) {
    const [treeData, setTreeData] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    // params를 ref로 보관 — 매 렌더마다 새 객체가 와도 loadTree 재생성을 막는다
    const paramsRef = useRef(params);
    useEffect(() => { paramsRef.current = params; }, [params]);

    const loadTree = useCallback(async (resetForm) => {
        try {
            const res = await fnAjaxFetch({
                url: URL,
                method: 'POST',
                data: paramsRef.current,
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.resultCodeInfo !== 'SUCCESS') {
                await Swal.fire({ icon: CODE.WARNING, title: 'ERROR', text: json?.resultMessage || '목록 조회 실패' });
                return;
            }
            const list = json?.result?.resultList || [];
            const tree = buildTree(list);

            // 트리 데이터와 확장 키를 한 번에 설정해 두 번의 렌더를 방지한다
            setTreeData(tree);
            setExpandedKeys(collectAllKeys(tree));
            setAutoExpandParent(true);

            setSelectedKey(null);
            setSelectedNode(null);
            if (resetForm) resetForm();

        } catch (e) {
            if (e?.name !== 'HandledError') {
                await Swal.fire({ icon: CODE.ERROR, title: 'ERROR', text: e?.message || '트리 조회 실패' });
            }
        }
    // params를 의존성에서 제거 — paramsRef로 최신 값을 읽으므로 안전
    }, [fnAjaxFetch, URL, CODE, buildTree, collectAllKeys]);

    useEffect(() => {
        (async () => { await loadTree(); })();
    }, [loadTree]);

    const calcLevel = useCallback((targetKey) => {
        let level = 0;
        const walk = (nodes, target, currentLevel) => {
            for (const n of nodes) {
                if (String(n.key) === String(target)) {
                    level = currentLevel;
                    return true;
                }
                if (n.children?.length && walk(n.children, target, currentLevel + 1)) return true;
            }
            return false;
        };
        walk(treeData, targetKey, 1);
        return level || 1;
    }, [treeData]);

    return {
        treeData, setTreeData,
        expandedKeys, setExpandedKeys,
        autoExpandParent, setAutoExpandParent,
        selectedKey, setSelectedKey,
        selectedNode, setSelectedNode,
        loadTree, calcLevel,
    };
}
