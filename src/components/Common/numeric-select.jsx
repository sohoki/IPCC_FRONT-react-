import React, { useMemo } from 'react';
/**
 * 숫자 범위 옵션 생성 커스텀 훅
 * @param {number} start - 시작 숫자
 * @param {number} end - 끝 숫자
 * @param {string} suffix - 숫자 뒤에 붙일 단위 (예: '시', '분', '개')
 * @returns {Array} [{ value: '01', label: '01시' }, ...] 형태의 배열
 */
export const NumericSelect = ({
    comboId, 
    start, 
    end, 
    value, // 부모로부터 들어오는 값 (숫자일 수도, 문자일 수도 있음)
    onChange, 
    placeholder, 
    suffix = "",
    padZero = true,
    ...props 
}) => {
    const options = useMemo(() => {
        const range = [];
        const first = Math.min(Number(start), Number(end));
        const last = Math.max(Number(start), Number(end));
        const isReverse = Number(start) > Number(end);

        for (let i = first; i <= last; i++) {
             // value는 비교를 위해 원본 숫자 또는 패딩된 문자열 선택 가능
            // 여기서는 선택 유지력을 높이기 위해 i를 그대로 value로 씁니다.
            const valStr = (padZero && i >= 0 && i < 10) ? `0${i}` : String(i);
            range.push({
                value: String(i), // 🔹 실제 매칭값은 숫자를 문자열화한 "1", "2"
                label: `${valStr}${suffix}`, // 🔹 화면 표시만 "01", "02"
            });
        }
        return isReverse ? range.reverse() : range;
    }, [start, end, suffix, padZero]);

    return (
        <select 
            id={comboId} 
            name={comboId} 
            // 🔹 부모의 value가 숫자 1이어도 "1"로 변환해 <option value="1">과 매칭시킴
            value={value !== null && value !== undefined ? String(value) : ""} 
            onChange={onChange} 
            className="form-select"
            {...props}
        >
            <option value="">{placeholder}</option>
            {options.map((item) => (
                <option key={item.value} value={item.value}>
                    {item.label}
                </option>
            ))}
        </select>
    );
};