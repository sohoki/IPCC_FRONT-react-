import { useCallback, useState } from 'react';
// 전화번호 입력 핸들러 (숫자만 허용, 3-4-4 형식 자동 포맷팅)
export const usePhoneInput = (onChange) => {
    // 내부의 핸들러를 useCallback으로 감싸고, 
    // 외부에서 받은 onChange를 의존성 배열에 넣습니다.
    const handleTelChange = useCallback((e) => {
        const { name, value } = e.target;
        const inputVal = value.replace(/[^0-9]/g, '');
        let formattedVal;

        if (inputVal.length < 4) {
            formattedVal = inputVal;
        } else if (inputVal.length < 7) {
            formattedVal = inputVal.replace(/(\d{3})(\d{1,3})/, '$1-$2');
        } else if (inputVal.length < 11) {
            formattedVal = inputVal.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3');
        } else {
            formattedVal = inputVal.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }

        if (onChange) {
            onChange({ [name]: formattedVal.substring(0, 13) });
        }
    }, [onChange]); // 핵심: 부모로부터 받은 onChange가 변경될 때만 함수 재생성

    return { handleTelChange, handleFaxChange: handleTelChange };
};
// 이메일 입력 핸들러 (영문, 숫자, @._- 특수문자만 허용)
export const useEmailInput = (onChange) => {
    const handleEmailChange = useCallback((e) => {
        const { name, value } = e.target;
        
        const sanitizedValue = value.replace(/[^a-zA-Z0-9@._-]/g, "");
        if (onChange) {
            onChange({ [name || 'email']: sanitizedValue });
        }
    }, [onChange]);

    return { handleEmailChange };
};
// 홈페이지 입력 핸들러 (영문, 숫자, URL 특수문자만 허용, 한글 입력 시 조합 중에는 정제 로직을 타지 않게 함)
export const useHomepageChange = (onChange) => {
    const [isComposing, setIsComposing] = useState(false);

    // 한글 조합 시작
    const handleCompositionStart = useCallback(() => {
        setIsComposing(true);
    }, []);

    // 한글 조합 종료 (종료 시점에 최종 정제 실행)
    const handleCompositionEnd = useCallback((e) => {
        setIsComposing(false);
        const { name, value } = e.target;
        
        const cleanedValue = value.replace(/[^a-zA-Z0-9./:?=_@-]/g, "");
        onChange?.({ [name]: cleanedValue });
    }, [onChange]);

    // 일반 입력 핸들러
    const handleHomepageChange = useCallback((e) => {
        const { name, value } = e.target;

        // 한글 조합 중에는 정제 로직을 타지 않게 하여 입력 끊김 방지
        if (isComposing) {
            onChange?.({ [name]: value });
            return;
        }

        // 일반 영문/숫자 입력 시 즉시 정제
        const cleanedValue = value.replace(/[^a-zA-Z0-9./:?=_@-]/g, "");
        onChange?.({ [name]: cleanedValue });
    }, [isComposing, onChange]);

    return { 
        handleHomepageChange, 
        handleCompositionStart, 
        handleCompositionEnd 
    };
};
//우편번호 입력 핸들러 (숫자만 허용, 3글자 이후 하이픈 자동 추가)
export const useZipcodeHandler = (onChange) => {
    
    const handleZipcodeChange = useCallback((e) => {
        const { name, value: rawValue } = e.target;
        
        // 1. 숫자 이외의 문자 제거 (기존 하이픈 포함 모두 제거)
        let value = rawValue.replace(/[^0-9]/g, ""); 
        
        // 2. 3글자가 넘어가면 하이픈(-) 삽입
        // 예: 123456 -> 123-456
        if (value.length > 3) {
            value = value.substring(0, 3) + "-" + value.substring(3, 6);
        } else {
            // 3글자 이하일 때는 숫자만 유지
            value = value.substring(0, 3);
        }

        // 3. 부모의 onChange 호출
        // [name]을 사용하여 comZipcode뿐만 아니라 다른 필드명도 대응 가능하게 함
        onChange?.({ [name]: value });
    }, [onChange]);

    return { handleZipcodeChange };
};