import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSidebar } from '@/hooks/use-sidebar.js';
import '@/style/SideBar.css';

// 폴더 아이콘 (기본 아이콘)
const FolderIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 7C3 5.9 3.9 5 5 5H10L12 7H19C20.1 7 21 7.9 21 9V17C21 18.1 20.1 19 19 19H5C3.9 19 3 18.1 3 17V7Z"
            fill="currentColor" opacity=".85"/>
    </svg>
);

// 메뉴 아이콘 (토글)
const MenuIcon = ({ open }) => (
    open ? (
        // 기 (chevron left)
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    ) : (
        // 메뉴 버튼
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round"/>
        </svg>
    )
);

// 화살표 아이콘 (하단)
const ChevronDown = () => (
    <svg className="sb-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// 사이드바 스켈레톤
const SideBarSkeleton = ({ open }) => (
    <aside className={`sb-root ${open ? 'sb-open' : ''}`}>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,.07)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                }}/>
            ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
    </aside>
);


const SideBar = () => {
    const {
        isOpenSideBar,
        toggleSideBar,
        loading,
        parents,
        childrenByParent,
        openParents,
        activeParentNo,
        menuNoInt,
        toggleParent,
        buildMenuUrl,
    } = useSidebar();

    // 사이드바 열기/닫기에 따라 body에 data-sb 속성 추가/제거
    useEffect(() => {
        document.body.setAttribute('data-sb', isOpenSideBar ? 'open' : 'closed');
        return () => document.body.removeAttribute('data-sb');
    }, [isOpenSideBar]);

    if (loading) return <SideBarSkeleton open={isOpenSideBar} />;

    return (
        <aside className={`sb-root ${isOpenSideBar ? 'sb-open' : ''}`}>
            {/* 사이드바 토글 버튼 */}
            <button
                type="button"
                className="sb-toggle"
                onClick={toggleSideBar}
                title={isOpenSideBar ? '메뉴 1기' : '메뉴 1차'}
            >
                <MenuIcon open={isOpenSideBar} />
            </button>

            <div className="sb-divider" />

            {/* 사이드바 메뉴 */}
            <nav className="sb-nav">
                {parents.map((m) => {
                    const pNo    = Number(m.menu_no);
                    const opened = openParents.has(pNo);
                    const active = activeParentNo === pNo;
                    const iconSrc = m.relate_image_nm
                        ? `/upload/${m.relate_image_nm.trim()}`
                        : null;
                    const children = childrenByParent[pNo] || [];

                    return (
                        <div key={pNo}>
                            {/* 1차 메뉴 */}
                            <button
                                type="button"
                                className={`sb-item ${active ? 'sb-active' : ''}`}
                                aria-expanded={opened}
                                onClick={() => toggleParent(pNo)}
                                title={!isOpenSideBar ? m.menu_nm?.replace(/\s/g, '') : undefined}
                            >
                                <span className="sb-icon">
                                    {iconSrc
                                        ? <img src={iconSrc} alt="" />
                                        : <FolderIcon />
                                    }
                                </span>

                                <span className="sb-label">
                                    {m.menu_nm?.replace(/\s/g, '')}
                                </span>

                                {children.length > 0 && <ChevronDown />}
                            </button>

                            {/* 2차 메뉴 */}
                            {children.length > 0 && (
                                <div className={`sb-sub ${opened && isOpenSideBar ? 'sb-sub-open' : ''}`}>
                                    {children.map((c) => {
                                        const childActive = Number(c.menu_no) === menuNoInt;
                                        return (
                                            <Link
                                                key={c.menu_no}
                                                to={buildMenuUrl(c)}
                                                className={`sb-sub-item ${childActive ? 'sb-sub-active' : ''}`}
                                            >
                                                {c.menu_nm?.replace(/\s/g, '')}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
};

export default SideBar;
