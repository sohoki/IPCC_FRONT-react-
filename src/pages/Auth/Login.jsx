import React, { useCallback, useRef, useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { setCookie } from '@/lib/cookie.jsx';
import { getLocalItem, setLocalItem } from '@/lib/storage.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { validateEmptyByType } from '@/lib/form-validators.js';
import { alert } from '@/lib/alert.js';
import API_URL from '@/constants/URL.jsx';
import '@/style/Login.css'


const LoginForm = lazy(() => import('@/components/auth/LoginForm.jsx'));

const KEY_ID           = 'KEY_ID';
const KEY_SAVE_ID_FLAG = 'KEY_SAVE_ID_FLAG';

const fieldsToValidate = [
    { inputId: 'userId',  type: 'text',     message: '아이디를 입력해주세요.' },
    { inputId: 'userPwd', type: 'password', message: '비밀번호를 입력해주세요.' },
];

const Login = () => {
    const navigate = useNavigate();
    const idRef = useRef(null);

    // localStorage 는 동기 읽기 → lazy initializer 로 첫 렌더에 세팅, useEffect 불필요
    const [saveIDFlag, setSaveIDFlag] = useState(() => {
        const flag = getLocalItem(KEY_SAVE_ID_FLAG);
        return flag === 'true' || flag === true;
    });

    const [userInfo, setUserInfo] = useState(() => {
        const isSaved = getLocalItem(KEY_SAVE_ID_FLAG);
        const savedId = (isSaved === 'true' || isSaved === true) ? getLocalItem(KEY_ID) : '';
        return { userId: savedId ? String(savedId) : '', userPwd: '' };
    });

    const loginButtonActive = userInfo.userId.trim() !== '' && userInfo.userPwd.trim() !== '';

    // 초기 포커스만 (setState 없음)
    useEffect(() => {
        idRef.current?.focus();
    }, []);

    const onChangeUserInfo = useCallback((e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSaveIDFlag = useCallback(() => {
        setSaveIDFlag(prev => {
            const next = !prev;
            setLocalItem(KEY_SAVE_ID_FLAG, next);
            return next;
        });
    }, []);

    const submitFormHandler = useCallback(async (e) => {
        e.preventDefault();
        if (!loginButtonActive) return;

        const isAllValid = await validateEmptyByType(fieldsToValidate);
        //if (!isAllValid) return;

        try {
            const res = await fnAjaxFetch({
                url: API_URL.LOGIN_PROCESS,
                method: 'POST',
                data: { adminId: userInfo.userId, adminPassword: userInfo.userPwd },
                withCredentials: true,
            });

            const { data } = res;
            if (data && String(data.resultCode) === '200' && data.resultCodeInfo === 'SUCCESS') {
                setLocalItem(KEY_ID, saveIDFlag ? userInfo.userId : '');

                setCookie('accessToken',  data.result.jToken,                        1);
                setCookie('refreshToken', data.result.refreshToken,                  1);
                setCookie('userName',     data.result.resultVO.adminName,          1);
                setCookie('adminId',       data.result.resultVO.adminId || userInfo.adminId, 1);
                setCookie('adminName',       data.result.resultVO.adminName || userInfo.adminName, 1);
                setCookie('partId',       data.result.resultVO.partId || userInfo.partId, 1);
                setCookie('insttCode',       data.result.resultVO.insttCode || userInfo.insttCode, 1);
                setCookie('adminEmail',    data.result.resultVO.adminEmail,         1);
                setCookie('userPic',      data.result.resultVO.managerPic,           1);

                navigate('/sub/bas/basInstt', { replace: true });
            } else {
                await alert.warning(data?.resultMessage || '아이디 또는 비밀번호를 확인해주세요.', '로그인 실패');
            }
        } catch (e) {
            if (e.name === 'HandledError') return;
            await alert.error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.', '로그인 실패');
        }
    }, [loginButtonActive, saveIDFlag, userInfo]);

    const handleIdFind = () => navigate('/search/idfind');
    const handlePasswordFind = () => navigate('/search/pwdfind');

    return (
        <div className="login-center">
            <Suspense fallback={null}>
                <LoginForm
                    userInfo={userInfo}
                    saveIDFlag={saveIDFlag}
                    loginButtonActive={loginButtonActive}
                    idRef={idRef}
                    onChangeUserInfo={onChangeUserInfo}
                    handleSaveIDFlag={handleSaveIDFlag}
                    handleIdFind={handleIdFind}
                    handlePasswordFind={handlePasswordFind}
                    submitFormHandler={submitFormHandler}
                />
            </Suspense>
        </div>
    );
};

export default Login;
