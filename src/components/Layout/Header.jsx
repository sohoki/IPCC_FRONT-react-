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
                <div className="header-theme-toggle" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isDark ? (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c6d3d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="다크 모드">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    ) : (
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c6d3d8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" title="라이트 모드">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/>
                            <line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/>
                            <line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                        </svg>
                    )}
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
