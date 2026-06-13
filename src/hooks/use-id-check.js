import { useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';

// 중복 체크 hook
/**
 * @param {String} checkUrl  - 중복 체크 API URL (예: '/api/check-id')
 * @param {String} message   - 중복 체크 대상 이름 (예: '아이디')
 * @returns {{ handleIdCheck: Function }}
 *
 * 사용 예시:
 *   const { handleIdCheck } = useIdCheck('/api/check-id', '아이디');
 *
 *   // 기본 (추가 파라미터 없음)
 *   handleIdCheck(form.id, setForm);
 *
 *   // 추가 쿼리 파라미터 전송 — ?/& 자동 처리
 *   handleIdCheck(form.menuNo, setForm, { systemCode: form.systemCode });
 *   // → /api/check-id/menuNo.do?systemCode=IPCC
 */
export const useIdCheck = (checkUrl, message) => {

    const handleIdCheck = useCallback(async (id, setForm, extraParams = {}) => {
        // 1. 유효성 검사
        if (!id || id.trim() === '') {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: `${message}를 입력해 주세요.` });
            return;
        }

        // 2. URL 구성 — extraParams가 있으면 ? 또는 & 로 쿼리 스트링 추가
        const base = `${checkUrl}/${encodeURIComponent(id.trim())}.do`;
        const queryEntries = Object.entries(extraParams).filter(([, v]) => v !== undefined && v !== null && v !== '');

        if (Object.keys(extraParams).length > 0 && queryEntries.length === 0) {
            await Swal.fire({ icon: 'warning', title: '입력 오류', text: '추가 조건 값을 입력해 주세요.' });
            return;
        }

        const queryStr = queryEntries
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        const url = queryStr
            ? `${base}${base.includes('?') ? '&' : '?'}${queryStr}`
            : base;

        try {
            const res = await fnAjaxFetch({
                url,
                method: 'GET',
                withCredentials: true,
            });

            const json = res?.data;
            const isSuccess = json?.resultCodeInfo === 'SUCCESS';

            // 3. 부모 상태 업데이트
            if (setForm) {
                setForm((prev) => ({ ...prev, idCheck: isSuccess ? 'Y' : 'N' }));
            }

            // 4. 결과 알림
            await Swal.fire({
                icon: isSuccess ? 'success' : 'error',
                title: '중복 확인',
                text: json?.resultMessage || (isSuccess ? `사용 가능한 ${message}입니다.` : `이미 존재하는 ${message}입니다.`),
            });

            return isSuccess;
        } catch (e) {
            await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '중복 체크 중 오류가 발생했습니다.' });
            return false;
        }
    }, [checkUrl, message]);

    return { handleIdCheck };
};
