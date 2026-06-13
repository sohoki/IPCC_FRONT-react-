import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
// Drag and Drop File Input 
export const useFileUpload = ({ 
    fieldName,  //파일이름 
    updateForm, // 부모의 updateForm 함수
    fileValue, // 부모로부터 전달받는 현재 파일 값 (null 또는 File 객체)
    accept, // 허용할 파일 타입 (예: { 'application/pdf': ['.pdf'] })
    multiUse = false, // 다중 파일 허용 여부 (현재는 false로 고정)
 }) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            // 부모의 updateForm 호출 (첫 번째 파일 전달)
            updateForm({ [fieldName]: acceptedFiles[0] });
        }
    }, [fieldName, updateForm]);

    // 기본 허용 파일 (엑셀/CSV)
    const defaultAccept = {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls'],
        'text/csv': ['.csv']
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: accept || defaultAccept,
        multiple: multiUse
    });

    // 파일 삭제 함수
    const clearFile = (e) => {
        e.stopPropagation(); // 드롭존 클릭 이벤트 방지
        updateForm({ [fieldName]: null });
    };

    return {
        getRootProps,
        getInputProps,
        isDragActive,
        file: fileValue,
        clearFile
    };
};
