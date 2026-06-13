// DOM 관련 유틸 함수 모음
// - 팝업 위치 계산 (예: 드롭다운, 툴팁 등)
export function computePopupPosition(inputEl, popupEl, offset = 8) {
    const rect = inputEl.getBoundingClientRect();
    const popupRect = popupEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 기본: 아래쪽 시작 (bottom-start)
    let top = rect.bottom + offset;
    let left = rect.left;

    // 가로 오버플로우 방지
    if (left + popupRect.width > vw - 8) {
        left = Math.max(8, vw - popupRect.width - 8);
    }
    if (left < 8) left = 8;

    // 세로 오버플로우 방지 (아래 공간 부족하면 위로 뒤집기)
    if (top + popupRect.height > vh - 8) {
        const flippedTop = rect.top - popupRect.height - offset;
        if (flippedTop >= 8) {
            top = flippedTop;
        } else {
            // 위/아래 모두 부족하면 화면 안에 최대한 맞추기
            top = Math.max(8, Math.min(top, vh - popupRect.height - 8));
        }
    }

    return { top, left };
}
// 트리 구조에서 모든 key 수집 (예: Ant Design Tree 컴포넌트용)
export const collectAllKeys = (nodes) => {
    const keys = [];
    const walk = (arr) => {
        arr?.forEach((n) => {
            keys.push(String(n.key));
            if (n.children?.length) walk(n.children);
        });
    };
    walk(nodes);
    return keys;
};