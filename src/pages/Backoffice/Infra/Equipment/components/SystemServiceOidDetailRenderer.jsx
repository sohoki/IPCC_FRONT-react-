import React, { useState, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

// ?�?� OID ?�브 그리??컬럼 (모듈 ?�벨) ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�
const OID_COL_DEFS = [
    { headerName: 'Oid Number',  field: 'oidNumber',      flex: 1 },
    { headerName: '?�름',         field: 'oidName',        flex: 1 },
    { headerName: '반환�?,       field: 'codeNm',         width: 120 },
    { headerName: '?�정??,       field: 'lastUpdusrId',   width: 110 },
    { headerName: '?�정?�자',     field: 'lastUpdtPnttm',  width: 130 },
    {
        headerName: '체크', width: 90, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => { e.preventDefault(); p.context?.onOidView(p.data?.oidSeq); }}
            >
                SNMP?�인
            </button>
        ),
    },
    {
        headerName: '?�정', width: 70, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-outline-secondary btn-modify"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onOpenOidEdit(p.data, p.data?.__serviceSeq);
                }}
            >
                ?�정
            </button>
        ),
    },
];

const OID_DEFAULT_COL_DEF = { resizable: true, sortable: false, filter: false, flex: 1 };

/**
 * ?�비??OID ?�브 그리???�더??
 * context ?�신:
 *   context.fetchOids({ serviceSeq })
 *   context.onOidView(oidSeq)
 *   context.onOpenOidEdit(oidData, serviceSeq)
 */
const SystemServiceOidDetailRenderer = (props) => {
    const { data, context } = props;
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        const serviceSeq = data?.serviceSeq;
        if (!serviceSeq) return;

        fnAjaxFetch({
            url: URL.SERVICE_OID_LIST,
            method: 'POST',
            data: { searchServiceSeq: serviceSeq, pageIndex: '1', pageUnit: '100' },
            withCredentials: true,
        }).then(res => {
            const list = res?.data?.result?.resultList || res?.data?.rows || [];
            setRowData(list.map(r => ({ ...r, __serviceSeq: serviceSeq })));
        }).catch(() => setRowData([]));
    }, [data?.serviceSeq]);

    return (
        <div style={{ width: '100%', backgroundColor: '#fff', padding: 0, boxSizing: 'border-box' }}>
            <div style={{
                fontWeight: 'bold', padding: '6px 15px', fontSize: '13px',
                backgroundColor: '#f8f9fa', borderBottom: '1px solid #dde2eb',
            }}>
                OID 목록
            </div>
            <div style={{ width: '100%', boxSizing: 'border-box', height: '220px' }}>
                <AppAgGrid
                    rowData={rowData}
                    columnDefs={OID_COL_DEFS}
                    defaultColDef={OID_DEFAULT_COL_DEF}
                    theme={gridTheme}
                    headerHeight={32}
                    rowHeight={30}
                    context={context}
                    overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>?�록??OID가 ?�습?�다.</span>"
                />
            </div>
        </div>
    );
};

export default SystemServiceOidDetailRenderer;
