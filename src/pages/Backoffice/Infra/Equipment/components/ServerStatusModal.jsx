import React, { useState, useEffect } from 'react';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const parseJson = (str) => {
	try { return typeof str === 'string' ? JSON.parse(str) : str; }
	catch { return null; }
};

const fmt = (bytes) => {
	if (bytes == null) return '-';
	const gb = bytes / 1024 / 1024 / 1024;
	return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / 1024 / 1024).toFixed(0)} MB`;
};

const GaugeBar = ({ percent, danger = 80, warning = 60 }) => {
	const val = Math.min(Math.max(Number(percent) || 0, 0), 100);
	const color = val >= danger ? '#dc3545' : val >= warning ? '#fd7e14' : '#0d6efd';
	return (
		<div style={{ background: '#e9ecef', borderRadius: 4, height: 10, overflow: 'hidden', marginTop: 4 }}>
			<div style={{ width: `${val}%`, height: '100%', backgroundColor: color, transition: 'width .3s' }} />
		</div>
	);
};

const ServerStatusModal = ({ open, onClose, serverCode, serverName }) => {
	const [status, setStatus] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open || !serverCode) return;
		setStatus(null);
		setLoading(true);
		fnAjaxFetch({
			url: `${URL.SERVER_STATUS_DETAIL}/${encodeURIComponent(serverCode)}.do`,
			method: 'GET',
			withCredentials: true,
		}).then(res => {
			const data = res?.data;
			if (data?.resultCodeInfo === 'SUCCESS' || data?.STATUS === 'SUCCESS') {
				// 백엔드 응답: { result: { result: { ...serverStatus } } }
				const payload = data?.result?.result ?? data?.result ?? null;
				setStatus(payload);
			}
		}).catch(() => {}).finally(() => setLoading(false));
	}, [open, serverCode]);

	if (!open) return null;

	const safeJson = (str) => parseJson(str?.replaceAll('&quot;', '"'));
	const cpu     = safeJson(status?.cpu);
	const mem     = safeJson(status?.memory);
	const hdd     = safeJson(status?.hddInfo);
	const loadAvg = safeJson(status?.loadAvg);
	const pingOk  = status?.ping && String(status.ping).toLowerCase() !== 'fail';

	return (
		<div className="modal-backdrop-custom">
			<div className="modal-custom">
				<div
					className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
					style={{ width: 520, maxWidth: '95%', backgroundColor: '#fff' }}
				>
					<div className="modal-content">
						<div className="modal-header">
							<div className="modal-title">
								<h2 className="modal-title__title">서버 상태 상세</h2>
								{serverName && <span style={{ fontSize: 13, color: '#6c757d', marginLeft: 8 }}>{serverName}</span>}
							</div>
							<button type="button" className="modal-close" aria-label="Close" onClick={onClose} />
						</div>
						<div className="modal-body">
							<div className="modal-body__content">
								{loading && (
									<div className="text-center py-4 text-muted">조회 중...</div>
								)}
								{!loading && !status && (
									<div className="text-center py-4 text-muted">수집된 상태 정보가 없습니다.</div>
								)}
								{!loading && status && (
									<div className="row g-3">
										{/* PING */}
										<div className="col-12">
											<div className="p-3" style={{ border: '1px solid #dee2e6', borderRadius: 6 }}>
												<div className="d-flex align-items-center gap-2">
													<span
														style={{
															width: 12, height: 12, borderRadius: '50%',
															backgroundColor: pingOk ? '#0d6efd' : '#dc3545',
															flexShrink: 0, display: 'inline-block',
														}}
													/>
													<strong>PING</strong>
													<span style={{ color: pingOk ? '#0d6efd' : '#dc3545' }}>
														{pingOk ? '정상' : '실패'}
													</span>
													{status.ping && (
														<span className="text-muted" style={{ fontSize: 12 }}>({status.ping})</span>
													)}
												</div>
											</div>
										</div>

										{/* CPU */}
										{cpu && (
											<div className="col-12">
												<div className="p-3" style={{ border: '1px solid #dee2e6', borderRadius: 6 }}>
													<div className="d-flex justify-content-between mb-1">
														<strong>CPU 사용률</strong>
														<span>{cpu.cpu_usage_percent ?? '-'}%</span>
													</div>
													<GaugeBar percent={cpu.cpu_usage_percent} danger={90} warning={70} />
												</div>
											</div>
										)}

										{/* 메모리 */}
										{mem && (
											<div className="col-12">
												<div className="p-3" style={{ border: '1px solid #dee2e6', borderRadius: 6 }}>
													<div className="d-flex justify-content-between mb-1">
														<strong>메모리 사용률</strong>
														<span>{mem.usage_percent ?? '-'}%</span>
													</div>
													<GaugeBar percent={mem.usage_percent} />
													<div className="d-flex justify-content-between mt-2" style={{ fontSize: 12, color: '#6c757d' }}>
														<span>사용: {fmt(mem.used_bytes)}</span>
														<span>전체: {fmt(mem.total_bytes)}</span>
													</div>
												</div>
											</div>
										)}

										{/* HDD */}
										{hdd && (
											<div className="col-12">
												<div className="p-3" style={{ border: '1px solid #dee2e6', borderRadius: 6 }}>
													<div className="d-flex justify-content-between mb-1">
														<strong>디스크 사용률</strong>
														<span>{hdd.usage_percent ?? '-'}%</span>
													</div>
													<GaugeBar percent={hdd.usage_percent} danger={85} warning={70} />
													<div className="d-flex justify-content-between mt-2" style={{ fontSize: 12, color: '#6c757d' }}>
														<span>사용: {fmt(hdd.used_bytes)}</span>
														<span>전체: {fmt(hdd.total_bytes)}</span>
													</div>
												</div>
											</div>
										)}

										{/* Load Average */}
										{loadAvg && (
											<div className="col-12">
												<div className="p-3" style={{ border: '1px solid #dee2e6', borderRadius: 6 }}>
													<strong className="d-block mb-2">Load Average</strong>
													<div className="d-flex gap-3">
														{['1min', '5min', '15min'].map(key => (
															<div key={key} className="text-center flex-fill">
																<div style={{ fontSize: 18, fontWeight: 600, color: (loadAvg.loadAverage?.[key] ?? 0) >= 1 ? '#dc3545' : '#0d6efd' }}>
																	{loadAvg.loadAverage?.[key] ?? '-'}
																</div>
																<div style={{ fontSize: 11, color: '#6c757d' }}>{key}</div>
															</div>
														))}
													</div>
													{loadAvg.processes && (
														<div className="d-flex justify-content-between mt-2 pt-2" style={{ borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#6c757d' }}>
															<span>실행 중: <strong>{loadAvg.processes.running}</strong></span>
															<span>전체 프로세스: <strong>{loadAvg.processes.total}</strong></span>
														</div>
													)}
												</div>
											</div>
										)}

										{/* 수집 일시 */}
										{status.lastUpdtPnttm && (
											<div className="col-12">
												<div style={{ fontSize: 12, color: '#6c757d', textAlign: 'right' }}>
													마지막 수집: {String(status.lastUpdtPnttm).replace('T', ' ').slice(0, 19)}
												</div>
											</div>
										)}
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

export default ServerStatusModal;
