import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import IosSwitch from '@/components/Common/IosSwitch.jsx';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const EMPTY_ADD = { recTelNm: '', recTelNumber: '', recTelUseyn: 'Y' };

const formatPhone = (value) => {
	const digits = value.replace(/\D/g, '');
	if (digits.startsWith('02')) {
		if (digits.length <= 2)  return digits;
		if (digits.length <= 5)  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
		if (digits.length <= 9)  return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
		return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
	}
	if (digits.length <= 3)  return digits;
	if (digits.length <= 6)  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
	if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
	return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

const isValidPhone = (phone) => /^[0-9]{9,11}$/.test(phone.replace(/-/g, ''));

const AlertRecModal = ({ open, onClose, alertSeq }) => {
	const [rows, setRows]     = useState([]);
	const [addRow, setAddRow] = useState(EMPTY_ADD);

	const loadList = useCallback(async () => {
		if (!alertSeq) return;
		try {
			const res = await fnAjaxFetch({
				url: URL.ALERT_REC_LIST,
				method: 'POST',
				data: { pageIndex: '1', pageUnit: '100', alertSeq },
				withCredentials: true,
			});
			const json = res?.data;
			setRows(json?.resultList || json?.result?.resultList || []);
		} catch { setRows([]); }
	}, [alertSeq]);

	useEffect(() => {
		if (!open || !alertSeq) return;
		fnAjaxFetch({
			url: URL.ALERT_REC_LIST,
			method: 'POST',
			data: { pageIndex: '1', pageUnit: '100', alertSeq },
			withCredentials: true,
		}).then(res => {
			const json = res?.data;
			setRows(json?.resultList || json?.result?.resultList || []);
		}).catch(() => setRows([]));
		return () => setAddRow(EMPTY_ADD);
	}, [open, alertSeq]);

	const handleAdd = useCallback(async () => {
		if (!addRow.recTelNm.trim()) {
			await Swal.fire({ icon: 'warning', text: '담당자명을 입력해 주세요.' });
			return;
		}
		if (!addRow.recTelNumber) {
			await Swal.fire({ icon: 'warning', text: '연락처를 입력해 주세요.' });
			return;
		}
		if (!isValidPhone(addRow.recTelNumber)) {
			await Swal.fire({ icon: 'warning', text: '올바른 전화번호 형식을 입력해 주세요.\n예) 02-1234-5678, 010-1234-5678' });
			return;
		}
		try {
			const res = await fnAjaxFetch({
				url: URL.ALERT_REC_UPDATE,
				method: 'POST',
				data: {
					mode: 'Ins',
					alertSeq,
					recTelNm:     addRow.recTelNm.trim(),
					recTelNumber: addRow.recTelNumber.replace(/-/g, ''),
					recTelUseyn:  addRow.recTelUseyn,
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.resultMessage || json?.MESSAGE || '등록되었습니다.' });
				setAddRow(EMPTY_ADD);
				loadList();
			} else {
				await Swal.fire({ icon: 'warning', text: json?.resultMessage || json?.MESSAGE || '처리 도중 문제가 발생했습니다.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [addRow, alertSeq, loadList]);

	const { handleDelete } = useCommonDelete({
		URL: URL.ALERT_REC,
		MESSAGE: '담당자',
		reloadFunction: loadList,
	});

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
			<div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
				<div className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 680, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">경고 담당자 리스트</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div style={{ overflowX: 'auto' }}>
									<table className="content-table__sub" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
										<thead>
											<tr>
												<th>담당자</th>
												<th>연락처</th>
												<th style={{ width: 110 }}>사용여부</th>
												<th style={{ width: 70 }}>등록/삭제</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													<input
														type="text" className="form-control form-control-sm"
														value={addRow.recTelNm}
														onChange={e => setAddRow(prev => ({ ...prev, recTelNm: e.target.value }))}
													/>
												</td>
												<td>
													<input
														type="text" className="form-control form-control-sm"
														placeholder="02-0000-0000"
														value={addRow.recTelNumber}
														onChange={e => setAddRow(prev => ({ ...prev, recTelNumber: formatPhone(e.target.value) }))}
														maxLength={13}
													/>
												</td>
												<td>
													<IosSwitch
														value={addRow.recTelUseyn}
														name="recTelUseyn"
														onChange={(payload) => setAddRow(prev => ({ ...prev, recTelUseyn: payload.recTelUseyn }))}
														onText="사용"
														offText="사용 안함"
													/>
												</td>
												<td>
													<button type="button" className="btn btn-sm btn-primary" onClick={handleAdd}>등록</button>
												</td>
											</tr>
											{rows.length === 0 ? (
												<tr>
													<td colSpan={4} className="text-center text-muted py-3">
														등록된 담당자가 없습니다.
													</td>
												</tr>
											) : rows.map(row => (
												<tr key={row.recPartSeq} style={{ color: '#fff' }}>
													<td>{row.recTelNm}</td>
													<td>{row.recTelNumber}</td>
													<td>{row.recTelUseyn}</td>
													<td>
														<button type="button" className="btn btn-sm btn-danger"
															onClick={() => handleDelete({ code: row.recPartSeq, name: row.recTelNm })}
														>삭제</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="modal-footer__left" />
							<div className="modal-footer__right">
								<button type="button" className="btn btn-action__lightblue" onClick={onClose}>닫기</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AlertRecModal;
