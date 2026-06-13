import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MoonFill, SunFill } from 'react-bootstrap-icons';

function ThemeToggle() {
    const [theme, setTheme] = useState('light');

    // 테마 상태가 바뀔 때마다 html 태그의 data-bs-theme 속성 업데이트
    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <Button variant={theme === 'light' ? 'outline-dark' : 'outline-light'} onClick={toggleTheme}>
            {theme === 'light' ? <MoonFill /> : <SunFill />}
        </Button>
    );
}
