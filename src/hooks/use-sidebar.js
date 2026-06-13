import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';

const LS_KEY = 'LEFT_MENU_OPEN_PARENTS_V1';

const serializeOpenParents   = (set) => JSON.stringify(Array.from(set || []));
const deserializeOpenParents = (raw) => {
    try {
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return new Set();
        return new Set(arr.map((n) => Number(n)).filter((n) => Number.isFinite(n)));
    } catch {
        return new Set();
    }
};

export function useSidebar() {
    const didInit  = useRef(false);
    const location = useLocation();

    const [isOpenSideBar, setIsOpenSideBar] = useState(true);
    const toggleSideBar = useCallback(() => {
        setIsOpenSideBar((p) => !p);
        // CSS transition(240ms) 종료 후 ag-grid sizeColumnsToFit 유발
        setTimeout(() => window.dispatchEvent(new CustomEvent('sb:resized')), 260);
    }, []);

    const [items,   setItems]   = useState([]);
    const [loading, setLoading] = useState(false);

    // user-controlled accordion state persisted to localStorage
    const [manualOpenParents, setManualOpenParents] = useState(() =>
        deserializeOpenParents(localStorage.getItem(LS_KEY))
    );

    // menuNo from current URL query string
    const menuNoInt = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const raw    = params.get('menuNo');
        if (!raw) return null;
        const n = Number(raw.replace('#', ''));
        return Number.isFinite(n) ? n : null;
    }, [location.search]);

    // active parent derived from URL menu
    const activeParentNo = useMemo(() => {
        if (!menuNoInt || !items.length) return null;
        const child    = items.find((m) => Number(m.menu_no) === menuNoInt);
        if (!child) return null;
        const parentNo = Number(child.upper_menu_no);
        return Number.isFinite(parentNo) ? parentNo : null;
    }, [menuNoInt, items]);

    // effective open parents: URL-active parent + manually clicked parents (union)
    const openParents = useMemo(() => {
        const set = new Set(manualOpenParents);
        if (activeParentNo != null) set.add(activeParentNo);
        return set;
    }, [activeParentNo, manualOpenParents]);

    // split items into level-2 parents and their level-3 children
    const { parents, childrenByParent } = useMemo(() => {
        const lvl2 = items.filter((m) => Number(m.level) === 2);
        const map  = {};
        items.forEach((m) => {
            if (Number(m.level) === 3) {
                const key = String(m.upper_menu_no);
                (map[key] = map[key] || []).push(m);
            }
        });
        return { parents: lvl2, childrenByParent: map };
    }, [items]);

    // fetch menu items once on mount
    useEffect(() => {
        if (didInit.current) return;
        didInit.current = true;
        let active = true;
        (async () => {
            setLoading(true);
            try {
                const res = await fnAjaxFetch({
                    url: API_URL.LEFT_MENU,
                    method: 'GET',
                    withCredentials: true,
                });
                if (active && res?.data?.resultCode === 200) {
                    setItems(res.data.result?.result ?? []);
                }
            } catch (err) {
                if (err.name !== 'HandledError') console.error('[LEFT_MENU]', err);
            } finally {
                if (active) setLoading(false);
            }
        })();
        return () => { active = false; };
    }, []);

    // persist manual selection to localStorage
    useEffect(() => {
        localStorage.setItem(LS_KEY, serializeOpenParents(manualOpenParents));
    }, [manualOpenParents]);

    // sync across tabs
    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key !== LS_KEY) return;
            setManualOpenParents(deserializeOpenParents(e.newValue));
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // single-accordion: clicking the open parent closes it, clicking another opens it
    const toggleParent = useCallback((menuNo) => {
        setManualOpenParents((prev) =>
            prev.has(menuNo) ? new Set() : new Set([menuNo])
        );
    }, []);

    const buildMenuUrl = useCallback((m) => {
        const connector = m.url?.includes('?') ? '&' : '?';
        return `${m.url}${connector}menuNo=${m.menu_no}`;
    }, []);

    return {
        isOpenSideBar,
        toggleSideBar,
        loading,
        parents,
        childrenByParent,
        openParents,
        activeParentNo,
        menuNoInt,
        toggleParent,
        buildMenuUrl,
    };
}
