import { Outlet } from 'react-router-dom';
import AuthHeader from '@/components/layout/AuthHeader.jsx';
import Footer from '@/components/layout/Footer.jsx';

const AppTopDownLayout = () => {
    return (
        <div className="wrapper">
            <AuthHeader />
            <main style={{ minHeight: 'calc(100vh - 120px)' }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AppTopDownLayout;
