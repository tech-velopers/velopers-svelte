---
trigger: model_decision
description: 블로그명, 태그, 쿼리, 카테고리 기준으로 게시글을 검색할 때 사용
globs: src/lib/stores/search.ts, src/lib/components/sidebar/SearchBox.svelte
---
# 검색 기능 규칙

## 검색 Store 사용

### 검색 상태 관리
검색 관련 모든 상태는 search store를 통해 관리해야 합니다.

```typescript
import { 
  selectedBlogs, 
  selectedTags, 
  searchQuery,
  selectedCategory,
  currentPage,
  toggleBlog, 
  toggleTag, 
  setSearchQuery,
  setCategory,
  setPage,
  resetSelected 
} from '$lib/stores/search';

// 블로그 토글
toggleBlog({ name: 'blogName', avatar: 'avatar.png' });

// 태그 토글
toggleTag('tagName');

// 검색어 설정
setSearchQuery('검색어');

// 카테고리 설정
setCategory('카테고리명');

// 페이지 설정
setPage(1);

// 선택 초기화
resetSelected();

// store 구독
$: console.log($selectedBlogs, $selectedTags, $searchQuery, $selectedCategory, $currentPage);
```

### 검색 조건
- 선택된 블로그와 태그는 AND 조건으로 검색됩니다.
- 검색어와 필터 조건이 모두 적용된 경우, 모든 조건을 만족하는 결과만 표시됩니다.

### 상태 지속성
- 모든 검색 상태(`selectedBlogs`, `selectedTags`, `searchQuery`, `selectedCategory`, `currentPage`)는 자동으로 localStorage에 저장됩니다.
- 페이지를 새로고침하거나 브라우저를 닫았다가 다시 열어도 검색 상태가 유지됩니다.
- URL 파라미터로도 검색 상태를 표현하여 페이지 공유 및 북마크 시 상태가 유지됩니다.

### URL과 상태 동기화
- 검색 상태가 변경되면 URL이 자동으로 업데이트됩니다.
- URL의 쿼리 파라미터가 변경되면 검색 상태도 업데이트됩니다.
- 뒤로가기/앞으로가기 시 이전/이후 검색 상태로 복원됩니다.

```typescript
import { updateUrl } from '$lib/stores/router';

// 상태 변경 후 URL 업데이트
toggleTag('typescript');
updateUrl();
```

### 주의사항
- 검색 관련 상태 변경은 반드시 store의 메서드를 통해 수행해야 합니다.
- 컴포넌트에서 직접 검색 상태를 관리하지 않습니다.
- 로고나 홈 버튼 클릭 시 검색 상태가 초기화됩니다.
- 검색 상태 초기화 후에는 반드시 URL도 업데이트해야 합니다.

```typescript
// 검색 상태 초기화 및 홈으로 이동 (Header.svelte에서 사용)
import { navigate } from '$lib/stores/router';
navigate('/', false, true); // 세 번째 파라미터: resetSearchState
```