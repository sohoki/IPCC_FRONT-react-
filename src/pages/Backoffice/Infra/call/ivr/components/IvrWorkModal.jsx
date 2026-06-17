import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';

const EMPTY_ADD = { ivrTimeGubun: '', ivrStartTime: '', ivrEndTime: '' };

const IvrWorkModal = ({ open, onClose, ivrCode }) => {
	const [workRows, setWorkRows] = useState([]);
	const [addRow, setAddRow] = useState(EMPTY_ADD);

	const { options: timeGubunOptions } = useCommonCodeData('IVR_WEEKGUBUN');

	// 이벤트 핸들러(등록·삭제 후 재조회)용 함수
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
			if (json?.STATUS === 'SUCCESS') setWorkRows(json.resultList || []);
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [ivrCode]);

	// 모달 오픈 시 최초 조회 — fnAjaxFetch 직접 호출로 setState-in-effect 진단 방지
	useEffect(() => {
		if (!open || !ivrCode) return;
		fnAjaxFetch({
			url: URL.IVR_WORK_LIST,
			method: 'POST',
			data: { pageIndex: '1', ivrCode },
			withCredentials: true,
		}).then(res => {
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS') setWorkRows(json.resultList || []);
		}).catch(() => {});
	}, [open, ivrCode]);

	const handleAdd = useCallback(async () => {
		if (!addRow.ivrTimeGubun) {
			await Swal.fire({ icon: 'warning', text: '요일을 선택해주세요' });
			return;
		}
		if (!addRow.ivrStartTime) {
			await Swal.fire({ icon: 'warning', text: '시작시간을 입력해주세요' });
			return;
		}
		if (!addRow.ivrEndTime) {
			await Swal.fire({ icon: 'warning', text: '종료시간을 입력해주세요' });
			return;
		}
		try {
			const res = await fnAjaxFetch({
				url: URL.IVR_WORK_UPDATE,
				method: 'POST',
				data: {
					mode: 'Ins',
					ivrCode,
					ivrTimeGubun: addRow.ivrTimeGubun,
					ivrStartTime: addRow.ivrStartTime,
					ivrEndTime: addRow.ivrEndTime,
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || '저장되었습니다' });
				setAddRow(EMPTY_ADD);
				loadList();
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || '저장에 실패했습니다' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [addRow, ivrCode, loadList]);

	const handleDelete = useCallback(async (seq) => {
		try {
			const res = await fnAjaxFetch({
				url: `${URL.IVR_WORK_DELETE}/${encodeURIComponent(seq)}.do`,
				method: 'DELETE',
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다' });
				loadList();
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [loadList]);

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
														type="time"
														className="form-control form-control-sm"
														value={addRow.ivrStartTime}
														onChange={e => setAddRow(prev => ({ ...prev, ivrStartTime: e.target.value }))}
													/>
												</td>
												<td className="text-center">
													<input
														type="time"
														className="form-control form-control-sm"
														value={addRow.ivrEndTime}
														onChange={e => setAddRow(prev => ({ ...prev, ivrEndTime: e.target.value }))}
													/>
												</td>
												<td className="text-center">
													<button type="button" className="btn btn-sm btn-primary" onClick={handleAdd}>
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
										style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
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
													<td>{row.codeNm}</td>
													<td className="text-center">{row.ivrStartTime}</td>
													<td className="text-center">{row.ivrEndTime}</td>
													<td className="text-center">
														<button
															type="button"
															className="btn btn-sm btn-danger"
															onClick={() => handleDelete(row.ivrWorkSeq)}
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
