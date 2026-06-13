import Swal from '@/lib/swal.js';
import { parseISO, isBefore } from 'date-fns';
export const useDateValidation =  () => {
    /**
     * @param {Object} options
     * @param {string} options.field - 현재 변경된 필드명
     * @param {string} options.value - 선택된 날짜 값
     * @param {Object} options.currentForm - 현재 상태 객체 (params 또는 form)
     * @param {Function} options.setter - 상태 업데이트 함수 (setParams 또는 setForm)
     * @param {string} options.startKey - 시작일 필드명
     * @param {string} options.endKey - 종료일 필드명
     */
    const validateDateRange = async ({
        field,
        value,
        currentForm,
        setter,
        startKey = 'searchStartDate',
        endKey = 'searchEndDate'
    }) => {
        const isStart = field === startKey;
        const otherField = isStart ? endKey : startKey;
        const otherValue = currentForm[otherField];

        if (otherValue && value) {
            const current = parseISO(value);
            const other = parseISO(otherValue);

            const isInvalid = isStart ? isBefore(other, current) : isBefore(current, other);

            if (isInvalid) {
                    await Swal.fire({
                        icon: 'warning',
                        title: '날짜 선택 오류',
                        text: isStart ? '시작일은 종료일보다 늦을 수 없습니다.' : '종료일은 시작일보다 빠를 수 없습니다.',
                        confirmButtonText: '확인'
                }).then(() => {
                    document.getElementById(field)?.focus();
                });
                return; 
            }
        }

        // 인자로 받은 setter를 사용하여 상태 업데이트
        setter((prev) => ({ ...prev, [field]: value }));
    };
    return { validateDateRange };
};