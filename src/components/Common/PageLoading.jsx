import React from 'react';

/**
 * MUI CircularProgress ? 페이지 로딩
 * Suspense fallback 
*/
const PageLoading = () => (
    <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.85)',
        zIndex: 9999,
        gap: '16px',
    }}>
        {/* MUI CircularProgress SVG */}
        <svg
            viewBox="22 22 44 44"
            width="48"
            height="48"
            style={{ animation: 'muiloading-rotate 1.4s linear infinite' }}
        >
            <circle
                cx="44"
                cy="44"
                r="20.2"
                fill="none"
                stroke="#1976d2"
                strokeWidth="3.6"
                strokeDasharray="80px, 200px"
                strokeDashoffset="0"
                strokeLinecap="round"
                style={{ animation: 'muiloading-dash 1.4s ease-in-out infinite' }}
            />
        </svg>

        <style>{`
            @keyframes muiloading-rotate {
                100% { transform: rotate(360deg); }
            }
            @keyframes muiloading-dash {
                0%   { stroke-dasharray: 1px, 200px; stroke-dashoffset: 0; }
                50%  { stroke-dasharray: 100px, 200px; stroke-dashoffset: -15px; }
                100% { stroke-dasharray: 100px, 200px; stroke-dashoffset: -125px; }
            }
        `}</style>
    </div>
);

export default PageLoading;
