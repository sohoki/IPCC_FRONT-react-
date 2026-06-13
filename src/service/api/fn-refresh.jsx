import axios from 'axios';
import Swal from '@/lib/swal.js';
import { getCookie, setCookie } from '@/lib/cookie.jsx';
import config from '@/config/index.jsx';

export async function fn_Refresh() {
    const refreshToken = getCookie('refreshToken');

    if (!refreshToken) return false;

    try {
        const res = await axios.get(`${config.REACT_APP_API_URL}/uat/uia/actionRefreshToken.do`, {
            headers: {
                'AJAX': 'true',
                'refreshToken': refreshToken,
                'Content-Type': 'application/json; charset=utf-8',
            },
            withCredentials: true,
            validateStatus: () => true,
        });

        const result = res.data;

        if (String(result?.resultCode) === '200') {
            const accessToken = result?.result?.jToken;
            const newRefreshToken = result?.result?.refreshToken;

            if (accessToken) setCookie('accessToken', accessToken, 1);
            if (newRefreshToken) setCookie('refreshToken', newRefreshToken, 1);

            return true;
        }

        Swal.fire({
            icon: 'warning',
            title: '토큰 기간이 만료되었습니다.',
            text: '다시 로그인 해주세요.',
            confirmButtonText: '확인',
            timer: 10000,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then(() => { window.location.href = '/login'; });

        return false;

    } catch (error) {
        console.error('토큰 갱신 실패:', error);
        Swal.fire({
            icon: 'warning',
            title: '토큰 갱신 오류',
            text: `다시 로그인 해주세요. (${error.message})`,
            confirmButtonText: '확인',
        });
        return false;
    }
}
