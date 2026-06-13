import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { themeQuartz } from 'ag-grid-community';
import UseSwitch from '@/components/Common/IosSwitch.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';

// ── 사용유무 Switch 셀 (모듈 레벨 정의 → 리마운트 없음) ──────────────────
const SubUseAtCell = ({ value, data, node, colDef }) => {
    const [currentValue, setCurrentValue] = useState(value);

    const handleChange = async (payload) => {
        const newValue = payload.useAt;
        try {
            await fnAjaxFetch({
                url: API_URL.CODE_DETAIL_UPDATE_USEYN,
                method: 'POST',
                data: { code: data.code, useAt: newValue },
                withCredentials: true,
            });
            setCurrentValue(newValue);
            node.setDataValue(colDef.field, newValue);
        } catch {
            // 실패 시 UI 원복은 setCurrentValue 미호출로 처리
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <UseSwitch
                value={currentValue}
                name="useAt"
                onChange={handleChange}
                onText="사용"
                offText="미사용"
                onColor="#86d3ff"
                offColor="#9ca3af"
            />
        </div>
    );
};

// ── 서브 그리드 컬럼 정의 (모듈 레벨 상수 → 재생성 없음) ──────────────────
const SUB_COL_DEFS = [
    { headerName: '상세코드',   field: 'code',     cellStyle: { textAlign: 'center' } },
    { headerName: '상세코드명', field: 'codeNm',   cellStyle: { textAlign: 'center' }, flex: 1 },
    { headerName: '설명',       field: 'codeDc',   cellStyle: { textAlign: 'center' }, flex: 1, sortable: false },
    { headerName: '비고',       field: 'codeEtc1', cellStyle: { textAlign: 'center' }, sortable: false },
    {
        headerName: '사용유무', field: 'useAt',
        cellStyle: { textAlign: 'center' }, width: 100,
        cellRenderer: SubUseAtCell,
    },
    {
        headerName: '수정',
        cellStyle: { textAlign: 'center' }, width: 60, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-outline-secondary btn-outline__gray btn-sm"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onEdit(p.data?.codeId, p.data?.code, p.data);
                }}
            >
                수정
            </button>
        ),
    },
    {
        headerName: '삭제',
        cellStyle: { textAlign: 'center' }, width: 60, sortable: false, filter: false,
        cellRenderer: (p) => (
            <button
                className="btn btn-outline-danger btn-outline__gray btn-sm"
                onClick={(e) => {
                    e.preventDefault();
                    p.context?.onDelete(
                        { code: p.data?.code, name: p.data?.codeNm },
                        [{ key: 'systemCode', value: p.data?.systemCode }],
                        () => p.context?.refreshRows({
                            parentRowId: p.data?.codeId,
                            codeId: p.data?.codeId,
                            systemCode: p.data?.systemCode,
                        }),
                    );
                }}
            >
                삭제
            </button>
        ),
    },
];

const SUB_DEFAULT_COL_DEF = { resizable: true, sortable: true, filter: false, flex: 1 };

/**
 * CodeInfo 전용 서브 그리드 렌더러.
 *
 * AG Grid master-detail의 detailCellRenderer로 사용.
 * 필요한 콜백은 부모 그리드의 context prop을 통해 수신:
 *   context.fetchDetail({ codeId, pageIndex, pageUnit }) → Promise<rows>
 *   context.onEdit(codeId, code, rawData)
 *   context.onDelete({ code, name }, null, afterCallback)
 *   context.refreshRows({ parentRowId, codeId })
 */
const CodeDetailCellRenderer = (props) => {
    const { data, node, context } = props;
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        const codeId = data?.codeId;
        const nodeId = node?.id;
        if (!codeId || !context?.fetchDetail) return;

        context.fetchDetail({ codeId, systemCode: data?.systemCode, pageIndex: '1', pageUnit: '100' })
            .then((list) => setRowData(list.map((r) => ({ ...r, codeId, __parentId: nodeId }))))
            .catch(() => setRowData([]));
    }, [data?.codeId, node?.id, context]);

    return (
        <div style={{ width: '100%', backgroundColor: '#fff', padding: 0, boxSizing: 'border-box' }}>
            <div style={{
                fontWeight: 'bold',
                padding: '6px 15px',
                fontSize: '13px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #dde2eb',
                lineHeight: '1.2',
            }}>
                상세 코드 목록
            </div>
            <div style={{ width: '100%', boxSizing: 'border-box', height: '220px' }}>
                <AgGridReact
                    rowData={rowData}
                    columnDefs={SUB_COL_DEFS}
                    defaultColDef={SUB_DEFAULT_COL_DEF}
                    theme={themeQuartz}
                    headerHeight={32}
                    rowHeight={30}
                    context={context}
                    overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>코드 데이터가 없습니다.</span>"
                    overlayLoadingTemplate="<span class='ag-overlay-loading-center'>조회 중...</span>"
                />
            </div>
        </div>
    );
};

export default CodeDetailCellRenderer;
