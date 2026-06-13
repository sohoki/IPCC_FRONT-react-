import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation(); 

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
    }
    , [pathname]);
    // UI를 렌더링하지 않는 유틸 컴포넌트
    return null;
}