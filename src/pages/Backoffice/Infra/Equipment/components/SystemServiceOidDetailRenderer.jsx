import React, { useState, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

// ?€?€ OID ?œë¸Œ ê·¸ë¦¬??ì»¬ëŸ¼ (ëª¨ë“ˆ ?ˆë²¨) ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
const OID_COL_DEFS = [
    { headerName: 'Oid Number',  field: 'oidNumber',      flex: 1 },
    { headerName: '?´ë¦„',         field: 'oidName',        flex: 1 },
    { headerName: 'ë°˜í™˜ê°?,       field: 'codeNm',         width: 120 },
    { headerName: '?˜ì •??,       field: 'lastUpdusrId',   width: 110 },
    { headerName: '?˜ì •?¼ì',     field: 'lastUpdtPnttm',  width: 130 },
    {
        headerName: 'ì²´í¬', width: 90, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => { e.preventDefault(); p.context?.onOidView(p.data?.oidSeq); }}
            >
                SNMP?•ì¸
            </button>
        ),
    },
    {
        headerName: '?˜ì •', width: 70, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-outline-secondary btn-modify"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onOpenOidEdit(p.data, p.data?.__serviceSeq);
                }}
            >
                ?˜ì •
            </button>
        ),
    },
];

const OID_DEFAULT_COL_DEF = { resizable: true, sortable: false, filter: false, flex: 1 };

/**
 * ?œë¹„??OID ?œë¸Œ ê·¸ë¦¬???Œë”??
 * context ?˜ì‹ :
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
                OID ëª©ë¡
            </div>
            <div style={{ width: '100%', boxSizing: 'border-box', height: '220px' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={OID_COL_DEFS}
                    defaultColDef={OID_DEFAULT_COL_DEF}
                    theme={themeQuartz}
                    headerHeight={32}
                    rowHeight={30}
                    context={context}
                    overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>?±ë¡??OIDê°€ ?†ìŠµ?ˆë‹¤.</span>"
                />
            </div>
        </div>
    );
};

export default SystemServiceOidDetailRenderer;
