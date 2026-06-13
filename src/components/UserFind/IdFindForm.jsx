import React from 'react'
import { Button } from 'react-bootstrap';
import { BoxArrowRight, BoxArrowLeft } from 'react-bootstrap-icons';

const IdFindForm = ({
    userInfo,
    findButtonActive,
    idRef,
    onChangeUserInfo,
    onEmailValidChange,
    handlePasswordFind,
    submitFormHandler,
}) => {
    
    return (
        <div className="login-box">
            <img src="/resource/img/logo_black.svg" alt="Logo" />
            {/* ✅ 핵심: input들을 form 태그로 감싸 경고 해결 및 엔터키 지원 */}
            <form className="row g-0 w-100" onSubmit={submitFormHandler}>
                <div className="col-12">
                    <div className="login-input">
                        <img src="/resource/img/ic_login_id.svg" alt="" />
                        <input 
                            type="text" 
                            id="userName" 
                            name="userName" 
                            className="form-control" 
                            placeholder='이름를 입력해주세요.' 
                            value={userInfo.userName} 
                            onChange={onChangeUserInfo} 
                            ref={idRef}
                            autoComplete="username"
                        />
                    </div>
                    {/* 입력창 사이 여백을 위해 mt-3 추가 (필요시 사용) */}
                    <div className="login-input mt-3">
                        <img src="/resource/img/ic_login_password.svg" alt="" />
                        <input 
                            type="text" 
                            id="userEmail" 
                            name="userEmail" 
                            className="form-control" 
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
                </div>

                {/* mt-4를 주어 ID 저장과 로그인 버튼 사이의 간격을 적절히 유지 */}
                <div className="col-12 mt-4">
                    {/* ✅ button 타입을 submit으로 변경 */}
                    <button 
                        type="submit" 
                        className="btn btn-login w-100" // 가로 꽉 차게 w-100 추가
                        disabled={!findButtonActive}
                    >
                        ID 찾기
                    </button>
                </div>

                {/* mt-5를 추가하여 로그인 버튼과 완전히 떨어뜨려 배치 */}
                <div className="col-12 d-flex align-items-stretch mt-5">
                    <Button 
                        variant="dark" 
                        className="w-100 py-3 d-flex align-items-center justify-content-center gap-2 border-0"
                        style={{ 
                            backgroundColor: '#2d2f31', 
                            borderRadius: '16px 16px 16px 16px', 
                            fontSize: '14px' 
                        }}
                        onClick={handlePasswordFind}
                    >
                        <BoxArrowRight size={16} /> 비밀번호 찾기
                    </Button>
                </div>

                
            </form>
        </div>
    )
}   
export default IdFindForm;