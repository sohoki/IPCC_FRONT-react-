import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    // plugins 제거 — extends에서 자동 등록됨
    languageOptions: {
      ecmaVersion: 2020, //최신 ECMAScript 기능을 지원합니다.
      globals: globals.browser, //브라우저 환경에서 사용되는 전역 변수를 정의합니다.
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      }, //모듈 시스템을 사용하여 코드를 분석합니다.
    },
    rules: {
      ...js.configs.recommended.rules, //JavaScript에 대한 권장 규칙을 적용합니다.
      ...reactHooks.configs.recommended.rules, //React Hooks 사용에 대한 권장 규칙을 적용합니다.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }], //사용되지 않는 변수에 대한 오류를 발생시키지만, 대문자 또는 밑줄로 시작하는 변수는 무시합니다.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ], //React 컴포넌트로만 내보내기를 허용하며, 상수 내보내기도 허용합니다.
    },
  },
])