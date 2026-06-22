import React, { useState, useCallback } from 'react';
import IosSwitch from '@/components/Common/IosSwitch.jsx';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import URL from '@/constants/URL.jsx';

const buildForm = (isEdt, rowData) => {
	const mode = isEdt ? 'Edt' : 'Ins';
	if (!isEdt || !rowData) {
		return { mode, insttCode: '', ivrCode: '', ivrName: '', ivrUseyn: 'Y', ivrMentUseyn: 'N', ivrMent: '', notiSday: '', notiEday: '', workStime: '', workEtime: '', ivrMeno: '' };
	}
	return {
		mode,
		insttCode:    rowData.insttCode    || '',
		ivrCode:      rowData.ivrCode      || '',
		ivrName:      rowData.ivrName      || '',
		ivrUseyn:     rowData.ivrUseyn     || 'Y',
		ivrMentUseyn: rowData.ivrMentUseyn || 'N',
		ivrMent:      rowData.ivrMent      || '',
		notiSday:     rowData.notiSday     || '',
		notiEday:     rowData.notiEday     || '',
		workStime:    rowData.workStime    || '',
		workEtime:    rowData.workEtime    || '',
		ivrMeno:      rowData.ivrMeno      || '',
	};
};

const CHECK_FIELDS = [
	{ inputId: 'ivrCode', label: 'IVR 코드', type: 'text' },
	{ inputId: 'ivrName', label: 'IVR명',    type: 'text' },
];

const SWITCH_CONFIGS = [
	{ label: '사용여부',     name: 'ivrUseyn',     onText: '사용', offText: '미사용' },
	{ label: '멘트사용여부', name: 'ivrMentUseyn', onText: '사용', offText: '미사용' },
];

const MENT_DATE_FIELDS = [
	{ label: '멘트시작일', id: 'notiSday' },
	{ label: '멘트종료일', id: 'notiEday' },
];

const WORK_TIME_FIELDS = [
	{ label: '업무 시작시간', id: 'workStime' },
	{ label: '업무 종료시간', id: 'workEtime' },
];

const IvrFormModal = ({ open, onClose, ivrCode, rowData, insttOptions = [], onSuccess }) => {
	const isEdt = ivrCode !== null && ivrCode !== undefined;

	const [form, setForm] = useState(() => buildForm(isEdt, rowData));

	const updateForm   = useCallback((e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); }, []);
	const updateSwitch = useCallback((payload) => { setForm(prev => ({ ...prev, ...payload })); }, []);

	const { handleSubmit } = useCommonSubmit({
		form,
		checkField:      CHECK_FIELDS,
		confirmMessage:  'IVR',
		URL:             URL.IVR_UPDATE,
		callback:        onSuccess,
	});

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
											<select id="insttCode" name="insttCode" className="form-select" value={form.insttCode} onChange={updateForm}>
												<option value="">선택</option>
												{insttOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
											</select>
										</div>
									</div>

									{/* IVR 코드 */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="ivrCode" className="form-label">IVR 코드 <span className="text-danger">*</span></label>
											<input id="ivrCode" name="ivrCode" type="text" className="form-control"
												placeholder="IVR 코드를 입력해주세요" value={form.ivrCode} onChange={updateForm} readOnly={isEdt} />
										</div>
									</div>

									{/* IVR명 */}
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="ivrName" className="form-label">IVR명 <span className="text-danger">*</span></label>
											<input id="ivrName" name="ivrName" type="text" className="form-control"
												placeholder="IVR명을 입력해주세요" value={form.ivrName} onChange={updateForm} />
										</div>
									</div>

									{/* 사용여부 / 멘트사용여부 */}
									{SWITCH_CONFIGS.map(({ label, name, onText, offText }) => (
										<div key={name} className="col-6">
											<div className="input-box">
												<label className="form-label">{label}</label>
												<div style={{ paddingTop: 4 }}>
													<IosSwitch value={form[name]} name={name} onChange={updateSwitch} onText={onText} offText={offText} />
												</div>
											</div>
										</div>
									))}

									{/* 멘트 사용 시 — 날짜 + 멘트 내용 */}
									{form.ivrMentUseyn === 'Y' && (
										<>
											{MENT_DATE_FIELDS.map(({ label, id }) => (
												<div key={id} className="col-6">
													<div className="input-box">
														<label htmlFor={id} className="form-label">{label}</label>
														<input id={id} name={id} type="date" className="form-control" value={form[id]} onChange={updateForm} />
													</div>
												</div>
											))}
											<div className="col-12">
												<div className="input-box">
													<label htmlFor="ivrMent" className="form-label">멘트 내용</label>
													<textarea id="ivrMent" name="ivrMent" className="form-control" rows={4}
														placeholder="멘트 내용을 입력해주세요" value={form.ivrMent} onChange={updateForm} />
												</div>
											</div>
										</>
									)}

									{/* 업무 시작/종료 시간 */}
									{WORK_TIME_FIELDS.map(({ label, id }) => (
										<div key={id} className="col-6">
											<div className="input-box">
												<label htmlFor={id} className="form-label">{label}</label>
												<input id={id} name={id} type="time" className="form-control" value={form[id]} onChange={updateForm} />
											</div>
										</div>
									))}

									{/* 비고 */}
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="ivrMeno" className="form-label">비고</label>
											<input id="ivrMeno" name="ivrMeno" type="text" className="form-control"
												placeholder="비고를 입력해주세요" value={form.ivrMeno} onChange={updateForm} />
										</div>
									</div>

								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="modal-footer__left" />
							<div className="modal-footer__right">
								<button type="button" className="btn btn-action__lightblue" onClick={onClose}>취소</button>
								<button type="button" className="btn btn-primary btn-action__blue" onClick={handleSubmit}>저장</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IvrFormModal;
