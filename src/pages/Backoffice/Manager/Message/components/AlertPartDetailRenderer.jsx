import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCommonDelete } from '@/hooks/use-common-delete.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const PART_DEFAULT_COL_DEF = { resizable: true, sortable: false, filter: false, flex: 1 };

const AlertPartDetailRenderer = (props) => {
	const { data, context } = props;
	const [rowData, setRowData] = useState([]);

	const loadData = useCallback(() => {
		const alertSeq = data?.alertSeq;
		if (!alertSeq) return;
		fnAjaxFetch({
			url: URL.ALERT_PART_LIST,
			method: 'POST',
			data: { alertSeq, pageIndex: '1', pageUnit: '100' },
			withCredentials: true,
		}).then(res => {
			const list = res?.data?.result?.resultList || res?.data?.rows || [];
			setRowData(list.map(r => ({ ...r, __alertSeq: alertSeq })));
		}).catch(() => setRowData([]));
	}, [data?.alertSeq]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const { handleDelete } = useCommonDelete({
		URL: URL.ALERT_PART,
		MESSAGE: '부서',
		reloadFunction: loadData,
	});

	const columnDefs = useMemo(() => [
		{ headerName: '부서 구분', field: 'codeNm',     flex: 1 },
		{ headerName: '기관명',    field: 'allInsttNm', flex: 1 },
		{ headerName: '부서코드',  field: 'alertPart',  flex: 1 },
		{ headerName: '부서명',    field: 'partNm',     flex: 1 },
		{
			headerName: '수정', width: 70, sortable: false, filter: false,
			cellRenderer: (p) => (
				<button
					className="btn btn-sm btn-outline-secondary btn-modify"
					onClick={(e) => {
						e.preventDefault();
						context?.onOpenPartEdit(p.data, p.data?.__alertSeq);
					}}
				>수정</button>
			),
		},
		{
			headerName: '삭제', width: 70, sortable: false, filter: false,
			cellRenderer: (p) => (
				<button
					className="btn btn-sm btn-danger"
					onClick={(e) => {
						e.preventDefault();
						handleDelete({ code: p.data?.alertPartSeq, name: p.data?.alertPartSeq });
					}}
				>삭제</button>
			),
		},
	], [context, handleDelete]);

	return (
		<div style={{ width: '100%', backgroundColor: '#fff', padding: 0, boxSizing: 'border-box' }}>
			<div style={{
				display: 'flex', justifyContent: 'space-between', alignItems: 'center',
				padding: '4px 15px', fontSize: '13px',
				backgroundColor: '#f8f9fa', borderBottom: '1px solid #dde2eb',
			}}>
				<span style={{ fontWeight: 'bold' }}>부서 목록</span>
				<button
					className="btn btn-sm btn-primary"
					onClick={() => context?.onOpenPartAdd(data?.alertSeq, data)}
				>부서 등록</button>
			</div>
			<div style={{ width: '100%', boxSizing: 'border-box', height: '200px' }}>
				<AppAgGrid
					rowData={rowData}
					columnDefs={columnDefs}
					defaultColDef={PART_DEFAULT_COL_DEF}
					theme={gridTheme}
					headerHeight={32}
					rowHeight={30}
					overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>등록된 부서가 없습니다.</span>"
				/>
			</div>
		</div>
	);
};

export default AlertPartDetailRenderer;
