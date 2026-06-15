import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import Swal from '@/lib/swal.js';
import URL from '@/constants/URL.jsx';
import CODE from '@/constants/CODE.jsx';
import { useSafeFormatter } from '@/hooks/use-formatters.jsx';

// TODO: 이전 프로젝트의 탭 컴포넌트를 ./components/ 폴더로 이동 후 아래 플레이스홀더를 교체하세요
const HotelTabInfo  = ({ comCode }) => <div className="p-4 text-muted small">호텔 및 객실 관리 — 컴포넌트 준비 중 (comCode: {comCode})</div>;
const OptionTabInfo = ({ comCode }) => <div className="p-4 text-muted small">옵션 관리 — 컴포넌트 준비 중 (comCode: {comCode})</div>;
const ManageTabInfo = ({ comCode }) => <div className="p-4 text-muted small">관리자 관리 — 컴포넌트 준비 중 (comCode: {comCode})</div>;

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

const tabContainerStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    borderBottom: 'none',
};

export default function VendorDetailInfo() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { comCode } = useParams();
    const comGubun = searchParams.get('comGubun') || 'COM_GUBUN_2';

    const headerTitle = comGubun === 'COM_GUBUN_1' ? '공급사 관리' : '판매사 관리';
    const breadSecond = comGubun === 'COM_GUBUN_1' ? '공급사 관리' : '판매사 관리';
    const defaultTab  = comGubun === 'COM_GUBUN_1' ? 'hotel' : 'member';

    const [activeTab, setActiveTab] = useState(defaultTab);
    const [loading, setLoading]     = useState(true);
    const [vendor, setVendor]       = useState(null);
    const { safe } = useSafeFormatter();

    useEffect(() => {
        if (!comCode) return;
        queueMicrotask(() => setLoading(true));
        const fetchData = async () => {
            try {
                const res = await fnAjaxFetch({
                    url: `${URL.VENDER_INFO}/${encodeURIComponent(comCode)}.do`,
                    method: 'GET',
                });
                const json = res?.data;
                if (json?.resultCodeInfo === 'SUCCESS') {
                    setVendor(json?.result?.result ?? null);
                } else {
                    await Swal.fire({
                        icon: CODE.WARNING,
                        title: '경고',
                        text: json?.resultMessage || '데이터를 불러오지 못했습니다.',
                    });
                }
            } catch (e) {
                await Swal.fire({
                    icon: CODE.ERROR,
                    title: '오류',
                    text: e?.message || '상세 조회 오류',
                });
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [comCode, navigate]);

    const fn_showGrid = useCallback((tabName) => {
        setActiveTab((prev) => (prev === tabName ? prev : tabName));
    }, []);

    const renderActiveTab = useMemo(() => {
        switch (activeTab) {
        case 'hotel':
            return <HotelTabInfo comCode={comCode} comCodeName={vendor?.comName} />;
        case 'option':
            return <OptionTabInfo comCode={comCode} />;
        case 'member':
        default:
            return <ManageTabInfo comCode={comCode} />;
        }
    }, [activeTab, vendor, comCode]);

    return (
        <div className="row g-0 main-contents">
            <div className="col-12 content-header">
                <div className="content-header__title">{headerTitle}</div>
                <div className="content-header__breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">거래처 관리</li>
                        <li className="breadcrumb-item">{breadSecond}</li>
                        <li className="breadcrumb-item">{vendor?.comName || ''}</li>
                    </ol>
                </div>
            </div>

            <div className="col-12 content-information">
                <div className="partner-detail-box">
                    <div className="row partner-detail__name">
                        <div className="col-12">
                            <span>{breadSecond} 정보</span>
                            {!loading && <p>{safe(vendor?.comName)}</p>}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <span>사업자 등록번호</span>
                            {!loading && <p>{safe(vendor?.comNumber)}</p>}
                        </div>
                        <div className="col-4">
                            <span>주소</span>
                            {!loading && vendor && (
                                <p>
                                    [{safe(vendor.comZipcode)}]<br />
                                    {safe(vendor.comAddr1)} {safe(vendor.comAddr2)}
                                </p>
                            )}
                        </div>
                        <div className="col-4">
                            <span>홈페이지 주소</span>
                            {!loading && <p>{safe(vendor?.comHomepage)}</p>}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4">
                            <span>전화번호</span>
                            {!loading && <p>{safe(vendor?.comTel)}</p>}
                        </div>
                        <div className="col-4">
                            <span>팩스 전화번호</span>
                            {!loading && <p>{safe(vendor?.comFax)}</p>}
                        </div>
                        <div className="col-4">
                            <span>고객센터 전화번호</span>
                            {!loading && <p>{safe(vendor?.comConnectTel)}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-12 content-tabs">
                <ul className="nav nav-underline nav-underline__wrap" id="myTab" role="tablist" style={tabContainerStyle}>
                    {comGubun === 'COM_GUBUN_1' && (
                        <>
                            <li className="nav-item me-2" role="presentation">
                                <button
                                    type="button"
                                    id="hotel-tab"
                                    className={`nav-link${activeTab === 'hotel' ? ' active' : ''}`}
                                    style={tabBtnStyle(activeTab === 'hotel')}
                                    data-bs-toggle="tab"
                                    role="tab"
                                    aria-controls="contentHotelRoom"
                                    aria-selected={activeTab === 'hotel'}
                                    onClick={() => fn_showGrid('hotel')}
                                >
                                    호텔 및 객실 관리
                                </button>
                            </li>
                            <li className="nav-item me-2" role="presentation">
                                <button
                                    type="button"
                                    id="option-tab"
                                    className={`nav-link${activeTab === 'option' ? ' active' : ''}`}
                                    style={tabBtnStyle(activeTab === 'option')}
                                    data-bs-toggle="tab"
                                    role="tab"
                                    aria-controls="contentOptions"
                                    aria-selected={activeTab === 'option'}
                                    onClick={() => fn_showGrid('option')}
                                >
                                    옵션 관리
                                </button>
                            </li>
                        </>
                    )}
                    <li className="nav-item me-2" role="presentation">
                        <button
                            type="button"
                            id="member-tab"
                            className={`nav-link${activeTab === 'member' ? ' active' : ''}`}
                            style={tabBtnStyle(activeTab === 'member')}
                            data-bs-toggle="tab"
                            role="tab"
                            aria-controls="contentAdmin"
                            aria-selected={activeTab === 'member'}
                            onClick={() => fn_showGrid('member')}
                        >
                            관리자 관리
                        </button>
                    </li>
                </ul>
            </div>

            <div className="col-12">
                <div className="tab-content" id="myTabContent">
                    {renderActiveTab}
                </div>
            </div>
        </div>
    );
}
