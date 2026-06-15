import { useCallback, useState, useEffect } from 'react';
import { useIdCheck } from '@/hooks/use-id-check.js';
import { useFileUpload } from '@/hooks/use-file-upload.js';
import { CommonSelect } from '@/components/Common/Select.jsx';
import IosSwitch from '@/components/Common/IosSwitch.jsx';
import URL from '@/constants/URL.jsx';
import '@/style/DropZone.css';

// 정규식
const REG_TEL          = /^(\d{4}-\d{4}|\d{2,3}-\d{3,4}-\d{4})$/;
const REG_URL          = /^(https?:\/\/)?([\w-]+\.)+[\w]{2,}(\/\S*)?$/i;
const REG_EMAIL        = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REG_BIZ_NUM      = /^\d{3}-\d{2}-\d{5}$/;        // 사업자등록번호 (개인사업자/법인)
const REG_RESIDENT_NUM = /^\d{6}-\d{7}$/;               // 주민등록번호 (개인)

// 사업자등록번호: XXX-XX-XXXXX (10자리)
const formatBizNum = (val) => {
  const d = val.replace(/\D/g, '').slice(0, 10);
  if (d.length > 5) return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
  if (d.length > 3) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return d;
};

// 주민등록번호: XXXXXX-XXXXXXX (13자리)
const formatResidentNum = (val) => {
  const d = val.replace(/\D/g, '').slice(0, 13);
  if (d.length > 6) return `${d.slice(0, 6)}-${d.slice(6)}`;
  return d;
};

// 사업자 구분 코드명으로 번호 유형 판별
// 코드명에 '사업자'가 없는 순수 '개인'은 주민등록번호, 나머지는 사업자등록번호
const getNumType = (comGubunVal, options = []) => {
  const item = options.find(o => (o.codeDetailId ?? o.code) === comGubunVal);
  const nm   = (item?.codeDetailNm ?? item?.codeNm ?? '').trim();
  return (nm && nm.includes('개인') && !nm.includes('사업자')) ? 'RESIDENT' : 'BIZ';
};

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

