import axios from 'axios';
import { getCookie, toQueryString, fn_Refresh } from "./http";
import Swal from 'sweetalert2';
import config  from "@/config/index.jsx";


export async function fnAjaxFetch({
    url,
    method,
    param,
    data,
    headers: customHeaders,
    signal,
    responseType,   
    async = true, // 미사용이지만 시그니처 유지
    done_callback,
    fail_callback,
    redirectOn401 = '/index',
    redirectOn401FromFail = '/login',
    redirectOnNoAuth = '/login',
    withCredentials = true,
    setJSessionIdHeader,
    showLoading = true
    }) {
    let baseUrl = config.REACT_APP_API_URL;

    if (showLoading) {
        Swal.fire({
            title: '데이터 처리 중...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }
    try{
        const headers = {
            'AJAX': 'true',
            ...customHeaders, //외부에서 넘긴 헤더가 있다면 덮어씌움 (multipart/form-data 등)
        };
        if (!Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
            headers['Content-Type'] = 'application/json; charset=utf-8';
        }
        const accessToken = getCookie('accessToken');
        if (accessToken) {
            headers['Authorization'] = "Bearer ".concat(accessToken);
            if (setJSessionIdHeader) {
                headers['JSESSIONID'] = setJSessionIdHeader;
            }
        }
        const config = {
            url: baseUrl +""+url,
            method,
            headers,
            withCredentials,
            signal,
            responseType: responseType || 'json',
            ...(String(method).toUpperCase() === 'GET'
                ? (param ? { params: param } : {})                 // GET → params
                : (data ? { data } : (param ? { data: param } : {})) // POST → data 우선
            ),
            validateStatus: () => true, // ✅ 오타 수정
        };
        const res = await axios(config);     
        if (showLoading) Swal.close();      
        if (res.status >= 200 && res.status < 300) {
            const data = res.data;
            if (
                    data &&
                    typeof data === 'object' &&
                    data.resultCodeInfo === 'FAIL' &&
                    String(data.resultCode) === '401'
                ) {
                    const hasAccess = !!getCookie('accessToken');
                    const hasRefresh = !!(getCookie('refreshToken'));
                    if (hasAccess && hasRefresh) {
                        const refreshed = await fn_Refresh();
                    if (refreshed) {
                        // 재귀 호출로 재시도
                        return await fnAjaxFetch({
                            url,
                            method,
                            param,
                            async,
                            done_callback,
                            fail_callback,
                            redirectOn401,
                            redirectOn401FromFail,
                            redirectOnNoAuth,
                            withCredentials,
                            setJSessionIdHeader,
                        });
                    } else {
                        //window.location.href = redirectOn401;
                        throw new Error('401 after refresh attempt (body signal)');
    
                    }
                    } else {
                        //window.location.href = redirectOn401;
                        throw new Error('401 (body signal), no tokens');
                    
                    }
                }
                // 정상 콜백
                if (typeof done_callback === 'function') {
                    done_callback(data);
                }
                return res;
        } else if (res.status === 401 || res.status === 403) {

            const hasAccess = !!getCookie('accessToken');
            const hasRefresh = !!(getCookie('refreshToken'));


            

            if (hasAccess && hasRefresh) {
                const refreshed = await fn_Refresh();
                if (refreshed) {
                    return await fnAjaxFetch({
                        url,
                        method,
                        param,
                        async,
                        done_callback,
                        fail_callback,
                        redirectOn401,
                        redirectOn401FromFail,
                        redirectOnNoAuth,
                        withCredentials,
                        setJSessionIdHeader,
                    });
                }
            }
            
            // 실패 콜백 알림
            if (typeof fail_callback === 'function') {
                fail_callback(res);
            }

            console.log(`HTTP ${res.status} (unauthorized/forbidden)`);

            Swal.fire({
                icon: 'error',
                title: '인증 에러',
                text: `토큰이 만료되어 로그인 페이지로 이동합니다. (HTTP ${res.status})`, 
                timer: 30000, 
                timerProgressBar: true,
                allowOutsideClick: false,
                allowEscapeKey: false,
            }).then(() => {
                window.location.href = redirectOnNoAuth;
            });

            throw new Error(`HTTP ${res.status} (unauthorized/forbidden)`);
            //return;
    
        } else if (res.status === 404){
            Swal.fire({
                icon: 'error',
                title: '404 Not Found',
                text: '없는 페이지 입니다.',
            });
            // 실패로 간주: 상위에서 catch하도록 throw
            throw new Error('HTTP 404 Not Found');
        } else if (res.status === 500) {
            const text = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
            const target = document.getElementById('sp_location');
            if (target) target.innerHTML = text;

            if (typeof fail_callback === 'function') {
                fail_callback(res);
            }
            // 그래도 반환
            return res;

        } else if (res.status === 0) {
            // axios에서는 보통 catch로 떨어지지만 호환 유지
                Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: '네트워크 에러 입니다. 접속 URL을 확인하세요.',
                timer: 100000,
                timerProgressBar: true,      // 진행바 표시
                allowOutsideClick: false,    // 바깥 클릭 방지
                allowEscapeKey: false,       // ESC 키 방지

            }).then(() => {
                window.location.href = redirectOnNoAuth;
            });
            throw new Error('Network Error (status 0)');
        }
    

    }catch(error) {
        //여기 부분을 어떻게 나오게 할지 확인 하기 
        if (showLoading) Swal.close();
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
            console.log('이전 요청이 취소되었습니다.'); // 무시해도 되는 에러
        } else {
            console.error('실제 네트워크 에러:', error);
        }
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: '네트워크 에러 입니다. 접속 URL을 확인하세요.' + error,
            timer: 100000,
            timerProgressBar: true,      // 진행바 표시
            allowOutsideClick: false,    // 바깥 클릭 방지
            allowEscapeKey: false,       // ESC 키 방지
        }).then(() => {
            //window.location.href = redirectOnNoAuth;
        });
        throw error;
    }
}