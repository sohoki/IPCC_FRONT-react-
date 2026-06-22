import React, { useCallback, useMemo } from 'react';
import URL from '@/constants/URL.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCustomReqDataCombo, useCommonCodeData } from '@/hooks/use-combo-data.js';
import { usePhoneInput } from '@/hooks/use-input-handlers.js';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import { useFileUpload } from '@/hooks/use-file-upload.js';

const BuildFormModal = ({
	open,
	onClose,
	form,
	setForm,
	onSubmit
}) => {
	const { options: insttOptions } = useCustomReqDataCombo({
		url: URL.INSTT_COMBO,
		method: 'POST',
		mapping: { id: 'insttCode', text: 'allInsttNm' },
	});

	const { options: floorCodes } = useCommonCodeData('CENTER_FLOOR');

	React.useEffect(() => {
		if (!open || form.mode !== 'Edt' || !form.centerId) return;
		let active = true;
		fnAjaxFetch({
			url: `${URL.CENTER_DETAIL}/${encodeURIComponent(form.centerId)}.do`,
			method: 'GET',
			withCredentials: true,
		}).then(res => {
			if (!active) return;
			if (res?.data?.resultCodeInfo === 'SUCCESS') {
				const obj = res?.data?.result?.regist || res?.data?.result || {};
				setForm(prev => ({
					...prev,
					centerZipcode: obj.centerZipcode || '',
					centerAddr1: obj.centerAddr1 || '',
					centerAddr2: obj.centerAddr2 || '',
					UseAt: obj.centerUseYn || 'Y',
					adminApprovalYn: obj.adminApprovalYn || 'N',
					centerFloor: obj.centerFloor || '',
					centerFloorEnd: obj.centerFloorEnd || '',
					floorInfo: obj.floorInfo || '',
					centerInfo: obj.centerInfo || '',
				}));
			}
		}).catch(() => {});
		return () => { active = false; };
	}, [open, form.centerId, form.mode, setForm]);

	const updateForm = useCallback((e) => {
		const { name, type, value, files } = e.target;
		setForm(prev => ({
			...prev,
			[name]: type === 'file' ? (files?.[0] || null) : value,
		}));
	}, [setForm]);

	const updateFormValue = useCallback((payload) => {
		setForm(prev => ({ ...prev, ...payload }));
	}, [setForm]);

	const { handleTelChange, handleFaxChange } = usePhoneInput(updateFormValue);

	const { getRootProps, getInputProps, isDragActive, file: imgFile, clearFile } = useFileUpload({
		fieldName: 'centerImgFile',
		updateForm: updateFormValue,
		fileValue: form.centerImgFile,
		accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'] },
		multiUse: false,
	});

	// 종료 층수 선택지: 시작 층수 이후 값만 표시
	const endFloorOptions = useMemo(() => {
		if (!form.centerFloor || !floorCodes.length) return floorCodes;
		const startIdx = floorCodes.findIndex(f => f.code === form.centerFloor);
		if (startIdx < 0) return floorCodes;
		return floorCodes.slice(startIdx + 1);
	}, [floorCodes, form.centerFloor]);

	// 시작 층수 변경 시 종료 층수가 시작 층수 이전이면 초기화
	const handleFloorStart = useCallback((e) => {
		const { value } = e.target;
		setForm(prev => {
			const startIdx = floorCodes.findIndex(f => f.code === value);
			const endIdx = floorCodes.findIndex(f => f.code === prev.centerFloorEnd);
			const shouldReset = endIdx >= 0 && startIdx >= 0 && endIdx <= startIdx;
			return { ...prev, centerFloor: value, ...(shouldReset ? { centerFloorEnd: '' } : {}) };
		});
	}, [floorCodes, setForm]);

	const floorRange = useMemo(() => {
		if (!form.centerFloor || !form.centerFloorEnd || !floorCodes.length) return [];
		const startIdx = floorCodes.findIndex(f => f.code === form.centerFloor);
		const endIdx = floorCodes.findIndex(f => f.code === form.centerFloorEnd);
		if (startIdx < 0 || endIdx < 0) return [];
		const min = Math.min(startIdx, endIdx);
		const max = Math.max(startIdx, endIdx);
		return floorCodes.slice(min, max + 1);
	}, [floorCodes, form.centerFloor, form.centerFloorEnd]);

	const selectedFloors = useMemo(() => {
		if (!form.floorInfo) return new Set();
		return new Set(form.floorInfo.split(',').filter(Boolean));
	}, [form.floorInfo]);

	const handleFloorCheck = useCallback((code, checked) => {
		setForm(prev => {
			const set = new Set((prev.floorInfo || '').split(',').filter(Boolean));
			if (checked) set.add(code);
			else set.delete(code);
			return { ...prev, floorInfo: [...set].join(',') };
		});
	}, [setForm]);

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom">
			<div className="modal-custom">
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 860, maxWidth: '92%', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">지점 {form.mode === 'Ins' ? '등록' : '수정'}</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div className="row input-box-wrap">
									{/* 지점명 */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="centerNm" className="form-label">
												지점명 <span className="text-danger">*</span>
											</label>
											<input
												id="centerNm" name="centerNm"
												type="text" className="form-control"
												placeholder="지점명을 입력해주세요."
												value={form.centerNm ?? ''}
												onChange={updateForm}
											/>
										</div>
									</div>
									{/* 기관명 */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="insttCode" className="form-label">
												기관명 <span className="text-danger">*</span>
											</label>
											<select
												id="insttCode" name="insttCode"
												className="form-select"
												value={form.insttCode ?? ''}
												onChange={updateForm}
											>
												<option value="">기관 선택</option>
												{insttOptions.map(o => (
													<option key={o.code} value={o.code}>{o.codeNm}</option>
												))}
											</select>
										</div>
									</div>
									{/* 주소 */}
									<div className="col-12">
										<div className="input-box">
											<label className="form-label">주소</label>
											<input
												name="centerZipcode" type="text"
												className="form-control mb-1"
												style={{ width: 140 }}
												placeholder="우편번호"
												value={form.centerZipcode ?? ''}
												onChange={updateForm}
											/>
											<input
												name="centerAddr1" type="text"
												className="form-control mb-1"
												placeholder="기본 주소"
												value={form.centerAddr1 ?? ''}
												onChange={updateForm}
											/>
											<input
												name="centerAddr2" type="text"
												className="form-control"
												placeholder="상세 주소"
												value={form.centerAddr2 ?? ''}
												onChange={updateForm}
											/>
										</div>
									</div>
									{/* 전화번호 / Fax */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="centerTel" className="form-label">전화번호</label>
											<input
												id="centerTel" name="centerTel"
												type="text" className="form-control"
												placeholder="전화번호"
												value={form.centerTel ?? ''}
												onChange={handleTelChange}
											/>
										</div>
									</div>
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="centerFax" className="form-label">Fax</label>
											<input
												id="centerFax" name="centerFax"
												type="text" className="form-control"
												placeholder="Fax"
												value={form.centerFax ?? ''}
												onChange={handleFaxChange}
											/>
										</div>
									</div>
									{/* 전경 사진 / URL */}
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">전경 사진</label>
											<div
												{...getRootProps()}
												style={{
													border: `2px dashed ${isDragActive ? '#0d6efd' : '#dee2e6'}`,
													borderRadius: 6,
													padding: '10px 14px',
													cursor: 'pointer',
													background: isDragActive ? '#f0f4ff' : '#fafafa',
													minHeight: 64,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												<input {...getInputProps()} />
												{imgFile ? (
													<div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
														<span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
															{imgFile.name}
														</span>
														<button
															type="button"
															className="btn-close"
															style={{ fontSize: 10, flexShrink: 0 }}
															onClick={clearFile}
															aria-label="파일 제거"
														/>
													</div>
												) : (
													<span style={{ color: '#adb5bd', fontSize: 13 }}>
														{isDragActive ? '파일을 놓아주세요' : '이미지를 드래그하거나 클릭하여 선택'}
													</span>
												)}
											</div>
										</div>
									</div>
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="centerUrl" className="form-label">URL</label>
											<input
												id="centerUrl" name="centerUrl"
												type="text" className="form-control"
												placeholder="URL을 입력해주세요."
												value={form.centerUrl ?? ''}
												onChange={updateForm}
											/>
										</div>
									</div>
									{/* 사용여부 / 관리자 승인여부 */}
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">사용 여부</label>
											<div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
												<UseSwitch
													value={form.UseAt}
													name="UseAt"
													onChange={(payload) => setForm(prev => ({ ...prev, UseAt: payload.UseAt }))}
													onText="사용"
													offText="미사용"
												/>
											</div>
										</div>
									</div>
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">관리자 승인여부</label>
											<div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
												<UseSwitch
													value={form.adminApprovalYn}
													name="adminApprovalYn"
													onChange={(payload) => setForm(prev => ({ ...prev, adminApprovalYn: payload.adminApprovalYn }))}
													onText="승인"
													offText="미승인"
												/>
											</div>
										</div>
									</div>
									{/* 전체 사용 층수 */}
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">전체 사용 층수</label>
											<div className="d-flex gap-2 align-items-center">
												<select
													name="centerFloor"
													className="form-select"
													value={form.centerFloor ?? ''}
													onChange={handleFloorStart}
												>
													<option value="">시작 층수</option>
													{floorCodes.map(f => (
														<option key={f.code} value={f.code}>{f.codeNm}</option>
													))}
												</select>
												<span className="px-1">~</span>
												<select
													name="centerFloorEnd"
													className="form-select"
													value={form.centerFloorEnd ?? ''}
													onChange={updateForm}
													disabled={!form.centerFloor}
												>
													<option value="">종료 층수</option>
													{endFloorOptions.map(f => (
														<option key={f.code} value={f.code}>{f.codeNm}</option>
													))}
												</select>
											</div>
										</div>
									</div>
									{/* 사용 층수 체크박스 */}
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">사용 층수</label>
											<div className="d-flex flex-wrap gap-2" style={{ minHeight: 38 }}>
												{floorRange.length === 0 ? (
													<span className="text-muted small align-self-center">시작/종료 층수를 먼저 선택해주세요.</span>
												) : floorRange.map(f => (
													<div key={f.code} className="form-check">
														<input
															className="form-check-input"
															type="checkbox"
															id={`floor_${f.code}`}
															checked={selectedFloors.has(f.code)}
															onChange={e => handleFloorCheck(f.code, e.target.checked)}
														/>
														<label className="form-check-label" htmlFor={`floor_${f.code}`}>
															{f.codeNm}
														</label>
													</div>
												))}
											</div>
										</div>
									</div>
									{/* 설명 */}
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="centerInfo" className="form-label">설명</label>
											<textarea
												id="centerInfo" name="centerInfo"
												className="form-control"
												rows={4}
												placeholder="설명을 입력해주세요."
												value={form.centerInfo ?? ''}
												onChange={updateForm}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="modal-footer__left" />
							<div className="modal-footer__right">
								<button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
								<button type="button" className="btn btn-primary btn-action__blue" onClick={onSubmit}>저장</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BuildFormModal;
