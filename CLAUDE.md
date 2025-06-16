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
  - `techBlogs.ts`: 테크블로그 정보 관리
  - `search.ts`: 검색 상태 관리 및 URL 동기화
  - `visitedPosts.ts`: 방문한 포스트 추적
  - `sidebar.ts`: 사이드바 상태 관리

### API 통신
- SvelteKit API 라우트 사용 (`src/routes/api/[...path]/+server.ts`)
- 백엔드 API 프록시 구현으로 CORS 해결
- 환경별 API 엔드포인트 분리 (dev, qa, production)
- `src/lib/config.ts`에서 API 설정 관리

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
- 새 페이지 추가 시 `src/routes/` 아래에 디렉토리 생성 후 `+page.svelte` 파일 작성
- 동적 라우팅: `[slug]` 폴더 사용
- 페이지 이동: `import { goto } from '$app/navigation'` 후 `goto()` 함수 사용
- 페이지 데이터 접근: `import { page } from '$app/stores'` 후 `$page.params`, `$page.url` 사용
- SEO를 위해 각 페이지마다 `<svelte:head>` 태그로 메타 태그 설정

### 스타일링
- Tailwind CSS 사용, 커스텀 CSS 변수 기반 색상 시스템
- 다크모드 지원: `dark:` prefix 사용
- 반응형: 모바일 우선 (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
- shadcn-ui 컴포넌트 우선 사용

### 상태 관리
- 컴포넌트 간 상태 공유는 Svelte 스토어 활용
- API 데이터는 스토어에서 중앙 관리
- 로컬 상태는 컴포넌트 내부에서 관리
- 검색 상태와 URL 동기화는 `search.ts` 스토어의 `getSearchParamsUrl()` 함수 사용

### API 통신
- SvelteKit API 라우트 (`/api/*`)를 통한 프록시 방식
- 클라이언트에서 `fetch('/api/...')` 형태로 호출
- 환경별 API URL은 `config.ts`에서 관리
- 에러 처리 및 로딩 상태 관리 필수

### 사용자 활동 로깅
- 중요한 사용자 행동은 ActivityLogger로 기록
- 페이지 뷰, 클릭, 검색 등 추적
- 개인정보는 수집하지 않음
- SSR 환경에서도 안전하게 동작

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