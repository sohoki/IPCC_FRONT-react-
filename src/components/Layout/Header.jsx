import React from 'react';
import Profile from '@/components/profile/Profile.jsx';

const Header = ({
    managerInfo,
    profileRef,
    showProfile,
    setShowProfile,
    loginText,
    handleLogout,
    handleOpenEditModal,
}) => {
    return (
        <header>
            <img src="/resource/img/logo.svg" alt="" />
            <div className="dropdown" ref={profileRef} style={{ position: 'relative' }}>
                <div
                    className="header-user-info"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowProfile(prev => !prev)}
                >
                    <img src="/resource/img/ic_header_user.svg" alt="" />
                    <span id="sp_loginId">{loginText}</span>
                </div>
                {showProfile && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            zIndex: 9999,
                            marginTop: '8px',
                            width: '360px',
                        }}
                    >
                        <Profile
                            managerInfo={managerInfo}
                            onLogout={handleLogout}
                            onClose={() => setShowProfile(false)}
                            onEditProfile={handleOpenEditModal}
                        />
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
