import SweetAlert2 from 'sweetalert2';

/**
 * 전역 SweetAlert2 기본값 관리 (단일 진입점).
 *
 * Swal.mixin 으로 공통 기본 옵션을 한 곳에서 관리한다.
 * 각 호출부는 'sweetalert2' 를 직접 import 하지 말고 이 모듈을 사용한다.
 *   import Swal from '@/lib/swal.js';
 *   Swal.fire({ ... });
 *
 * - reverseButtons:false → 확인(예) 버튼이 항상 왼쪽 = "예 → 아니오" 순서.
 *   버튼 순서를 바꾸려면 이 값만 수정하면 전 화면에 일괄 반영된다.
 *
 * NOTE: confirmButtonText/cancelButtonText 는 전역화하지 않는다.
 *       (확인/성공 등 단일 버튼 알럿은 '확인'이, 확인창은 '예/아니오'가 적절하므로 호출부에서 지정)
 */
const Swal = SweetAlert2.mixin({
    reverseButtons: false,
});

export default Swal;
