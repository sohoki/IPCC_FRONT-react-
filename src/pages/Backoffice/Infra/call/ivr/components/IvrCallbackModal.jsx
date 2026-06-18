import React, { useState, useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import { useRadioGroup } from '@/hooks/use-form.jsx';

const RADIO_CONFIGS = [
	{ label: 'DARS 사용여부',     name: 'useDarsAt',     col: 'col-6', useSwitch: true, options: [{ value: 'Y', text: '사용' }, { value: 'N', text: '미사용' }] },
	{ label: 'callback 사용여부', name: 'useCallbackAt', col: 'col-6', useSwitch: true, options: [{ value: 'Y', text: '사용' }, { value: 'N', text: '미사용' }] },
];

const IvrCallbackModal = ({ open, onClose, ivrCode, ivrDars, ivrCbk, onSuccess }) => {


    
	const [form, setForm] = useState({
		useDarsAt: ivrDars === 'Y' ? 'Y' : 'N',
		useCallbackAt: ivrCbk === 'Y' ? 'Y' : 'N',
	});
    const { renderRadioGroup } = useRadioGroup(form, setForm);

	const handleSave = useCallback(async () => {
		const ok = await Swal.fire({
			icon: 'question',
			title: 'IVR 저장',
			text: '저장 하시겠습니까?',
			showCancelButton: true,
			confirmButtonText: '예',
			cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;

		try {
			const res = await fnAjaxFetch({
				url: URL.IVR_CALLBACK_UPDATE,
				method: 'POST',
				data: {
					mode: 'Edt',
					ivrCode,
					ivrDars: form.useDarsAt,
					ivrCbk: form.useCallbackAt,
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || '저장되었습니다' });
				onSuccess();
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || '저장에 실패했습니다' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '오류가 발생했습니다' });
		}
	}, [form, ivrCode, onSuccess]);

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom" style={{ zIndex: 1055 }}>
			<div className="modal-custom" style={{ zIndex: 1056, marginLeft: 0 }}>
				<div
					className="modal-dialog modal-dialog-centered"
					style={{ width: 560, maxWidth: '90%', marginLeft: 'auto', marginRight: 'auto', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">[{ivrCode}] DARS / Callback 설정 </h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div className="row input-box-wrap">
									{RADIO_CONFIGS.map(config => (
										<React.Fragment key={config.name}>
											{renderRadioGroup(config)}
										</React.Fragment>
									))}
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="modal-footer__left" />
							<div className="modal-footer__right">
								<button type="button" className="btn btn-action__lightblue" onClick={onClose}>닫기</button>
								<button type="button" className="btn btn-primary btn-action__blue" onClick={handleSave}>저장</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default IvrCallbackModal;
