import React, { useState, useCallback, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const fmtDate = (str) => {
	if (!str || str.length !== 8) return str || '';
	return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}`;
};

const IvrHolyModal = ({ open, onClose, ivrCode }) => {
	const [holyDay, setHolyDay] = useState('');
	const [holyRows, setHolyRows] = useState([]);
	const [pageIndex, setPageIndex] = useState(1);
	const [pagination, setPagination] = useState(null);
	const [checkedSeqs, setCheckedSeqs] = useState(new Set());
	const excelInputRef = useRef(null);

	const applyResult = useCallback((json) => {
		setHolyRows(json.result?.resultList || []);
		setPagination(json.result?.paginationInfo || null);
		setCheckedSeqs(new Set());
	}, []);

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
			if (json?.resultCodeInfo === 'SUCCESS') applyResult(json);
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [ivrCode, applyResult]);

	useEffect(() => {
		if (!open || !ivrCode) return;
		fnAjaxFetch({
			url: URL.IVR_HOLY_LIST,
			method: 'POST',
			data: { pageIndex: '1', ivrCode },
			withCredentials: true,
		}).then(res => {
			const json = res?.data;
			if (json?.resultCodeInfo === 'SUCCESS') applyResult(json);
		}).catch(() => {});
	}, [open, ivrCode, applyResult]);

	const handleAdd = useCallback(async () => {
		if (!holyDay) {
			await Swal.fire({ icon: 'warning', text: '날짜를 선택해주세요' });
			return;
		}
		try {
			const res = await fnAjaxFetch({
				url: URL.IVR_HOLY_UPDATE,
				method: 'POST',
				data: { mode: 'Ins', ivrCode, ivrHolyday: holyDay.replaceAll('-', '') },
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.resultMessage || '저장되었습니다' });
				setHolyDay('');
				loadList(pageIndex);
			} else {
				await Swal.fire({ icon: 'error', text: json?.resultMessage || '저장에 실패했습니다' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [holyDay, ivrCode, pageIndex, loadList]);

	// 단건 삭제 (행 삭제 버튼 제거, 체크박스 삭제로 통합)
	const deleteBySeqs = useCallback(async (seqs) => {
		if (!seqs.length) return;
		const ok = await Swal.fire({
			icon: 'question',
			title: '확인',
			text: `선택한 ${seqs.length}건을 삭제하시겠습니까?`,
			showCancelButton: true,
			confirmButtonText: '예',
			cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;
		try {
			for (const seq of seqs) {
				await fnAjaxFetch({
					url: `${URL.IVR_HOLY_DELETE}/${encodeURIComponent(seq)}.do`,
					method: 'DELETE',
					withCredentials: true,
				});
			}
			await Swal.fire({ icon: 'success', text: '삭제되었습니다' });
			loadList(pageIndex);
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '오류가 발생했습니다' });
		}
	}, [pageIndex, loadList]);

	const handleDeleteChecked = useCallback(() => {
		if (checkedSeqs.size === 0) {
			Swal.fire({ icon: 'warning', text: '삭제할 항목을 선택해주세요' });
			return;
		}
		deleteBySeqs([...checkedSeqs]);
	}, [checkedSeqs, deleteBySeqs]);

	const handlePageChange = useCallback((page) => {
		setPageIndex(page);
		loadList(page);
	}, [loadList]);

	// 전체 선택
	const allChecked = holyRows.length > 0 && holyRows.every(r => checkedSeqs.has(r.ivrHolydaySeq));
	const handleCheckAll = useCallback((checked) => {
		setCheckedSeqs(checked ? new Set(holyRows.map(r => r.ivrHolydaySeq)) : new Set());
	}, [holyRows]);
	const handleCheckOne = useCallback((seq, checked) => {
		setCheckedSeqs(prev => {
			const next = new Set(prev);
			if (checked) next.add(seq);
			else next.delete(seq);
			return next;
		});
	}, []);

	// 엑셀 업로드
	const handleExcelChange = useCallback(async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		e.target.value = '';
		try {
			const buf = await file.arrayBuffer();
			const wb = XLSX.read(buf, { type: 'array' });
			const ws = wb.Sheets[wb.SheetNames[0]];
			const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

			// 날짜 컬럼 탐색: '날짜', 'ivrHolyday', '공휴일' 순
			const dateKey = rows.length > 0
				? Object.keys(rows[0]).find(k => ['날짜', 'ivrHolyday', '공휴일'].includes(k)) || Object.keys(rows[0])[0]
				: null;

			if (!dateKey) {
				await Swal.fire({ icon: 'error', text: '날짜 컬럼을 찾을 수 없습니다' });
				return;
			}

			const holyUpload = rows
				.map(r => {
					let val = String(r[dateKey] || '').trim().replaceAll('-', '').replaceAll('/', '');
					// 엑셀 시리얼 날짜 처리
					if (/^\d{5}$/.test(val)) {
						const d = XLSX.SSF.parse_date_code(Number(val));
						val = `${d.y}${String(d.m).padStart(2, '0')}${String(d.d).padStart(2, '0')}`;
					}
					return val.length === 8 ? { mode: 'Ins', ivrCode, ivrHolyday: val } : null;
				})
				.filter(Boolean);

			if (!holyUpload.length) {
				await Swal.fire({ icon: 'warning', text: '유효한 날짜 데이터가 없습니다' });
				return;
			}

			const res = await fnAjaxFetch({
				url: URL.IVR_HOLY_EXCEL_UPLOAD,
				method: 'POST',
				data: { holyUpload },
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: `${holyUpload.length}건 업로드 완료` });
				loadList(1);
			} else {
				await Swal.fire({ icon: 'error', text: json?.resultMessage || '업로드에 실패했습니다' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '파일 처리 중 오류가 발생했습니다' });
		}
	}, [ivrCode, loadList]);

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
								{/* 상단 버튼 영역 */}
								<div className="d-flex gap-2 align-items-center mb-3 flex-wrap">
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
									<div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
										<input
											type="file"
											ref={excelInputRef}
											accept=".xlsx,.xls,.csv"
											style={{ display: 'none' }}
											onChange={handleExcelChange}
										/>
										<button
											type="button"
											className="btn btn-success btn-sm"
											onClick={() => excelInputRef.current?.click()}
										>
											엑셀 업로드
										</button>
										<button
											type="button"
											className="btn btn-danger btn-sm"
											onClick={handleDeleteChecked}
										>
											선택 삭제
										</button>
									</div>
								</div>
								{/* 날짜 목록 */}
								<div style={{ overflowX: 'auto' }}>
									<table
										className="content-table__sub"
										style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
									>
										<thead>
											<tr>
												<th style={{ width: 40, textAlign: 'center' }}>
													<input
														type="checkbox"
														checked={allChecked}
														onChange={e => handleCheckAll(e.target.checked)}
													/>
												</th>
												<th style={{ textAlign: 'center' }}>날짜</th>
												<th style={{ width: 40, textAlign: 'center' }}>
													<span style={{ visibility: 'hidden' }}>☐</span>
												</th>
												<th style={{ textAlign: 'center' }}>날짜</th>
											</tr>
										</thead>
										<tbody>
											{holyRows.length === 0 ? (
												<tr>
													<td colSpan={4} style={{ textAlign: 'center', padding: '12px 0', color: '#666' }}>
														등록된 공휴일이 없습니다
													</td>
												</tr>
											) : (
												Array.from({ length: Math.ceil(holyRows.length / 2) }, (_, i) => {
													const left = holyRows[i * 2];
													const right = holyRows[i * 2 + 1];
													return (
														<tr key={left?.ivrHolydaySeq}>
															<td style={{ textAlign: 'center' }}>
																<input
																	type="checkbox"
																	checked={checkedSeqs.has(left?.ivrHolydaySeq)}
																	onChange={e => handleCheckOne(left?.ivrHolydaySeq, e.target.checked)}
																/>
															</td>
															<td style={{ textAlign: 'center', color: 'inherit' }}>
																{fmtDate(left?.ivrHolyday)}
															</td>
															<td style={{ textAlign: 'center' }}>
																{right && (
																	<input
																		type="checkbox"
																		checked={checkedSeqs.has(right?.ivrHolydaySeq)}
																		onChange={e => handleCheckOne(right?.ivrHolydaySeq, e.target.checked)}
																	/>
																)}
															</td>
															<td style={{ textAlign: 'center', color: 'inherit' }}>
																{fmtDate(right?.ivrHolyday)}
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
