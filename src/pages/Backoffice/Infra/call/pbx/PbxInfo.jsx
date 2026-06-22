import React, { useState, useMemo, useCallback, lazy } from 'react';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { useResetForm } from '@/hooks/use-form.jsx';
import URL from '@/constants/URL.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';

const PbxStationFormModal      = lazy(() => import('./components/PbxStationFormModal.jsx'));
const PbxStationPbxSearchModal = lazy(() => import('./components/PbxStationPbxSearchModal.jsx'));
const PbxStationExcelModal     = lazy(() => import('./components/PbxStationExcelModal.jsx'));
const PbxAgentFormModal        = lazy(() => import('./components/PbxAgentFormModal.jsx'));
const PbxAgentPbxSearchModal   = lazy(() => import('./components/PbxAgentPbxSearchModal.jsx'));
const PbxAgentExcelModal       = lazy(() => import('./components/PbxAgentExcelModal.jsx'));

const INITIAL_STATION_SEARCH = { searchCondition: '', searchKeyword: '' };
const INITIAL_AGENT_SEARCH   = { searchCondition: '', searchKeyword: '' };

const ynCellRenderer = (p) => {
	const v = p.value?.toUpperCase();
	if (v === 'Y') return <span className="badge bg-success">사용</span>;
	if (v === 'N') return <span className="badge bg-danger">사용안함</span>;
	return p.value ?? '';
};

const SearchIcon = () => (
	<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M10.7 5C12.0791 5 13.4018 5.58699 14.377 6.63183C15.3521 7.67668 15.9 9.09379 15.9 10.5714C15.9 11.9514 15.428 13.22 14.652 14.1971L14.868 14.4286H15.5L19.5 18.7143L18.3 20L14.3 15.7143V15.0371L14.084 14.8057C13.172 15.6371 11.988 16.1429 10.7 16.1429C9.32087 16.1429 7.99823 15.5559 7.02304 14.511C6.04786 13.4662 5.5 12.0491 5.5 10.5714C5.5 9.09379 6.04786 7.67668 7.02304 6.63183C7.99823 5.58699 9.32087 5 10.7 5ZM10.7 6.71429C8.7 6.71429 7.1 8.42857 7.1 10.5714C7.1 12.7143 8.7 14.4286 10.7 14.4286C12.7 14.4286 14.3 12.7143 14.3 10.5714C14.3 8.42857 12.7 6.71429 10.7 6.71429Z" fill="currentColor"/>
	</svg>
);

const ResetIcon = () => (
	<svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M19 8L15 12L19 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
		<path d="M12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16C13.1046 16 14.1046 15.5523 14.8284 14.8284" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
		<path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.4853 3 16.7353 4.00736 18.364 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
	</svg>
);

const AddIcon = () => (
	<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path d="M15.5417 10.2917H10.7917V15.0417H9.20837V10.2917H4.45837V8.70833H9.20837V3.95833H10.7917V8.70833H15.5417V10.2917Z" fill="currentColor"/>
	</svg>
);

