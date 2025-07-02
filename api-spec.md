# 댓글 시스템 API 명세서

## 1. 공통 사항

- **Base URL**: `/api`
- **인증**: 모든 요청의 `Authorization` 헤더에 `Bearer <JWT>` 토큰 포함.
- **데이터 형식**: 모든 요청/응답 본문은 `application/json` 사용.
- **오류 응답 형식**:
  ```json
  {
    "timestamp": "2023-10-27T10:00:00Z",
    "status": 404,
    "error": "Not Found",
    "message": "오류 메시지",
    "path": "/api/requested-path"
  }
  ```

---

## 2. 댓글 API

### 2.1. 댓글 조회

게시물에 달린 모든 댓글과 대댓글을 계층 구조로 조회합니다.

- **Method**: `GET`
- **Endpoint**: `/posts/{postId}/comments`
- **Request**:
  - Path Variable: `postId` (string) - 게시물 ID
- **Response**: `200 OK`
  - Body: `Comment` 객체 배열
  ```json
  [
    {
      "id": "comment-101",
      "content": "정말 유용한 정보네요!",
      "author": {
        "id": "user-abc",
        "name": "김스벨트",
        "avatarUrl": "/path/to/avatar1.png"
      },
      "createdAt": "2023-10-27T10:15:00Z",
      "isEdited": false,
      "reactions": {
        "likes": { "count": 5, "reactedByCurrentUser": true },
        "dislikes": { "count": 0, "reactedByCurrentUser": false }
      },
      "replies": [ /* ... Comment 객체 재귀 ... */ ]
    }
  ]
  ```

### 2.2. 댓글/대댓글 작성

- **Method**: `POST`
- **Endpoint**: `/posts/{postId}/comments`
- **Request**:
  - Path Variable: `postId` (string)
  - Body:
    ```json
    {
      "content": "새로운 댓글 내용입니다.",
      "parentId": null 
    }
    ```
    - `parentId`: 대댓글인 경우 부모 댓글 ID, 최상위 댓글은 `null`
- **Response**: `201 Created`
  - Body: 생성된 `Comment` 객체

### 2.3. 댓글 수정

- **Method**: `PATCH`
- **Endpoint**: `/comments/{commentId}`
- **Request**:
  - Path Variable: `commentId` (string)
  - Body:
    ```json
    {
      "content": "수정된 댓글 내용입니다."
    }
    ```
- **Response**: `200 OK`
  - Body: 수정된 `Comment` 객체 ( `isEdited` 필드가 `true`로 변경)

### 2.4. 댓글 삭제

- **Method**: `DELETE`
- **Endpoint**: `/comments/{commentId}`
- **Request**:
  - Path Variable: `commentId` (string)
- **Response**: `204 No Content`

---

## 3. 반응(Reaction) API

### 3.1. 이모티콘 반응 (좋아요/싫어요)

댓글에 대한 반응을 추가, 변경 또는 취소합니다.

- **Method**: `POST`
- **Endpoint**: `/comments/{commentId}/reactions`
- **Request**:
  - Path Variable: `commentId` (string)
  - Body:
    ```json
    {
      "type": "LIKE" 
    }
    ```
    - `type`: `LIKE` 또는 `DISLIKE`
- **Response**: `200 OK`
  - Body: 업데이트된 반응 정보
  ```json
  {
    "likes": { "count": 6, "reactedByCurrentUser": true },
    "dislikes": { "count": 0, "reactedByCurrentUser": false }
  }
  ```
- **서버 로직**:
  - 동일한 반응을 다시 요청하면 취소됩니다.
  - 다른 종류의 반응을 요청하면 기존 반응은 취소되고 새로운 반응이 추가됩니다.
