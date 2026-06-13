export function toQueryString(param) {
    const usp = new URLSearchParams();
    Object.entries(param).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (typeof v === 'object') {
            usp.append(k, JSON.stringify(v));
        } else {
            usp.append(k, String(v));
        }
    });
    const qs = usp.toString();
    return qs ? `?${qs}` : '';
}
