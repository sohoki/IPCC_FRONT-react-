import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';

// ?€?€ ê·¸ë£¹ ?œë¸Œ ê·¸ë¦¬??ì»¬ëŸ¼ (ëª¨ë“ˆ ?ˆë²¨) ?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€?€
const GROUP_COL_DEFS = [
    { headerName: 'ê·¸ë£¹ ID',   field: 'employeegrpId',   width: 120 },
    { headerName: 'ê·¸ë£¹ ëª?,   field: 'employeegrpName', flex: 1 },
    { headerName: 'ê°ì‹œ?¬ë?',  field: 'monitorFlag',     width: 90 },
    {
        headerName: '?€?±ë¡', width: 90, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onOpenPartList(
                        p.data?.employeegrpId,
                        p.data?.__tenantId,
                        p.data?.__centerId,
                    );
                }}
            >?€?±ë¡</button>
        ),
    },
    {
        headerName: '?˜ì •', width: 70, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-sm btn-outline-secondary btn-modify"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onOpenGroupEdit(p.data, {
                        tenantId: p.data?.__tenantId,
                        centerId: p.data?.__centerId,
                    });
                }}
            >?˜ì •</button>
        ),
    },
];

const GROUP_DEFAULT_COL_DEF = { resizable: true, sortable: false, filter: false, flex: 1 };

/**
 * CTI ê·¸ë£¹ ?œë¸Œ ê·¸ë¦¬???Œë”??
 * MasterDetailGrid ??detailCellRenderer ë¡??¬ìš©.
 * ?„ìš”??ì½œë°±?€ ë¶€ëª?ê·¸ë¦¬?œì˜ context prop ?¼ë¡œ ?˜ì‹ :
 *   context.fetchGroups({ tenantId, centerId, pageUnit })
 *   context.onOpenGroupEdit(groupData, tenantData)
 *   context.onOpenPartList(employeegrpId, tenantId, centerId)
 */
const CtiGroupDetailRenderer = (props) => {
    const { data, context } = props;
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        const tenantId = data?.tenantId;
        const centerId = data?.centerId;
        if (!tenantId || !context?.fetchGroups) return;

        context.fetchGroups({ tenantId, centerId, pageUnit: '100' })
            .then(list => setRowData(list.map(r => ({ ...r, __tenantId: tenantId, __centerId: centerId }))))
            .catch(() => setRowData([]));
    }, [data?.tenantId, data?.centerId, context]);

    return (
        <div style={{ width: '100%', backgroundColor: '#fff', padding: 0, boxSizing: 'border-box' }}>
            <div style={{
                fontWeight: 'bold', padding: '6px 15px', fontSize: '13px',
                backgroundColor: '#f8f9fa', borderBottom: '1px solid #dde2eb',
            }}>
                ê·¸ë£¹ ëª©ë¡
            </div>
            <div style={{ width: '100%', boxSizing: 'border-box', height: '220px' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={GROUP_COL_DEFS}
                    defaultColDef={GROUP_DEFAULT_COL_DEF}
                    theme={themeQuartz}
                    headerHeight={32}
                    rowHeight={30}
                    context={context}
                    overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>?±ë¡??ê·¸ë£¹???†ìŠµ?ˆë‹¤.</span>"
                />
            </div>
        </div>
    );
};

export default CtiGroupDetailRenderer;
