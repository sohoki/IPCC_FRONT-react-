import React, { useState, useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const PbxStationPbxSearchModal = ({ open, onClose, onSuccess }) => {
	const [txtExt, setTxtExt]     = useState('');
	const [txtCount, setTxtCount] = useState('');
	const [rows, setRows]         = useState([]);
	const [checkedIds, setCheckedIds] = useState(new Set());

	const handleSearch = useCallback(async () => {
		try {
			const res = await fnAjaxFetch({
				url: URL.STATION_PBX_SEARCH,
				method: 'POST',
				data: {
					notiSeq: '101',
					status: 'list',
					objectName: '',
					qualifier: `ext ${txtExt} count ${txtCount}`,
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS') {
				const stations = json?.result?.resultData?.station || [];
				setRows(stations);
				setCheckedIds(new Set());
			} else {
				await Swal.fire({ icon: 'warning', title: '조회', text: json?.MESSAGE || '조회에 실패했습니다.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [txtExt, txtCount]);

	const handleSearchKeyDown = (e) => {
		if (e.key === 'Enter') handleSearch();
	};

	const toggleAll = useCallback((checked) => {
		if (checked) setCheckedIds(new Set(rows.map(r => r.extension)));
		else setCheckedIds(new Set());
	}, [rows]);

	const toggleOne = useCallback((extension, checked) => {
		setCheckedIds(prev => {
			const next = new Set(prev);
			if (checked) next.add(extension);
			else next.delete(extension);
			return next;
		});
	}, []);

	const handleSave = useCallback(async () => {
		if (checkedIds.size === 0) {
			await Swal.fire({ icon: 'warning', text: '내선번호를 선택해 주세요.' });
			return;
		}
		const ok = await Swal.fire({
			icon: 'question',
			title: '상담사 내선번호',
			text: '등록 하시겠습니까?',
			showCancelButton: true,
			confirmButtonText: '예',
			cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;

		try {
			const res = await fnAjaxFetch({
				url: URL.STATION_LIST_UPDATE,
				method: 'POST',
				data: { extensionlist: [...checkedIds].join(',') },
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', title: '등록', text: json?.MESSAGE || '등록되었습니다.' });
				onSuccess();
			} else {
				await Swal.fire({ icon: 'error', title: '오류', text: json?.MESSAGE || '등록에 실패했습니다.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [checkedIds, onSuccess]);

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
			<div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: '80vw', maxWidth: '80vw', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">내선번호 현황</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div className="d-flex gap-2 align-items-center mb-3">
									<input
										type="text"
										className="form-control form-control-sm"
										style={{ width: 120 }}
										placeholder="시작 번호"
										value={txtExt}
										onChange={e => setTxtExt(e.target.value)}
										onKeyDown={handleSearchKeyDown}
									/>
									<span>부터</span>
									<input
										type="text"
										className="form-control form-control-sm"
										style={{ width: 120 }}
										placeholder="개수"
										value={txtCount}
										onChange={e => setTxtCount(e.target.value)}
										onKeyDown={handleSearchKeyDown}
									/>
									<span>까지</span>
									<button type="button" className="btn btn-sm btn-primary" onClick={handleSearch}>
										검색
									</button>
								</div>
								<div style={{ overflowX: 'auto' }}>
									<table
										className="content-table__sub"
										style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}
									>
										<thead>
											<tr>
												<th style={{ width: 50 }}>
													<input
														type="checkbox"
														checked={rows.length > 0 && checkedIds.size === rows.length}
														onChange={e => toggleAll(e.target.checked)}
													/>
												</th>
												<th>내선번호</th>
												<th>TYPE</th>
												<th>COR</th>
												<th>COS</th>
												<th>NAME</th>
											</tr>
										</thead>
										<tbody>
											{rows.length === 0 ? (
												<tr>
													<td colSpan={6} className="text-center text-muted py-3">
														검색 조건을 입력하고 검색 버튼을 클릭하세요.
													</td>
												</tr>
											) : rows.map((row, idx) => (
												<tr key={row.extension ?? idx}>
													<td>
														<input
															type="checkbox"
															checked={checkedIds.has(row.extension)}
															onChange={e => toggleOne(row.extension, e.target.checked)}
														/>
													</td>
													<td>{row.extension}</td>
													<td>{row.type}</td>
													<td>{row.cor}</td>
													<td>{row.cos}</td>
													<td>{row.name}</td>
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
								<button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>등록</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PbxStationPbxSearchModal;
