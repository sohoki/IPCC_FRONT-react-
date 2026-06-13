import axios from 'axios';
import Swal from "sweetalert2";
import { getCookie, setCookie } from '@/lib/cookie.jsx';
import config from '@/config.js';

export async function fn_Refresh(_type, _params, _async, _done_callback, _fail_callback, _navigate) {
    const refreachToken =
        getCookie('refreshToken') || getCookie('refreachToken');

    try {
        const res = await axios.get(config.REACT_APP_API_URL+ "/uat/uia/actionRefreshToken.do", {
        headers: {
            'AJAX': 'true',
            ...(refreachToken ? { 'refreshToken': refreachToken } : {}),
            'Content-Type': 'application/json; charset=utf-8',
        },
        withCredentials: true,
        // params: params, // 필요 시 활성화 (GET query)
        validateStatus: () => true,
        });

        const result = res.data;

        if (String(result?.resultCode) === '200') {
        const access = result?.result?.jToken;
        const refresh = result?.result?.refreshToken;

        if (access) setCookie('accessToken', access, 1);
        if (refresh) {
            setCookie('refreachToken', refresh, 1);
        }

        
        return true;
        } else {
        Swal.fire({
            icon: 'warning',
            title: '토큰 기간이 만료되었습니다.',
            text: '다시 로그인 해주세요.',
            confirmButtonText: '확인',
            timer: 100000,
            allowOutsideClick: false,    // 바깥 클릭 방지
            allowEscapeKey: false,       // ESC 키 방지
            timerProgressBar: true,      // 진행바 표시
        }).then(() => {
            setTimeout(() => (document.location.href = '/login'), 1000);
        });
        
        return false;
        }
    } catch (error) {
        Swal.fire({
            icon: 'warning',
            title: 'ERROR.',
            text: `TOKEN ${error.message} 입니다 다시 로그인 해주세요.`,
            confirmButtonText: '확인',
        });
        return false;
    }
}