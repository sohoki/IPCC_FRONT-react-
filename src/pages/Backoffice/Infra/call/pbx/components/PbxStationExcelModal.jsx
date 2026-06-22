import React, { useState, useCallback, useRef } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const PbxStationExcelModal = ({ open, onClose, onSuccess }) => {
	const [basicNumber, setBasicNumber]   = useState('');
	const [parsedExtensions, setParsedExtensions] = useState([]);
	const fileInputRef = useRef(null);

	const handleFileChange = useCallback(async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		try {
			const XLSX = window.XLSX || (await import('xlsx'));
			const reader = new FileReader();
			reader.onload = (evt) => {
				const wb = XLSX.read(evt.target.result, { type: 'binary' });
				const sheet = wb.Sheets[wb.SheetNames[0]];
				const json = XLSX.utils.sheet_to_json(sheet);
				const extensions = json
					.map(row => ({ extension: row['Extension'] }))
					.filter(a => a.extension);
				setParsedExtensions(extensions);
			};
			reader.readAsBinaryString(file);
		} catch {
			await Swal.fire({ icon: 'error', text: 'Excel 파일 파싱에 실패했습니다. xlsx 라이브러리가 필요합니다.' });
		}
	}, []);

	const handleSave = useCallback(async () => {
		if (!basicNumber.trim()) {
			await Swal.fire({ icon: 'warning', text: '복사할 내선번호를 입력해 주세요.' });
			return;
		}
		if (parsedExtensions.length === 0) {
			await Swal.fire({ icon: 'warning', text: 'Excel 파일을 먼저 업로드해 주세요.' });
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
				url: URL.STATION_EXCEL_UPDATE,
				method: 'POST',
				data: {
					basicNumber: basicNumber.trim(),
					copyNumber: parsedExtensions,
				},
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
	}, [basicNumber, parsedExtensions, onSuccess]);

	const handleClose = useCallback(() => {
		setBasicNumber('');
		setParsedExtensions([]);
		if (fileInputRef.current) fileInputRef.current.value = '';
		onClose();
	}, [onClose]);

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom">
			<div className="modal-custom">
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 520, maxWidth: '90%', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">엑셀 업로드</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={handleClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div className="row input-box-wrap">
									<div className="col-12">
										<div className="input-box">
											<label className="form-label">엑셀 업로드 파일</label>
											<input
												ref={fileInputRef}
												type="file"
												className="form-control"
												accept=".xlsx,.xls,.csv"
												onChange={handleFileChange}
											/>
											{parsedExtensions.length > 0 && (
												<div className="mt-1 text-muted small">
													{parsedExtensions.length}개 내선번호 파싱 완료
												</div>
											)}
										</div>
									</div>
									<div className="col-12">
										<div className="input-box">
											<label className="form-label">복사할 내선번호</label>
											<input
												type="text"
												className="form-control"
												placeholder="복사할 내선번호를 입력하세요"
												value={basicNumber}
												onChange={e => setBasicNumber(e.target.value)}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="modal-footer__left" />
							<div className="modal-footer__right">
								<button type="button" className="btn btn-action__lightblue" onClick={handleClose}>취소</button>
								<button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>업로드</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PbxStationExcelModal;
