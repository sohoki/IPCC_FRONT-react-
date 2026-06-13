import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import CODE from '@/constants/CODE.jsx';
import API_URL from '@/constants/URL.jsx';

// 공통 코드 이외 데이터 가지고 오는 hook
export const useCustomReqDataCombo = ({
    url,
    params = {},
    method = 'GET',
    mapping = { id: 'code', text: 'codeNm' }
}) => {
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isMountedRef = useRef(true);

    // 객체 → 직렬화 문자열로 안정적 deps 키 생성
    const paramsKey  = JSON.stringify(params);
    const mappingKey = JSON.stringify(mapping);

    const fetchData = useCallback(async () => {
        if (!url) {
            if (isMountedRef.current) setOptions([]);
            return;
        }

        if (isMountedRef.current) setIsLoading(true);
        try {
            const safeMethod = (typeof method === 'string' ? method : 'POST').toUpperCase();

            const res = await fnAjaxFetch({
                url,
                param: JSON.parse(paramsKey),
                method: safeMethod,
                withCredentials: true,
            });

            if (!isMountedRef.current) return;

            const json = res?.data;
            if (json?.resultCodeInfo === CODE.SUCCESS.toUpperCase()) {
                const rawData = json?.result?.resultList || json?.result?.result || [];
                const parsedMapping = JSON.parse(mappingKey);
                const formattedData = rawData.map(item => ({
                    code: item[parsedMapping.id] || item.code,
                    codeNm: item[parsedMapping.text] || item.codeNm,
                }));
                if (isMountedRef.current) setOptions(formattedData);
            } else {
                if (isMountedRef.current) setOptions([]);
            }
        } catch (e) {
            if (isMountedRef.current && e?.name !== 'HandledError') {
                console.error('Fetch Error:', e);
                setOptions([]);
            }
        } finally {
            if (isMountedRef.current) setIsLoading(false);
        }
    // 직렬화 키만 deps로 사용 → params/mapping 객체 참조 변경에 무관
    }, [url, paramsKey, mappingKey, method]);

    useEffect(() => {
        isMountedRef.current = true;
        (async () => { await fetchData(); })();
        return () => { isMountedRef.current = false; };
    }, [fetchData]);

    return useMemo(() => ({
        options,
        isLoading,
        refetch: fetchData
    }), [options, isLoading, fetchData]);
};

// 공통 코드 데이터를 가져오는 커스텀 훅
export const useCommonCodeData = (CODE_ID) => {
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isMountedRef = useRef(true);

    // idKey: 배열이면 join(","), 문자열이면 그대로 → useCallback deps 용 안정적 string
    const idKey = Array.isArray(CODE_ID) ? CODE_ID.join(',') : (CODE_ID ?? '');

    // CODE_ID 자체를 ref로 보관 — 배열 참조가 매 렌더마다 바뀌어도 useCallback 재생성을 막는다
    const codeIdRef = useRef(CODE_ID);
    useEffect(() => { codeIdRef.current = CODE_ID; });

    const fetchCodeData = useCallback(async () => {
        if (!idKey) return;

        if (isMountedRef.current) setIsLoading(true);
        try {
            const currentId = codeIdRef.current;
            const isArray   = Array.isArray(currentId);
            const ids       = isArray ? currentId : [currentId];

            const promises = ids.map(id =>
                fnAjaxFetch({
                    url: `${API_URL.CODE_LIST_COMBO_CDE}/${encodeURIComponent(id)}.do`,
                    method: 'GET',
                    withCredentials: true,
                })
            );

            const responses = await Promise.all(promises);

            if (!isMountedRef.current) return;

            const results = responses.map((res, index) => {
                const json = res?.data;
                if (json?.resultCodeInfo === CODE.SUCCESS.toUpperCase()) {
                    return json?.result?.result || [];
                }
                console.warn(`Code [${ids[index]}] fetch failed:`, json?.resultMessage);
                return [];
            });

            // 배열 입력 → 각 코드별 배열 반환, 단일 입력 → 첫 번째 결과만 반환
            if (isMountedRef.current) setOptions(isArray ? results : results[0]);
        } catch (e) {
            if (isMountedRef.current && e?.name !== 'HandledError') {
                await Swal.fire({
                    icon: 'error',
                    title: '오류',
                    text: e?.message || '코드 데이터를 불러오는 중 오류가 발생했습니다.'
                });
            }
        } finally {
            if (isMountedRef.current) setIsLoading(false);
        }
    // CODE_ID 배열 참조 대신 idKey(안정적 string)만 의존 → 무한 재호출 방지
    }, [idKey]);

    useEffect(() => {
        isMountedRef.current = true;
        (async () => { await fetchCodeData(); })();
        return () => { isMountedRef.current = false; };
    }, [fetchCodeData]);

    return { options, isLoading, refetch: fetchCodeData };
};
