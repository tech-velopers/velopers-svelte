---
trigger: model_decision
description: 테크블로그의 정보를 사용할 때 사용
globs: src/lib/stores/techBlogs.ts
---
# 테크블로그 정보 관리 규칙

## TechBlogs Store 사용

### 테크블로그 정보 로드
테크블로그 정보는 `techBlogs` store에서 중앙 집중적으로 관리합니다.

```typescript
import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';

// 컴포넌트 마운트 시 블로그 정보 로드
onMount(async () => {
  await techBlogsStore.fetchTechBlogs();
});

// 블로그 정보 구독
techBlogsStore.subscribe((blogs) => {
  // blogs 배열 사용
});

// 블로그 맵 사용 (블로그명으로 빠른 조회)
$: blogInfo = $techBlogMap[blogName];
```

### 주의사항
1. `fetchTechBlogs()`는 데이터가 없을 때만 호출합니다.
2. 컴포넌트에서 구독 시 반드시 `onMount` 내에서 구독하고, 컴포넌트 언마운트 시 구독 해제합니다.
3. 블로그 정보가 필요한 경우 `company.name` 대신 `techBlogName`을 사용합니다.

### 데이터 지속성
- 한 번 로드된 블로그 정보는 페이지 새로고침 전까지 유지됩니다.
- 불필요한 API 호출을 방지하기 위해 캐시된 데이터를 우선 사용합니다.