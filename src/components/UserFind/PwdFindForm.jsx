import React from 'react'
import URL from "@/constants/URL.jsx";

const PwdFindForm = ({
    userInfo,
    findButtonActive,
    userIdRef,
    onChangeUserInfo,
    onEmailValidChange,
    submitFormHandler,
    handleUserIdCheck,
    hintField,
    idChecking
}) => {

    


    return (
        <div className="login-box">
            <img src="/resource/img/logo_black.svg" alt="Logo" />
            {/* ✅ 핵심: input들을 form 태그로 감싸 경고 해결 및 엔터키 지원 */}
            <form className="row g-0 w-100" onSubmit={submitFormHandler}>
                <div className="col-12">
                    <div className="login-input" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <img src="/resource/img/ic_login_id.svg" alt="" />
                        <input
                            type="text"
                            id="userId"
                            name="userId"
                            className="form-control"
                            placeholder="아이디를 입력해주세요."
                            value={userInfo.userId}
                            onChange={onChangeUserInfo}
                            ref={userIdRef}
                            autoComplete="username"
                            inputMode="latin"
                            lang="en"
                            style={{ paddingRight: '60px' }}  
                        />
                        {/* ✅ input 안쪽 오른편에 위치 */}
                        <button
                            type="button"
                            onClick={handleUserIdCheck}
                            disabled={idChecking || !userInfo.userId?.trim()}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                background: '#6c757d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                opacity: (!userInfo.userId?.trim() || idChecking) ? 0.5 : 1,
                            }}
                        >
                            {idChecking ? '조회중...' : '확인'}
                        </button>
                    </div>
                    {/* 입력창 사이 여백을 위해 mt-3 추가 (필요시 사용) */}
                    <div className="login-input mt-3">
                        <img src="/resource/img/ic_login_password.svg" alt="" />
                        <input 
                            type="text" 
                            id="userEmail" 
                            name="userEmail" 
                            className="form-control" 
                            inputMode="latin"
                            lang="en"
                            placeholder="이메일를 입력해주세요."
                            value={userInfo.userEmail} 
                            onChange={(e) => {
                                    
                                        onChangeUserInfo(e);
                                        const value = e.target.value;
                                        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                                        onEmailValidChange(isValid);
                                    }}
                        />
                    </div>
                    {hintField && (
                        <>
                            <div className="login-input mt-3">
                                <img src="/resource/img/ic_login_password.svg" alt="" />
                                <input 
                                    type="text" 
                                    id="passwordHint" 
                                    name="passwordHint" 
                                    className="form-control" 
                                    placeholder="비밀번호 힌트를 입력해주세요."
                                    value={userInfo.passwordHint || ''}
                                    onChange={onChangeUserInfo}
                                />
                            </div>
                            
                            <div className="login-input mt-3">
                                <img src="/resource/img/ic_login_password.svg" alt="" />
                                <input 
                                    type="text" 
                                    id="passwordCnsr" 
                                    name="passwordCnsr" 
                                    className="form-control" 
                                    placeholder="비밀번호 힌트를 입력해주세요."
                                    value={userInfo.passwordCnsr} 
                                    onChange={onChangeUserInfo}
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* mt-4를 주어 ID 저장과 로그인 버튼 사이의 간격을 적절히 유지 */}
                <div className="col-12 mt-4">
                    {/* ✅ button 타입을 submit으로 변경 */}
                    <button 
                        type="submit" 
                        className="btn btn-login w-100" // 가로 꽉 차게 w-100 추가
                        disabled={!findButtonActive}
                    >
                        비밀번호 찾기
                    </button>
                </div>

                
            </form>
        </div>
    )
}
export default PwdFindForm;