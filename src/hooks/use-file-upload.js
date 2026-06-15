import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// Drag and Drop File Input
export const useFileUpload = ({
    fieldName,           // 파일 필드명
    updateForm,          // 부모의 updateForm 함수
    fileValue,           // 현재 파일 값 (단일: File | null, 멀티: File[])
    accept,              // 허용 파일 타입
    multiUse = false,    // true: 다중 파일 누적, false: 단일 파일
}) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;

        if (multiUse) {
            // 멀티: 기존 파일 배열에 추가
            const prev = Array.isArray(fileValue) ? fileValue : [];
            updateForm({ [fieldName]: [...prev, ...acceptedFiles] });
        } else {
            // 단일: 첫 번째 파일만 전달
            updateForm({ [fieldName]: acceptedFiles[0] });
        }
    }, [fieldName, updateForm, multiUse, fileValue]);

    const defaultAccept = {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'text/csv': ['.csv'],
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: accept || defaultAccept,
        multiple: multiUse,
    });

    // 단일 파일 제거
    const clearFile = (e) => {
        e.stopPropagation();
        updateForm({ [fieldName]: multiUse ? [] : null });
    };

    // 멀티 파일에서 특정 인덱스 제거
    const removeFileAt = (e, index) => {
        e.stopPropagation();
        if (!multiUse || !Array.isArray(fileValue)) return;
        const next = fileValue.filter((_, i) => i !== index);
        updateForm({ [fieldName]: next });
    };

    return {
        getRootProps,
        getInputProps,
        isDragActive,
        file: fileValue,
        clearFile,
        removeFileAt,
    };
};
