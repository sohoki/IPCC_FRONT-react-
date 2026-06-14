import React, { useState, useEffect, useRef } from 'react';
import AppAgGrid from '@/components/Common/AppAgGrid.jsx';
import { gridTheme } from '@/constants/agGridTheme.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';

const SUB_DEFAULT_COL_DEF = { resizable: true, sortable: false, filter: false };

const SkillEmployeeCellRenderer = (props) => {
  const { data, node, context } = props;
  const [rowData, setRowData] = useState([]);

  const ctxRef = useRef(context);
  useEffect(() => { ctxRef.current = context; });

  const loadSubData = () => {
    const skillId = data?.skillId;
    const tenantId = data?.tenantId;
    const centerId = data?.centerId || '1';
    if (!skillId) return;

    fnAjaxFetch({
      url: URL.SKILL_EMP_LIST,
      method: 'POST',
      data: { centerId, tenantId, skillId },
      withCredentials: true,
    }).then((res) => {
      const json = res?.data;
      const list = json?.result?.resultList || json?.result || [];
      setRowData(list);
    }).catch(() => setRowData([]));
  };

  useEffect(() => {
    loadSubData();
  // context?.subRefresh?.[skillId] 카운터가 오르면 재조회
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.skillId, data?.tenantId, context?.subRefresh?.[data?.skillId]]);

  const colDefs = [
    { headerName: 'SKILL ID', field: 'skillId', width: 100, cellStyle: { textAlign: 'center' } },
    { headerName: '부서명', field: 'employeegrpName', width: 130 },
    { headerName: '팀명', field: 'employeepartName', width: 130 },
    { headerName: '상담사 ID', field: 'employeeId', width: 110, cellStyle: { textAlign: 'center' } },
    { headerName: '상담사 이름', field: 'employeeName', flex: 1 },
    { headerName: '스킬명', field: 'skillName', flex: 1 },
    { headerName: '스킬 LEVEL', field: 'skillLevel', width: 100, cellStyle: { textAlign: 'center' } },
    {
      headerName: '삭제',
      width: 70,
      sortable: false,
      filter: false,
      cellStyle: { textAlign: 'center' },
      cellRenderer: (p) => (
        <button
          className="btn btn-outline-danger btn-outline__gray btn-sm"
          onClick={() => ctxRef.current?.onSubDelete?.({
            skillId: p.data?.skillId,
            tenantId: p.data?.tenantId,
            centerId: p.data?.centerId || '1',
            skillLevel: p.data?.skillLevel,
            employeeId: p.data?.employeeId,
          })}
        >
          삭제
        </button>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', padding: 0, boxSizing: 'border-box' }}>
      <div style={{
        fontWeight: 'bold',
        padding: '6px 15px',
        fontSize: '13px',
        lineHeight: '1.2',
      }}
        className="skill-emp-sub-header"
      >
        SKILL 사용자 목록
      </div>
      <div style={{ width: '100%', boxSizing: 'border-box', height: '220px' }}>
        <AppAgGrid
          rowData={rowData}
          columnDefs={colDefs}
          defaultColDef={SUB_DEFAULT_COL_DEF}
          theme={gridTheme}
          headerHeight={32}
          rowHeight={30}
          context={context}
          overlayNoRowsTemplate="<span class='ag-overlay-loading-center'>SKILL 사용자가 없습니다.</span>"
        />
      </div>
    </div>
  );
};

export default SkillEmployeeCellRenderer;
