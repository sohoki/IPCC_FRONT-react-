/**
 * 안전한 스토리지 접근(SSR 또는 브라우저 보안 정책 등으로 window가 없을 수 있음)
 */
const safeLocalStorage = typeof window !== 'undefined' ? window.localStorage : null;
const safeSessionStorage = typeof window !== 'undefined' ? window.sessionStorage : null;

/**
 * JSON.parse 안전 처리
 */
function safeParse(jsonStr) {
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.warn('[storage] JSON parse error:', e);
        return null;
    }
}

/**
 * 스토리지에서 아이템 가져오기
 */
function getItem(storage, key) {
    if (!storage) return null;
    const item = storage.getItem(key);
    return item ? safeParse(item) : null;
}

/**
 * 스토리지에 아이템 저장하기
 */
function setItem(storage, key, value) {
    if (!storage) return;
    storage.setItem(key, JSON.stringify(value));
}

/**
 * 스토리지에서 아이템 삭제하기
 */
function removeItem(storage, key) {
    if (!storage) return;
    storage.removeItem(key);
}

export function getLocalItem(key) {
    return getItem(safeLocalStorage, key);
}

export function setLocalItem(key, value) {
    setItem(safeLocalStorage, key, value);
}

export function removeLocalItem(key) {
    removeItem(safeLocalStorage, key);
}
/* ----------------- SessionStorage ----------------- */

export function getSessionItem(key) {
    return getItem(safeSessionStorage, key);
}

export function setSessionItem(key, value) {
    setItem(safeSessionStorage, key, value);
}

export function removeSessionItem(key) {
    removeItem(safeSessionStorage, key);
}
/* ----------------- 선택: 네임스페이스 유틸 -----------------
   동일 키 충돌을 막고 싶으면 다음 함수로 감싸서 사용하세요.
   예) const ns = createStorageNamespace('myApp');
       ns.setLocal('token', 'abc'); // 내부적으로 myApp:token 키 사용
---------------------------------------------------------------- */
export function createStorageNamespace(namespace) {
    const prefix = namespace ? `${namespace}:` : '';
    const withNs = (key) => `${prefix}${key}`;

    return {
        getLocal: (key) => getLocalItem(withNs(key)),
        setLocal: (key, value) => setLocalItem(withNs(key), value),
        removeLocal: (key) => removeLocalItem(withNs(key)),
        getSession: (key) => getSessionItem(withNs(key)),
        setSession: (key, value) => setSessionItem(withNs(key), value),
        removeSession: (key) => removeSessionItem(withNs(key)),
    };
}