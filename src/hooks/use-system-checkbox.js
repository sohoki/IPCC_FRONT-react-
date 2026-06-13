import { useState, useCallback } from 'react';
import { useCustomReqDataCombo } from '@/hooks/use-combo-data.js';
import API_URL from '@/constants/URL.jsx';

const SYSTEM_PARAMS = { systemMenuUse: 'Y', systemNotcode: 'IPCC' };
const SYSTEM_MAPPING = { id: 'systemCode', text: 'systemName' };

/**
 * 시스템 권한 체크박스 관리 hook
 * - systemOptions: 시스템 목록 [{ code, codeNm }]  — useCustomReqDataCombo 로 자동 로드
 * - authRows: 체크된 시스템별 권한 행 [{ systemCode, systemName, authGubun, roleId, authDc }]
 * - setAuthRows: 수정 모드 진입 시 기존 authInfo 주입용
 * - isChecked(systemCode): 체크 여부
 * - handleSystemCheck(system, checked): 체크/해제
 * - updateAuthRow(systemCode, field, value): 개별 행 필드 수정
 */
export const useSystemCheckbox = () => {
    const { options: systemOptions } = useCustomReqDataCombo({
        url: API_URL.SERVER_SYSTEM_COMBO,
        params: SYSTEM_PARAMS,
        mapping: SYSTEM_MAPPING,
    });

    const [authRows, setAuthRows] = useState([]);

    const isChecked = useCallback(
        (systemCode) => authRows.some((r) => r.systemCode === systemCode),
        [authRows],
    );

    const handleSystemCheck = useCallback((system, checked) => {
        if (checked) {
            setAuthRows((prev) => [
                ...prev,
                { systemCode: system.code, systemName: system.codeNm, authGubun: 'AUTH_GUBUN_1', roleId: '', authDc: '' },
            ]);
        } else {
            setAuthRows((prev) => prev.filter((r) => r.systemCode !== system.code));
        }
    }, []);

    const updateAuthRow = useCallback((systemCode, field, value) => {
        setAuthRows((prev) =>
            prev.map((r) => (r.systemCode === systemCode ? { ...r, [field]: value } : r)),
        );
    }, []);

    return {
        systemOptions,
        authRows,
        setAuthRows,
        isChecked,
        handleSystemCheck,
        updateAuthRow,
    };
};
