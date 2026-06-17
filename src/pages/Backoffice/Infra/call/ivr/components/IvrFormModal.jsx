import React, { useState, useCallback, useEffect } from 'react';
import IosSwitch from '@/components/Common/IosSwitch.jsx';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const buildForm = (isEdt, rowData) => {
	if (!isEdt || !rowData) {
		return { insttCode: '', ivrCode: '', ivrName: '', ivrUseyn: 'Y', ivrMentUseyn: 'N', ivrMent: '', notiSday: '', notiEday: '', workStime: '', workEtime: '', ivrMeno: '' };
	}
	return {
		insttCode: rowData.insttCode || '',
		ivrCode: rowData.ivrCode || '',
		ivrName: rowData.ivrName || '',
		ivrUseyn: rowData.ivrUseyn || 'Y',
		ivrMentUseyn: rowData.ivrMentUseyn || 'N',
		ivrMent: rowData.ivrMent || '',
		notiSday: rowData.notiSday || '',
		notiEday: rowData.notiEday || '',
		workStime: rowData.workStime || '',
		workEtime: rowData.workEtime || '',
		ivrMeno: rowData.ivrMeno || '',
	};
};

const IvrFormModal = ({ open, onClose, ivrCode, rowData, onSuccess }) => {
	const isEdt = ivrCode !== null && ivrCode !== undefined;

	// 부모가 key를 변경해 리마운트하므로 lazy initializer로 최초 1회 초기화
	const [form, setForm] = useState(() => buildForm(isEdt, rowData));
	const [insttOptions, setInsttOptions] = useState([]);

	// 기관 콤보 조회 — .then() 안에서 setState → effect 본문에서 직접 호출 아님
	useEffect(() => {
		if (!open) return;
		fnAjaxFetch({ url: URL.IVR_INSTT_COMBO, method: 'GET', withCredentials: true })
			.then(res => {
				const list = res?.data?.result || res?.data || [];
				if (Array.isArray(list)) {
					setInsttOptions(list.map(o => ({
						code: o.insttCode || o.code || '',
						codeNm: o.insttNm || o.codeNm || '',
					})));
				}
			}).catch(() => {});
	}, [open]);

	const updateForm = useCallback((e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	}, []);

	const updateSwitch = useCallback((payload) => {
		setForm(prev => ({ ...prev, ...payload }));
	}, []);

	const handleSave = useCallback(async () => {
		if (!form.ivrCode?.trim()) {
			await Swal.fire({ icon: 'warning', text: 'IVR 코드를 입력해주세요.' });
			return;
		}
		if (!form.ivrName?.trim()) {
			await Swal.fire({ icon: 'warning', text: 'IVR명을 입력해주세요.' });
			return;
		}

		const action = isEdt ? '수정' : '등록';
		const ok = await Swal.fire({
			icon: 'question',
			title: `IVR ${action}`,
			text: `IVR를 ${action}하시겠습니까?`,
			showCancelButton: true,
			confirmButtonText: '예',
			cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;

		try {
			const res = await fnAjaxFetch({
				url: URL.IVR_UPDATE,
				method: 'POST',
				data: {
					mode: isEdt ? 'Edt' : 'Ins',
					insttCode: form.insttCode,
					ivrCode: form.ivrCode,
					ivrName: form.ivrName,
					ivrUseyn: form.ivrUseyn,
					ivrMentUseyn: form.ivrMentUseyn,
					ivrMent: form.ivrMent,
					notiSday: form.notiSday.replace(/-/g, ""),
					notiEday: form.notiEday.replace(/-/g, ""),
					workStime: form.workStime,
					workEtime: form.workEtime,
					ivrMeno: form.ivrMeno,
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || `${action}되었습니다` });
				onSuccess();
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || `${action}에 실패했습니다` });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '오류가 발생했습니다' });
		}
	}, [form, isEdt, onSuccess]);

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom">
			<div className="modal-custom">
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 600, maxWidth: '90%', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">IVR {isEdt ? '수정' : '등록'}</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div className="row input-box-wrap">

									{/* 기관 */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="insttCode" className="form-label">기관</label>
											<select
												id="insttCode"
												name="insttCode"
												className="form-select"
												value={form.insttCode}
												onChange={updateForm}
											>
												<option value="">선택</option>
												{insttOptions.map(o => (
													<option key={o.code} value={o.code}>{o.codeNm}</option>
												))}
											</select>
										</div>
									</div>

									{/* IVR 코드 */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="ivrCode" className="form-label">
												IVR 코드 <span className="text-danger">*</span>
											</label>
											<input
												id="ivrCode"
												name="ivrCode"
												type="text"
												className="form-control"
												placeholder="IVR 코드를 입력해주세요"
												value={form.ivrCode}
												onChange={updateForm}
												readOnly={isEdt}
											/>
										</div>
									</div>

									{/* IVR명 */}
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="ivrName" className="form-label">
												IVR명 <span className="text-danger">*</span>
											</label>
											<input
												id="ivrName"
												name="ivrName"
												type="text"
												className="form-control"
												placeholder="IVR명을 입력해주세요"
												value={form.ivrName}
												onChange={updateForm}
											/>
										</div>
									</div>

									{/* 사용여부 */}
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">사용여부</label>
											<div style={{ paddingTop: 4 }}>
												<IosSwitch value={form.ivrUseyn} name="ivrUseyn" onChange={updateSwitch} onText="사용" offText="미사용" />
											</div>
										</div>
									</div>

									{/* 멘트사용여부 */}
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">멘트사용여부</label>
											<div style={{ paddingTop: 4 }}>
												<IosSwitch value={form.ivrMentUseyn} name="ivrMentUseyn" onChange={updateSwitch} onText="사용" offText="미사용" />
											</div>
										</div>
									</div>

									{/* 멘트 사용 시 멘트 관련 필드 */}
									{form.ivrMentUseyn === 'Y' && (
										<>
											<div className="col-6">
												<div className="input-box">
													<label htmlFor="notiSday" className="form-label">멘트시작일</label>
													<input id="notiSday" name="notiSday" type="date" className="form-control" value={form.notiSday} onChange={updateForm} />
												</div>
											</div>
											<div className="col-6">
												<div className="input-box">
													<label htmlFor="notiEday" className="form-label">멘트종료일</label>
													<input id="notiEday" name="notiEday" type="date" className="form-control" value={form.notiEday} onChange={updateForm} />
												</div>
											</div>
											<div className="col-12">
												<div className="input-box">
													<label htmlFor="ivrMent" className="form-label">멘트 내용</label>
													<textarea id="ivrMent" name="ivrMent" className="form-control" rows={4} placeholder="멘트 내용을 입력해주세요" value={form.ivrMent} onChange={updateForm} />
												</div>
											</div>
										</>
									)}

									{/* 업무 시작/종료 시간 */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="workStime" className="form-label">업무 시작시간</label>
											<input id="workStime" name="workStime" type="time" className="form-control" value={form.workStime} onChange={updateForm} />
										</div>
									</div>
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="workEtime" className="form-label">업무 종료시간</label>
											<input id="workEtime" name="workEtime" type="time" className="form-control" value={form.workEtime} onChange={updateForm} />
										</div>
									</div>

									{/* 비고 */}
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="ivrMeno" className="form-label">비고</label>
											<input
												id="ivrMeno"
												name="ivrMeno"
												type="text"
												className="form-control"
												placeholder="비고를 입력해주세요"
												value={form.ivrMeno}
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
								<button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>저장</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IvrFormModal;
