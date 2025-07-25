---
trigger: model_decision
description: 커스텀 라우팅, 다른 페이지 이동 시 사용
globs: src/lib/stores/router.ts, src/lib/pages/*.svelte
---
# 라우팅 규칙

## 커스텀 라우터 사용

### 페이지 이동
페이지 이동은 반드시 `navigate` 함수를 사용해야 합니다.

```typescript
import { navigate } from '$lib/stores/router';
navigate('/about');
```

### 현재 경로 구독
현재 경로는 `currentPath`와 `currentUrl` store를 구독하여 사용합니다.

```typescript
import { currentPath, currentUrl } from '$lib/stores/router';
$: console.log($currentPath); // 경로만 필요할 때
$: console.log($currentUrl);  // 쿼리 파라미터를 포함한 전체 URL이 필요할 때
```

### URL 상태 관리
URL의 쿼리 파라미터가 변경될 때 (예: 페이지 번호, 카테고리 변경) 반드시 `window.history.pushState`를 사용하여 브라우저 히스토리에 기록해야 합니다.

```typescript
function updateUrl(page: number, category: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('page', page.toString());
  url.searchParams.set('category', category);
  window.history.pushState({}, '', url.toString());
}
```

### 뒤로가기 처리
브라우저의 뒤로가기/앞으로가기는 `popstate` 이벤트를 통해 자동으로 처리됩니다. 
컴포넌트에서는 `currentUrl` store를 구독하여 URL 변경을 감지하고 필요한 상태를 업데이트해야 합니다.

```typescript
// URL 변경 감지 및 상태 업데이트
let prevUrl = '';
$: {
  if (prevUrl !== $currentUrl) {
    const { page, category } = getParamsFromUrl();
    if (page !== currentPage || category !== currentCategory) {
      updateState(page, category);
    }
    prevUrl = $currentUrl;
  }
}
```

### 주의사항
- `<a href>` 태그 대신 `navigate` 함수를 사용해야 합니다.
- 외부 링크는 일반 `<a>` 태그를 사용할 수 있습니다.
- 새로운 페이지 추가 시 `App.svelte`의 라우팅 조건문에 추가해야 합니다.
- URL 상태 변경 시 반드시 브라우저 히스토리에 기록하여 뒤로가기가 정상 동작하도록 해야 합니다.
- 컴포넌트 마운트 시점에 현재 URL의 상태를 반영해야 합니다. 