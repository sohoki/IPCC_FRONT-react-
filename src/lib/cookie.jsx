export function getCookie(name) {
    const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (!m) return '';
    try {
        return decodeURIComponent(m[2]);
    } catch (e) {
        // 인코딩이 깨진 경우 원본 값을 반환하거나 빈 값을 반환합니다.
        console.error("쿠키 디코딩 실패:", e);
        return m[2]; 
    }
}
export function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }   
    document.cookie = name + "=" + (encodeURIComponent(value) || "") + expires + "; path=/";
}