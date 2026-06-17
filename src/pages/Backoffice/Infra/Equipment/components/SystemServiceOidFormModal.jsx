import React, { useState, useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';

const EMPTY_FORM = { oidNumber: '', oidName: '', oidResultType: '' };

const buildForm = (isEdt, oidData) => {
	if (!isEdt || !oidData) return { ...EMPTY_FORM };
	return {
		oidNumber: oidData.oidNumber || '',
		oidName: oidData.oidName || '',
		oidResultType: oidData.oidResultType || '',
	};
};

/**
 * Props:
 *   open, onClose
 *   serviceSeq   — 부모 서비스
 *   oidSeq       — null = 신규, string = 수정
 *   oidData      — 수정 시 row 데이터
 *   onSuccess(serviceSeq) — 저장/삭제 후 호출
 */
const SystemServiceOidFormModal = ({ open, onClose, serviceSeq, oidSeq, oidData, onSuccess }) => {
	const isEdt = oidSeq !== null && oidSeq !== undefined;
	// 부모가 key를 변경해 리마운트하므로 lazy initializer로 최초 1회 초기화
	const [form, setForm] = useState(() => buildForm(isEdt, oidData));
	const { options: oidResultTypeOptions } = useCommonCodeData('SNMP_VALUE_GUBUN');

	const updateForm = useCallback((e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	}, []);

	const handleSave = useCallback(async () => {
		if (!form.oidNumber) { await Swal.fire({ icon: 'warning', text: 'OID를 입력해 주세요.' }); return; }
		if (!form.oidName)   { await Swal.fire({ icon: 'warning', text: 'OID 명을 입력해 주세요.' }); return; }

		const action = isEdt ? '수정' : '등록';
		const ok = await Swal.fire({
			icon: 'question', title: `OID ${action}`,
			text: `${action} 하시겠습니까?`,
			showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;

		try {
			const res = await fnAjaxFetch({
				url: URL.SERVICE_OID_UPDATE,
				method: 'POST',
				data: {
					mode: isEdt ? 'Edt' : 'Ins',
					oidSeq: oidSeq || '',
					serviceSeq,
					oidNumber: form.oidNumber,
					oidName: form.oidName,
					oidResultType: form.oidResultType,
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}되었습니다.` });
				onSuccess(serviceSeq);
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || '처리 중 문제가 발생했습니다.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [form, serviceSeq, oidSeq, isEdt, onSuccess]);

	const handleDelete = useCallback(async () => {
		const ok = await Swal.fire({
			icon: 'question', title: 'OID 삭제',
			html: `<b>${oidSeq}</b> 를(을) 삭제 하시겠습니까?`,
			showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;

		try {
			const res = await fnAjaxFetch({
				url: `${URL.SERVICE_OID}/${encodeURIComponent(oidSeq)}.do`,
				method: 'DELETE',
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다.' });
				onSuccess(serviceSeq);
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [oidSeq, serviceSeq, onSuccess]);

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom" style={{ zIndex: 1060 }}>
			<div className="modal-custom" style={{ zIndex: 1061, marginLeft: 0 }}>
				<div className="modal-dialog modal-dialog-centered" style={{ width: 520, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">OID {isEdt ? '수정' : '등록'}</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div className="row input-box-wrap">
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="oidNumber" className="form-label">
												OID <span className="text-danger">*</span>
											</label>
											<input
												id="oidNumber" name="oidNumber"
												type="text" className="form-control"
												placeholder="OID를 입력해주세요."
												value={form.oidNumber}
												onChange={updateForm}
											/>
										</div>
									</div>
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="oidName" className="form-label">
												세부코드명 <span className="text-danger">*</span>
											</label>
											<input
												id="oidName" name="oidName"
												type="text" className="form-control"
												placeholder="OID 명을 입력해주세요."
												value={form.oidName}
												onChange={updateForm}
											/>
										</div>
									</div>
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="oidResultType" className="form-label">결과형태</label>
											<select
												id="oidResultType" name="oidResultType"
												className="form-select"
												value={form.oidResultType}
												onChange={updateForm}
											>
												<option value="">선택</option>
												{oidResultTypeOptions.map(o => (
													<option key={o.code} value={o.code}>{o.codeNm}</option>
												))}
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="modal-footer__left">
								{isEdt && (
									<button type="button" className="btn btn-danger" onClick={handleDelete}>삭제</button>
								)}
							</div>
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

export default SystemServiceOidFormModal;
