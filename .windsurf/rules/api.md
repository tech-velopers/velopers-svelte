---
trigger: model_decision
description:  백엔드 API와의 통신에서 사용한 규칙
globs: src/lib/config.ts
---
# 백엔드 API 요청 규칙

**적용 대상**: `src/lib/config.ts`

## API 요청 규칙

### getApiUrl 함수 사용
모든 백엔드 API 요청은 `getApiUrl` 함수를 사용하여 URL을 생성해야 합니다.

```typescript
import { getApiUrl } from '$lib/config';
const apiUrl = getApiUrl('/api/posts');
const response = await fetch(apiUrl);
const data = await response.json();
```

### 새로운 API 엔드포인트
- 새로운 API 엔드포인트는 `src/lib/config.ts`에 추가해야 합니다.
- 각 엔드포인트는 명확한 목적과 사용법을 주석으로 문서화해야 합니다.