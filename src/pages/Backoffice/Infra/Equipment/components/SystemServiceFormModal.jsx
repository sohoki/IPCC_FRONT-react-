import React, { useState, useCallback, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useCommonCodeData } from '@/hooks/use-combo-data.js';
import URL from '@/constants/URL.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const EMPTY_FORM = {
	serviceSeq: '',
	serverCode: '',
	serviceName: '',
	servicePort: '',
	serviceUseyn: 'Y',
	serviceHealthGubun: '',
	licenseType: '',
	licenseStartday: '',
	licenseEndday: '',
	licenseKey: '',
	licenseCount: '',
	comCodeNumber: '',
	serviceOidUseyn: 'N',
	serviceSnmpVersion: '',
	serviceSnmpCommunityName: '',
	serviceSnmpId: '',
	serviceSnmpPassword: '',
	serviceSnmpAuthentication: '',
	serviceSnmpPrivacy: '',
	licenseDc: '',
};

const buildForm = (isEdt, rowData) => {
	if (!isEdt || !rowData) return { ...EMPTY_FORM };
	return {
		serviceSeq: String(rowData.serviceSeq || ''),
		serverCode: rowData.serverCode || '',
		serviceName: rowData.serviceName || '',
		servicePort: rowData.servicePort || '',
		serviceUseyn: rowData.serviceUseyn || 'Y',
		serviceHealthGubun: rowData.serviceHealthGubun || '',
		licenseType: rowData.licenseType || '',
		licenseStartday: rowData.licenseStartday || '',
		licenseEndday: rowData.licenseEndday || '',
		licenseKey: rowData.licenseKey || '',
		licenseCount: rowData.licenseCount || '',
		comCodeNumber: rowData.comCodeNumber || '',
		serviceOidUseyn: rowData.serviceOidUseyn || 'N',
		serviceSnmpVersion: rowData.serviceSnmpVersion || '',
		serviceSnmpCommunityName: rowData.serviceSnmpCommunityName || '',
		serviceSnmpId: rowData.serviceSnmpId || '',
		serviceSnmpPassword: rowData.serviceSnmpPassword || '',
		serviceSnmpAuthentication: rowData.serviceSnmpAuthentication || '',
		serviceSnmpPrivacy: rowData.serviceSnmpPrivacy || '',
		licenseDc: rowData.licenseDc || '',
	};
};

