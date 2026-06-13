import React, { useState, useEffect, useRef } from 'react';

/*
* 공통 유틸
* 데이터 받아서 select 박스 만들어 주는 것
*/
export const  CommonSelect = React.memo(({ 
    comboData=[],
    comboId,  
    valueGubun = "TEXT", 
    placeholder = "선택",
    addData=[],
    onChange,
    value,
    ...props 
}) => {
    
    return (
        <select id={comboId} name={comboId} value={value} onChange={onChange} {...props}  
            >
            <option value="">{placeholder}</option>
            {/* addData 가 있을 때만 렌더링 */}
            {addData && addData.map((item, index) => (
                <option key={item.code || index} value={item.code}>
                    {item.codeNm}
                </option>
            ))}
            {/* comboData가 있을 때만 렌더링 */}
            {comboData && comboData.map((item, index) => (
                <option 
                    key={item.code || index} // 고유값인 code를 key로 사용 권장
                    value={valueGubun === "CODE" ? item.codeNm : item.code}
                >
                    {item.codeNm}
                </option>
            ))}
        </select>
    );
})

export const CommonSearchSelect = React.memo(({
    comboData = [],
    comboId,
    valueGubun = "TEXT",
    placeholder = "선택",
    onChange,
    value,
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapRef = useRef(null);
    const searchRef = useRef(null);
    const triggerRef = useRef(null);  // ✅ 추가

    const getVal = (item) => valueGubun === "CODE" ? item.codeNm : item.code;
    const selectedLabel = comboData.find(item => getVal(item) === value)?.codeNm ?? placeholder;
    const filtered = comboData.filter(item => item.codeNm?.includes(query));

    // ✅ 닫기 함수 — 포커스 해제 포함
    const handleClose = () => {
        setOpen(false);
        // 모달이 #root에 aria-hidden 걸기 전에 포커스 제거
        setTimeout(() => {
            triggerRef.current?.blur();
        }, 0);
    };

    // ✅ 열기 함수 — 버튼 클릭 시
    const handleToggle = () => {
        if (open) {
            handleClose();
        } else {
            setOpen(true);
        }
    };

    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                handleClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    useEffect(() => {
        if (open) {
            setQuery("");
            searchRef.current?.focus();
        }
    }, [open]);

    const handleSelect = (val) => {
        onChange?.({
            target: { id: comboId, name: comboId, value: val }
        });
        handleClose();
    };

    return (
        <div
            ref={wrapRef}
            style={{ position: "relative", display: "inline-block", minWidth: 160 }}
            {...props}
        >
            {/* 트리거 버튼 */}
            <button
                ref={triggerRef}          // ✅ ref 연결
                id={comboId}
                name={comboId}
                type="button"             // ✅ form submit 방지
                data-value={value} 
                onClick={handleToggle}
                style={{
                    width: "100%",
                    height: 36,
                    padding: "0 28px 0 10px",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    background: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {selectedLabel}
            </button>

            {/* 드롭다운 */}
            {open && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    width: "100%",
                    background: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    zIndex: 9999,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                    overflow: "hidden",
                }}>
                    {/* 검색 input */}
                    <input
                        ref={searchRef}
                        type="text"           // ✅ type="text" 명시 — "select" 아님
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="검색..."
                        style={{
                        width: "100%", boxSizing: "border-box", padding: "6px 10px",
                        border: "none", borderBottom: "1px solid #eee",
                        outline: "none", fontSize: 13, background: "#f9f9f9",
                        }}
                    />

                    {/* 옵션 목록 */}
                    <div style={{ maxHeight: 200, overflowY: "auto" }}>
                        <div
                            onClick={() => handleSelect("")}
                            style={{ padding: "7px 10px", cursor: "pointer", fontSize: 13, color: "#999" }}
                        >
                            {placeholder}
                        </div>
                        {filtered.length === 0 ? (
                            <div style={{ padding: "10px", fontSize: 13, color: "#999", textAlign: "center" }}>
                                결과 없음
                            </div>
                        ) : (
                            filtered.map((item, index) => {
                                const val = valueGubun === "CODE" ? item.codeNm : item.code;
                                return (
                                    <div
                                        key={item.code || index}
                                        onClick={() => handleSelect(val)}
                                        style={{
                                            padding: "7px 10px", cursor: "pointer", fontSize: 13,
                                            background: value === val ? "#f0f4ff" : "transparent",
                                            color: value === val ? "#3b5bdb" : "inherit",
                                            fontWeight: value === val ? 500 : 400,
                                        }}
                                    >
                                        {item.codeNm}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});