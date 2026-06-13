import Swal from '@/lib/swal.js';
import { normalizeEmail } from '@/lib/sanitizers.js';
import { telRegex, passwordRegex, emailRegex } from '@/lib/validators.js';

export async function validateNotEmptyById( inputId, message, options = {}) {
    const { highlightMs = 2000, borderColor = 'red', focus = true } = options;
    const el = document.getElementById(inputId);

    if (!el || el.value.trim() === "") {
        // 1. 기존 보더 저장 및 빨간색 적용
        const prevBorder = el.style.borderColor;
        el.style.borderColor = borderColor;
        el.style.boxShadow = '0 0 0 0.2rem rgba(255, 0, 0, 0.25)'; // 부드러운 강조 효과 추가

        // 2. 특정 시간 후 원래대로 복구 (비동기로 미리 실행)
        setTimeout(() => {
            if (el) {
                el.style.borderColor = prevBorder; // 원래대로 (보통 "")
                el.style.boxShadow = '';            // 강조 효과 제거
            }
        }, highlightMs);

        // 3. 사용자에게 알림 표시 (확인 누를 때까지 대기)
        await Swal.fire({
            icon: 'warning',
            title: '필수 입력 확인',
            text: message,
            confirmButtonText: '확인',
        });

        if (focus) el.focus();
        return false;
    }
    return true;
}

export async function valuedateMatch(preId, checkId, warnMessage){
    // 1. 요소 가져오기
    const preEl = document.getElementById(preId);
    const checkEl = document.getElementById(checkId);

    if (!preEl || !checkEl) return false;

    // 2. 값(value) 비교 (Element 자체를 비교하면 항상 false입니다)
    const isMatch = preEl.value === checkEl.value;

    if (isMatch) return true;

    const highlightMs = 2000; 
    const errorColor = '#dc3545'; // Bootstrap 위험색(빨강)
    const prevBorder = preEl.style.borderColor;
    const prevBoxShadow = preEl.style.boxShadow;

    preEl.style.borderColor = errorColor;
    preEl.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';

    // 원래 스타일로 복구
    setTimeout(() => {
        if (preEl) {
            preEl.style.borderColor = prevBorder;
            preEl.style.boxShadow = prevBoxShadow;
        }
    }, highlightMs);

    // 3. SweetAlert2 경고창
    await Swal.fire({
        icon: 'warning',
        title: '입력값 확인',
        text: warnMessage,
        confirmButtonText: '확인',
    });

    // 4. 포커스 이동
    preEl.focus();
    return false;
}

export async function validateNotEmptyByType(inputId, message, inputType, options = {}) {
    const { highlightMs = 2000, borderColor = 'red', focus = true } = options;
    const el = document.getElementById(inputId);

    // 엘리먼트가 없거나 value 접근 불가하면 실패 처리
    const value = (el && typeof el.value === 'string') ? el.value.trim() : '';

    // 타입별 검증
    let isValid;
    let warnMessage = message; // 기본 메시지를 우선 사용

    switch (inputType) {
        case 'text':
        isValid = !!value;
        // 필요시 사용자 메시지 커스터마이즈
        if (!isValid && !warnMessage) warnMessage = '값을 입력해 주세요.';
        break;
        case 'tel': // ☎️ 전화번호 검증 추가
        isValid = !!value && telRegex.test(value);
        if (!value && !warnMessage) {
            warnMessage = '전화번호를 입력해 주세요.';
        } else if (!!value && !telRegex.test(value)) {
            warnMessage = '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)';
        }
        break;
            case 'select':
            isValid = !!value;
            // 필요시 사용자 메시지 커스터마이즈
            if (!isValid && !warnMessage) warnMessage = '값을 선택해 주세요.';
            break;
        case 'password':
            // 비어있거나 정규식 불일치 시 실패
            isValid = !!value && passwordRegex.test(value);
            if (!value && !warnMessage) {
                warnMessage = '비밀번호를 입력해 주세요.';
            } else if (!!value && !passwordRegex.test(value)) {
                warnMessage = '비밀번호는 8~16자, 영문/숫자/특수문자(@$!%*#?&)를 각각 1자 이상 포함해야 합니다.';
            }
            break;
        case 'email': {
            // 비어있거나 정규식 불일치 시 실패
            const normalized = normalizeEmail(value);
            console.log("normalized:" + normalized + ":" + value);

            isValid = !!normalized && emailRegex.test(normalized);
            if (!value && !warnMessage) {
                warnMessage = '이메일을 입력해 주세요.';
            } else if (!!value && !emailRegex.test(value)) {
                warnMessage = '올바른 이메일 형식이 아닙니다.';
            }
            break;
        }
        default:
            // 알 수 없는 타입이면 기본적으로 "비어있음"만 체크
            isValid = !!value;
            if (!isValid && !warnMessage) warnMessage = '값을 입력해 주세요.';
        break;
    }

    if (isValid) return true;

    // ❌ 유효하지 않은 경우: 시각 강조 + 알림 + 포커스
    if (el) {
        const prevBorder = el.style.borderColor;
        const prevBoxShadow = el.style.boxShadow;

        el.style.borderColor = borderColor;
        el.style.boxShadow = '0 0 0 0.2rem rgba(255, 0, 0, 0.25)';

        setTimeout(() => {
        if (el) {
            el.style.borderColor = prevBorder;
            el.style.boxShadow = prevBoxShadow;
        }
        }, highlightMs);
    }

    await Swal.fire({
        icon: 'warning',
        title: '입력값 확인',
        text: warnMessage,
        confirmButtonText: '확인',
    });

    if (focus && el && typeof el.focus === 'function') {
        el.focus();
    }

    return false;
}

// use-common-submit 의 checkField 배열을 순회하며 검증하는 래퍼
// checkField 예시: [{ inputId: 'name', label: '이름', type: 'text' }, ...]
export async function validateEmptyByType(fields = []) {
    for (const field of fields) {
        const { inputId, label, type = 'text', message } = field;
        const isValid = await validateNotEmptyByType(
            inputId,
            message || `${label}을(를) 입력해 주세요.`,
            type.toLowerCase()
        );
        if (!isValid) return false;
    }
    return true;
}