import { useMemo } from 'react';

const RULES = [
    { key: 'len',     label: '8자 이상',               test: (v) => v.length >= 8 },
    { key: 'alpha',   label: '영문자 포함',             test: (v) => /[a-zA-Z]/.test(v) },
    { key: 'number',  label: '숫자 포함',               test: (v) => /[0-9]/.test(v) },
    { key: 'special', label: '특수문자 포함 (!@#$%^&*)', test: (v) => /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/.test(v) },
];

export const usePwdValidate = (pwd = '') => {
    const rules = useMemo(() =>
        RULES.map((r) => ({ ...r, passed: r.test(pwd) })),
    [pwd]);

    const isValid = rules.every((r) => r.passed);

    return { rules, isValid };
};
