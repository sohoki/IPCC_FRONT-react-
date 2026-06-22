import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Swal from '@/lib/swal.js';
import IosSwitch from '@/components/Common/IosSwitch.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData, useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';

const RING_OPTIONS = [
	{ value: '', label: '' },
	{ value: 'abbreviated-ring', label: 'abbreviated-ring' },
	{ value: 'delayed-ring',     label: 'delayed-ring' },
	{ value: 'no-ring',          label: 'no-ring' },
	{ value: 'ring',             label: 'ring' },
];

const EMPTY_BTN_ROW = { btnIndex: '1', d1: '', d2: '', d3: '', d4: '', d5: '', d6: '', d7: '' };

const EMPTY_FORM = {
	extension: '', idCheck: 'N',
	type: '', cor: '1', cos: '1',
	securityCode: '1234', name: '',
	displayLangage: '', ipSoftphone: 'y',
	location: '', tn: '1',
};

const TN_OPTIONS  = Array.from({ length: 10 }, (_, i) => String(i + 1));
const IDX_OPTIONS = Array.from({ length: 100 }, (_, i) => String(i + 1));

const PbxStationFormModal = ({ open, onClose, extension, onSuccess }) => {
	const isEdt = extension !== null && extension !== undefined;

	const [form, setForm]         = useState(EMPTY_FORM);
	const [buttons, setButtons]   = useState([]);
	const [addBtn, setAddBtn]     = useState(EMPTY_BTN_ROW);
	const [idSetupMode, setIdSetupMode] = useState(null); // null | 'auto' | 'manual'
	const [insttCode, setInsttCode] = useState('');

	const { options: pbxTypeOptions }     = useCommonCodeData('PBX_TYPE');
	const { options: pbxLangOptions }     = useCommonCodeData('PBX_LANAGE');
	const { options: pbxLocationOptions } = useCommonCodeData('PBX_LOCATION');
	const { options: pbxButtonOptions }   = useCommonCodeData('PBX_BUTTON');
	const { options: insttOptions }       = useCustomReqDataCombo({
		url: URL.INSTT_COMBO,
		method: 'POST',
		mapping: { id: 'insttCode', text: 'allInsttNm' },
	});

	useEffect(() => {
		if (!open) return;
		setButtons([]);
		setAddBtn(EMPTY_BTN_ROW);
		if (!isEdt) {
			setForm(EMPTY_FORM);
			setIdSetupMode(null);
			setInsttCode('');
			return;
		}
		setForm(prev => ({ ...prev, extension, idCheck: 'Y' }));
		setIdSetupMode(null);
	}, [open, extension, isEdt]);

	useEffect(() => {
		if (!open || !isEdt || !extension) return;
		let active = true;
		fnAjaxFetch({
			url: `${URL.STATION_INFO}/${encodeURIComponent(extension)}.do`,
			method: 'GET',
			withCredentials: true,
		}).then(res => {
			if (!active) return;
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				const d = json.result || {};
				setForm({
					extension:     d.extension     || extension,
					idCheck:       'Y',
					type:          d.type          || '',
					cor:           d.cor           || '1',
					cos:           d.cos           || '1',
					securityCode:  d.securityCode  || '',
					name:          d.name          || '',
					displayLangage: d.displayLangage || '',
					ipSoftphone:   d.ipSoftphone   || 'y',
					location:      d.location      || '',
					tn:            d.tn            || '1',
				});
				const rawBtns = d.stationButton || [];
				setButtons(rawBtns.map(b => ({
					btnIndex: String(b.index  || b.btnIndex || ''),
					d1: b.data1 || b.d1 || '',
					d2: b.data2 || b.d2 || '',
					d3: b.data3 || b.d3 || '',
					d4: b.data4 || b.d4 || '',
					d5: b.data5 || b.d5 || '',
					d6: b.data6 || b.d6 || '',
					d7: b.data7 || b.d7 || '',
				})));
			}
		}).catch(() => {});
		return () => { active = false; };
	}, [open, extension, isEdt]);

	const handleShowChoice = useCallback(async () => {
		const result = await Swal.fire({
			title: '번호설정',
			text: '번호 설정 방식을 선택하세요.',
			showConfirmButton: true,
			confirmButtonText: '자동생성',
			showDenyButton: true,
			denyButtonText: '중복확인',
			showCancelButton: true,
			cancelButtonText: '취소',
		});
		if (result.isConfirmed) setIdSetupMode('auto');
		else if (result.isDenied) setIdSetupMode('manual');
	}, []);

	const handleAutoGenerate = useCallback(async () => {
		if (!insttCode) {
			await Swal.fire({ icon: 'warning', text: '내선번호를 생성할 기관을 선택해 주세요.' });
			return;
		}
		try {
			const res = await fnAjaxFetch({
				url: `${URL.STATION_RANDOM}/${encodeURIComponent(insttCode)}.do`,
				method: 'GET',
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS') {
				setForm(prev => ({ ...prev, extension: String(json.result), idCheck: 'Y' }));
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || '자동 생성되었습니다.' });
			} else {
				setForm(prev => ({ ...prev, idCheck: 'N' }));
				await Swal.fire({ icon: 'error', text: '내선번호 생성이 초과되었습니다. 기관 메뉴에서 내선번호 범위 및 라이센스를 확인해 주세요.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [insttCode]);

	const handleManualCheck = useCallback(async () => {
		if (!form.extension) {
			await Swal.fire({ icon: 'warning', text: '내선번호를 입력해 주세요.' });
			return;
		}
		try {
			const res = await fnAjaxFetch({
				url: `${URL.STATION_CHECK}/${encodeURIComponent(form.extension)}.do`,
				method: 'GET',
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS') {
				setForm(prev => ({ ...prev, idCheck: 'Y' }));
				await Swal.fire({ icon: 'success', text: json?.MESSAGE || '사용 가능한 번호입니다.' });
			} else {
				setForm(prev => ({ ...prev, idCheck: 'N' }));
				await Swal.fire({ icon: 'warning', text: json?.MESSAGE || '이미 사용 중인 번호입니다.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [form.extension]);

	const handleBtnSave = useCallback(async () => {
		if (!addBtn.d1) {
			await Swal.fire({ icon: 'warning', text: 'Data1(버튼 타입)을 선택해 주세요.' });
			return;
		}
		setButtons(prev => {
			const exists = prev.findIndex(b => b.btnIndex === addBtn.btnIndex);
			if (exists >= 0) {
				const next = [...prev];
				next[exists] = { ...addBtn };
				return next;
			}
			return [...prev, { ...addBtn }].sort((a, b) => Number(a.btnIndex) - Number(b.btnIndex));
		});
		setAddBtn(EMPTY_BTN_ROW);
	}, [addBtn]);

	const handleBtnDelete = useCallback((btnIndex) => {
		setButtons(prev => prev.filter(b => b.btnIndex !== btnIndex));
	}, []);

	const handleBtnRowClick = useCallback((row) => {
		setAddBtn({ ...row });
	}, []);

	const handleSave = useCallback(async () => {
		if (!isEdt && form.idCheck !== 'Y') {
			await Swal.fire({ icon: 'warning', text: '중복체크가 안되었습니다.' });
			return;
		}
		if (!form.extension) {
			await Swal.fire({ icon: 'warning', text: '내선번호를 입력해 주세요.' });
			return;
		}
		if (!form.type) {
			await Swal.fire({ icon: 'warning', text: '전화기 Type을 선택해 주세요.' });
			return;
		}
		if (!form.cor) {
			await Swal.fire({ icon: 'warning', text: 'COR을 입력해 주세요.' });
			return;
		}
		if (!form.cos) {
			await Swal.fire({ icon: 'warning', text: 'COS를 입력해 주세요.' });
			return;
		}
		if (!form.displayLangage) {
			await Swal.fire({ icon: 'warning', text: '언어 타입을 선택해 주세요.' });
			return;
		}
		const action = isEdt ? '수정' : '등록';
		const ok = await Swal.fire({
			icon: 'question',
			title: `내선번호 ${action}`,
			text: `내선번호를 ${action} 하시겠습니까?`,
			showCancelButton: true,
			confirmButtonText: '예',
			cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;

		try {
			const res = await fnAjaxFetch({
				url: URL.STATION_UPDATE,
				method: 'POST',
				data: {
					mode:          isEdt ? 'Edt' : 'Ins',
					extension:     form.extension,
					type:          form.type,
					cor:           form.cor,
					cos:           form.cos,
					securityCode:  form.securityCode,
					name:          form.name,
					displayLangage: form.displayLangage,
					ipSoftphone:   form.ipSoftphone,
					tn:            form.tn,
					location:      form.location,
					stationButton: buttons.map(b => ({
						index: b.btnIndex,
						data1: b.d1, data2: b.d2, data3: b.d3, data4: b.d4,
						data5: b.d5, data6: b.d6, data7: b.d7,
					})),
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}되었습니다.` });
				onSuccess();
			} else {
				await Swal.fire({ icon: 'error', title: '오류', text: json?.MESSAGE || '처리 도중 문제가 발생하였습니다.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', title: '오류', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [form, buttons, isEdt, onSuccess]);

	const pbxButtonMap = useMemo(() => {
		const map = {};
		(pbxButtonOptions || []).forEach(o => { map[o.code] = o.codeNm; });
		return map;
	}, [pbxButtonOptions]);

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom">
			<div className="modal-custom">
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 1400, maxWidth: '98%', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">내선번호 {isEdt ? '수정' : '등록'}</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div className="row input-box-wrap">
									{/* 내선번호 */}
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">PBX 내선번호 <span className="text-danger">*</span></label>
											{isEdt ? (
												<input type="text" className="form-control" value={form.extension} readOnly />
											) : (
												<div className="input-group">
													<input
														type="text"
														className="form-control"
														placeholder="최대 8자리 숫자"
														maxLength={8}
														value={form.extension}
														readOnly={idSetupMode === 'auto' && form.idCheck === 'Y'}
														onChange={(e) => {
															const v = e.target.value.replace(/[^0-9]/g, '');
															setForm(prev => ({ ...prev, extension: v, idCheck: 'N' }));
														}}
													/>
													{idSetupMode === 'auto' && (
														<select
															className="form-select"
															style={{ maxWidth: 150 }}
															value={insttCode}
															onChange={e => setInsttCode(e.target.value)}
														>
															<option value="">기관 선택</option>
															{insttOptions.map(o => (
																<option key={o.code} value={o.code}>{o.codeNm}</option>
															))}
														</select>
													)}
													<button
														type="button"
														className="btn btn-primary btn-default__blue"
														onClick={
															idSetupMode === null     ? handleShowChoice
															: idSetupMode === 'auto' ? handleAutoGenerate
															: handleManualCheck
														}
													>
														{idSetupMode === null     ? '번호설정'
															: idSetupMode === 'auto' ? '자동생성'
															: '중복확인'}
													</button>
												</div>
											)}
										</div>
									</div>
									{/* PBX TYPE */}
									<div className="col-3">
										<div className="input-box">
											<label className="form-label">PBX TYPE <span className="text-danger">*</span></label>
											<select
												className="form-select"
												value={form.type}
												onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
											>
												<option value="">선택</option>
												{(pbxTypeOptions || []).map(o => (
													<option key={o.code} value={o.code}>{o.codeNm}</option>
												))}
											</select>
										</div>
									</div>
									{/* COR / COS */}
									<div className="col-2">
										<div className="input-box">
											<label className="form-label">PBX COR <span className="text-danger">*</span></label>
											<input
												type="text" className="form-control"
												value={form.cor}
												onChange={e => setForm(prev => ({ ...prev, cor: e.target.value }))}
											/>
										</div>
									</div>
									<div className="col-1">
										<div className="input-box">
											<label className="form-label">COS <span className="text-danger">*</span></label>
											<input
												type="text" className="form-control"
												value={form.cos}
												onChange={e => setForm(prev => ({ ...prev, cos: e.target.value }))}
											/>
										</div>
									</div>
									{/* 비밀번호 / 이름 */}
									<div className="col-3">
										<div className="input-box">
											<label className="form-label">PBX 비밀번호</label>
											<input
												type="password" className="form-control"
												value={form.securityCode}
												onChange={e => setForm(prev => ({ ...prev, securityCode: e.target.value }))}
											/>
										</div>
									</div>
									<div className="col-3">
										<div className="input-box">
											<label className="form-label">PBX 이름</label>
											<input
												type="text" className="form-control"
												value={form.name}
												onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
											/>
										</div>
									</div>
									{/* 표시언어 */}
									<div className="col-3">
										<div className="input-box">
											<label className="form-label">Display Language <span className="text-danger">*</span></label>
											<select
												className="form-select"
												value={form.displayLangage}
												onChange={e => setForm(prev => ({ ...prev, displayLangage: e.target.value }))}
											>
												<option value="">선택</option>
												{(pbxLangOptions || []).map(o => (
													<option key={o.code} value={o.code}>{o.codeNm}</option>
												))}
											</select>
										</div>
									</div>
									{/* IP Softphone */}
									<div className="col-3">
										<div className="input-box">
											<label className="form-label">IP Softphone</label>
											<div className="d-flex align-items-center" style={{ height: 38 }}>
												<IosSwitch
													value={form.ipSoftphone}
													name="ipSoftphone"
													onChange={(payload) => setForm(prev => ({ ...prev, ipSoftphone: payload.ipSoftphone }))}
													onText="사용"
													offText="사용 안함"
													onValue="y"
													offValue="n"
												/>
											</div>
										</div>
									</div>
									{/* LOCATION / TN */}
									<div className="col-3">
										<div className="input-box">
											<label className="form-label">PBX LOCATION</label>
											<select
												className="form-select"
												value={form.location}
												onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
											>
												<option value="">선택</option>
												{(pbxLocationOptions || []).map(o => (
													<option key={o.code} value={o.code}>{o.codeNm}</option>
												))}
											</select>
										</div>
									</div>
									<div className="col-2">
										<div className="input-box">
											<label className="form-label">TN</label>
											<select
												className="form-select"
												value={form.tn}
												onChange={e => setForm(prev => ({ ...prev, tn: e.target.value }))}
											>
												{TN_OPTIONS.map(v => (
													<option key={v} value={v}>{v}</option>
												))}
											</select>
										</div>
									</div>
									{/* 버튼 설정 */}
									<div className="col-12">
										<div className="input-box">
											<label className="form-label">버튼 설정</label>
											<p className="text-muted small mb-1">버튼 삭제 시 Data1 값을 빈값으로 처리해 주세요. 행 클릭 시 수정할 수 있습니다.</p>
											<div style={{ overflowX: 'auto' }}>
												<table
													className="content-table__sub"
													style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', minWidth: 900 }}
												>
													<thead>
														<tr>
															<th style={{ width: 60 }}>INDEX</th>
															<th style={{ width: 130 }}>Data1</th>
															<th>Data2</th>
															<th>Data3</th>
															<th style={{ width: 150 }}>Data4</th>
															<th style={{ width: 70 }}>Data5</th>
															<th>Data6</th>
															<th>Data7</th>
															<th style={{ width: 60 }}>삭제</th>
														</tr>
													</thead>
													<tbody>
														{buttons.length === 0 ? (
															<tr>
																<td colSpan={9} className="text-center text-muted py-2">
																	등록된 버튼이 없습니다.
																</td>
															</tr>
														) : buttons.map((row) => (
															<tr
																key={row.btnIndex}
																style={{ cursor: 'pointer' }}
																onClick={() => handleBtnRowClick(row)}
															>
																<td>{row.btnIndex}</td>
																<td>{pbxButtonMap[row.d1] || row.d1}</td>
																<td>{row.d2}</td>
																<td>{row.d3}</td>
																<td>{row.d4}</td>
																<td>{row.d5}</td>
																<td>{row.d6}</td>
																<td>{row.d7}</td>
																<td>
																	<button
																		type="button"
																		className="btn btn-sm btn-danger"
																		onClick={(e) => { e.stopPropagation(); handleBtnDelete(row.btnIndex); }}
																	>삭제</button>
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
											{/* 버튼 추가/수정 행 */}
											<div className="d-flex gap-2 mt-2 flex-wrap align-items-center">
												<select
													className="form-select form-select-sm"
													style={{ width: 80 }}
													value={addBtn.btnIndex}
													onChange={e => setAddBtn(prev => ({ ...prev, btnIndex: e.target.value }))}
												>
													{IDX_OPTIONS.map(v => (
														<option key={v} value={v}>{v}</option>
													))}
												</select>
												<select
													className="form-select form-select-sm"
													style={{ width: 150 }}
													value={addBtn.d1}
													onChange={e => setAddBtn(prev => ({ ...prev, d1: e.target.value }))}
												>
													<option value="">Data1 선택</option>
													{(pbxButtonOptions || []).map(o => (
														<option key={o.code} value={o.code}>{o.codeNm}</option>
													))}
												</select>
												<input
													type="text" className="form-control form-control-sm" style={{ width: 90 }}
													placeholder="Data2" value={addBtn.d2}
													onChange={e => setAddBtn(prev => ({ ...prev, d2: e.target.value }))}
												/>
												<input
													type="text" className="form-control form-control-sm" style={{ width: 90 }}
													placeholder="Data3" value={addBtn.d3}
													onChange={e => setAddBtn(prev => ({ ...prev, d3: e.target.value }))}
												/>
												<select
													className="form-select form-select-sm"
													style={{ width: 160 }}
													value={addBtn.d4}
													onChange={e => setAddBtn(prev => ({ ...prev, d4: e.target.value }))}
												>
													{RING_OPTIONS.map(o => (
														<option key={o.value} value={o.value}>{o.label}</option>
													))}
												</select>
												<select
													className="form-select form-select-sm"
													style={{ width: 80 }}
													value={addBtn.d5}
													onChange={e => setAddBtn(prev => ({ ...prev, d5: e.target.value }))}
												>
													<option value="">Data5</option>
													<option value="n">no</option>
													<option value="y">yes</option>
												</select>
												<input
													type="text" className="form-control form-control-sm" style={{ width: 90 }}
													placeholder="Data6" value={addBtn.d6}
													onChange={e => setAddBtn(prev => ({ ...prev, d6: e.target.value }))}
												/>
												<input
													type="text" className="form-control form-control-sm" style={{ width: 90 }}
													placeholder="Data7" value={addBtn.d7}
													onChange={e => setAddBtn(prev => ({ ...prev, d7: e.target.value }))}
												/>
												<button type="button" className="btn btn-sm btn-primary" onClick={handleBtnSave}>
													저장
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="modal-footer__left" />
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

export default PbxStationFormModal;
