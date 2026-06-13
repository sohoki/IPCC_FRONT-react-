import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SideBar from '@/components/layout/SideBar.jsx';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';
import { getCookie } from '@/lib/cookie.jsx';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import API_URL from '@/constants/URL.jsx';
import Swal from 'sweetalert2';
import { alert } from '@/lib/alert.js';


const ManagerFormModal = lazy(() => import('@/pages/backoffice/HrInfo/components/ManagerFormModal'));

export default function AppLayout() {
    const navigate = useNavigate();
    const profileRef = useRef(null);

    // 쿠키는 동기 읽기 → lazy initializer 로 첫 렌더에 바로 세팅, useEffect 불필요
    const [managerInfo] = useState(() => ({
        managerName: getCookie('adminName')  || '사용자',
        managerId:   getCookie('adminId')    || 'user',
        managerEmail: getCookie('adminEmail') || '',
        managerPic:   getCookie('userPic')   || '',
    }));
    // loginText 는 managerInfo 파생값 → 별도 state 불필요
    const loginText = `${managerInfo.managerName} (${managerInfo.managerId})`;

    const [showProfile, setShowProfile] = useState(false);
    const [showManagerModal, setShowManagerModal] = useState(false);
    const [managerForm, setManagerForm] = useState(null);

    useEffect(() => {
        if (!showProfile) return;
        const handleClickOutside = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfile]);

    const handleOpenEditModal = () => {
        setManagerForm({
            mode: 'Edt',
            managerId:   managerInfo?.managerId   || '',
            managerName: managerInfo?.managerName || '',
        });
        setShowManagerModal(true);
    };

    const handleLogout = async () => {
        try {
            const res = await fnAjaxFetch({
                url: API_URL.LOGOUT_PROCESS,
                method: 'GET',
                withCredentials: true,
            });
            const partId = res?.data?.result?.partId;
            navigate(partId === 'VENDER' ? '/loginPartners' : '/login');
        } catch (error) {
            // HandledError: fnAjaxFetch 내부에서 이미 Swal 처리됨 → 중복 표시 방지
            if (error.name === 'HandledError') return;
            await alert.error(`로그아웃 중 오류가 발생했습니다. ${error}`, '로그아웃 실패');
        }
    };

    return (
        <div className="wrapper">
            <Header
                profileRef={profileRef}
                showProfile={showProfile}
                setShowProfile={setShowProfile}
                loginText={loginText}
                managerInfo={managerInfo}
                handleLogout={handleLogout}
                handleOpenEditModal={handleOpenEditModal}
            />
            <section>
                <SideBar />
                <Outlet />
            </section>
            <Footer />

            {showManagerModal && managerForm && (
                <Suspense fallback={null}>
                    <ManagerFormModal
                        open={showManagerModal}
                        form={managerForm}
                        onClose={() => setShowManagerModal(false)}
                        onSubmit={() => setShowManagerModal(false)}
                        onDelete={() => setShowManagerModal(false)}
                    />
                </Suspense>
            )}
        </div>
    );
}
