import React from 'react';
import Profile from '@/components/profile/Profile.jsx';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import UseSwitch from '@/components/Common/IosSwitch.jsx';

const Header = ({
    managerInfo,
    profileRef,
    showProfile,
    setShowProfile,
    loginText,
    handleLogout,
    handleOpenEditModal,
}) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <header>
            <img src="/resource/img/logo.svg" alt="" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div className="header-theme-toggle">
                    <span style={{ color: '#c6d3d8', fontSize: 11, userSelect: 'none', lineHeight: 1 }}>
                        {isDark ? '다크' : '라이트'}
                    </span>
                    <UseSwitch
                        value={isDark ? 'Y' : 'N'}
                        name="darkMode"
                        onChange={toggleTheme}
                        onText="Dark"
                        offText="Light"
                        onColor="#4B92FF"
                        offColor="#6b7280"
                    />
                </div>
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
            </div>
        </header>
    );
};

export default Header;
