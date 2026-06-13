import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

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
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                404
            </p>

            <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: 0,
            }}>
                페이지를 찾을수 없습니다.
            </h2>

            <p style={{
                fontSize: '15px',
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.6,
            }}>
                요청 하신 페이지가 없거나<br />
                잘못된 주소로 요청 하신거 같습니다.
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

export default NotFound;
