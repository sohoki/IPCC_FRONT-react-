import Swal from '@/lib/swal.js';

export const alert = {
  success: (text, title = '완료')    => Swal.fire({ icon: 'success', title, text }),
  warning: (text, title = '경고')    => Swal.fire({ icon: 'warning', title, text }),
  error:   (text, title = 'ERROR')   => Swal.fire({ icon: 'error',   title, text }),
  confirm: (title, text) =>
    Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '확인',
      cancelButtonText: '취소',
    }),
};
