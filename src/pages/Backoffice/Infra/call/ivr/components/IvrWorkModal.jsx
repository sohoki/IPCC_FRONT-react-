import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import { useCommonSubmit } from '@/hooks/use-common-submit.js';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import URL from '@/constants/URL.jsx';

const EMPTY_ADD = { mode: 'Ins', ivrTimeGubun: '', ivrStartTime: '', ivrEndTime: '' };

const CHECK_FIELDS = [
	{ inputId: 'workTimeGubun', label: '요일',     type: 'select' },
	{ inputId: 'workStartTime', label: '시작시간', type: 'text' },
	{ inputId: 'workEndTime',   label: '종료시간', type: 'text' },
];

const IvrWorkModal = ({ open, onClose, ivrCode }) => {
	const [workRows, setWorkRows] = useState([]);
	const [addRow, setAddRow] = useState(EMPTY_ADD);

	const { options: timeGubunOptions } = useCommonCodeData('IVR_WEEKGUBUN');

	const loadList = useCallback(async () => {
		if (!ivrCode) return;
		try {
			const res = await fnAjaxFetch({
				url: URL.IVR_WORK_LIST,
				method: 'POST',
				data: { pageIndex: '1', ivrCode },
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.resultCodeInfo === 'SUCCESS') setWorkRows(json.result?.resultList || []);
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [ivrCode]);

	useEffect(() => {
		if (!open || !ivrCode) return;
		fnAjaxFetch({
			url: URL.IVR_WORK_LIST,
			method: 'POST',
			data: { pageIndex: '1', ivrCode },
			withCredentials: true,
		}).then(res => {
			const json = res?.data;
			if (json?.resultCodeInfo === 'SUCCESS') setWorkRows(json.result?.resultList || []);
		}).catch(() => {});
	}, [open, ivrCode]);

	// ivrCode를 form에 합산해서 submit 훅에 전달
	const submitForm = useMemo(() => ({ ...addRow, ivrCode }), [addRow, ivrCode]);

	const onSubmitSuccess = useCallback(() => {
		setAddRow(EMPTY_ADD);
		loadList();
	}, [loadList]);

	const { handleSubmit } = useCommonSubmit({
		form:           submitForm,
		checkField:     CHECK_FIELDS,
		confirmMessage: '근무시간',
		URL:            URL.IVR_WORK_UPDATE,
		callback:       onSubmitSuccess,
	});

	const { handleDelete } = useCommonDelete({
		URL:      URL.IVR_WORK_DELETE,
		MESSAGE:  '근무시간',
		callback: loadList,
	});

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
			<div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 680, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">근무시간 등록 - {ivrCode}</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								{/* 입력 행 */}
								<div style={{ overflowX: 'auto' }}>
									<table
										className="content-table__sub"
										style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
									>
										<thead>
											<tr>
												<th>요일</th>
												<th>시작시간</th>
												<th>종료시간</th>
												<th style={{ width: 70 }}>저장</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td>
													<select
														id="workTimeGubun"
														className="form-select form-select-sm"
														value={addRow.ivrTimeGubun}
														onChange={e => setAddRow(prev => ({ ...prev, ivrTimeGubun: e.target.value }))}
													>
														<option value="">선택</option>
														{timeGubunOptions.map(o => (
															<option key={o.code} value={o.code}>{o.codeNm}</option>
														))}
													</select>
												</td>
												<td className="text-center">
													<input
														id="workStartTime"
														type="time"
														className="form-control form-control-sm"
														value={addRow.ivrStartTime}
														onChange={e => setAddRow(prev => ({ ...prev, ivrStartTime: e.target.value }))}
													/>
												</td>
												<td className="text-center">
													<input
														id="workEndTime"
														type="time"
														className="form-control form-control-sm"
														value={addRow.ivrEndTime}
														onChange={e => setAddRow(prev => ({ ...prev, ivrEndTime: e.target.value }))}
													/>
												</td>
												<td className="text-center">
													<button type="button" className="btn btn-sm btn-primary" onClick={handleSubmit}>
														저장
													</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								{/* 목록 */}
								<div className="mt-2" style={{ overflowX: 'auto' }}>
									<table
										className="content-table__sub"
										style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', color: 'inherit' }}
									>
										<thead>
											<tr>
												<th>요일</th>
												<th>시작시간</th>
												<th>종료시간</th>
												<th style={{ width: 70 }}>삭제</th>
											</tr>
										</thead>
										<tbody>
											{workRows.length === 0 ? (
												<tr>
													<td colSpan={4} className="text-center text-muted py-3">
														등록된 근무시간이 없습니다
													</td>
												</tr>
											) : workRows.map(row => (
												<tr key={row.ivrWorkSeq}>
													<td style={{ color: 'inherit' }}>{row.codeNm}</td>
													<td className="text-center" style={{ color: 'inherit' }}>{row.ivrStartTime}</td>
													<td className="text-center" style={{ color: 'inherit' }}>{row.ivrEndTime}</td>
													<td className="text-center">
														<button
															type="button"
															className="btn btn-sm btn-danger"
															onClick={() => handleDelete({ code: row.ivrWorkSeq, name: row.codeNm })}
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

export default IvrWorkModal;
