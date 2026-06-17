import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const IvrHolyModal = ({ open, onClose, ivrCode }) => {
	const [holyDay, setHolyDay] = useState('');
	const [holyRows, setHolyRows] = useState([]);
	const [pageIndex, setPageIndex] = useState(1);
	const [pagination, setPagination] = useState(null);

	// 이벤트 핸들러(등록·삭제·페이지 이동 후 재조회)용 함수
	const loadList = useCallback(async (page = 1) => {
		if (!ivrCode) return;
		try {
			const res = await fnAjaxFetch({
				url: URL.IVR_HOLY_LIST,
				method: 'POST',
				data: { pageIndex: String(page), ivrCode },
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS') {
				setHolyRows(json.resultList || []);
				setPagination(json.paginationInfo || null);
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [ivrCode]);

	// 모달 오픈 시 최초 조회 — fnAjaxFetch 직접 호출로 setState-in-effect 진단 방지
	useEffect(() => {
		if (!open || !ivrCode) return;
		fnAjaxFetch({
			url: URL.IVR_HOLY_LIST,
			method: 'POST',
			data: { pageIndex: '1', ivrCode },
			withCredentials: true,
		}).then(res => {
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS') {
				setHolyRows(json.resultList || []);
				setPagination(json.paginationInfo || null);
			}
		}).catch(() => {});
	}, [open, ivrCode]);

	const handleAdd = useCallback(async () => {
		if (!holyDay) {
			await Swal.fire({ icon: 'warning', text: '날짜를 선택해주세요' });
			return;
		}
		try {
			const res = await fnAjaxFetch({
				url: URL.IVR_HOLY_UPDATE,
				method: 'POST',
				data: {
					mode: 'Ins',
					ivrCode,
					ivrHolyday: holyDay.replaceAll('-', ''),
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || '저장되었습니다' });
				setHolyDay('');
				loadList(pageIndex);
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || '저장에 실패했습니다' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [holyDay, ivrCode, pageIndex, loadList]);

	const handleDelete = useCallback(async (seq) => {
		const ok = await Swal.fire({
			icon: 'question',
			title: '확인',
			text: '삭제 하시겠습니까?',
			showCancelButton: true,
			confirmButtonText: '예',
			cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;
		try {
			const res = await fnAjaxFetch({
				url: `${URL.IVR_HOLY_DELETE}/${encodeURIComponent(seq)}.do`,
				method: 'DELETE',
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || '삭제되었습니다' });
				loadList(pageIndex);
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || '삭제에 실패했습니다' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [pageIndex, loadList]);

	const handlePageChange = useCallback((page) => {
		setPageIndex(page);
		loadList(page);
	}, [loadList]);

	const totalPages = pagination ? pagination.totalPageCount : 0;

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
			<div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 700, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">공휴일 등록 - {ivrCode}</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								{/* 날짜 입력 */}
								<div className="d-flex gap-2 align-items-center mb-3">
									<input
										type="date"
										className="form-control"
										style={{ maxWidth: 180 }}
										value={holyDay}
										onChange={e => setHolyDay(e.target.value)}
										onKeyDown={e => e.key === 'Enter' && handleAdd()}
									/>
									<button type="button" className="btn btn-primary btn-sm" onClick={handleAdd}>
										저장
									</button>
								</div>
								{/* 날짜 목록 */}
								<div style={{ overflowX: 'auto' }}>
									<table
										className="content-table__sub"
										style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
									>
										<thead>
											<tr>
												<th>날짜</th>
												<th style={{ width: 70 }}>삭제</th>
												<th>날짜</th>
												<th style={{ width: 70 }}>삭제</th>
											</tr>
										</thead>
										<tbody>
											{holyRows.length === 0 ? (
												<tr>
													<td colSpan={4} className="text-center text-muted py-3">
														등록된 공휴일이 없습니다
													</td>
												</tr>
											) : (
												Array.from({ length: Math.ceil(holyRows.length / 2) }, (_, i) => {
													const left = holyRows[i * 2];
													const right = holyRows[i * 2 + 1];
													return (
														<tr key={left?.ivrHolydaySeq}>
															<td className="text-center">{left?.ivrHolyday}</td>
															<td className="text-center">
																<button
																	type="button"
																	className="btn btn-sm btn-danger"
																	onClick={() => handleDelete(left?.ivrHolydaySeq)}
																>삭제</button>
															</td>
															<td className="text-center">{right?.ivrHolyday || ''}</td>
															<td className="text-center">
																{right && (
																	<button
																		type="button"
																		className="btn btn-sm btn-danger"
																		onClick={() => handleDelete(right?.ivrHolydaySeq)}
																	>삭제</button>
																)}
															</td>
														</tr>
													);
												})
											)}
										</tbody>
									</table>
								</div>
								{/* 페이지 이동 */}
								{totalPages > 1 && (
									<div className="d-flex justify-content-center gap-1 mt-2">
										<button
											className="btn btn-sm btn-outline-secondary"
											disabled={pageIndex <= 1}
											onClick={() => handlePageChange(pageIndex - 1)}
										>이전</button>
										{Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
											<button
												key={p}
												className={`btn btn-sm ${p === pageIndex ? 'btn-primary' : 'btn-outline-secondary'}`}
												onClick={() => handlePageChange(p)}
											>{p}</button>
										))}
										<button
											className="btn btn-sm btn-outline-secondary"
											disabled={pageIndex >= totalPages}
											onClick={() => handlePageChange(pageIndex + 1)}
										>다음</button>
									</div>
								)}
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

export default IvrHolyModal;
