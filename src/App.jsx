import React from 'react';
import RootRoutes from './routes/index.jsx'
import '@/style/Modal.css'; 
console.log(`현재 환경: ${import.meta.env.MODE}`); // Vite 기준

function App() {
    return (
        <>
            <RootRoutes />
        </>
    )
}
export default App
