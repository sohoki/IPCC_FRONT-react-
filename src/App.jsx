import React from 'react';
import RootRoutes from './routes/index.jsx';
import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import '@/style/Modal.css';
import '@/style/DarkMode.css';
console.log(`현재 환경: ${import.meta.env.MODE}`); // Vite 기준

function App() {
    return (
        <ThemeProvider>
            <RootRoutes />
        </ThemeProvider>
    );
}
export default App;
