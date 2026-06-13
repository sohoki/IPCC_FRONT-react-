import { useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/utils/fetchUtil';
import { CODE } from '@/constants/code';
import { URL } from '@/constants/url';
/**
 *  @param {Object} gridApiRef - AG-Grid 등의 ref 객체
 * @param {Function} fnAjaxFetch - 공통 Ajax 호출 함수
 * @param {Object} URL - API URL 설정 객체
 * @param {Object} CODE - 결과 코드 정의 객체 인자를 ({code, name}) 형태로 
 * */
export const useCommonDelete = ({
    gridApiRef,  
    URL, 
    MESSAGE,        
    reloadFunction,
    callback,
    retrunParams,
    extraParams: hookExtraParams,
}) => {

    const handleDelete = useCallback(async (params, dynamicExtraParams, refreshFn) => {
        if (!params) return;
        const { code, name } = params;

        const ok = await Swal.fire({
            icon: 'question',
            title: `${MESSAGE} 삭제`,
            html: `<b>${name || ''}</b>를(을) 삭제하시면 시스템에 영향이 있을 수 있습니다.<br>정말로 삭제하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
            focusCancel: true,
        });

        if (!ok.isConfirmed) return;

        // URL 구성 (보통 .do가 붙는 경우)
        let targetUrl = `${URL}/${encodeURIComponent(code)}.do`;

        // 파라미터 합치기 로직
        const resolvedHookParams = typeof hookExtraParams === 'function' 
                                    ? hookExtraParams(params) 
                                    : (Array.isArray(hookExtraParams) ? hookExtraParams : []);
        const resolvedDynamicParams = Array.isArray(dynamicExtraParams) 
                                    ? dynamicExtraParams 
                                    : (dynamicExtraParams ? [dynamicExtraParams] : []); 
        const allExtraParams = [...resolvedHookParams, ...resolvedDynamicParams];
        if (allExtraParams.length > 0) {
            const searchParams = new URLSearchParams();
            allExtraParams.forEach(item => {
                if (item.value !== null && item.value !== undefined && item.value !== '') {
                    searchParams.append(item.key, item.value);
                }
            });
            const queryString = searchParams.toString();
            if (queryString) targetUrl += `?${queryString}`;
        }
        try {   
              
            const res = await fnAjaxFetch({
                url: targetUrl,
                method: 'DELETE',
                withCredentials: true,
            });
            const json = res?.data;

            // ✅ 결과 확인 (json?.resultCodeInfo 체크)
            if (json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ 
                    icon: 'success', 
                    title: '삭제', 
                    text: json?.resultMessage || '삭제되었습니다.' 
                });

                let extractedData = {};
                
                if (Array.isArray(retrunParams) && json?.result) {
                    retrunParams.forEach(key => {
                        extractedData[key] = json.result[key];
                    });
                }
                // 1️⃣ [추가된 로직] 직접 넘겨받은 refreshFn(예: fetchHotels) 실행
                if (typeof refreshFn === 'function') {
                    refreshFn(); 
                }

                // 2️⃣ 기존 reloadFunction 처리 (그리드용)
                if (typeof reloadFunction === 'function') {
                    const targetPage = (gridApiRef?.current?.paginationGetCurrentPage() + 1 || 1);
                    reloadFunction(targetPage);
                } else if (reloadFunction === 'grid' && gridApiRef?.current) {
                    gridApiRef.current.purgeInfiniteCache?.();
                    gridApiRef.current.refreshInfiniteCache?.();
                }

                // 3️⃣ 콜백 처리
                if (typeof callback === 'function') {
                    await callback(params, extractedData);
                }
            } else {
                await Swal.fire({ 
                    icon: 'warning', 
                    title: '경고', 
                    text: json?.resultMessage || '삭제에 실패했습니다.' 
                });
            }
        } catch (e) {
            await Swal.fire({ 
                icon: 'error', 
                title: '오류', 
                text: e?.message || '삭제 중 오류가 발생했습니다.' 
            });
        }
    }, [gridApiRef, URL, MESSAGE, hookExtraParams, reloadFunction, callback, retrunParams]);

    return { handleDelete };
}