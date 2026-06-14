import React, { useState, useEffect } from 'react';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';

// 상세 그룹 서브 그리드 컬럼 (모듈 레벨) ======================================
const GROUP_COL_DEFS = [
    { headerName: '그룹 ID',   field: 'employeegrpId',   width: 120 },
    { headerName: '그룹 명',   field: 'employeegrpName', flex: 1 },
    { headerName: '감시여부',  field: 'monitorFlag',     width: 90 },
    {
        headerName: '파트목록', width: 90, sortable: false, filter: false,
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
            >파트목록</button>
        ),
    },
    {
        headerName: '수정', width: 70, sortable: false, filter: false,
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
            >수정</button>
        ),
    },
];

const GROUP_DEFAULT_COL_DEF = { resizable: true, sortable: false, filter: false, flex: 1 };

/**
 * CTI 그룹 서브 그리드 렌더러
 * MasterDetailGrid 의 detailCellRenderer 로 사용.
 * 필요한 콜백은 부모 그리드의 context prop 으로 수신:
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
                그룹 목록
            </div>
            <div style={{ width: '100%', boxSizing: 'border-box', height: '220px' }}>
                <AppAgGrid
                    rowData={rowData}
                    columnDefs={GROUP_COL_DEFS}
                    defaultColDef={GROUP_DEFAULT_COL_DEF}
                    theme={gridTheme}
                    headerHeight={32}
                    rowHeight={30}
                    context={context}
                    overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>등록된 그룹이 없습니다.</span>"
                />
            </div>
        </div>
    );
};

export default CtiGroupDetailRenderer;
