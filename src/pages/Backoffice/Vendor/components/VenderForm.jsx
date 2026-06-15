import { useRef, useCallback, useState } from 'react';
import { useIdCheck } from '@/hooks/use-id-check.js';
import { CommonSelect } from '@/components/Common/Select.jsx';
import URL from '@/constants/URL.jsx';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const formatTel = (val) => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

const formatZipcode = (val) => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}`;
};

const VenderForm = ({
  open,
  form,
  setForm,
  onClose,
  onData,
  onSubmit,
}) => {
  const { handleIdCheck } = useIdCheck(URL.VENDER_ID_CHECK, '사업자 번호');
  const fileRef = useRef(null);
  const [isComposing, setIsComposing] = useState(false);

  const [comStatus, comNumberGubun] = onData || [[], []];

  const updateForm = useCallback((payload) => {
    setForm((prev) => ({ ...prev, ...payload }));
  }, [setForm]);

  const handleTelChange = useCallback((e) => {
    const { name, value } = e.target;
    updateForm({ [name]: formatTel(value) });
  }, [updateForm]);

  const handleZipcodeChange = useCallback((e) => {
    updateForm({ comZipcode: formatZipcode(e.target.value) });
  }, [updateForm]);

  const handleComNumberCheck = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    updateForm({ comNumber: raw, idCheck: 'N' });
  }, [updateForm]);

  const handleHomepageChange = useCallback((e) => {
    if (!isComposing) updateForm({ comHomepage: e.target.value });
  }, [isComposing, updateForm]);

  const handleEmailChange = useCallback((e) => {
    updateForm({ comRepresentativeEmail: e.target.value });
  }, [updateForm]);

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
                <h2 className="modal-title__title">
                  {form.comGubun === 'COM_GUBUN_1' ? '공급사' : '판매사'} {form.mode === 'Ins' ? '등록' : '수정'}
                </h2>
                <h3 className="modal-title__subtitle">
                  {form.comGubun === 'COM_GUBUN_1' ? '객실 상품을 공급하는 공급사' : '객실 상품을 판매하는 판매사'}를 {form.mode === 'Ins' ? '등록' : '수정'}합니다.
                </h3>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              <div className="modal-body__content">
                <div className="row input-box-wrap">
                  <div className="col-12">
                    <div className="input-box">
                      <label htmlFor="comName" className="form-label">회사명 <span className="text-danger">*</span></label>
                      <input
                        className="form-control"
                        id="comName"
                        name="comName"
                        type="text"
                        value={form.comName}
                        onChange={(e) => updateForm({ comName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label htmlFor="comNumberGubun" className="form-label">사업자 구분 <span className="text-danger">*</span></label>
                      <CommonSelect
                        comboId="comNumberGubun"
                        comboData={comNumberGubun}
                        value={form.comNumberGubun || ''}
                        onChange={(e) => updateForm({ comNumberGubun: e.target.value })}
                        placeholder="발행 구분 선택"
                        className="form-select"
                      />
                    </div>
                  </div>
                  <div className="col-9">
                    <div className="input-box">
                      <label htmlFor="comNumber" className="form-label">사업자 등록번호 <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          id="comNumber"
                          name="comNumber"
                          value={form.comNumber ?? ''}
                          onChange={handleComNumberCheck}
                        />
                        {(form.mode === 'Ins' || (form.mode === 'Edt' && form.comNumber !== form.originalComNumber)) && (
                          <button
                            type="button"
                            className="btn btn-primary btn-default__blue"
                            onClick={() => handleIdCheck(form.comNumber, setForm)}
                          >
                            중복체크
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comLogo" className="form-label">로고</label>
                      <input
                        ref={fileRef}
                        type="file"
                        id="comLogo"
                        name="comLogo"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => updateForm({ logoImgFile: e.target.files?.[0] || null })}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comCeoName" className="form-label">대표자명 <span className="text-danger">*</span></label>
                      <input
                        id="comCeoName"
                        name="comCeoName"
                        type="text"
                        className="form-control"
                        value={form.comCeoName}
                        onChange={(e) => updateForm({ comCeoName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comBuscondition" className="form-label">업종 <span className="text-danger">*</span></label>
                      <input
                        id="comBuscondition"
                        name="comBuscondition"
                        type="text"
                        className="form-control"
                        value={form.comBuscondition}
                        onChange={(e) => updateForm({ comBuscondition: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comItem" className="form-label">업태 <span className="text-danger">*</span></label>
                      <input
                        id="comItem"
                        name="comItem"
                        type="text"
                        className="form-control"
                        value={form.comItem}
                        onChange={(e) => updateForm({ comItem: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="input-box">
                      <label htmlFor="comZipcode" className="form-label">우편번호</label>
                      <input
                        id="comZipcode"
                        name="comZipcode"
                        type="text"
                        className="form-control"
                        placeholder="000-000"
                        value={form.comZipcode || ''}
                        maxLength={7}
                        onChange={handleZipcodeChange}
                      />
                    </div>
                  </div>
                  <div className="col-9">
                    <div className="input-box">
                      <label htmlFor="comAddr1" className="form-label">주소 <span className="text-danger">*</span></label>
                      <input
                        id="comAddr1"
                        name="comAddr1"
                        type="text"
                        className="form-control"
                        value={form.comAddr1}
                        onChange={(e) => updateForm({ comAddr1: e.target.value })}
                      />
                      <br />
                      <input
                        id="comAddr2"
                        name="comAddr2"
                        type="text"
                        className="form-control"
                        value={form.comAddr2}
                        onChange={(e) => updateForm({ comAddr2: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="input-box">
                      <label htmlFor="comTel" className="form-label">전화번호 <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        id="comTel"
                        name="comTel"
                        placeholder="010-0000-0000"
                        value={form.comTel || ''}
                        maxLength={13}
                        onChange={handleTelChange}
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="input-box">
                      <label htmlFor="comFax" className="form-label">팩스 전화번호</label>
                      <input
                        type="text"
                        className="form-control"
                        id="comFax"
                        name="comFax"
                        placeholder="010-0000-0000"
                        value={form.comFax || ''}
                        maxLength={13}
                        onChange={handleTelChange}
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="input-box">
                      <label htmlFor="comConnectTel" className="form-label">고객센터 전화번호</label>
                      <input
                        type="text"
                        className="form-control"
                        id="comConnectTel"
                        name="comConnectTel"
                        placeholder="010-0000-0000"
                        value={form.comConnectTel || ''}
                        maxLength={13}
                        onChange={handleTelChange}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comHomepage" className="form-label">홈페이지 주소</label>
                      <input
                        type="text"
                        className="form-control"
                        id="comHomepage"
                        name="comHomepage"
                        placeholder="https://www.example.com"
                        value={form.comHomepage || ''}
                        onChange={handleHomepageChange}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={(e) => { setIsComposing(false); updateForm({ comHomepage: e.target.value }); }}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comRepresentativeEmail" className="form-label">대표 메일주소</label>
                      <input
                        type="text"
                        className="form-control"
                        id="comRepresentativeEmail"
                        name="comRepresentativeEmail"
                        placeholder="example@domain.com"
                        value={form.comRepresentativeEmail || ''}
                        onChange={handleEmailChange}
                        onBlur={(e) => {
                          if (e.target.value && !validateEmail(e.target.value)) {
                            alert('유효한 이메일 주소를 입력해주세요.');
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comState" className="form-label">상태 <span className="text-danger">*</span></label>
                      <CommonSelect
                        comboId="comState"
                        comboData={comStatus}
                        value={form.comState || ''}
                        onChange={(e) => updateForm({ comState: e.target.value })}
                        placeholder="상태 선택"
                        className="form-select"
                      />
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label className="form-label">사용유무</label>
                      <div className="input-group gap-2">
                        <label className="d-inline-flex align-items-center gap-1">
                          <input
                            type="radio"
                            name="comUseyn"
                            value="Y"
                            checked={form.comUseyn === 'Y'}
                            onChange={() => updateForm({ comUseyn: 'Y' })}
                          />
                          <span>사용</span>
                        </label>
                        <label className="d-inline-flex align-items-center gap-1">
                          <input
                            type="radio"
                            name="comUseyn"
                            value="N"
                            checked={form.comUseyn === 'N'}
                            onChange={() => updateForm({ comUseyn: 'N' })}
                          />
                          <span>사용안함</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-footer__left" />
              <div className="modal-footer__right">
                <button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
                <button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>
                  {form.mode === 'Ins' ? '등록' : '수정'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VenderForm;
