import React, { useState, useEffect } from 'react';
import Swal from '@/lib/swal.js';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const PART_COL_DEFS = [
    { headerName: 'ë¶€??êµ¬ë¶„', field: 'codeNm',   flex: 1 },
    { headerName: 'ë¶€?œì½”??,  field: 'alertPart', flex: 1 },
    {
        headerName: '?˜ì •', width: 70, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-outline-secondary btn-modify"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onOpenPartEdit(p.data, p.data?.__alertSeq);
                }}
            >?˜ì •</button>
        ),
    },
    {
        headerName: '?? œ', width: 70, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-danger"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onDeletePart(p.data?.alertPartSeq, p.data?.__alertSeq);
                }}
            >?? œ</button>
        ),
    },
];

const PART_DEFAULT_COL_DEF = { resizable: true, sortable: false, filter: false, flex: 1 };

/**
 * ë¶€???œë¸Œ ê·¸ë¦¬???Œë”??
 * context ?˜ì‹ :
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
                ë¶€??ëª©ë¡
            </div>
            <div style={{ width: '100%', boxSizing: 'border-box', height: '200px' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={PART_COL_DEFS}
                    defaultColDef={PART_DEFAULT_COL_DEF}
                    theme={themeQuartz}
                    headerHeight={32}
                    rowHeight={30}
                    context={context}
                    overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>?±ë¡??ë¶€?œê? ?†ìŠµ?ˆë‹¤.</span>"
                />
            </div>
        </div>
    );
};

export default AlertPartDetailRenderer;
