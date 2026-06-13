import { useCallback } from 'react';
import Swal from '@/lib/swal.js';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { validateEmptyByType } from '@/lib/form-validators.js';
import CODE from '@/constants/CODE.jsx';

export const useCommonSubmit = ({
    form,
    type = 'json',
    checkField = [],
    uploadField = [],
    idFieldMessage = '아이디',
    confirmMessage = '데이터',
    regexFieldCheck = [],
    compareField = [],
    gridApiRef,
    setModalOpen,
    URL,
    reloadFunction,
    callback,
}) => {


    const handleSubmit = useCallback(async () => {
        const isAllValid = await validateEmptyByType(checkField);
        if (!isAllValid) return;

        if (form.mode === 'Ins' && 'idCheck' in form && form.idCheck !== 'Y') {
            await Swal.fire({
                icon: CODE.WARNING,
                title: '입력 체크',
                text: `${idFieldMessage} 체크가 안되었습니다.`
            });
            return;
        }

        if (regexFieldCheck.length > 0) {
            for (const item of regexFieldCheck) {
                const { inputId, regex, message } = item;
                const value = form[inputId] || '';
                const re = regex instanceof RegExp ? regex : new RegExp(regex);
                if (!re.test(String(value))) {
                    await Swal.fire({
                        icon: CODE.WARNING,
                        title: '입력 형식 오류',
                        text: message || `${inputId} 형식이 올바르지 않습니다.`,
                    });
                    return;
                }
            }
        }

        if (compareField.length > 0) {
            for (const item of compareField) {
                const { primaryId, secondaryId, operator = '==', message } = item;
                const val1 = form[primaryId];
                const val2 = form[secondaryId];
                const isInvalid = (() => {
                    switch (operator) {
                        case '!=': return val1 === val2;
                        case '>':  return Number(val1) <= Number(val2);
                        case '<':  return Number(val1) >= Number(val2);
                        default:   return val1 !== val2; // '==' 및 기타
                    }
                })();
                if (isInvalid) {
                    await Swal.fire({
                        icon: CODE.WARNING,
                        title: '입력 확인',
                        text: message || `${primaryId}와 ${secondaryId} 값이 올바르지 않습니다.`,
                    });
                    return;
                }
            }
        }

        const label = form.mode === 'Ins' ? '등록' : '수정';
        const result = await Swal.fire({
            icon: CODE.QUESTION,
            title: label,
            html: `<b>${confirmMessage}</b> ${label} 하시겠습니까?`,
            showCancelButton: true,
            confirmButtonText: '예',
            cancelButtonText: '아니오',
            focusCancel: true,
        });

        if (!result.isConfirmed) return;

        try {
            let requestData;
            let headers = {};

            const sanitizeFormValue = (key, value) => {
                let v = value ?? '';
                if ((key.toLowerCase().includes('day') || key.toLowerCase().includes('date')) && typeof v === 'string') {
                    v = v.replace(/-/g, '');
                }
                if ((key.toLowerCase().includes('price') || key.toLowerCase().includes('cnt')) && typeof v === 'string') {
                    v = v.replace(/,/g, '');
                }
                return v;
            };

            if (type === 'json') {
                requestData = {};
                Object.entries(form).forEach(([key, value]) => {
                    requestData[key] = sanitizeFormValue(key, value);
                });
                headers = { 'Content-Type': 'application/json' };
            } else {
                const fd = new FormData();
                Object.entries(form).forEach(([key, value]) => {
                    if (!uploadField.includes(key)) {
                        fd.append(key, sanitizeFormValue(key, value));
                    }
                });
                uploadField.forEach(fieldKey => {
                    const fileData = form[fieldKey];
                    if (fileData instanceof File) {
                        fd.append(fieldKey, fileData, fileData.name);
                    } else if (fileData) {
                        fd.append(fieldKey, fileData);
                    }
                });
                requestData = fd;
                headers = { 'Content-Type': 'multipart/form-data' };
            }

            const res = await fnAjaxFetch({
                url: URL,
                method: 'POST',
                data: requestData,
                withCredentials: true,
                headers,
            });

            const json = res?.data;

            if (json?.resultCodeInfo === 'SUCCESS') {
                await Swal.fire({ icon: CODE.SUCCESS, title: '저장', text: json?.resultMessage || '저장되었습니다.' });
                setModalOpen?.(false);

                if (typeof reloadFunction === 'function') {
                    const targetPage = (form.mode === 'Ins') ? 1 : (gridApiRef?.current?.paginationGetCurrentPage() + 1 || 1);
                    reloadFunction(targetPage);
                } else if (reloadFunction === 'grid' && gridApiRef?.current) {
                    gridApiRef.current.purgeInfiniteCache?.();
                    gridApiRef.current.refreshInfiniteCache?.();
                }

                if (typeof callback === 'function') {
                    await callback();
                }
            } else {
                await Swal.fire({ icon: CODE.WARNING, title: '저장 실패', text: json?.resultMessage || '' });
            }
        } catch (e) {
            if (e?.name === 'HandledError') return; // fnAjaxFetch에서 이미 처리된 에러
            console.error('Submit Error:', e);
            await Swal.fire({ icon: CODE.ERROR, title: 'ERROR', text: e?.message || '저장 중 오류' });
        }
    }, [form, type, checkField, uploadField, idFieldMessage, confirmMessage, regexFieldCheck, compareField, gridApiRef, setModalOpen, URL, reloadFunction, callback]);

    return { handleSubmit };
};
