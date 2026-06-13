import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format, parse, parseISO, isValid } from 'date-fns';
import { ko } from 'date-fns/locale';
import { computePopupPosition } from '@/utils/popupPosition';
import './date-picker.css';


// 상수 정의
const YEAR_RANGE = { from: 1960, to: 2099 };
const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const POPUP_Z_INDEX = 1060;
const POPUP_OFFSET = 8;

const MonthYearPicker = React.memo(({ selected, fromYear, toYear, onChange }) => {
    const [internalYear, setInternalYear] = useState(
        selected?.getFullYear() ?? new Date().getFullYear()
    );

    // selected가 외부에서 바뀌면 내부 연도도 동기화
    useEffect(() => {
        if (selected) setInternalYear(selected.getFullYear());
    }, [selected]);

    const currentMonth = selected?.getMonth() ?? -1;
    const years = useMemo(() => 
        Array.from({ length: toYear - fromYear + 1 }, (_, i) => fromYear + i),
        [fromYear, toYear]
    );

    return (
        <div style={{ padding: '12px 16px', width: '100%', boxSizing: 'border-box' }}>
             {/* 연도 선택 - 연도만 바꾸고 월은 그대로 유지 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                 <select
                    value={internalYear}
                    onChange={(e) => {
                        const newYear = +e.target.value;
                        setInternalYear(newYear);
                        // ✅ 이미 월이 선택된 상태면 연도 변경 시 같은 월로 onChange 호출
                        // ✅ 월이 선택 안 된 상태면 onChange 호출하지 않음
                        if (currentMonth >= 0) {
                            onChange(new Date(newYear, currentMonth, 1));
                        }
                    }}
                    style={{ border: '0.5px solid #ccc', borderRadius: '6px', padding: '4px 8px', fontSize: '13px' }}
                >
                    {years.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
            </div>

             {/* 월 그리드 - 월 클릭 시에만 onChange 호출 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', width: '100%' }}>
                {MONTHS.map((m, i) => (
                    <div
                        key={i}
                        onClick={() => onChange(new Date(internalYear, i, 1))}   // ✅ internalYear 사용
                        style={{
                            textAlign: 'center',
                            padding: '6px 4px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            background: i === currentMonth ? '#e6f1fb' : 'transparent',
                            color: i === currentMonth ? '#185fa5' : 'inherit',
                            fontWeight: i === currentMonth ? 500 : 400,
                        }}
                    >
                        {m}
                    </div>
                ))}
            </div>
        </div>
    );
});

MonthYearPicker.displayName = 'MonthYearPicker';

export const DatePickerInput = React.memo(({
    textId,
    placeholder = '시작일',
    value,
    onChange,
    offset = POPUP_OFFSET,
    type = 'date',
    ...props
}) => {
    const formatStr = useMemo(() => type === 'month' ? 'yyyyMM' : 'yyyy-MM-dd', [type]);

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const popupRef = useRef(null);

    

    const [popupStyle, setPopupStyle] = useState({
        position: 'fixed',
        top: -99999,
        left: -99999,
        visibility: 'hidden',
        zIndex: POPUP_Z_INDEX,
    });
    //년 월에 대한 수정 
    const selectedDate = useMemo(() => {
        if (!value) return undefined;
        // yyyyMM 형식을 인식하기 위해 parse 사용
        const date = typeof value === 'string' 
            ? (type === 'month' ? parse(value, 'yyyyMM', new Date()) : parseISO(value)) 
            : value;
        return isValid(date) ? date : undefined;
    }, [value, type]);

    const [navMonth, setNavMonth] = useState(selectedDate || new Date());

    // 외부 클릭 닫기
    useEffect(() => {
        if (!isOpen) return;
        const onDown = (e) => {
        const c = containerRef.current;
        const p = popupRef.current;
        if (c && c.contains(e.target)) return;
        if (p && p.contains(e.target)) return;
        setIsOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [isOpen]);

    // ESC 닫기
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => e.key === 'Escape' && setIsOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen]);

    const updatePosition = useCallback(() => {
        const inputEl = inputRef.current;
        const popupEl = popupRef.current;
        if (!inputEl || !popupEl) return;
        const { top, left } = computePopupPosition(inputEl, popupEl, offset);
        const width = inputEl.getBoundingClientRect().width;  // ✅ 너비 계산
        setPopupStyle((s) => ({ ...s, top, left, width }));   // ✅ 너비 반영
    }, [offset]);

    useLayoutEffect(() => {
        if (!isOpen) return;

        let raf1, raf2;
        const onAfterPaint = () => {
        raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
            updatePosition();
            setPopupStyle((s) => ({ ...s, visibility: 'visible' }));
            });
        });
        };
        onAfterPaint();

        const onResizeOrScroll = () => updatePosition();
        window.addEventListener('resize', onResizeOrScroll);
        window.addEventListener('scroll', onResizeOrScroll, true);

        const ro = new ResizeObserver(updatePosition);
        if (popupRef.current) ro.observe(popupRef.current);

        return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
        window.removeEventListener('resize', onResizeOrScroll);
        window.removeEventListener('scroll', onResizeOrScroll, true);
        ro.disconnect();
        };
    }, [isOpen, updatePosition]);


    const handleSelect = useCallback((date) => {
        if (date && type === 'date') {
            onChange(format(date, 'yyyy-MM-dd'));
            setIsOpen(false);
        }
    }, [onChange, type]);

    // 포털 대상: 가장 가까운 모달이 있으면 그 안에, 없으면 body
    const portalTarget = useMemo(() => {
        const el = inputRef.current;
        return (el?.closest?.('.modal') || el?.closest?.('[role="dialog"]') || document.body);
    }, []); // ref는 불변이므로 의존성 배열 비움
    
    return (
        <div
        ref={containerRef}
        className="datepicker-container"
        style={{ position: 'relative', display: 'inline-block', width: '100%' }}
        >
        <input
            ref={inputRef}
            id={textId}
            name={textId}
            type="text"
            className="form-select"
            readOnly
            autoComplete="off"
            placeholder={type === 'month' ? '월 선택' : placeholder}
            value={value || ''}
            onClick={() => setIsOpen((prev) => !prev)}
            style={{ paddingRight: '2rem', cursor: 'pointer' }}
            {...props}
        />
        <span
            onClick={() => setIsOpen((prev) => !prev)}
            style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zM9 14H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
            </svg>
        </span>

        {isOpen && createPortal(
            <div ref={popupRef} style={{
                ...popupStyle,
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                overflow: 'fit-content',
                width: 'max-content',
                minWidth: inputRef.current?.offsetWidth,
            }}>
                {type === 'month' ? (
                    <MonthYearPicker
                        selected={selectedDate}
                        fromYear={YEAR_RANGE.from}
                        toYear={YEAR_RANGE.to}
                        onChange={(date) => {
                            onChange(format(date, formatStr));
                            setIsOpen(false);
                        }}
                    />
                ) : (
                    <DayPicker
                        mode="single"
                        locale={ko}
                        selected={selectedDate}
                        onSelect={handleSelect}
                        month={navMonth} 
                        onMonthChange={(date) => {
                            setNavMonth(date);
                            if (type === 'month') {
                                setTimeout(updatePosition, 0);
                                onChange(format(date, formatStr));
                                setIsOpen(false);
                            } else {
                                updatePosition();
                            }
                        }}
                        captionLayout="dropdown"  
                        fromYear={YEAR_RANGE.from}
                        toYear={YEAR_RANGE.to}
                        styles={type === 'month' ? {
                            month_grid: { display: 'none' },
                            weekdays: { display: 'none' },
                        } : undefined}
                    />
                )}
            </div>,
            portalTarget
        )}
        </div>
    );
});

DatePickerInput.displayName = 'DatePickerInput20260613';
