import React from 'react'
import '@/style/Login.css'
import { BoxArrowRight, BoxArrowLeft } from 'react-bootstrap-icons'

const LoginForm = ({
  userInfo,
  saveIDFlag,
  loginButtonActive,
  idRef,
  onChangeUserInfo,
  handleSaveIDFlag,
  handleIdFind,
  handlePasswordFind,
  submitFormHandler,
}) => {
  return (
    <div className="login-box">
        <img src="/resource/img/logo_black.svg" alt="Logo" />

        <form onSubmit={submitFormHandler}>
            <div className="login-input">
                <img src="/resource/img/ic_login_id.svg" alt="" />
                <input
                    type="text"
                    id="userId"
                    name="userId"
                    className="form-control"
                    placeholder="아이디를 입력해 주세요."
                    value={userInfo.userId}
                    onChange={onChangeUserInfo}
                    ref={idRef}
                    autoComplete="username"
                />
            </div>

            <div className="login-input mt-3">
                <img src="/resource/img/ic_login_password.svg" alt="" />
                <input
                    type="password"
                    id="userPwd"
                    name="userPwd"
                    className="form-control"
                    placeholder="비밀번호를 입력해 주세요."
                    value={userInfo.userPwd}
                    onChange={onChangeUserInfo}
                    autoComplete="current-password"
                />
            </div>

            <div className="save-id mt-3">
                <label className="save-id-label">
                    <input
                        type="checkbox"
                        id="saveid"
                        checked={saveIDFlag}
                        onChange={handleSaveIDFlag}
                    />
                    <span className="custom-checkbox"></span>
                    <span className="text">ID 저장</span>
                </label>
            </div>

            <button
                type="submit"
                className="btn btn-login w-100 mt-4"
                disabled={!loginButtonActive}
            >
                LOGIN
            </button>

            <div className="login-find-wrap mt-4">
                <button type="button" className="login-find-btn" onClick={handleIdFind}>
                    <BoxArrowLeft size={15} /> 아이디 찾기
                </button>
                <div className="login-find-divider" />
                <button type="button" className="login-find-btn" onClick={handlePasswordFind}>
                    <BoxArrowRight size={15} /> 비밀번호 찾기
                </button>
            </div>
        </form>
    </div>
  )
}

export default LoginForm
