---
trigger: model_decision
description: 디자인, 색상, color, design을 추가하거나 바꿀 때 사용. 새로운 페이지 개발시 참고
globs: 
---
 # 디자인 시스템 규칙

## 색상 체계
- **기본 색상**: 
  - 파란색 계열 (`blue-500`, `blue-600`, 등)을 주요 액션 색상으로 사용
  - 회색 계열 (`gray-100` ~ `gray-900`)을 중립 색상으로 사용
- **방문 상태**: 
  - 라이트 모드: 배경 `#f3f4f6`, 타이틀 `#6b7280`, 텍스트 `#9ca3af`
  - 다크 모드: 배경 `#1f2937`, 타이틀 `#9ca3af`, 텍스트 `#6b7280`

## 테마 모드
- 라이트/다크 모드 전환 지원은 필수
- 다크 모드에서는 `dark:` 접두사로 스타일 재정의
  - 예: `class="bg-white dark:bg-gray-900"`
- 다크 모드에서 컴포넌트 구분을 위해 `dark:ring-1 dark:ring-gray-800` 패턴 활용

## 타이포그래피
- 제목: `font-semibold` 사용, 크기는 상황에 따라 `text-sm`, `text-base`, `text-lg` 조정
- 일반 텍스트: `text-gray-600 dark:text-gray-300` 색상 조합 사용
- 메타 정보: `text-gray-500 dark:text-gray-400` 색상 조합 사용, `text-xs` 또는 `text-sm` 크기

## 컴포넌트 스타일
### 카드 컴포넌트
- 기본 패딩: `p-3 sm:p-4 md:p-5` (반응형)
- 기본 배경: `bg-white dark:bg-gray-900`
- 테두리 및 그림자: `rounded-lg shadow-sm`
- 호버 효과: `hover:shadow-md transition-all duration-300`

### 버튼
- 선택 상태 버튼: `bg-blue-500 hover:bg-blue-600 text-white border-blue-500`
- 비선택 상태 버튼: `hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 dark:hover:border-blue-800`
- 방문한 콘텐츠 버튼: `bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400`
- 크기: `size="sm"`, 패딩: `px-3 py-[0.3rem]`

### 아바타
- 포스트 카드: `w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6`
- 호버 카드: `h-10 w-10 sm:h-12 sm:w-12` 

## 반응형 디자인
- 모바일(`max-sm`): 간소화된 레이아웃, 작은 아이콘 및 텍스트 크기
- 태블릿(`sm`): 기본 레이아웃, 중간 크기의 요소들
- 데스크탑(`md`, `lg`): 여유로운 레이아웃, 큰 크기의 요소들

### 반응형 패턴
- 이미지 크기: `w-16 sm:w-24 md:w-28 lg:w-36 h-16 sm:h-24 md:h-28 lg:h-36`
- 텍스트 크기: `text-xs sm:text-sm md:text-base` 패턴 활용
- 간격: `gap-4 md:gap-4 lg:gap-6` 패턴으로 화면 크기에 따라 조정

## 애니메이션 및 전환 효과
- 기본 전환: `transition-all duration-300`
- 호버 효과: `group-hover:scale-110 transition-transform duration-500`
- 텍스트 호버: `hover:text-blue-500 transition-colors`

## 접근성
- 모든 클릭 가능한 요소에 `role="button"`, `tabindex="0"` 추가
- 키보드 네비게이션 지원 (`on:keydown` 이벤트)
- 이미지에 `alt` 속성 필수 지정
- 로딩 최적화: `loading="lazy"`, `decoding="async"`, `fetchpriority="low"`