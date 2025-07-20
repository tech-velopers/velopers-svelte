# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Velopers는 한국 IT 테크 블로그의 최신 게시글을 크롤링하여 정리하는 웹 서비스의 프론트엔드입니다. **SvelteKit 2** 기반으로 구축된 풀스택 웹 애플리케이션입니다.

## 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# QA 환경 실행  
npm run qa

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# 타입 체크 및 검증
npm run check
```

## 핵심 아키텍처

### 라우팅 시스템
- **SvelteKit 2**의 파일 기반 라우팅 시스템 사용
- 페이지는 `src/routes/` 디렉토리의 `+page.svelte` 파일로 정의
- 동적 라우팅: `[slug]` 폴더 구조 사용
- 네비게이션: SvelteKit의 `goto()` 함수 사용 (`$app/navigation`)
- 페이지 상태: `$page` 스토어 사용 (`$app/stores`)

### 상태 관리
- Svelte 스토어를 활용한 중앙 집중식 상태 관리 (`src/lib/stores/`)
- 주요 스토어들:
  - `posts.ts`: 포스트 데이터 및 필터링 상태
  - `techBlogs.ts`: 테크블로그 정보 관리 (`techBlogMap` 활용한 빠른 조회)
  - `search.ts`: 검색 상태 관리 및 URL 동기화 (localStorage 자동 저장)
  - `visitedPosts.ts`: 방문한 포스트 추적
  - `sidebar.ts`: 사이드바 상태 관리
  - `viewMode.ts`: 포스트 보기 모드 (자세히/요약 보기)

### API 통신
- **필수**: 모든 클라이언트 API 요청은 `/api/*` 프록시 경로 사용
- SvelteKit API 라우트 사용 (`src/routes/api/[...path]/+server.ts`)
- 백엔드 API 프록시 구현으로 CORS 해결
- 환경별 API 엔드포인트 분리 (dev, qa, production)
- `src/lib/config.ts`에서 API 설정 관리
- 직접 백엔드 호출 금지: `config.ts`의 `API_ENDPOINTS` 상수 활용
- 서버 사이드 데이터 로딩 시 `+page.server.ts` 사용

## 주요 기술 스택

- **SvelteKit 2**: 풀스택 웹 프레임워크
- **Svelte 4**: 컴포넌트 프레임워크  
- **TypeScript**: 타입 안정성
- **Vite**: 빌드 도구
- **Tailwind CSS**: 스타일링
- **shadcn-svelte**: UI 컴포넌트 라이브러리
- **mode-watcher**: 다크모드 관리

## 디렉토리 구조

```
src/
├── routes/                 # SvelteKit 라우팅
│   ├── +layout.svelte     # 전역 레이아웃
│   ├── +page.svelte       # 홈 페이지
│   ├── about/+page.svelte # 정적 페이지들
│   ├── all-blogs/+page.svelte
│   ├── all-tags/+page.svelte
│   ├── blog/[slug]/+page.svelte    # 동적 라우팅
│   ├── post/[slug]/+page.svelte
│   └── api/[...path]/+server.ts    # API 프록시
├── lib/
│   ├── components/         # 재사용 컴포넌트
│   │   ├── layout/        # Header, Footer, Navigation
│   │   ├── main/          # PostCard, PostList 등 핵심 컴포넌트
│   │   ├── sidebar/       # 사이드바 관련
│   │   └── ui/            # shadcn-ui 컴포넌트
│   ├── stores/            # Svelte 스토어
│   ├── utils/             # 유틸리티 함수
│   └── config.ts          # API 및 환경 설정
├── app.html               # HTML 템플릿
static/                    # 정적 파일 (이미지, 아이콘 등)
└── svelte.config.js       # SvelteKit 설정
```

## 중요한 개발 규칙

### 라우팅
- **파일 기반 라우팅**: `src/routes/` 구조가 URL 경로와 일치
- 새 페이지 추가 시 `src/routes/` 아래에 디렉토리 생성 후 `+page.svelte` 파일 작성
- 동적 라우팅: `[slug]` 폴더 사용
- **페이지 이동**: `import { goto } from '$app/navigation'` 후 `goto()` 함수 사용
- 페이지 데이터 접근: `import { page } from '$app/stores'` 후 `$page.params`, `$page.url` 사용
- SEO를 위해 각 페이지마다 `<svelte:head>` 태그로 메타 태그 설정
- **내부 링크**: `goto()` 함수 사용, **외부 링크**: `<a>` 태그 사용
- URL 파라미터 업데이트 시 `replaceState: true` 옵션 활용

### 스타일링 및 디자인 시스템
- **Tailwind CSS** 사용, 커스텀 CSS 변수 기반 색상 시스템
- **색상 체계**: 파란색 계열 주요 액션, 회색 계열 중립 색상
- **다크모드 필수**: `dark:` prefix 사용, 모든 컴포넌트에서 지원
- **반응형**: 모바일 우선 (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- **shadcn-ui 컴포넌트** 우선 사용
- **카드 컴포넌트**: `p-3 sm:p-4 md:p-5`, `rounded-lg shadow-sm`
- **애니메이션**: `transition-all duration-300` 기본 패턴
- **접근성**: 클릭 요소에 `role="button"`, `tabindex="0"`, 키보드 네비게이션 지원
- **이미지**: alt 속성 필수, 로딩 최적화 (`loading="lazy"`, `decoding="async"`)

### 상태 관리 상세
- **중앙 집중식**: 컴포넌트 간 상태 공유는 Svelte 스토어 활용
- **API 데이터**: 스토어에서 중앙 관리, 불필요한 API 호출 방지
- **로컬 상태**: 컴포넌트 내부에서 관리
- **URL 동기화**: 검색, 페이지 상태는 URL과 양방향 동기화
- **검색 상태**: `search.ts` 스토어의 `getSearchParamsUrl()` 함수 사용
- **블로그/태그 검색**: AND 조건 검색 방식
- **상태 지속성**: localStorage 자동 저장으로 페이지 새로고침 시에도 상태 유지
- **포스트 상태**: 모든 포스트 관련 상태는 `posts.ts` store에서 관리

### API 통신 상세
- **프록시 필수**: SvelteKit API 라우트 (`/api/*`)를 통한 프록시 방식만 사용
- **클라이언트 호출**: `fetch('/api/...')` 형태로만 호출
- **환경별 설정**: API URL은 `config.ts`에서 관리
- **에러 처리**: 로딩 상태 관리 필수
- **올바른 예시**: `const response = await fetch('/api/posts');`
- **잘못된 예시**: 직접 백엔드 URL 호출 금지

### 사용자 활동 로깅 (ActivityLogger)
- **필수 적용**: 모든 컴포넌트에서 `ActivityLogger` 임포트 및 사용
- **활동 유형**: VIEW, CLICK, SEARCH, SCROLL, INTERACT 표준화
- **대상 유형**: 대문자+언더스코어 네이밍 (예: `POST_CARD`, `TAG_SELECT`)
- **공통 필드**: `from`, `location`, `timestamp` 포함
- **상태 변경**: 이전/새 상태 기록
- **SSR 안전성**: 브라우저 체크 필수
- **개인정보**: 수집하지 않음

#### 로깅 구현 예시
```typescript
import logger from '$lib/utils/ActivityLogger';

// 페이지 뷰 로깅
onMount(() => {
  logger.logPageView('HOME');
});

// 클릭 이벤트 로깅
function handleClick() {
  logger.logClick('POST_CARD', post.id, post.title, {
    from: 'component_name',
    techBlogName: post.techBlogName
  });
}
```

### 아이콘 및 UI 요소
- **아이콘**: `lucide-svelte` 라이브러리 사용 필수
- **SVG 파일**: 별도 생성 금지, lucide-svelte 사용
- **임포트 패턴**: `import { Search, RotateCcw } from 'lucide-svelte';`

### 특수 페이지 구현 가이드

#### Quiz 페이지
- **기능**: 퀴즈 진행(순차/랜덤), 카테고리 필터링, 다시하기 시스템
- **UI**: Dialog 기반 퀴즈 수정, Sonner 토스트 알림
- **저장**: 실시간 로컬 스토리지 저장/복원
- **접근성**: 키보드 단축키 지원
- **인증**: 비밀번호 인증 (4120)
- **특별 구현**: `_repeat_` ID를 통한 고유 다시하기 퀴즈 생성

## 정적 파일 관리

- 정적 파일은 `static/` 디렉토리에 위치
- 이미지, 아이콘, robots.txt 등
- 브라우저에서 `/파일명` 형태로 직접 접근 가능

## Path Alias

- `$lib`: `src/lib` 디렉토리 alias
- `$app/*`: SvelteKit 내장 모듈들
- 절대 경로 import 사용 권장: `import { component } from '$lib/components/...'`

## 마이그레이션 완료 상태

이 프로젝트는 **Svelte 4 + 커스텀 라우터**에서 **SvelteKit 2**로 성공적으로 마이그레이션되었습니다:

- ✅ 파일 기반 라우팅 시스템 구현
- ✅ SvelteKit API 라우트로 프록시 구현  
- ✅ 정적 파일 서빙 (`static/` 디렉토리)
- ✅ SSR 지원 및 SEO 최적화
- ✅ 레거시 코드 정리 완료

## 핵심 개발 원칙

### 1. Store 중심 아키텍처
- 모든 상태 관리는 Svelte store를 통해 중앙 집중화
- URL과 상태의 양방향 동기화 필수
- localStorage를 활용한 상태 지속성 보장

### 2. API 통신 표준
- 반드시 `/api/*` 프록시 경로만 사용
- 직접 백엔드 호출 절대 금지
- 서버 사이드 데이터 로딩은 `+page.server.ts` 활용

### 3. 사용자 활동 추적
- 모든 사용자 상호작용에 ActivityLogger 적용 필수
- 표준화된 로깅 패턴 준수
- SSR 환경에서의 안전성 보장

### 4. 디자인 시스템 일관성
- shadcn-svelte 컴포넌트 우선 사용
- 다크모드 지원 필수
- 접근성 가이드라인 준수
- 모바일 우선 반응형 디자인

### 5. 성능 최적화
- 불필요한 API 호출 방지
- 캐시 적극 활용 (`techBlogMap` 등)
- 이미지 lazy loading 및 최적화
- 컴포넌트 렌더링 최적화

### 6. 타입 안전성
- TypeScript 인터페이스 정의 및 활용
- Props 타입 명시
- API 응답 타입 정의