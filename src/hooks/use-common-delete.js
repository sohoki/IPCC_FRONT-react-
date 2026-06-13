import { useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';

export const useCommonDelete = ({
    gridApiRef,
    URL,
    MESSAGE,
    reloadFunction,
    callback,
    returnParams,
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

        let targetUrl = `${URL}/${encodeURIComponent(code)}.do`;

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

            if (json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({
                    icon: 'success',
                    title: '삭제',
                    text: json?.resultMessage || '삭제되었습니다.'
                });

                let extractedData = {};
                if (Array.isArray(returnParams) && json?.result) {
                    returnParams.forEach(key => {
                        extractedData[key] = json.result[key];
                    });
                }

                if (typeof refreshFn === 'function') refreshFn();

                if (typeof reloadFunction === 'function') {
                    const targetPage = (gridApiRef?.current?.paginationGetCurrentPage() + 1 || 1);
                    reloadFunction(targetPage);
                } else if (reloadFunction === 'grid' && gridApiRef?.current) {
                    gridApiRef.current.purgeInfiniteCache?.();
                    gridApiRef.current.refreshInfiniteCache?.();
                }

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
    }, [gridApiRef, URL, MESSAGE, hookExtraParams, reloadFunction, callback]);

    return { handleDelete };
};
