
const VenderForm = ({
    form,              // 상태 객체
    setForm,
    onChange,          // (patch) => void
    onClose,
    onData,
    onSubmit,    
})=>{

    const { handleIdCheck } = useIdCheck(URL.VENDER_ID_CHECK, "사업자 번호");
    const originComNumberRef = useRef(form.originComNumber ?? "");
    const { handleHomepageChange, handleCompositionStart, handleCompositionEnd } = useHomepageChange(onChange);
    const [comStatus, comNumberGubun] = onData;  

    const updateForm = useCallback((payload) => {
        setForm((prev) => ({
        ...prev,
        ...payload
        }));
    }, [setForm]);

    const fileRef = useRef(null);
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
                                    <h2 className="modal-title__title">판매사 등록</h2>
                                    <h3 className="modal-title__subtitle">객실 상품을 판매하는 판매사를 등록합니다.</h3>
                                </div>
                                <button type="button" className="modal-close" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                            
                                <div className="modal-body__content">
                                    <div className="row input-box-wrap">
                                        <div className="col-12">
                                            <div className="input-box">
                                                <label for="comName" className="form-label">회사명 
                                                <span className="text-danger">*</span></label>
                                                <input className="form-control" 
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
                                                <label for="comNumberGubun" className="form-label">사업자 구분 
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <CommonSelect 
                                                    comboId="comNumberGubun" // form 객체의 키값과 맞춤
                                                    comboData={comNumberGubun} 
                                                    value={form.comNumberGubun || ""} // 부모에서 전달받은 form 상태 사용
                                                    onChange={(e) => updateForm({ comNumberGubun: e.target.value }) }
                                                    placeholder={"발행 구분 선택"}
                                                    className="form-select"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-9">
                                            <div className="input-box">
                                                <label for="txt_comNumber" className="form-label">사업자 등록번호 
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <div className="input-group">
                                                    <input type="text" className="form-control" id="comNumber" 
                                                        name="comNumber"
                                                        value={form.comNumber ?? ""}
                                                        onChange={handleComNumberCheck}
                                                    />
                                                    {(form.mode === 'Ins' || (form.mode === 'Edt' && form.comNumber !== form.originComNumber)) && (
                                                    <button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleIdCheck(form.comNumber, setForm)}>
                                                        중복체크
                                                    </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label for="comLogo" className="form-label">로고 </label>
                                                <input
                                                    ref={fileRef}
                                                    type="file"
                                                    id="comLogo"
                                                    name="comLogo"
                                                    className="form-control"
                                                    onChange={(e) => updateForm({ comLogo: e.target.files?.[0] || null })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label for="comCeoName" className="form-label">대표자명 
                                                    <span className="text-danger">*</span>
                                                </label>
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
                                                <label for="comBuscondition" className="form-label">업종 <span className="text-danger">*</span></label>
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
                                                <label for="comItem" className="form-label">업태 <span className="text-danger">*</span></label>
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
                                                <label for="comZipcode" className="form-label">우편번호</label>
                                                <input
                                                    id="comZipcode"
                                                    name="comZipcode"
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="000-000"
                                                    value={form.comZipcode || ""}
                                                    maxLength={7} // 하이픈 포함 최대 7자 (숫자6 + 하이픈1)
                                                    onChange={handleZipcodeChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-9">
                                            <div className="input-box">
                                                <label for="comAddr1" className="form-label">주소 <span className="text-danger">*</span></label>
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
                                                <label for="comTel" className="form-label">전화번호 <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="comTel"
                                                    name="comTel"
                                                    placeholder="010-0000-0000"
                                                    value={form.comTel || ""}
                                                    maxLength={13} // 하이픈 포함 최대 길이
                                                    onChange={handleTelChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="input-box">
                                                <label for="comFax" className="form-label">팩스 전화번호</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="comFax"
                                                    name="comFax"
                                                    placeholder="010-0000-0000"
                                                    value={form.comFax || ""}
                                                    maxLength={13} // 하이픈 포함 최대 길이
                                                    onChange={handleTelChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="input-box">
                                                <label for="comConnectTel" className="form-label">고객센터 전화번호 <span className="text-danger">*</span></label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="comConnectTel"
                                                    name="comConnectTel"
                                                    placeholder="010-0000-0000"
                                                    value={form.comConnectTel || ""}
                                                    maxLength={13} // 하이픈 포함 최대 길이
                                                    onChange={handleTelChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label for="txt_comHomepage" className="form-label">홈페이지 주소</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    id="comHomepage"
                                                    name="comHomepage"
                                                    placeholder="https://www.example.com"
                                                    value={form.comHomepage || ""}
                                                    onChange={handleHomepageChange}
                                                    onCompositionStart={handleCompositionStart}
                                                    onCompositionEnd={handleCompositionEnd}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label for="comRepresentativeEmail" className="form-label">대표 메일주소</label>
                                                <input 
                                                    type="text" 
                                                    className="form-control" 
                                                    id="comRepresentativeEmail"
                                                    name="comRepresentativeEmail"
                                                    placeholder="example@domain.com"
                                                    value={form.comRepresentativeEmail || ""}
                                                    onChange={handleEmailChange}
                                                    onBlur={(e) => {
                                                        // 입력이 끝났을 때(포커스 아웃) 형식 체크
                                                        if (e.target.value && !validateEmail(e.target.value)) {
                                                            alert("유효한 이메일 주소를 입력해주세요.");
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="input-box">
                                                <label for="comState" className="form-label">상태 <span className="text-danger">*</span></label>
                                                <CommonSelect 
                                                    comboId="comState" // form 객체의 키값과 맞춤
                                                    comboData={comStatus} 
                                                    value={form.comState || ""} // 부모에서 전달받은 form 상태 사용
                                                    onChange={(e) => updateForm({ comState: e.target.value }) }
                                                    placeholder={"발행 구분 선택"}
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
                                <div className="modal-footer__left"></div>
                                <div className="modal-footer__right">
                                    <button type="button" className="btn btn-action__lightblue" aria-label="Close" onClick={onClose}>취소</button>
                                    <button type="button" className="btn btn-primary btn-action__blue"  onClick={onSubmit}>
                                    {form.mode === 'Ins' ? '등록' : '수정'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>
        </>
    )
}
export default VenderForm;