const SystemServiceFormModal = ({ open, onClose, serviceSeq, rowData, onSuccess }) => {
	const isEdt = serviceSeq !== null && serviceSeq !== undefined;
	// 부모가 key를 변경해 리마운트하므로 lazy initializer로 최초 1회 초기화
	const [form, setForm] = useState(() => buildForm(isEdt, rowData));
	const [serverOptions, setServerOptions] = useState([]);
	const [companyOptions, setCompanyOptions] = useState([]);

	const { options: licenseTypeOptions }  = useCommonCodeData('LICENSE_TYPE');
	const { options: healthGubunOptions }  = useCommonCodeData('SERVER_CON_GUBUN');
	const { options: snmpVersionOptions }  = useCommonCodeData('SNMP_VERSION');

	// 서버 콤보
	useEffect(() => {
		if (!open) return;
		let active = true;
		fnAjaxFetch({ url: URL.SERVICE_SERVER_COMBO, method: 'GET', withCredentials: true })
			.then(res => {
				if (!active) return;
				const list = res?.data?.result || res?.data?.resultList || [];
				setServerOptions(list.map(o => ({ code: o.serverCode, codeNm: o.serverName || o.serverCode })));
			}).catch(() => {});
		return () => { active = false; };
	}, [open]);

	// 관련업체 콤보
	useEffect(() => {
		if (!open) return;
		let active = true;
		fnAjaxFetch({ url: URL.SERVER_COMPANY_COMBO, method: 'GET', withCredentials: true })
			.then(res => {
				if (!active) return;
				const list = res?.data?.result || res?.data?.resultList || [];
				setCompanyOptions(list.map(o => ({ code: o.comCodeNumber || o.code, codeNm: o.comName || o.codeNm })));
			}).catch(() => {});
		return () => { active = false; };
	}, [open]);

	const updateForm = useCallback((e) => {
		const { name, value } = e.target;
		setForm(prev => ({ ...prev, [name]: value }));
	}, []);

	// licenseType 변경 시 LICENSE_TYPE_1이면 관련 필드 초기화
	const handleLicenseTypeChange = useCallback((e) => {
		const value = e.target.value;
		if (value === 'LICENSE_TYPE_1') {
			setForm(prev => ({
				...prev,
				licenseType: value,
				licenseStartday: '',
				licenseEndday: '',
				licenseKey: '',
				licenseCount: '',
				comCodeNumber: '',
			}));
		} else {
			setForm(prev => ({ ...prev, licenseType: value }));
		}
	}, []);

	// OID 사용여부 변경 시 N이면 SNMP 필드 초기화
	const handleOidUseynChange = useCallback((value) => {
		if (value === 'N') {
			setForm(prev => ({
				...prev,
				serviceOidUseyn: 'N',
				serviceSnmpCommunityName: '',
				serviceSnmpId: '',
				serviceSnmpPassword: '',
				serviceSnmpAuthentication: '',
				serviceSnmpPrivacy: '',
			}));
		} else {
			setForm(prev => ({ ...prev, serviceOidUseyn: value }));
		}
	}, []);

	const showLicenseFields  = form.licenseType !== '' && form.licenseType !== 'LICENSE_TYPE_1';
	const showSnmpFields     = form.serviceOidUseyn === 'Y';
	const showSnmpV3Fields   = showSnmpFields && form.serviceSnmpVersion === 'SNMP_VERSION_3';

	const handleSave = useCallback(async () => {
		if (!form.serverCode)   { await Swal.fire({ icon: 'warning', text: '서버를 선택해주세요.' }); return; }
		if (!form.serviceName)  { await Swal.fire({ icon: 'warning', text: '서비스명을 입력해주세요.' }); return; }
		if (!form.servicePort)  { await Swal.fire({ icon: 'warning', text: '서비스 PORT를 입력해주세요.' }); return; }
		if (!form.licenseType)  { await Swal.fire({ icon: 'warning', text: 'license를 선택해주세요.' }); return; }
		if (form.serviceOidUseyn === 'Y') {
			if (!form.serviceSnmpVersion)       { await Swal.fire({ icon: 'warning', text: 'SNMP Version을 선택해주세요.' }); return; }
			if (!form.serviceSnmpCommunityName) { await Swal.fire({ icon: 'warning', text: 'SNMP Community Name을 입력해주세요.' }); return; }
			if (!form.serviceSnmpId)            { await Swal.fire({ icon: 'warning', text: 'SNMP ID를 입력해주세요.' }); return; }
			if (form.serviceSnmpVersion === 'SNMP_VERSION_3') {
				if (!form.serviceSnmpPassword)       { await Swal.fire({ icon: 'warning', text: 'SNMP Password를 입력해주세요.' }); return; }
				if (!form.serviceSnmpAuthentication) { await Swal.fire({ icon: 'warning', text: 'SNMP Authentication을 입력해주세요.' }); return; }
				if (!form.serviceSnmpPrivacy)        { await Swal.fire({ icon: 'warning', text: 'SNMP Privacy를 입력해주세요.' }); return; }
			}
		}
		const action = isEdt ? '수정' : '등록';
		const ok = await Swal.fire({
			icon: 'question', title: `서비스 정보 ${action}`,
			html: `<b>${form.serviceName}</b> ${action} 하시겠습니까?`,
			showCancelButton: true, confirmButtonText: '예', cancelButtonText: '아니오',
			focusCancel: true,
		});
		if (!ok.isConfirmed) return;

		try {
			const res = await fnAjaxFetch({
				url: URL.SERVICE_INFO_UPDATE,
				method: 'POST',
				data: {
					mode: isEdt ? 'Edt' : 'Ins',
					serviceSeq: form.serviceSeq,
					serverCode: form.serverCode,
					serviceName: form.serviceName,
					servicePort: form.servicePort,
					serviceUseyn: form.serviceUseyn,
					serviceHealthGubun: form.serviceHealthGubun,
					licenseType: form.licenseType,
					licenseStartday: form.licenseStartday.replaceAll('-', ''),
					licenseEndday: form.licenseEndday.replaceAll('-', ''),
					licenseKey: form.licenseKey,
					licenseCount: form.licenseCount || '0',
					comCodeNumber: form.comCodeNumber,
					serviceOidUseyn: form.serviceOidUseyn,
					serviceSnmpVersion: form.serviceSnmpVersion,
					serviceSnmpCommunityName: form.serviceSnmpCommunityName,
					serviceSnmpId: form.serviceSnmpId,
					serviceSnmpPassword: form.serviceSnmpPassword,
					serviceSnmpAuthentication: form.serviceSnmpAuthentication,
					serviceSnmpPrivacy: form.serviceSnmpPrivacy,
					licenseDc: form.licenseDc,
				},
				withCredentials: true,
			});
			const json = res?.data;
			if (json?.STATUS === 'SUCCESS' || json?.resultCodeInfo === 'SUCCESS') {
				await Swal.fire({ icon: 'success', title: action, text: json?.MESSAGE || `${action}되었습니다.` });
				onSuccess();
			} else {
				await Swal.fire({ icon: 'error', text: json?.MESSAGE || '처리 중 문제가 발생했습니다.' });
			}
		} catch (e) {
			await Swal.fire({ icon: 'error', text: e?.message || '처리 중 오류가 발생했습니다.' });
		}
	}, [form, isEdt, onSuccess]);

	if (!open) return null;
	return (
		<div className="modal-backdrop-custom">
			<div className="modal-custom">
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 900, maxWidth: '95%', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">서비스 정보 {isEdt ? '수정' : '등록'}</h2>
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								<div className="row input-box-wrap">
									{/* 서버 / 서비스명 */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="serverCode" className="form-label">서버 <span className="text-danger">*</span></label>
											<select id="serverCode" name="serverCode" className="form-select" value={form.serverCode} onChange={updateForm}>
												<option value="">선택</option>
												{serverOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
											</select>
										</div>
									</div>
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="serviceName" className="form-label">서비스명 <span className="text-danger">*</span></label>
											<input id="serviceName" name="serviceName" type="text" className="form-control" value={form.serviceName} onChange={updateForm} />
										</div>
									</div>
									{/* 서비스 PORT / 사용여부 */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="servicePort" className="form-label">서비스 PORT <span className="text-danger">*</span></label>
											<input id="servicePort" name="servicePort" type="text" className="form-control" value={form.servicePort} onChange={updateForm} />
										</div>
									</div>
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">사용여부</label>
											<div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
												<UseSwitch
													value={form.serviceUseyn}
													name="serviceUseyn"
													onChange={(payload) => setForm(prev => ({ ...prev, serviceUseyn: payload.serviceUseyn }))}
													onText="사용"
													offText="사용 안함"
												/>
											</div>
										</div>
									</div>
									{/* Health Check / 라이선스Type */}
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="serviceHealthGubun" className="form-label">Health Check</label>
											<select id="serviceHealthGubun" name="serviceHealthGubun" className="form-select" value={form.serviceHealthGubun} onChange={updateForm}>
												<option value="">선택</option>
												{healthGubunOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
											</select>
										</div>
									</div>
									<div className="col-6">
										<div className="input-box">
											<label htmlFor="licenseType" className="form-label">라이선스Type <span className="text-danger">*</span></label>
											<select id="licenseType" name="licenseType" className="form-select" value={form.licenseType} onChange={handleLicenseTypeChange}>
												<option value="">선택</option>
												{licenseTypeOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
											</select>
										</div>
									</div>
									{/* 라이선스 관련(LICENSE_TYPE_1이 아닐 때) */}
									{showLicenseFields && (<>
										<div className="col-6">
											<div className="input-box">
												<label className="form-label">라이선스기간</label>
												<div className="d-flex gap-2 align-items-center">
													<input name="licenseStartday" type="date" className="form-control" value={form.licenseStartday} onChange={updateForm} />
													<span>~</span>
													<input name="licenseEndday" type="date" className="form-control" value={form.licenseEndday} onChange={updateForm} />
												</div>
											</div>
										</div>
										<div className="col-6">
											<div className="input-box">
												<label htmlFor="licenseKey" className="form-label">라이선스Key</label>
												<input id="licenseKey" name="licenseKey" type="password" className="form-control" value={form.licenseKey} onChange={updateForm} />
											</div>
										</div>
										<div className="col-6">
											<div className="input-box">
												<label htmlFor="licenseCount" className="form-label">라이선스수량</label>
												<input id="licenseCount" name="licenseCount" type="text" className="form-control" value={form.licenseCount} onChange={updateForm} />
											</div>
										</div>
										<div className="col-6">
											<div className="input-box">
												<label htmlFor="comCodeNumber" className="form-label">제품업체</label>
												<select id="comCodeNumber" name="comCodeNumber" className="form-select" value={form.comCodeNumber} onChange={updateForm}>
													<option value="">선택</option>
													{companyOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
												</select>
											</div>
										</div>
									</>)}
									{/* OID 사용여부 / SNMP Version */}
									<div className="col-6">
										<div className="input-box">
											<label className="form-label">OID 사용여부</label>
											<div style={{ height: 38, display: 'flex', alignItems: 'center' }}>
												<UseSwitch
													value={form.serviceOidUseyn}
													name="serviceOidUseyn"
													onChange={(payload) => handleOidUseynChange(payload.serviceOidUseyn)}
													onText="사용"
													offText="사용 안함"
												/>
											</div>
										</div>
									</div>
									{showSnmpFields && (
										<div className="col-6">
											<div className="input-box">
												<label htmlFor="serviceSnmpVersion" className="form-label">SNMP Version</label>
												<select id="serviceSnmpVersion" name="serviceSnmpVersion" className="form-select" value={form.serviceSnmpVersion} onChange={updateForm}>
													<option value="">선택</option>
													{snmpVersionOptions.map(o => <option key={o.code} value={o.code}>{o.codeNm}</option>)}
												</select>
											</div>
										</div>
									)}
									{/* SNMP 관련(OID 사용 시) */}
									{showSnmpFields && (<>
										<div className="col-6">
											<div className="input-box">
												<label htmlFor="serviceSnmpCommunityName" className="form-label">SNMP Name</label>
												<input id="serviceSnmpCommunityName" name="serviceSnmpCommunityName" type="text" className="form-control" value={form.serviceSnmpCommunityName} onChange={updateForm} />
											</div>
										</div>
										<div className="col-6">
											<div className="input-box">
												<label htmlFor="serviceSnmpId" className="form-label">SNMP ID</label>
												<input id="serviceSnmpId" name="serviceSnmpId" type="text" className="form-control" value={form.serviceSnmpId} onChange={updateForm} />
											</div>
										</div>
									</>)}
									{/* SNMP V3 전용 */}
									{showSnmpV3Fields && (<>
										<div className="col-6">
											<div className="input-box">
												<label htmlFor="serviceSnmpPassword" className="form-label">SNMP PWD</label>
												<input id="serviceSnmpPassword" name="serviceSnmpPassword" type="password" className="form-control" value={form.serviceSnmpPassword} onChange={updateForm} />
											</div>
										</div>
										<div className="col-6">
											<div className="input-box">
												<label htmlFor="serviceSnmpAuthentication" className="form-label">SNMP Auth</label>
												<input id="serviceSnmpAuthentication" name="serviceSnmpAuthentication" type="text" className="form-control" value={form.serviceSnmpAuthentication} onChange={updateForm} />
											</div>
										</div>
										<div className="col-12">
											<div className="input-box">
												<label htmlFor="serviceSnmpPrivacy" className="form-label">SNMP Privacy</label>
												<input id="serviceSnmpPrivacy" name="serviceSnmpPrivacy" type="text" className="form-control" value={form.serviceSnmpPrivacy} onChange={updateForm} />
											</div>
										</div>
									</>)}
									{/* 비고 */}
									<div className="col-12">
										<div className="input-box">
											<label htmlFor="licenseDc" className="form-label">비고</label>
											<textarea id="licenseDc" name="licenseDc" className="form-control" rows={5} value={form.licenseDc} onChange={updateForm} />
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

export default SystemServiceFormModal;
