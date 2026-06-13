import { useCallback, useMemo } from 'react';

// KRW 통화 포맷터 훅
export const useKRWFormatter = () => {
    const formatter = useMemo(() => {
        return new Intl.NumberFormat('ko-KR', { // <--- return 키워드 필수!
            style: 'currency',
            currency: 'KRW',
        });
    }, []);
    // 2. 포맷팅 함수 자체를 useCallback으로 감싸 참조 무결성 유지
    // 자식 컴포넌트의 props로 전달될 때 불필요한 리렌더링을 방지합니다.
    const format = useCallback((value) => {
        if (!formatter) return value;
        
        // 숫자가 아니거나 유효하지 않은 값 처리
        const num = Number(value);
        if (isNaN(num)) return value;
        
        return formatter.format(num);
    }, [formatter]);
    return format;
};
// 안전한 문자열 포맷터 훅
export const useSafeFormatter = (defaultFallback = '-') => {
    const safe = (v, fallback = defaultFallback) => (v ?? '').toString().trim() || fallback;
    return { safe };
};
// 날짜 포맷터 훅
export const useDateFormat = () => {
    const formatToDate = useCallback((value) => {
        if (!value) return '';
        
        // 1. 숫자가 아닌 모든 문자 제거 (replaceAll 효과)
        const pureDigits = String(value).replace(/\D/g, '');

        // 2. 8자리 숫자인지 확인 후 포맷팅
        if (pureDigits.length === 8) {
            return pureDigits.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        }

        return value; // 8자리가 아니면 원본 반환
    }, []);

    return { formatToDate };
};
