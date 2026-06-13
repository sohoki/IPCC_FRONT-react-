export const fmtDate     = (v) => (!v ? '-' : String(v).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'));
export const fmtDateTime = (v) => (!v ? '-' : String(v).replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3 $4:$5:$6'));
export const fmtPhone    = (v) => (!v ? '' : String(v).replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3'));
export const fmtComma    = (v) => (!v ? '0' : Number(v).toLocaleString());
export const todayStr    = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');
//달력 년/월
export const formatMonth = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
};
// 숫자 천 단위 콤마
export function formatNumber(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
//숫자믈 문자로 

export const unformatNumber = (v) =>
  v === null || v === undefined || v === ''  ? '' : String(v).replace(/,/g, '');

export const NVL = (reqValue) => {
  return reqValue === undefined || reqValue === null || reqValue === "" ? "" : reqValue;
};



