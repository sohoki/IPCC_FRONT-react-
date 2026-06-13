import React, { useCallback, useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { alert } from '@/lib/alert.js';
import API_URL from '@/constants/URL.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { validateEmptyByType } from '@/lib/form-validators.js';
import "@/style/Login.css";

const IdFindForm  = React.lazy(() => import('@/components/UserFind/IdFindForm.jsx'));
const PwdFindForm = React.lazy(() => import('@/components/UserFind/PwdFindForm.jsx'));

const fieldsToValidateId = [
    { inputId: 'userName',  type: 'text', message: '이름을 입력해주세요.' },
    { inputId: 'userEmail', type: 'text', message: '이메일을 입력해주세요.' },
];

const fieldsToValidatePwd = [
    { inputId: 'userId',       type: 'text', message: '아이디를 입력해주세요.' },
    { inputId: 'userEmail',    type: 'text', message: '이메일을 입력해주세요.' },
    { inputId: 'passwordHint', type: 'text', message: '패스워드 힌트를 입력해주세요.' },
    { inputId: 'passwordCnsr', type: 'text', message: '패스워드 답변을 입력해주세요.' },
];

const getInitialUserInfo = (type) =>
    type === 'idfind'
        ? { userName: '', userEmail: '' }
        : { userId: '', userEmail: '', passwordHint: '', passwordCnsr: '' };

// ─────────────────────────────────────────────
// 실제 폼 로직 컴포넌트
// key={type} 으로 렌더되므로 type이 바뀌면 완전히 리마운트 →
// useEffect 로 state 리셋할 필요 없음
// ─────────────────────────────────────────────
const FindPageContent = ({ type }) => {
    const navigate = useNavigate();

    const [userInfo,   setUserInfo]   = useState(() => getInitialUserInfo(type));
    const [emailValid, setEmailValid] = useState(false);
    const [hintField,  setHintField]  = useState(false);
    const [idChecking, setIdChecking] = useState(false);

    const idRef     = useRef(null);
    const userIdRef = useRef(null);

    // 마운트 시 포커스만 (setState 없음)
    useEffect(() => {
        (type === 'idfind' ? idRef : userIdRef).current?.focus();
    }, [type]);

    const onChangeUserInfo = useCallback((e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    }, []);

    const findButtonActive = useMemo(() => {
        if (type === 'idfind') {
            return userInfo.userName?.trim() !== '' && userInfo.userEmail.trim() !== '' && emailValid;
        }
        return (
            userInfo.userId?.trim()       !== '' &&
            userInfo.userEmail.trim()     !== '' &&
            userInfo.passwordHint?.trim() !== '' &&
            userInfo.passwordCnsr?.trim() !== '' &&
            emailValid
        );
    }, [userInfo, emailValid, type]);

    const handleUserIdCheck = useCallback(async () => {
        const value = userInfo.userId?.trim();
        if (!value) {
            await alert.warning('아이디를 입력해주세요.', '확인');
            return;
        }
        setIdChecking(true);
        try {
            const res  = await fnAjaxFetch({
                url: `${API_URL.MANAGER_DETAIL_PWD}/${encodeURIComponent(value)}.do`,
                method: 'GET',
                withCredentials: true,
            });
            const json = res?.data;
            if (json?.resultCodeInfo === 'SUCCESS') {
                setHintField(true);
                setUserInfo(prev => ({ ...prev, passwordHint: json?.result?.result?.passwordHint || '' }));
            } else {
                setHintField(false);
                await alert.warning(json?.resultMessage || '', 'No DATA');
            }
        } catch (err) {
            if (err.name === 'HandledError') return;
            setHintField(false);
            await alert.error(err?.message || '상세 조회 오류', '조회 실패');
        } finally {
            setIdChecking(false);
        }
    }, [userInfo.userId]);

    const submitFormHandler = useCallback(async (e) => {
        e.preventDefault();
        if (!findButtonActive) return;

        const isAllValid = await validateEmptyByType(
            type === 'idfind' ? fieldsToValidateId : fieldsToValidatePwd
        );
        if (!isAllValid) return;

        const requestData = type === 'idfind'
            ? { userName: userInfo.userName, userEmail: userInfo.userEmail }
            : { userId: userInfo.userId, userEmail: userInfo.userEmail,
                passwordHint: userInfo.passwordHint, passwordCnsr: userInfo.passwordCnsr };

        try {
            const res  = await fnAjaxFetch({
                url: type === 'idfind' ? API_URL.ID_FIND_PROCESS : API_URL.PWD_FIND_PROCESS,
                method: 'POST',
                data: requestData,
                withCredentials: true,
            });
            const { data } = res;

            if (data && String(data.resultCode) === '200' && data.resultCodeInfo === 'SUCCESS') {
                if (type === 'idfind') {
                    await alert.success(`회원님의 아이디는 ${data.result.managerId}입니다.`, '아이디 찾기 성공');
                } else {
                    await alert.success('임시 비밀번호가 이메일로 발송되었습니다.', `신규 비밀번호: ${data.result.result}`);
                    navigate('/login');
                }
            } else {
                await alert.warning(
                    data?.resultMessage || '입력 정보를 확인해주세요.',
                    type === 'idfind' ? '아이디 찾기 실패' : '비밀번호 찾기 실패'
                );
            }
        } catch (err) {
            if (err.name === 'HandledError') return;
            await alert.error(
                '처리 중 오류가 발생했습니다. 다시 시도해주세요.',
                type === 'idfind' ? '아이디 찾기 실패' : '비밀번호 찾기 실패'
            );
        }
    }, [findButtonActive, userInfo, type, navigate]);

    const renderForm = () => {
        switch (type) {
            case 'idfind':
                return (
                    <IdFindForm
                        userInfo={userInfo}
                        findButtonActive={findButtonActive}
                        idRef={idRef}
                        onChangeUserInfo={onChangeUserInfo}
                        onEmailValidChange={setEmailValid}
                        handlePasswordFind={() => navigate('/search/pwdfind')}
                        submitFormHandler={submitFormHandler}
                    />
                );
            case 'pwdfind':
                return (
                    <PwdFindForm
                        userInfo={userInfo}
                        findButtonActive={findButtonActive}
                        userIdRef={userIdRef}
                        onChangeUserInfo={onChangeUserInfo}
                        onEmailValidChange={setEmailValid}
                        submitFormHandler={submitFormHandler}
                        handleUserIdCheck={handleUserIdCheck}
                        hintField={hintField}
                        idChecking={idChecking}
                    />
                );
            default:
                return <p>잘못된 접근입니다.</p>;
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <Suspense fallback={null}>
                {renderForm()}
            </Suspense>
        </div>
    );
};

// ─────────────────────────────────────────────
// 진입 컴포넌트 — key={type} 으로 type 변경 시 FindPageContent 리마운트
// ─────────────────────────────────────────────
const FindPage = () => {
    const { type } = useParams();
    return <FindPageContent key={type} type={type} />;
};

export default FindPage;
