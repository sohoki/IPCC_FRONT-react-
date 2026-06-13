import Switch from 'react-switch';

/**
 * 사용/미사용공통 공통 컴포넌트
 * @param {string}   value      - ?재?('Y' | 'N')
 * @param {string}   name       - updateForm???용???드?
 * @param {function} onChange   - 변??들??(checked => updateForm({ [name]: 'Y'|'N' }))
 * @param {string}   onText     - ON ?태 ?스??(기본: '사용')
 * @param {string}   offText    - OFF ?태 ?스??(기본: '미사용')
 * @param {boolean}  disabled   - 비활성화
 */
const IsoSwitch = ({
    value,
    name,
    onChange,
    onText   = '사용',
    offText  = '미사용',
    disabled = false,
    onColor  = '#34c759',
    offColor = '#9ca3af',
}) => {
    const checked = value === 'Y';

    const handleChange = (isChecked) => {
        onChange?.({ [name]: isChecked ? 'Y' : 'N' });
    };

    const maxTextLength = Math.max(onText.length, offText.length);
    const dynamicWidth = Math.max(90, 44 + maxTextLength * 14); // 텍스트 기반 너비

    const textStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap', // 줄바꿈 방지
    };

    return (
        <Switch
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            onColor={onColor}
            offColor={offColor}
            width={dynamicWidth}
            height={28}
            handleDiameter={22}
            checkedIcon={
                <div style={{ ...textStyle, paddingRight: '8px' }}>
                    {onText}
                </div>
            }
            uncheckedIcon={
                <div style={{ ...textStyle, paddingRight: '8px' }}>
                    {offText}
                </div>
            }
        />
    );
};

export default IsoSwitch;