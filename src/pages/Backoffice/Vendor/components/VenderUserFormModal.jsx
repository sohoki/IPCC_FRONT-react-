import { useCallback } from 'react';
import { useIdCheck } from '@/hooks/use-id-check.js';
import { CommonSelect } from '@/components/Common/Select.jsx';
import IosSwitch from '@/components/Common/IosSwitch.jsx';
import API_URL from '@/constants/URL.jsx';

const formatTel = (val) => {
  const raw = val.replace(/\D/g, '');
  // 대표번호 (1XXX~): 최대 8자리 (XXXX-XXXX)
  if (!raw.startsWith('0')) {
    const d = raw.slice(0, 8);
    if (d.length > 4) return `${d.slice(0, 4)}-${d.slice(4)}`;
    return d;
  }
  // 02 지역번호: 최대 10자리 (02-XXXX-XXXX)
  if (raw.startsWith('02')) {
    const d = raw.slice(0, 10);
    if (d.length > 6) return `${d.slice(0, 2)}-${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
    if (d.length > 2) return `${d.slice(0, 2)}-${d.slice(2)}`;
    return d;
  }
  // 3자리 지역번호 / 휴대폰: 최대 11자리
  const d = raw.slice(0, 11);
  if (d.length > 7) return `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return d;
};

/**
 * 거래처 관리자 등록/수정 모달
 *
 * Props:
 *   open            - 모달 표시 여부
 *   form            - 폼 상태 객체
 *   setForm         - 폼 상태 setter
 *   onClose         - 닫기 핸들러
 *   comboData       - { statusOptions, roleOptions, isLoaded }
 *   onPasswordReset - 비밀번호 초기화 핸들러 (수정 모드에서만 표시)
 *   onSubmit        - 저장 핸들러
 */
export default function VenderUserFormModal({ open, form, setForm, onClose, comboData, onPasswordReset, onSubmit }) {
  const { handleIdCheck } = useIdCheck(API_URL.VENDER_USER_ID_CHECK, '아이디');

  const updateForm = useCallback((payload) => {
    setForm((prev) => ({ ...prev, ...payload }));
  }, [setForm]);

  const { statusOptions = [], roleOptions = [], isLoaded } = comboData || {};

  if (!open) return null;

  return (
    <>
      <div className="modal-backdrop-custom" onClick={onClose} />
      <div className="modal-custom">
        <div
          className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
          style={{ width: 800, maxWidth: '55%', backgroundColor: '#fff' }}
        >
          <div className="modal-content modal">
            <div className="modal-header">
              <div className="modal-title">
                <h2 className="modal-title__title">관리자 {form.mode === 'Ins' ? '등록' : '수정'}</h2>
                <h3 className="modal-title__subtitle">
                  관리자 정보를 {form.mode === 'Ins' ? '등록' : '수정'}합니다.
                </h3>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="modal-body__content">
                <div className="row input-box-wrap">

                  {/* 아이디 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comUserId" className="form-label">
                        아이디 <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="comUserId"
                          name="comUserId"
                          autoComplete="off"
                          value={form.comUserId}
                          readOnly={form.mode !== 'Ins'}
                          onChange={(e) =>
                            updateForm({ comUserId: e.target.value.replace(/[^A-Za-z0-9]/g, ''), idCheck: 'N' })
                          }
                        />
                        {form.mode === 'Ins' && (
                          <button
                            type="button"
                            className="btn btn-primary btn-default__blue"
                            onClick={() => handleIdCheck(form.comUserId, setForm)}
                          >
                            중복체크
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 관리자명 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comUserName" className="form-label">
                        관리자명 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="comUserName"
                        placeholder="홍길동"
                        autoComplete="off"
                        value={form.comUserName}
                        onChange={(e) => updateForm({ comUserName: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 비밀번호 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comPassword" className="form-label">
                        비밀번호 {form.mode === 'Ins' && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="comPassword"
                        name="comPassword"
                        autoComplete="new-password"
                        placeholder={form.mode === 'Edt' ? '변경 시에만 입력' : ''}
                        value={form.comPassword}
                        onChange={(e) => updateForm({ comPassword: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comPasswordConfirm" className="form-label">
                        비밀번호 확인 {form.mode === 'Ins' && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="comPasswordConfirm"
                        name="comPasswordConfirm"
                        autoComplete="new-password"
                        placeholder={form.mode === 'Edt' ? '변경 시에만 입력' : ''}
                        value={form.comPasswordConfirm}
                        onChange={(e) => updateForm({ comPasswordConfirm: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 권한 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comUserRoleid" className="form-label">
                        권한 <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        comboId="comUserRoleid"
                        comboData={roleOptions}
                        value={form.comUserRoleid || ''}
                        onChange={(e) => updateForm({ comUserRoleid: e.target.value })}
                        placeholder={isLoaded ? '권한 선택' : '로딩 중...'}
                        className="form-select"
                      />
                    </div>
                  </div>

                  {/* 상태 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comUserStatus" className="form-label">
                        상태 <span className="text-danger">*</span>
                      </label>
                      <CommonSelect
                        comboId="comUserStatus"
                        comboData={statusOptions}
                        value={form.comUserStatus || ''}
                        onChange={(e) => updateForm({ comUserStatus: e.target.value })}
                        placeholder="상태 선택"
                        className="form-select"
                      />
                    </div>
                  </div>

                  {/* 전화번호 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comUserPhone" className="form-label">
                        전화번호 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="comUserPhone"
                        name="comUserPhone"
                        placeholder="010-1234-5678"
                        maxLength={13}
                        value={form.comUserPhone}
                        onChange={(e) => updateForm({ comUserPhone: formatTel(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* 이메일 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comUserEmail" className="form-label">
                        이메일 <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="comUserEmail"
                        name="comUserEmail"
                        placeholder="example@domain.com"
                        value={form.comUserEmail || ''}
                        onChange={(e) => updateForm({ comUserEmail: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 사용유무 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label className="form-label">사용유무</label>
                      <div style={{ paddingTop: 4 }}>
                        <IosSwitch
                          value={form.comUserUseyn}
                          name="comUserUseyn"
                          onChange={updateForm}
                          onText="사용"
                          offText="사용안함"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 변경일시 (수정 모드에서만 표시) */}
                  {form.mode === 'Edt' && (
                    <div className="col-6">
                      <div className="input-box">
                        <label htmlFor="lastUpdtPnttm" className="form-label">변경일시</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastUpdtPnttm"
                          value={form.lastUpdtPnttm || ''}
                          disabled
                        />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="modal-footer__left">
                {form.mode === 'Edt' && (
                  <button type="button" className="btn btn-action__red" onClick={onPasswordReset}>
                    비밀번호 초기화
                  </button>
                )}
              </div>
              <div className="modal-footer__right">
                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>저장</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
