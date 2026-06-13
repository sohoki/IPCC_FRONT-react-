import { useState, useEffect, useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
/**
 *  //상세 코드 정보 요청 
 *  @param {String} url 호출 URL
 *  @param {String} reqCode 요청 코드
 *  @param {String} redirectOnNoAuth 인증 호출 페이지 
 * 
 * 
 * 사용 예시:
 * const { detailInfo, loading, setDetailInfo, refetch } = useReqObjectDetail('/api/endpoint', reqCode, '/login');  
 * */
export const useReqObjectDetail = (_url, reqCode, redirectOnNoAuth) => {


    const [detailInfo, setDetailInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // 1. fetchData를 useCallback으로 감싸서 재사용 가능하게 만듭니다.
    const fetchData = useCallback(async () => {
        if (!reqCode || !_url) return;

        setLoading(true);
        try {
            const res = await fnAjaxFetch({
                url: `${_url}/${encodeURIComponent(reqCode)}.do`,
                method: 'GET',
                withCredentials: true,
            });

            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS') {
                // 서버 응답 구조에 맞춰 데이터 설정
                setDetailInfo(json?.result?.result || json?.result); 
            } else {
                await Swal.fire({
                    icon: 'warning',
                    title: '경고',
                    text: json?.resultMessage || '데이터를 불러오지 못했습니다.'
                });
            }
        } catch (e) {
            await Swal.fire({
                icon: 'error',
                title: '오류',
                text: e?.message || '상세 조회 오류'
            }).then(() => {
                if (redirectOnNoAuth) {
                    const errorData = {
                        message: e?.message || '상세 조회 중 서버 오류가 발생했습니다.',
                        status: e?.response?.status || 500,
                        timestamp: new Date().toISOString()
                    };
                    sessionStorage.setItem('error_info', JSON.stringify(errorData));
                    window.location.href = redirectOnNoAuth;
                }
            });
        } finally {
            setLoading(false);
        }
    }, [_url, reqCode, redirectOnNoAuth]); // 의존성 관리

    // 2. useEffect에서 선언한 함수를 실행합니다.
    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData가 변경될 때마다 실행

    // 외부에서 수동 새로고침이 필요할 수 있으므로 refetch(fetchData)를 함께 반환합니다.
    return { detailInfo, loading, setDetailInfo, refetch: fetchData };
};