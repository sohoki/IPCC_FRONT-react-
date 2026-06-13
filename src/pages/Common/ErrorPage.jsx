import { useNavigate, useLocation } from 'react-router-dom';

const ERROR_META = {
    '404': { label: '페이지를 찾을 수 없습니다', desc: '요청하신 페이지가 존재하지 않거나\n이동되었을 수 있습니다.' },
    '403': { label: '접근 권한이 없습니다',     desc: '해당 페이지에 접근할 권한이 없습니다.\n관리자에게 문의하세요.' },
    '500': { label: '서버 오류가 발생했습니다', desc: '일시적인 서버 오류입니다.\n잠시 후 다시 시도해 주세요.' },
};


const GRADIENT = {
    '404': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
    '403': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    '500': 'linear-gradient(135deg, #ef4444 0%, #be123c 100%)',
};

const ErrorPage = ({ statusCode, message }) => {
    const navigate   = useNavigate();
    const location   = useLocation();

    const code       = String(location.state?.statusCode || statusCode || 500);
    const meta       = ERROR_META[code] ?? ERROR_META['500'];
    const finalMsg   = location.state?.message || message || meta.desc;
    const gradient   = GRADIENT[code] ?? GRADIENT['500'];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 'calc(100vh - 120px)',
            gap: '16px',
            textAlign: 'center',
            padding: '0 24px',
        }}>
            <p style={{
                fontSize: '120px',
                fontWeight: '800',
                lineHeight: 1,
                margin: 0,
                background: gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                {code}
            </p>

            <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
            }}>
                {meta.label}
            </h2>

            <p style={{
                fontSize: '15px',
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
            }}>
                {finalMsg}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: '1.5px solid #d1d5db',
                        background: '#fff',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    이전 페이지
                </button>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#2563eb',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                    }}
                >
                    로그인
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;
