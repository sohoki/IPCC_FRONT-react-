import axios from 'axios';
import { getCookie } from '@/lib/cookie.jsx';
import { fn_Refresh } from '@/service/api/fn-refresh.jsx';
import Swal from '@/lib/swal.js';
import appConfig from '@/config/index.jsx';

// ━━━━━━━━━━ Circuit Breaker ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CIRCUIT = {
    MAX_FAILURES: 3,        // 연속 실패 허용 횟수
    RESET_TIMEOUT: 30_000,  // 30초 후 자동 재개
    failures: 0,
    open: false,
    resetTimer: null,
};

function circuitBreak() {
    CIRCUIT.open = true;
    clearTimeout(CIRCUIT.resetTimer);
    CIRCUIT.resetTimer = setTimeout(() => {
        CIRCUIT.open = false;
        CIRCUIT.failures = 0;
    }, CIRCUIT.RESET_TIMEOUT);

    Swal.fire({
        icon: 'error',
        title: '서버 연결 실패',
        html: `연속 ${CIRCUIT.MAX_FAILURES}회 오류가 발생했습니다.<br>잠시 후 자동으로 재시도합니다.`,
        timer: CIRCUIT.RESET_TIMEOUT,
        timerProgressBar: true,
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonText: '지금 재시도',
    }).then((result) => {
        if (result.isConfirmed) {
            CIRCUIT.open = false;
            CIRCUIT.failures = 0;
            clearTimeout(CIRCUIT.resetTimer);
        }
    });
}

// ━━━━━━━━━━ MUI 스타일 API 로딩 오버레이 ━━━━━━━━━━━━━━━━
const LOADING_ID = '__api-loading-overlay__';

const LOADING_HTML = `
<div id="${LOADING_ID}" style="
    position:fixed;inset:0;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    background:rgba(255,255,255,0.75);
    z-index:99999;gap:12px;
">
    <svg viewBox="22 22 44 44" width="44" height="44"
         style="animation:_apiRotate 1.4s linear infinite">
        <circle cx="44" cy="44" r="20.2" fill="none"
            stroke="#1976d2" stroke-width="3.6"
            stroke-dasharray="80px,200px" stroke-dashoffset="0"
            stroke-linecap="round"
            style="animation:_apiDash 1.4s ease-in-out infinite"/>
    </svg>
    <style>
        @keyframes _apiRotate{100%{transform:rotate(360deg)}}
        @keyframes _apiDash{
            0%{stroke-dasharray:1px,200px;stroke-dashoffset:0}
            50%{stroke-dasharray:100px,200px;stroke-dashoffset:-15px}
            100%{stroke-dasharray:100px,200px;stroke-dashoffset:-125px}
        }
    </style>
</div>`;

function showApiLoading() {
    if (document.getElementById(LOADING_ID)) return;
    const div = document.createElement('div');
    div.innerHTML = LOADING_HTML;
    document.body.appendChild(div.firstElementChild);
}

function hideApiLoading() {
    document.getElementById(LOADING_ID)?.remove();
}

// 이미 Swal 에러를 표시한 경우 catch에서 중복 표시를 막기 위한 마커
class HandledError extends Error {
    constructor(message) {
        super(message);
        this.name = 'HandledError';
    }
}

