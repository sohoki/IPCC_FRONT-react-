import React, { useState, lazy, Suspense } from 'react';
import PageLoading from '@/components/Common/PageLoading.jsx';

const QueueTab    = lazy(() => import('./components/QueueTab.jsx'));
const ExchangeTab = lazy(() => import('./components/ExchangeTab.jsx'));

const TABS = [
  { key: 'queue',    label: 'Queue 관리' },
  { key: 'exchange', label: 'Exchange 관리' },
];

const tabBtnStyle = (isActive) => ({
  padding: '12px 20px',
  fontSize: '14px',
  border: 'none',
  background: isActive ? '#0d6efd' : '#e9ecef',
  color: isActive ? '#fff' : '#495057',
  fontWeight: isActive ? 'bold' : 'normal',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  borderRight: '1px solid #dee2e6',
  borderBottom: '3px solid #0d6efd',
  borderRadius: '8px 8px 0 0',
  transition: 'all 0.2s',
  position: 'relative',
  zIndex: isActive ? 1 : 0,
  opacity: isActive ? 1 : 0.7,
});

const QueueInfo = () => {
    const [activeTab, setActiveTab] = useState('queue');

    



    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">메세지 Queue/Exchange 관리</div>
                <div className="content-header__breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">시스템 관리</li>
                    <li className="breadcrumb-item">메세지 Queue/Exchange 관리</li>
                </ol>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="col-12" style={{ display: 'flex', alignItems: 'flex-end', padding: '0 0 0 12px', borderBottom: '2px solid #0d6efd' }}>
                {TABS.map(({ key, label }) => (
                <button key={key} style={tabBtnStyle(activeTab === key)} onClick={() => setActiveTab(key)}>
                    {label}
                </button>
                ))}
            </div>

            {/* 탭 컨텐츠 */}
            <Suspense fallback={<PageLoading />}>
                {activeTab === 'queue'    && <QueueTab />}
                {activeTab === 'exchange' && <ExchangeTab />}
            </Suspense>
        </div>
    );
};

export default QueueInfo;
