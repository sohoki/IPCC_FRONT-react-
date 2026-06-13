import { useCallback } from 'react';
import IsoSwitch from '@/components/Common/IosSwitch';
// 라디오 그룹 렌더링 훅
export const useRadioGroup = (form, setter) => {
     const renderRadioGroup = ({ 
        label, 
        name, 
        options, 
        col = "col-6" ,
        useSwitch = false  // 토글 스위치 사용 여부
    }) => {
        // 토글 스위치 사용
        if (useSwitch && options.length === 2) {
            const isFirstOption = String(form[name] || '') === String(options[0].value);
            return (
                <div className={col} key={name}>
                    <div className="input-box">
                        <label className="form-label">{label}</label>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <IsoSwitch
                                value={isFirstOption ? 'Y' : 'N'}
                                name={name}
                                onChange={(updatedObj) => {
                                    // updatedObj = { [name]: 'Y' | 'N' }
                                    const isChecked = updatedObj[name] === 'Y';
                                    const newValue = isChecked ? options[0].value : options[1].value;
                                    setter((prev) => ({ ...prev, [name]: newValue }));
                                }}
                                onText={options[0].text}
                                offText={options[1].text}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        // 기존 라디오 버튼 렌더링 (useSwitch가 false 또는 options가 2개 이상인 경우)
        return (
            <div className={col} key={name}>
                <div className="input-box mb-3">
                    <label className="form-label">{label}</label>
                    <div className="input-group gap-2">
                        {options.map((opt) => (
                            <label key={opt.value} className="d-inline-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
                                <input
                                type="radio"
                                name={name}
                                className="form-check-input"
                                checked={form[name] === opt.value}
                                onChange={() => setter((prev) => ({ ...prev, [name]: opt.value }))}
                                />
                                <span>{opt.text}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
    return { renderRadioGroup };
}
//폼 리셋 훅
export const useResetForm = (setParams, initialValues) => {
    const handleReset = useCallback(() => {
        setParams(initialValues);
    }, [setParams, initialValues]);

    return { handleReset };
};