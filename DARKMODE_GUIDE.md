# 다크모드 공통 적용 가이드

이 프로젝트는 `[data-theme="dark"]` 속성을 `<html>` 요소에 적용하는 방식으로 다크모드를 구현한다.  
`src/style/DarkMode.css`에 정의된 CSS 변수를 활용하면 새 컴포넌트에서도 자동으로 다크모드가 적용된다.

---

## 1. CSS 변수 목록

`DarkMode.css`의 `:root` 섹션에 라이트 기본값이, `[data-theme="dark"]` 섹션에 다크 오버라이드가 정의되어 있다.

| 변수 | 라이트값 | 다크값 | 용도 |
|------|----------|--------|------|
| `--ipcc-card-bg` | `#ffffff` | `#25262b` | 카드·패널·모달 배경 |
| `--ipcc-card-header-bg` | `#f8fafc` | `#2c2e33` | 카드 헤더·타이틀바 배경 |
| `--ipcc-card-border` | `#e2e8f0` | `#373a40` | 카드·패널 테두리 |
| `--ipcc-card-shadow` | `0 2px 12px rgba(0,0,0,.07)` | `0 2px 12px rgba(0,0,0,.4)` | 카드 그림자 |
| `--ipcc-divider` | `#f0f4f8` | `#373a40` | 구분선·border-bottom |
| `--ipcc-text-primary` | `#1e293b` | `#e9ecef` | 주요 텍스트 |
| `--ipcc-text-secondary` | `#334155` | `#c1c2c5` | 보조 텍스트 |
| `--ipcc-text-muted` | `#64748b` | `#909296` | 흐린 텍스트·레이블 |
| `--ipcc-text-placeholder` | `#94a3b8` | `#6b6e72` | 플레이스홀더·비활성 |
| `--ipcc-hover-bg` | `#eff6ff` | `#1c2333` | hover 배경 |
| `--ipcc-hover-color` | `#1d4ed8` | `#4B92FF` | hover 텍스트 |
| `--ipcc-selected-bg` | `#dbeafe` | `#1a2740` | 선택 항목 배경 |
| `--ipcc-selected-color` | `#1d4ed8` | `#4B92FF` | 선택 항목 텍스트 |
| `--ipcc-ctx-menu-bg` | `#ffffff` | `#25262b` | 컨텍스트 메뉴 배경 |
| `--ipcc-ctx-menu-border` | `#e2e8f0` | `#373a40` | 컨텍스트 메뉴 테두리 |
| `--ipcc-ctx-menu-hover` | `#f1f5f9` | `#2c2e33` | 컨텍스트 메뉴 hover |
| `--ipcc-ctx-menu-hover-danger` | `#fff1f2` | `#2c1a1a` | 위험 항목 hover |
| `--ipcc-dropzone-bg` | `#f8fafc` | `#1f2124` | 드래그 존 배경 |
| `--ipcc-dropzone-border` | `#cbd5e1` | `#4a4f57` | 드래그 존 테두리 |
| `--ipcc-dropzone-active-bg` | `#eff6ff` | `#1c2333` | 드래그 활성 배경 |
| `--ipcc-dropzone-active-border` | `#3b82f6` | `#4B92FF` | 드래그 활성 테두리 |

---

## 2. 새 컴포넌트 작성 규칙

### ✅ 올바른 방법 — CSS 변수 사용

```jsx
// 패널/카드 컨테이너
<div style={{
  background: 'var(--ipcc-card-bg)',
  border: '1px solid var(--ipcc-card-border)',
  boxShadow: 'var(--ipcc-card-shadow)',
}}>

// 헤더 영역
<div style={{
  background: 'var(--ipcc-card-header-bg)',
  borderBottom: '1px solid var(--ipcc-divider)',
  color: 'var(--ipcc-text-primary)',
}}>

// 보조 텍스트
<span style={{ color: 'var(--ipcc-text-muted)' }}>레이블</span>

// hover가 필요한 버튼 (CSS 클래스 사용 권장)
<button className="menu-ctx-btn">항목</button>
```

### ❌ 잘못된 방법 — 하드코딩 금지

```jsx
// 이 방식은 CSS 선택자로 덮어쓸 수 없다
<div style={{ background: '#fff' }}>         // ❌
<div style={{ backgroundColor: '#ffffff' }}> // ❌
<span style={{ color: '#334155' }}>          // ❌
```

---

## 3. 기존 컴포넌트 패턴별 자동 처리 항목

아래 패턴은 `DarkMode.css`에 이미 규칙이 있어 별도 작업 없이 다크모드가 적용된다.

| 패턴 | 적용 범위 |
|------|-----------|
| `[data-theme="dark"] .modal-dialog` | 모든 모달의 modal-dialog 컨테이너 (`background: transparent`) |
| `[data-theme="dark"] .modal-content` | 모든 모달 본문 배경 |
| `[data-theme="dark"] .form-control, .form-select` | 폼 인풋·셀렉트 |
| `[data-theme="dark"] .modal-body .form-label` | 모달 내 레이블 |
| `[data-theme="dark"] .ag-theme-material` | AG Grid 테마 전체 |
| `[data-theme="dark"] .ag-details-row > div` | AG Grid 마스터-디테일 서브그리드 |
| `[data-theme="dark"] .ag-details-row > div > div:first-child` | 서브그리드 서브 헤더 |
| `[data-theme="dark"] .dropdown-menu` | Bootstrap 드롭다운 |
| `[data-theme="dark"] .swal2-popup` | SweetAlert2 팝업 |

---

## 4. 특이 케이스 처리 방법

### 4-1. 인라인 스타일이 있는 기존 컴포넌트 수정 시

하드코딩된 색상을 CSS 변수로 교체한다.

```jsx
// 수정 전
style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#334155' }}

// 수정 후
style={{
  background: 'var(--ipcc-card-bg)',
  border: '1px solid var(--ipcc-card-border)',
  color: 'var(--ipcc-text-secondary)',
}}
```

### 4-2. hover 처리가 필요한 경우

`onMouseEnter`/`onMouseLeave`로 스타일을 직접 조작하면 다크모드가 적용되지 않는다.  
CSS 클래스 + `:hover` 방식으로 구현한다.

```css
/* DarkMode.css에 추가 */
.my-btn { color: var(--ipcc-text-secondary); background: transparent; }
.my-btn:hover { background: var(--ipcc-hover-bg); color: var(--ipcc-hover-color); }
```

### 4-3. 인라인 `<style>` 태그 제거

컴포넌트 내부의 `<style>{`...`}</style>` 블록은 CSS 변수를 사용할 수 없다.  
DarkMode.css로 이동하고 CSS 변수를 사용한다.

---

## 5. 관련 파일

| 파일 | 역할 |
|------|------|
| `src/style/DarkMode.css` | CSS 변수 정의 및 다크모드 오버라이드 전체 |
| `src/hooks/use-dark-mode.js` | localStorage + OS 감지, `data-theme` 속성 적용 |
| `src/contexts/ThemeContext.jsx` | React Context — `useTheme()` 훅 제공 |
| `src/components/layout/Header.jsx` | 다크모드 토글 UI (IosSwitch) |

---

## 6. useTheme 훅 사용법

```jsx
import { useTheme } from '@/contexts/ThemeContext.jsx';

const MyComponent = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{ background: 'var(--ipcc-card-bg)' }}>
      현재 모드: {isDark ? '다크' : '라이트'}
    </div>
  );
};
```
