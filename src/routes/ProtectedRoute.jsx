
import { useState, useEffect } from 'react';
import { Navigate, useLocation } from "react-router-dom";
import { fn_Refresh } from "@/service/api/fn-refresh.jsx";
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import PageLoading from '@/components/Common/PageLoading.jsx';

async function jwtAuthentication() {
    try {
        const res = await fnAjaxFetch({
            url: URL.AUTH_CHECK,
            method: 'POST',
            data: {},
            withCredentials: true,
        });

        const code = String(res?.data?.resultCode || '');

        if (code === '200') {
            return true;
        }

        // 리프레시 토큰 로직 - 인증 실패 시 재시도
        return await fn_Refresh();
    } catch (e) {
        console.error('Auth check error:', e);
        return false;
    }
}

export default function ProtectedRoute({ children }) {
    const [status, setStatus] = useState('checking');
    const location = useLocation();

    // 인증 상태 확인
    useEffect(() => {
        let isMounted = true;

        jwtAuthentication().then((isAuth) => {
            if (isMounted) {
                setStatus(isAuth ? 'authenticated' : 'unauthenticated');
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    // 로딩 상태
    if (status === 'checking') {
        return <PageLoading />;
    }

    // 인증 실패 - 로그인 페이지로 리다이렉트
    if (status === 'unauthenticated') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 인증 성공
    return <>{children}</>;
}
