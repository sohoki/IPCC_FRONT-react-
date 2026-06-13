import { useCallback } from 'react';
import { fnAjaxFetch } from '@/service/api/fn-ajax-fetch.jsx';
import { alert } from '@/lib/alert.js';
import { format } from 'date-fns';

export const useExcelDownload = () => {

    const downloadExcel = useCallback(async ({ url, method, data, fileName = 'download' }) => {
        try {
            const res = await fnAjaxFetch({
                url,
                data,
                method,
                responseType: 'blob',
                withCredentials: true,
            });

            if (res.status < 200 || res.status >= 300) {
                throw new Error(`다운로드 실패: ${res.status}`);
            }

            const blob = new Blob([res.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${fileName}_${format(new Date(), 'yyyyMMddHHmmss')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (e) {
            await alert.error(e?.message || '엑셀 파일 다운로드 중 오류가 발생했습니다.', '다운로드 실패');
        }
    }, []);

    return downloadExcel;
};
