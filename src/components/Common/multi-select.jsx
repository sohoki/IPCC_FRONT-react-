import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Select from 'react-select';
import { tagFilterCnvt } from '../../utils/commonUtils';
import { components } from "react-select";

// ============================================================
// 상수 분리 - 렌더링마다 재생성되지 않도록
// ============================================================
const SELECT_STYLES = {
    valueContainer: (base) => ({
        ...base,
        flexWrap: 'nowrap',
        overflow: 'hidden',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
    }),
    multiValue: (base) => ({
        ...base,
        flex: '0 0 auto',
        maxWidth: '120px',
        backgroundColor: '#e2efff',
        borderRadius: '4px',
        marginRight: '4px',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#333',
        fontSize: '13px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#333',
        ':hover': { backgroundColor: '#d1e3ff', color: 'red' },
    }),
    option: (base, state) => ({
        ...base,
        color: '#333',
        backgroundColor: state.isFocused ? '#f0f7ff' : 'white',
        cursor: 'pointer',
    }),
    control: (base) => ({
        ...base,
        minHeight: '38px',
        backgroundColor: 'white',
        borderRadius: '8px',
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
};

const TOP_BUTTON_STYLE = {
    flex: 1,
    padding: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '4px',
    margin: '0 4px',
    color: '#333',
};

const BADGE_STYLE = {
    backgroundColor: '#4a90e2',
    color: '#fff',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 'bold',
    flexShrink: 0,
};

const CHECKBOX_CONTAINER_STYLE = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '4px 0',
};

const CHECKBOX_LABEL_STYLE = { color: '#333', fontSize: '14px' };
const CHECKBOX_INPUT_STYLE = { marginLeft: '8px', cursor: 'pointer', width: '16px', height: '16px' };

// ============================================================
// CheckboxOption - 메모이제이션 추가
// ============================================================
const CheckboxOption = React.memo((props) => (
    <components.Option {...props}>
        <div style={CHECKBOX_CONTAINER_STYLE}>
            <span style={CHECKBOX_LABEL_STYLE}>
                {props.data.label}
            </span>
            <input
                type="checkbox"
                checked={props.isSelected}
                readOnly
                style={CHECKBOX_INPUT_STYLE}
            />
        </div>
    </components.Option>
));

CheckboxOption.displayName = 'CheckboxOption';

// ============================================================
// CustomMenuList - 메모이제이션 추가
// ============================================================
const CustomMenuList = React.memo((props) => {
    const { selectProps, children } = props;
    const handleInputChange = (e) => {
        selectProps.onInputChange(e.target.value, { action: 'input-change' });
    };
    const stopProp = (e) => e.stopPropagation();
    return (
        <components.MenuList {...props}>
            <div
                style={{
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    zIndex: 10,
                    padding: '8px',
                    borderBottom: '1px solid #eee'
                }}
                onMouseDown={stopProp}
            >
                <input
                    type="text"
                    placeholder="검색하세요"
                    value={selectProps.inputValue || ""}
                    onChange={handleInputChange}
                    onMouseDown={stopProp}
                    onKeyDown={(e) => {
                        stopProp(e);
                        if (e.key === 'Escape') selectProps.onMenuClose();
                    }}
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#333',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button type="button" onMouseDown={stopProp} onClick={selectProps.onSelectAll} style={TOP_BUTTON_STYLE}>
                        전체 선택
                    </button>
                    <button type="button" onMouseDown={stopProp} onClick={selectProps.onClearAll} style={TOP_BUTTON_STYLE}>
                        전체 해제
                    </button>
                </div>
            </div>
            {children}
        </components.MenuList>
    );
});

CustomMenuList.displayName = 'CustomMenuList';

// ============================================================
// createSelectComponents - 컴포넌트 조합
// ============================================================
const createSelectComponents = (isMulti, selectedCount, placeholder) => ({
    MenuList: CustomMenuList,
    Option: CheckboxOption,
    Placeholder: (placeholderProps) => (
        <components.Placeholder {...placeholderProps} isDisabled={false}>
            {placeholder}
        </components.Placeholder>
    ),
    Control: ({ children, ...controlProps }) => (
        <components.Control {...controlProps}>
            {children}
            {isMulti && (
                <div style={{ display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
                    <span style={{
                        ...BADGE_STYLE,
                        backgroundColor: selectedCount > 0 ? '#4a90e2' : '#adb5bd',
                    }}>
                        {selectedCount}
                    </span>
                </div>
            )}
        </components.Control>
    ),
});

// ============================================================
// CustomMultiSelect - 구조 정리 및 최적화
// ============================================================
export const CustomMultiSelect = React.memo(({
    comboId,
    onData = [],
    onChange,
    isMulti,
    isClearable = true,
    placeholder = "선택",
    closeMenuOnSelect = false,
    hideSelectedOptions = false,
    value = [],
    ...props
}) => {
    const containerRef = useRef(null);
    const [inputValue, setInputValue] = useState("");
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setMenuIsOpen(false);
                setInputValue("");
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const options = useMemo(() =>
        onData.map((item) => ({
            value: item.code ?? item.id,
            label: tagFilterCnvt(item.codeNm) ?? tagFilterCnvt(item.text),
        }))
    , [onData]);

    const selectedValue = useMemo(() => {
        if (!value?.length) return isMulti ? [] : null;
        // ✅ 타입 통일 (이미 string이지만 안전하게)
        const valueStrings = value.map(String);
        return options.filter(opt => valueStrings.includes(String(opt.value)));
    }, [value, options, isMulti]);

    const selectedCount = isMulti ? (selectedValue?.length ?? 0) : 0;

    // ✅ selectedCount, isMulti, placeholder 바뀔 때만 components 재생성
    const selectComponents = useMemo(
        () => createSelectComponents(isMulti, selectedCount, placeholder),
        [isMulti, selectedCount, placeholder]
    );

    const handleChange = useCallback((selected) => {
        const rawValues = isMulti
            ? (selected?.map(s => s.value) ?? [])
            : (selected?.value ?? null);
        onChange?.(rawValues);
    }, [isMulti, onChange]);

    const handleSelectAll = useCallback(() =>
        onChange?.(options.map(opt => opt.value))
    , [onChange, options]);

    const handleClearAll = useCallback(() =>
        onChange?.([])
    , [onChange]);

    const handleInputChange = useCallback((val, action) => {
        if (action.action === 'input-change') setInputValue(val);
    }, []);

    const filterOption = useCallback((option, rawInput) =>
        option.label.toLowerCase().includes(rawInput.toLowerCase())
    , []);

    return (
        <div ref={containerRef} style={{ width: '100%', maxWidth: '350px', height: '32px' }}>
            <Select
                id={comboId}
                name={comboId}
                isMulti={isMulti}
                placeholder={placeholder}
                options={options}
                value={selectedValue}
                onChange={handleChange}

                menuIsOpen={menuIsOpen}
                onMenuOpen={() => setMenuIsOpen(true)}
                onMenuClose={() => {}}

                isSearchable={false}
                closeMenuOnSelect={closeMenuOnSelect}
                blurInputOnSelect={false}
                isClearable={isClearable}
                hideSelectedOptions={hideSelectedOptions}

                inputValue={inputValue}
                onInputChange={handleInputChange}
                filterOption={filterOption}
                styles={selectStyles}
                {...props}
                components={selectComponents} // ✅ useMemo로 안정화된 components
                onSelectAll={handleSelectAll}
                onClearAll={handleClearAll}
            />
        </div>
    );
});

CustomMultiSelect.displayName = 'CustomMultiSelect';


// ============================================================
// 상수 분리 - 렌더링마다 재생성되지 않도록
// ============================================================
const selectStyles = {
    valueContainer: (base) => ({
        ...base,
        flexWrap: 'nowrap',
        overflow: 'hidden',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
    }),
    multiValue: (base) => ({
        ...base,
        flex: '0 0 auto',
        maxWidth: '120px',
        backgroundColor: '#e2efff',
        borderRadius: '4px',
        marginRight: '4px',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#333',
        fontSize: '13px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'block',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#333',
        ':hover': { backgroundColor: '#d1e3ff', color: 'red' },
    }),
    option: (base, state) => ({
        ...base,
        color: '#333',
        backgroundColor: state.isFocused ? '#f0f7ff' : 'white',
        cursor: 'pointer',
    }),
    control: (base) => ({
        ...base,
        minHeight: '38px',
        backgroundColor: 'white',
        borderRadius: '8px',
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
};
