import React, { useState, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const PART_COL_DEFS = [
    { headerName: '부서 구분', field: 'codeNm',   flex: 1 },
    { headerName: '부서코드',  field: 'alertPart', flex: 1 },
    {
        headerName: '수정', width: 70, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-outline-secondary btn-modify"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onOpenPartEdit(p.data, p.data?.__alertSeq);
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
                    p.context?.onDeletePart(p.data?.alertPartSeq, p.data?.__alertSeq);
                }}
            >삭제</button>
        ),
    },
];

const PART_DEFAULT_COL_DEF = { resizable: true, sortable: false, filter: false, flex: 1 };

/**
 * 부서 서브 그리드 렌더러
 * context 수신:
 *   context.onOpenPartEdit(partData, alertSeq)
 *   context.onDeletePart(alertPartSeq, alertSeq)
 *   context.refreshRows(alertSeq)
 */
const AlertPartDetailRenderer = (props) => {
    const { data, context } = props;
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
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

    return (
        <div style={{ width: '100%', backgroundColor: '#fff', padding: 0, boxSizing: 'border-box' }}>
            <div style={{
                fontWeight: 'bold', padding: '6px 15px', fontSize: '13px',
                backgroundColor: '#f8f9fa', borderBottom: '1px solid #dde2eb',
            }}>
                부서 목록
            </div>
            <div style={{ width: '100%', boxSizing: 'border-box', height: '200px' }}>
                <AppAgGrid
                    rowData={rowData}
                    columnDefs={PART_COL_DEFS}
                    defaultColDef={PART_DEFAULT_COL_DEF}
                    theme={gridTheme}
                    headerHeight={32}
                    rowHeight={30}
                    context={context}
                    overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>등록된 부서가 없습니다.</span>"
                />
            </div>
        </div>
    );
};

export default AlertPartDetailRenderer;