const PbxInfo = () => {
	const [activeTab, setActiveTab] = useState('station');
	const [pageUnit] = useState(20);

	// ── 내선번호(Station) ──
	const [stationFormOpen, setStationFormOpen]           = useState(false);
	const [stationPbxSearchOpen, setStationPbxSearchOpen] = useState(false);
	const [stationExcelOpen, setStationExcelOpen]         = useState(false);
	const [selectedExtension, setSelectedExtension]       = useState(null);

	const fetchStationData = async (query) => {
		const res = await fnAjaxFetch({ url: URL.STATION_LIST, method: 'POST', data: query });
		const data = res?.data;
		return {
			rows:  data?.result?.resultList || [],
			total: data?.result?.paginationInfo?.totalRecordCount || 0,
		};
	};

	const {
		onGridReady: onStationGridReady,
		defaultColDef: stationDefaultColDef,
		tempParams: stationParams,
		setTempParams: setStationParams,
		handleSearch: handleStationSearch,
	} = useGridInfinite({ fetchApi: fetchStationData, pageUnit, initialFilters: INITIAL_STATION_SEARCH });

	const { handleReset: resetStation } = useResetForm(setStationParams, INITIAL_STATION_SEARCH);
	const onStationSearch = useCallback((p) => handleStationSearch(p || 1), [handleStationSearch]);
	const onStationChange = (e) => {
		const { name, value } = e.target;
		setStationParams((prev) => ({ ...prev, [name]: value }));
	};
	const handleOpenStation = useCallback((ext = null) => {
		setSelectedExtension(ext);
		setStationFormOpen(true);
	}, []);

	// ── 에이전트(Agent) ──
	const [agentFormOpen, setAgentFormOpen]           = useState(false);
	const [agentPbxSearchOpen, setAgentPbxSearchOpen] = useState(false);
	const [agentExcelOpen, setAgentExcelOpen]         = useState(false);
	const [selectedLoginId, setSelectedLoginId]       = useState(null);

	const fetchAgentData = async (query) => {
		const res = await fnAjaxFetch({ url: URL.AGENT_LIST, method: 'POST', data: query });
		const data = res?.data;
		return {
			rows:  data?.result?.resultList || [],
			total: data?.result?.paginationInfo?.totalRecordCount || 0,
		};
	};

	const {
		onGridReady: onAgentGridReady,
		defaultColDef: agentDefaultColDef,
		tempParams: agentParams,
		setTempParams: setAgentParams,
		handleSearch: handleAgentSearch,
	} = useGridInfinite({ fetchApi: fetchAgentData, pageUnit, initialFilters: INITIAL_AGENT_SEARCH });

	const { handleReset: resetAgent } = useResetForm(setAgentParams, INITIAL_AGENT_SEARCH);
	const onAgentSearch = useCallback((p) => handleAgentSearch(p || 1), [handleAgentSearch]);
	const onAgentChange = (e) => {
		const { name, value } = e.target;
		setAgentParams((prev) => ({ ...prev, [name]: value }));
	};
	const handleOpenAgent = useCallback((loginId = null) => {
		setSelectedLoginId(loginId);
		setAgentFormOpen(true);
	}, []);

	// ── Column Defs ──
	const stationColumnDefs = useMemo(() => [
		{ headerName: '내선번호',  field: 'extension',     width: 110 },
		{ headerName: 'TYPE',      field: 'type',          width: 90 },
		{ headerName: 'COR',       field: 'cor',           width: 70 },
		{ headerName: 'COS',       field: 'cos',           width: 70 },
		{ headerName: 'TN',        field: 'tn',            width: 70 },
		{ headerName: 'NAME',      field: 'name',          width: 120 },
		{ headerName: '비번',      field: 'securityCode',  width: 80 },
		{ headerName: '표시언어',  field: 'displayLangage', width: 90 },
		{ headerName: 'SoftPhone', field: 'ipSoftphone',  width: 100, cellRenderer: ynCellRenderer },
		{ headerName: '상담사사용', field: 'consultUseyn', width: 100, cellRenderer: ynCellRenderer },
		{ headerName: '최종수정일', field: 'updateDate',   flex: 1 },
	], []);

	const agentColumnDefs = useMemo(() => [
		{ headerName: '로그인ID',  field: 'loginId',     width: 130 },
		{ headerName: '이름',      field: 'name',        width: 120 },
		{ headerName: '시나리오',  field: 'sn',          width: 120 },
		{ headerName: 'Index',     field: 'snIndex',     width: 100 },
		{ headerName: '스킬Level', field: 'sr',          width: 100 },
		{ headerName: '스킬Index', field: 'srIndex',     width: 100 },
		{ headerName: '최종수정일', field: 'agentUpdate', flex: 1 },
	], []);

	const gridProps = {
		theme: gridTheme,
		rowModelType: 'infinite',
		pagination: true,
		paginationPageSize: pageUnit,
		paginationPageSizeSelector: [10, 20, 50, 100],
		cacheBlockSize: pageUnit,
		maxBlocksInCache: 2,
		domLayout: 'autoHeight',
		overlayNoRowsTemplate: "<span class='ag-overlay-loading-center'>데이터가 없습니다.</span>",
		overlayLoadingTemplate: "<span class='ag-overlay-loading-center'>조회 중..</span>",
	};

	return (
		<div className="row g-0 main-contents">
			<div className="col-12 content-header">
				<div className="content-header__title">내선번호 / 에이전트 관리</div>
				<div className="content-header__breadcrumb">
					<ol className="breadcrumb">
						<li className="breadcrumb-item">인프라 관리</li>
						<li className="breadcrumb-item">내선번호 / 에이전트 관리</li>
					</ol>
				</div>
			</div>

			{/* 탭 */}
			<div className="col-12" style={{ padding: '0 16px' }}>
				<ul className="nav nav-tabs">
					<li className="nav-item">
						<button
							type="button"
							className={`nav-link${activeTab === 'station' ? ' active' : ''}`}
							onClick={() => setActiveTab('station')}
						>
							내선번호 관리
						</button>
					</li>
					<li className="nav-item">
						<button
							type="button"
							className={`nav-link${activeTab === 'agent' ? ' active' : ''}`}
							onClick={() => setActiveTab('agent')}
						>
							에이전트 관리
						</button>
					</li>
				</ul>
			</div>

			{/* ─── 내선번호 탭 ─── */}
			{activeTab === 'station' && (
				<>
					<div className="col-12 content-search">
						<div className="row g-0 w-100 justify-content-between">
							<div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
								<select
									name="searchCondition"
									className="form-select"
									style={{ width: 120 }}
									value={stationParams.searchCondition}
									onChange={onStationChange}
								>
									<option value="">선택</option>
									<option value="conName">이름</option>
									<option value="conExtension">내선번호</option>
								</select>
								<input
									type="text"
									name="searchKeyword"
									placeholder="검색어를 입력하세요"
									value={stationParams.searchKeyword}
									onChange={onStationChange}
									onKeyDown={(e) => { if (e.key === 'Enter') onStationSearch(1); }}
								/>
							</div>
							<div className="col-auto content-search__action">
								<button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onStationSearch(1)}>
									<SearchIcon />검색
								</button>
								<button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={resetStation}>
									<ResetIcon />검색초기화
								</button>
								<button type="button" className="btn btn-outline-secondary btn-outline__gray" onClick={() => setStationExcelOpen(true)}>
									EXCEL UPLOAD
								</button>
								<button type="button" className="btn btn-secondary" onClick={() => setStationPbxSearchOpen(true)}>
									내선번호 조회
								</button>
								<button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenStation()}>
									<AddIcon />개별 등록
								</button>
							</div>
						</div>
					</div>
					<div className="col-12 content-table content-table__main">
						<div className="ag-theme-material" style={{ width: '100%' }}>
							<AppAgGrid
								{...gridProps}
								columnDefs={stationColumnDefs}
								defaultColDef={stationDefaultColDef}
								onGridReady={onStationGridReady}
							/>
						</div>
					</div>
				</>
			)}

			{/* ─── 에이전트 탭 ─── */}
			{activeTab === 'agent' && (
				<>
					<div className="col-12 content-search">
						<div className="row g-0 w-100 justify-content-between">
							<div className="col-auto content-search__option d-flex gap-2 align-items-center flex-wrap">
								<select
									name="searchCondition"
									className="form-select"
									style={{ width: 120 }}
									value={agentParams.searchCondition}
									onChange={onAgentChange}
								>
									<option value="">선택</option>
									<option value="name">이름</option>
									<option value="loginId">LoginId</option>
								</select>
								<input
									type="text"
									name="searchKeyword"
									placeholder="검색어를 입력하세요"
									value={agentParams.searchKeyword}
									onChange={onAgentChange}
									onKeyDown={(e) => { if (e.key === 'Enter') onAgentSearch(1); }}
								/>
							</div>
							<div className="col-auto content-search__action">
								<button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={() => onAgentSearch(1)}>
									<SearchIcon />검색
								</button>
								<button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={resetAgent}>
									<ResetIcon />검색초기화
								</button>
								<button type="button" className="btn btn-outline-secondary btn-outline__gray" onClick={() => setAgentExcelOpen(true)}>
									EXCEL UPLOAD
								</button>
								<button type="button" className="btn btn-outline-secondary btn-outline__gray" onClick={() => setAgentExcelOpen(true)}>
									EXCEL DELETE
								</button>
								<button type="button" className="btn btn-secondary" onClick={() => setAgentPbxSearchOpen(true)}>
									에이전트 조회
								</button>
								<button type="button" className="btn btn-primary btn-default__blue" onClick={() => handleOpenAgent()}>
									<AddIcon />개별 등록
								</button>
							</div>
						</div>
					</div>
					<div className="col-12 content-table content-table__main">
						<div className="ag-theme-material" style={{ width: '100%' }}>
							<AppAgGrid
								{...gridProps}
								columnDefs={agentColumnDefs}
								defaultColDef={agentDefaultColDef}
								onGridReady={onAgentGridReady}
							/>
						</div>
					</div>
				</>
			)}

			{/* 내선번호 모달 */}
			<PbxStationFormModal
				open={stationFormOpen}
				onClose={() => setStationFormOpen(false)}
				extension={selectedExtension}
				onSuccess={() => { setStationFormOpen(false); onStationSearch(1); }}
			/>
			<PbxStationPbxSearchModal
				open={stationPbxSearchOpen}
				onClose={() => setStationPbxSearchOpen(false)}
				onSuccess={() => { setStationPbxSearchOpen(false); onStationSearch(1); }}
			/>
			<PbxStationExcelModal
				open={stationExcelOpen}
				onClose={() => setStationExcelOpen(false)}
				onSuccess={() => { setStationExcelOpen(false); onStationSearch(1); }}
			/>

			{/* 에이전트 모달 */}
			<PbxAgentFormModal
				key={agentFormOpen ? (selectedLoginId ?? 'new') : 'closed'}
				open={agentFormOpen}
				onClose={() => setAgentFormOpen(false)}
				loginId={selectedLoginId}
				onSuccess={() => { setAgentFormOpen(false); onAgentSearch(1); }}
			/>
			<PbxAgentPbxSearchModal
				open={agentPbxSearchOpen}
				onClose={() => setAgentPbxSearchOpen(false)}
				onSuccess={() => { setAgentPbxSearchOpen(false); onAgentSearch(1); }}
			/>
			<PbxAgentExcelModal
				open={agentExcelOpen}
				onClose={() => setAgentExcelOpen(false)}
				onSuccess={() => { setAgentExcelOpen(false); onAgentSearch(1); }}
			/>
		</div>
	);
};

export default PbxInfo;
