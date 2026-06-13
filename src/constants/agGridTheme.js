import { themeMaterial } from 'ag-grid-community';

export const gridTheme = themeMaterial.withParams({
    // ── Header ──────────────────────────────────────────────────────────────
    headerBackgroundColor:          '#1E293B', // slate-800
    headerTextColor:                '#F1F5F9', // slate-100
    headerForegroundColor:          '#F1F5F9',
    headerFontWeight:               700,
    headerFontSize:                 12,
    headerHeight:                   44,
    headerCellHoverBackgroundColor: '#2D4263', // slate-800 lighter on hover
    headerColumnBorder:             { style: 'solid', width: 1, color: '#334155' }, // slate-700
    headerColumnResizeHandleColor:  '#6366F1', // indigo-500

    // ── Accent & brand ──────────────────────────────────────────────────────
    accentColor: '#6366F1', // indigo-500

    // ── Rows ────────────────────────────────────────────────────────────────
    backgroundColor:              '#FFFFFF',
    foregroundColor:              '#1E293B',
    oddRowBackgroundColor:        '#F8FAFC', // slate-50  (subtle stripe)
    rowHoverColor:                '#EEF2FF', // indigo-50
    selectedRowBackgroundColor:   '#E0E7FF', // indigo-100

    // ── Borders & spacing ───────────────────────────────────────────────────
    borderColor:  '#E2E8F0', // slate-200
    fontSize:     13,
    rowHeight:    40,
});