const formatZipcode = (val) => {
  const d = val.replace(/\D/g, '');
  if (d.length <= 3) return d;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}`;
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
  const [logoPreview, setLogoPreview]   = useState(null);
  // 필드별 에러 메시지
  const [errors, setErrors] = useState({});

  const [comStatus, comGubun] = onData || [[], []];

  const updateForm = useCallback((payload) => {
    setForm((prev) => ({ ...prev, ...payload }));
  }, [setForm]);

  // 로고 DropZone
  const updateLogo = useCallback((payload) => {
    const file = payload.logoImgFile;
    setLogoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return file ? window.URL.createObjectURL(file) : null; });
    updateForm({ logoImgFile: file || null });
  }, [updateForm]);

  const { getRootProps, getInputProps, isDragActive, clearFile } = useFileUpload({
    fieldName: 'logoImgFile',
    updateForm: updateLogo,
    fileValue: form.logoImgFile,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'] },
  });

  // 모달 닫힐 때 미리보기 URL 해제 및 에러 초기화
  useEffect(() => {
    if (!open) return;
    return () => {
      setLogoPreview((prev) => { if (prev) window.URL.revokeObjectURL(prev); return null; });
      setErrors({});
    };
  }, [open]);

  // 전화번호 포맷 + 실시간 에러
  const handleTelChange = useCallback((e) => {
    const { name, value } = e.target;
    const formatted = formatTel(value);
    updateForm({ [name]: formatted });
    setErrors((prev) => ({ ...prev, [name]: formatted && !REG_TEL.test(formatted) ? '형식이 올바르지 않습니다. (예: 02-1234-5678)' : '' }));
  }, [updateForm]);

  const handleZipcodeChange = useCallback((e) => {
    updateForm({ comZipcode: formatZipcode(e.target.value) });
  }, [updateForm]);

  const handleComNumberCheck = useCallback((e) => {
    const numType  = getNumType(form.comGubun, comGubun);
    const formatted = numType === 'RESIDENT'
      ? formatResidentNum(e.target.value)
      : formatBizNum(e.target.value);
    const reg = numType === 'RESIDENT' ? REG_RESIDENT_NUM : REG_BIZ_NUM;
    const errMsg = formatted && !reg.test(formatted)
      ? (numType === 'RESIDENT'
          ? '주민등록번호 형식이 올바르지 않습니다. (예: 900101-1234567)'
          : '사업자등록번호 형식이 올바르지 않습니다. (예: 123-45-67890)')
      : '';
    updateForm({ comNumber: formatted, idCheck: 'N' });
    setErrors((prev) => ({ ...prev, comNumber: errMsg }));
  }, [form.comGubun, comGubun, updateForm]);

  const handleHomepageChange = useCallback((e) => {
    const val = e.target.value;
    updateForm({ comHomepage: val });
    setErrors((prev) => ({ ...prev, comHomepage: val && !REG_URL.test(val) ? 'URL 형식이 올바르지 않습니다. (예: https://example.com)' : '' }));
  }, [updateForm]);

  const handleEmailChange = useCallback((e) => {
    const val = e.target.value;
    updateForm({ comRepresentativeEmail: val });
    setErrors((prev) => ({ ...prev, comRepresentativeEmail: val && !REG_EMAIL.test(val) ? '이메일 형식이 올바르지 않습니다.' : '' }));
  }, [updateForm]);

  if (!open) return null;

  const titleLabel = form.comGubun === 'COM_GUBUN_1' ? '공급사' : '판매사';

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
                <h2 className="modal-title__title">{titleLabel} {form.mode === 'Ins' ? '등록' : '수정'}</h2>
                <h3 className="modal-title__subtitle">
                  {form.comGubun === 'COM_GUBUN_1' ? '상품을 공급하는 공급사' : '상품을 판매하는 판매사'}를 {form.mode === 'Ins' ? '등록' : '수정'}합니다.
                </h3>
              </div>
              <button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="modal-body__content">
                <div className="row input-box-wrap">

                  {/* 회사명 */}
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

                  {/* 사업자 구분 + 사업자 등록번호 */}
                  {(() => {
                    const numType   = getNumType(form.comGubun, comGubun);
                    const isResident = numType === 'RESIDENT';
                    return (
                      <>
                        <div className="col-3">
                          <div className="input-box">
                            <label htmlFor="comGubun" className="form-label">사업자 구분 <span className="text-danger">*</span></label>
                            <CommonSelect
                              comboId="comGubun"
                              comboData={comGubun}
                              value={form.comGubun || ''}
                              onChange={(e) => updateForm({ comGubun: e.target.value, comNumber: '', idCheck: 'N' })}
                              placeholder="구분 선택"
                              className="form-select"
                            />
                          </div>
                        </div>
                        <div className="col-9">
                          <div className="input-box">
                            <label htmlFor="comNumber" className="form-label">
                              {isResident ? '주민등록번호' : '사업자 등록번호'} <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                              <input
                                type="text"
                                className={`form-control${errors.comNumber ? ' is-invalid' : ''}`}
                                id="comNumber"
                                name="comNumber"
                                placeholder={isResident ? '숫자만 입력 (900101-1234567)' : '숫자만 입력 (123-45-67890)'}
                                maxLength={isResident ? 14 : 12}
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
                            {errors.comNumber && <div className="invalid-feedback">{errors.comNumber}</div>}
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* 로고 DropZone + 대표자명/업종/업태 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label className="form-label">로고 이미지</label>
                      <div
                        {...getRootProps()}
                        className={`dropzone-box${isDragActive ? ' active' : ''}${form.logoImgFile ? ' has-file' : ''}`}
                        style={{ minHeight: 148 }}
                      >
                        <input {...getInputProps()} />
                        {logoPreview ? (
                          <div className="file-info">
                            <img
                              src={logoPreview}
                              alt="로고 미리보기"
                              style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain', borderRadius: 4 }}
                            />
                            <span className="file-name" style={{ fontSize: 12 }}>{form.logoImgFile?.name}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              style={{ fontSize: 11, padding: '2px 8px', zIndex: 3, position: 'relative' }}
                              onClick={(e) => { e.stopPropagation(); clearFile(e); setLogoPreview(null); }}
                            >
                              삭제
                            </button>
                          </div>
                        ) : (
                          <div className="placeholder-content">
                            <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                            <div style={{ fontSize: 13, color: '#8c8c8c' }}>
                              {isDragActive ? '여기에 놓으세요' : '클릭하거나 파일을 드래그하세요'}
                            </div>
                            <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>JPG · PNG · GIF · SVG</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 대표자명 / 업종 / 업태 (로고 우측) */}
                  <div className="col-6">
                    <div className="row g-0" style={{ height: '100%' }}>
                      {[
                        { id: 'comCeoName',      label: '대표자명', field: 'comCeoName' },
                        { id: 'comBuscondition', label: '업종',    field: 'comBuscondition' },
                        { id: 'comItem',         label: '업태',    field: 'comItem' },
                      ].map(({ id, label, field }) => (
                        <div className="col-12" key={id} style={{ paddingBottom: 6 }}>
                          <label htmlFor={id} className="form-label mb-1" style={{ fontSize: 13 }}>
                            {label} <span className="text-danger">*</span>
                          </label>
                          <input
                            id={id}
                            name={id}
                            type="text"
                            className="form-control form-control-sm"
                            value={form[field] || ''}
                            onChange={(e) => updateForm({ [field]: e.target.value })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 우편번호 / 주소 */}
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
                        className="form-control mt-1"
                        value={form.comAddr2}
                        onChange={(e) => updateForm({ comAddr2: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 전화번호 / 팩스 / 고객센터 */}
                  <div className="col-4">
                    <div className="input-box">
                      <label htmlFor="comTel" className="form-label">전화번호 <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control${errors.comTel ? ' is-invalid' : ''}`}
                        id="comTel"
                        name="comTel"
                        placeholder="02-1234-5678"
                        value={form.comTel || ''}
                        maxLength={13}
                        onChange={handleTelChange}
                      />
                      {errors.comTel && <div className="invalid-feedback">{errors.comTel}</div>}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="input-box">
                      <label htmlFor="comFax" className="form-label">팩스</label>
                      <input
                        type="text"
                        className={`form-control${errors.comFax ? ' is-invalid' : ''}`}
                        id="comFax"
                        name="comFax"
                        placeholder="02-1234-5678"
                        value={form.comFax || ''}
                        maxLength={13}
                        onChange={handleTelChange}
                      />
                      {errors.comFax && <div className="invalid-feedback">{errors.comFax}</div>}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="input-box">
                      <label htmlFor="comConnectTel" className="form-label">고객센터</label>
                      <input
                        type="text"
                        className={`form-control${errors.comConnectTel ? ' is-invalid' : ''}`}
                        id="comConnectTel"
                        name="comConnectTel"
                        placeholder="1588-0000"
                        value={form.comConnectTel || ''}
                        maxLength={13}
                        onChange={handleTelChange}
                      />
                      {errors.comConnectTel && <div className="invalid-feedback">{errors.comConnectTel}</div>}
                    </div>
                  </div>

                  {/* 홈페이지 / 이메일 */}
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comHomepage" className="form-label">홈페이지</label>
                      <input
                        type="text"
                        className={`form-control${errors.comHomepage ? ' is-invalid' : ''}`}
                        id="comHomepage"
                        name="comHomepage"
                        placeholder="https://www.example.com"
                        value={form.comHomepage || ''}
                        onChange={handleHomepageChange}
                      />
                      {errors.comHomepage && <div className="invalid-feedback">{errors.comHomepage}</div>}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-box">
                      <label htmlFor="comRepresentativeEmail" className="form-label">대표 메일</label>
                      <input
                        type="text"
                        className={`form-control${errors.comRepresentativeEmail ? ' is-invalid' : ''}`}
                        id="comRepresentativeEmail"
                        name="comRepresentativeEmail"
                        placeholder="example@domain.com"
                        value={form.comRepresentativeEmail || ''}
                        onChange={handleEmailChange}
                      />
                      {errors.comRepresentativeEmail && <div className="invalid-feedback">{errors.comRepresentativeEmail}</div>}
                    </div>
                  </div>

                  {/* 상태 / 사용유무 */}
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
                      <label className="form-label d-block">사용유무</label>
                      <div style={{ paddingTop: 4 }}>
                        <IosSwitch
                          value={form.comUseyn}
                          name="comUseyn"
                          onChange={updateForm}
                          onText="사용"
                          offText="미사용"
                        />
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
