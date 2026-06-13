import React, { useState, useCallback, useRef } from 'react';
import { useGridInfinite } from '@/hooks/grid/use-grid-infinite.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import URL from '@/constants/URL.jsx';
import { themeQuartz } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

const INITIAL_SEARCH = { searchCondition: '', searchKeyword: '' };

/**
 * ?ÑÎ°úÍ∑∏Îû® ?†ÌÉù ?ùÏóÖ
 * Props:
 *   open     ???úÏãú ?¨Î?
 *   onClose  ???´Í∏∞ ÏΩúÎ∞±
 *   onSelect ??(row) => void  ???†ÌÉù ÏΩúÎ∞±
 */
const ProgramChoiceModal = ({ open, onClose, onSelect }) => {
    const [pageUnit] = useState(20);
    const [tempParams, setTempParams] = useState(INITIAL_SEARCH);
    const inputRef = useRef(null);

    const fetchData = useCallback(async (query) => {
        const res = await fnAjaxFetch({
            url: URL.PROGRAM_LIST,
            method: 'POST',
            data: query,
            withCredentials: true,
        });
        const data = res?.data;
        return {
            rows: data?.result?.resultList || [],
            total: data?.result?.paginationInfo?.totalRecordCount || 0,
        };
    }, []);

    const { onGridReady, defaultColDef, tempParams: gridParams, setTempParams: setGridParams, handleSearch } =
        useGridInfinite({ fetchApi: fetchData, pageUnit, initialFilters: INITIAL_SEARCH });

    const onSearch = useCallback(() => handleSearch(1), [handleSearch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTempParams((p) => ({ ...p, [name]: value }));
        setGridParams((p) => ({ ...p, [name]: value }));
    };

    const onKeyDown = (e) => {
        if (e.key === 'Enter') onSearch();
    };

    const columnDefs = [
        { headerName: '?ÑÎ°úÍ∑∏Îû®ÏΩîÎìú', field: 'progrmFileNm', width: 180 },
        { headerName: '?úÍ?Î™?,       field: 'progrmKoreannm', flex: 1 },
        { headerName: '?Ä?•Í≤ΩÎ°?,     field: 'progrmStrePath', flex: 1 },
        {
            headerName: '?†ÌÉù',
            width: 80,
            sortable: false,
            filter: false,
            cellRenderer: (p) => (
                <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ padding: '2px 10px', fontSize: 12 }}
                    onClick={() => { onSelect(p.data); onClose(); }}
                >
                    ?†ÌÉù
                </button>
            ),
        },
    ];

    if (!open) return null;
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <div style={{
                background: '#fff', borderRadius: 12,
                width: '70vw', maxWidth: 860,
                boxShadow: '0 12px 40px rgba(0,0,0,.2)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '80vh', overflow: 'hidden',
            }}>
                {/* ?§Îçî */}
                <div style={{
                    padding: '16px 20px 12px', borderBottom: '1px solid #f0f4f8',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                        ?ÑÎ°úÍ∑∏Îû® Í≤Ä??                    </span>
                    <button
                        type="button"
                        style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
                        onClick={onClose}
                    >√ó</button>
                </div>

                {/* Í≤Ä??Î∞?*/}
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f4f8', display: 'flex', gap: 8, flexShrink: 0 }}>
                    <select
                        name="searchCondition"
                        className="form-select"
                        style={{ width: 130 }}
                        value={tempParams.searchCondition}
                        onChange={handleInputChange}
                    >
                        <option value="">?†ÌÉù</option>
                        <option value="progrmFileNm">ÏΩîÎìú</option>
                        <option value="progrmKoreannm">?úÍ?Î™?/option>
                    </select>
                    <input
                        ref={inputRef}
                        name="searchKeyword"
                        type="text"
                        className="form-control"
                        placeholder="Í≤Ä?âÏñ¥Î•??ÖÎ†•?òÏÑ∏??
                        value={tempParams.searchKeyword}
                        onChange={handleInputChange}
                        onKeyDown={onKeyDown}
                    />
                    <button type="button" className="btn btn-outline-dark btn-outline__gray" onClick={onSearch}
                        style={{ whiteSpace: 'nowrap' }}>
                        Í≤Ä??                    </button>
                </div>

                {/* Í∑∏Î¶¨????Í≥†Ï†ï ?íÏù¥ + odd/even Ï§ÑÎ¨¥??*/}
                <div style={{ padding: '0 16px 4px', flexShrink: 0 }}>
                <div className="ag-theme-quartz" style={{ height: 420 }}>
                    <style>{`
                        .pgm-grid .ag-row-odd  { background-color: #f8fafc; }
                        .pgm-grid .ag-row-even { background-color: #ffffff; }
                        .pgm-grid .ag-row:hover { background-color: #eff6ff !important; }
                        .pgm-grid .ag-row-selected { background-color: #dbeafe !important; }
                        .pgm-grid .ag-header { background: #f1f5f9; font-weight: 600; font-size: 13px; }
                    `}</style>
                    <AgGridReact
                        className="pgm-grid"
                        columnDefs={columnDefs}
                        theme={themeQuartz}
                        defaultColDef={defaultColDef}
                        rowModelType="infinite"
                        pagination={true}
                        paginationPageSize={pageUnit}
                        paginationPageSizeSelector={[10, 20, 50]}
                        cacheBlockSize={pageUnit}
                        rowHeight={38}
                        overlayNoRowsTemplate="<span style='color:#94a3b8'>Í≤Ä??Í≤∞Í≥ºÍ∞Ä ?ÜÏäµ?àÎã§.</span>"
                        overlayLoadingTemplate="<span style='color:#94a3b8'>Ï°∞Ìöå Ï§?..</span>"
                        onGridReady={onGridReady}
                    />
                </div>
                </div>

                {/* ?òÎã® */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f4f8', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                        ?´Í∏∞
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProgramChoiceModal;
