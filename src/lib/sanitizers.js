// 1) 전각 → 반각 매핑 (필요한 문자만 최소 치환)
const toHalfWidth = (s) =>
  s.replace(/[！-～]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
   .replace(/［/g, '[').replace(/］/g, ']')
   .replace(/＠/g, '@')
   .replace(/．/g, '.')
   .replace(/－/g, '-')
   .replace(/＿/g, '_');

// 2) 제로폭/보이지 않는 문자 제거
const stripInvisible = (s) =>
  s.replace(/[\u200B-\u200D\uFEFF]/g, '');


// 3) 최종 정규화 파이프라인
export const normalizeEmail = (raw) => {
  if (raw == null) return '';
  return stripInvisible(toHalfWidth(raw)).trim();
};

export const tagFilter = (reqValue) => {
  if (!reqValue) return "";
  return String(reqValue)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\//g, "/");
};

export const tagFilterCnvt = (reqValue) => {
  if (!reqValue) return "";
  return String(reqValue)
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&")
    .replace(/amp;/gi, "")
    .replace(/&quot;/gi, '"')
    .replace(/&lsquo;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/\//g, "/")
    .replace(/&rdquo;/gi, '"');
};