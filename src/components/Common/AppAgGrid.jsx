import { AgGridReact } from 'ag-grid-react';
import { useCallback, useEffect, useRef } from 'react';

/**
 * AgGridReact 래퍼 — 사이드바 토글 후 'sb:resized' 커스텀 이벤트를 받아
 * api.sizeColumnsToFit()을 호출하여 flex 컬럼 너비를 재계산합니다.
 */
const AppAgGrid = ({ onGridReady: externalOnGridReady, ...props }) => {
    const apiRef = useRef(null);

    useEffect(() => {
        const handler = () => apiRef.current?.sizeColumnsToFit();
        window.addEventListener('sb:resized', handler);
        return () => window.removeEventListener('sb:resized', handler);
    }, []);

    const handleGridReady = useCallback((params) => {
        apiRef.current = params.api;
        externalOnGridReady?.(params);
    }, [externalOnGridReady]);

    return <AgGridReact onGridReady={handleGridReady} {...props} />;
};

export default AppAgGrid;
