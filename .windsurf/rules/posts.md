---
trigger: model_decision
description: 포스트 관련 모든 상태와 로직은 posts store에서 관리
globs: src/lib/stores/posts.ts, src/lib/components/main/PostList.svelte, src/lib/components/main/PostCard.svelte
---
# 포스트 관리 규칙

## Posts Store 사용

### 포스트 상태 관리
포스트 관련 모든 상태와 로직은 posts store에서 관리합니다.

```typescript
import { store as postsStore } from '$lib/stores/posts';

// 포스트 상태 구독
$: posts = $postsStore.posts;
$: currentPage = $postsStore.currentPage;
$: totalPages = $postsStore.totalPages;
$: isLoading = $postsStore.isLoading;
$: error = $postsStore.error;
$: currentCategory = $postsStore.currentCategory;
$: searchQuery = $postsStore.searchQuery;
```

### 포스트 액션
모든 포스트 관련 액션은 store의 메서드를 통해 수행해야 합니다.

```typescript
// 포스트 관련 액션
postsStore.fetchPosts();  // 현재 상태로 포스트 조회
postsStore.setCategory('Frontend');  // 카테고리 변경
postsStore.setPage(2);  // 페이지 변경
postsStore.setSearchQuery('검색어');  // 검색어 설정
postsStore.reset();  // 상태 초기화
```

### Store 통합
- posts store는 `selectedBlogs`와 `selectedTags` store와 연동됩니다.
- store 값이 변경될 때마다 자동으로 포스트 목록이 업데이트됩니다.
- 검색 조건은 AND 조건으로 적용됩니다.

### 주의사항
1. 포스트 관련 상태 변경은 반드시 store의 메서드를 통해 수행해야 합니다.
2. 검색, 필터링 등의 로직은 컴포넌트에서 직접 구현하지 않고 store를 사용합니다.
3. URL 파라미터와 store 상태를 동기화해야 하는 경우 컴포넌트에서 처리합니다.
4. 에러 처리는 store의 error 상태를 통해 확인합니다.

## 포스트 상세 페이지 (Post.svelte)

### SEO 최적화
포스트 상세 페이지는 SEO를 위해 다음 요소들을 포함해야 합니다:

```svelte
<svelte:head>
  <title>{post.title} - {post.techBlogName} | Velopers</title>
  <meta name="description" content={post.preview} />
  <meta property="og:title" content={`${post.title} - ${post.techBlogName}`} />
  <meta property="og:description" content={post.preview} />
  <meta property="og:image" content={post.imageUrl} />
  <meta name="keywords" content={post.tags.join(', ')} />
</svelte:head>
```

### 테크블로그 정보
테크블로그 정보는 `techBlogs` store를 통해 가져와야 합니다:

```typescript
import { store as techBlogsStore, techBlogMap } from '$lib/stores/techBlogs';

onMount(() => {
  techBlogsStore.fetchTechBlogs();
});

// 블로그 아이콘 사용
<img src={`/icons/${$techBlogMap[post.techBlogName]?.icon}`} alt={post.techBlogName} />
```

### 에러 처리
포스트 로딩 실패 시 적절한 에러 메시지를 표시해야 합니다:

```typescript
try {
  const response = await fetch(getApiUrl(`/api/post/${postId}`));
  if (!response.ok) throw new Error('포스트를 불러오는데 실패했습니다.');
  post = await response.json();
} catch (e) {
  error = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
}
```