export async function fnAjaxFetch(options) {
    // ━━━━━━━━━━ Circuit Breaker 차단 체크 ━━━━━━━━━━━━━━━━
    if (CIRCUIT.open) {
        // 이미 차단 중이면 Swal 중복 표시 없이 조용히 거절
        throw new HandledError('Circuit breaker open - request blocked');
    }

    const {
        url,
        method,
        param,
        data,
        headers: customHeaders,
        signal,
        responseType,
        done_callback,
        fail_callback,
        redirectOnNoAuth = '/login',
        withCredentials = true,
        setJSessionIdHeader,
        showLoading = true,
        suppressErrorHandling = false,
        _retryCount = 0,
    } = options;

    // loadingOpen 플래그: loading overlay가 열려 있을 때만 닫도록 추적
    let loadingOpen = false;

    const closeLoading = () => {
        if (loadingOpen) {
            hideApiLoading();
            loadingOpen = false;
        }
    };

    if (showLoading) {
        loadingOpen = true;
        showApiLoading();
    }

    try {
        const headers = {
            'AJAX': 'true',
            ...customHeaders,
        };
        if (!Object.keys(headers).some(k => k.toLowerCase() === 'content-type')) {
            headers['Content-Type'] = 'application/json; charset=utf-8';
        }

        const accessToken = getCookie('accessToken');
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
            if (setJSessionIdHeader) headers['JSESSIONID'] = setJSessionIdHeader;
        }

        const axiosConfig = {
            url: `${appConfig.REACT_APP_API_URL}${url}`,
            method,
            headers,
            withCredentials,
            signal,
            responseType: responseType ?? 'json',
            ...(String(method).toUpperCase() === 'GET'
                ? (param ? { params: param } : {})
                : (data ? { data } : (param ? { data: param } : {}))
            ),
            validateStatus: () => true,
        };

        const res = await axios(axiosConfig);
        closeLoading();

        // ━━━━━━━━━━ 성공: 실패 카운트 리셋 ━━━━━━━━━━━━━━━━
        CIRCUIT.failures = 0;

        if (res.status >= 200 && res.status < 300) {
            const resData = res.data;

            // 서버가 HTTP 200으로 응답했지만 body에 401 신호를 담는 경우
            if (
                resData &&
                typeof resData === 'object' &&
                resData.resultCodeInfo === 'FAIL' &&
                String(resData.resultCode) === '401'
            ) {
                return await handleUnauthorized(options, _retryCount, fail_callback, redirectOnNoAuth);
            }

            if (typeof done_callback === 'function') done_callback(resData);
            return res;

        } else if (res.status === 401 || res.status === 403) {
            return await handleUnauthorized(options, _retryCount, fail_callback, redirectOnNoAuth);

        } else if (res.status === 404) {
            if (!suppressErrorHandling) Swal.fire({ icon: 'error', title: '404 Not Found', text: '없는 페이지입니다.' });
            throw new HandledError('HTTP 404 Not Found');

        } else if (res.status === 500) {
            if (!suppressErrorHandling) {
                if (typeof fail_callback === 'function') fail_callback(res);
                const msg = res.data?.resultMessage || res.data?.message || '서버 내부 오류가 발생했습니다.';
                Swal.fire({ icon: 'error', title: '서버 오류 (500)', text: msg });
            }
            throw new HandledError('HTTP 500 Internal Server Error');

        } else {
            if (!suppressErrorHandling) {
                Swal.fire({
                    icon: 'error',
                    title: 'Network Error',
                    text: `네트워크 에러 입니다. 접속 URL을 확인하세요. (HTTP ${res.status})`,
                    timer: 10000,
                    timerProgressBar: true,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                }).then(() => { window.location.href = '/error'; });
            }
            throw new HandledError(`HTTP ${res.status}`);
        }

    } catch (error) {
        closeLoading(); // loadingOpen=false 이면 no-op이므로 에러 Swal과 겹치지 않는다
        if (error.name === 'CanceledError' || error.name === 'AbortError') {
            console.log('요청이 취소되었습니다.');
            return;
        }
        if (error.name === 'HandledError') throw error; // 이미 Swal 처리됨
        // ━━━━━━━━━━ 네트워크 오류: 실패 카운트 증가 후 Circuit Breaker 발동 ━━━━━
        CIRCUIT.failures += 1;
        if (CIRCUIT.failures >= CIRCUIT.MAX_FAILURES) {
            circuitBreak();
            throw new HandledError('Circuit breaker triggered');
        }

        console.error('네트워크 에러:', error);
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: `네트워크 에러 입니다. 접속 URL을 확인하세요.\n${error.message}`,
            timer: 10000,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
        });
        throw error;
    }
}

async function handleUnauthorized(options, _retryCount, fail_callback, redirectOnNoAuth) {
    if (_retryCount < 1 && getCookie('refreshToken')) {
        const refreshed = await fn_Refresh();
        if (refreshed) {
            return fnAjaxFetch({ ...options, _retryCount: _retryCount + 1 });
        }
    }

    if (typeof fail_callback === 'function') fail_callback();

    Swal.fire({
        icon: 'error',
        title: '인증 에러',
        text: '토큰이 만료되어 로그인 페이지로 이동합니다.',
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then(() => { window.location.href = redirectOnNoAuth; });

    throw new HandledError('Unauthorized');
}
