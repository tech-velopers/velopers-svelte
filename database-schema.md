# 댓글 시스템 데이터베이스 스키마

## 1. 엔티티 관계 다이어그램 (ERD)

```
+-------------+       +-------------+       +--------------------+
|    USER     |       |    POST     |       |      COMMENT       |
+-------------+       +-------------+       +--------------------+
| user_id (PK)|--<|-- | post_id (PK)|--<|-- | comment_id (PK)    |
| ...         |       | user_id (FK)|       | post_id (FK)       |
+-------------+       | ...         |       | user_id (FK)       |
                      +-------------+       | parent_comment_id(FK)|--+
                                            | ...                |   |
                                            +--------------------+   |
                                                  |                  |
                                                  | (Self-referencing) |
                                                  +--------------------+
                                                  |
                                                  v
                                      +----------------------+
                                      |  COMMENT_REACTION    |
                                      +----------------------+
                                      | reaction_id (PK)     |
                                      | comment_id (FK)      |
                                      | user_id (FK)         |
                                      | ...                  |
                                      +----------------------+
```

---

## 2. 테이블 스키마

### 2.1. `USER` 테이블 (가정)

```sql
CREATE TABLE USER (
    user_id         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    nickname        VARCHAR(50)     NOT NULL,
    avatar_url      VARCHAR(255)    NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2. `POST` 테이블 (기존)

```sql
CREATE TABLE POST (
    post_id         BIGINT          PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    title           VARCHAR(255)    NOT NULL,
    content         TEXT            NOT NULL,
    comment_count   INT             DEFAULT 0,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(user_id)
);
```

### 2.3. `COMMENT` 테이블

```sql
CREATE TABLE COMMENT (
    comment_id          BIGINT          PRIMARY KEY AUTO_INCREMENT,
    post_id             BIGINT          NOT NULL,
    user_id             BIGINT          NOT NULL,
    parent_comment_id   BIGINT          NULL,
    content             TEXT            NOT NULL,
    is_edited           BOOLEAN         DEFAULT FALSE,
    is_deleted          BOOLEAN         DEFAULT FALSE,
    like_count          INT             DEFAULT 0,
    dislike_count       INT             DEFAULT 0,
    created_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (post_id) REFERENCES POST(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES COMMENT(comment_id) ON DELETE CASCADE
);
```
- **`parent_comment_id`**: `NULL`이면 최상위 댓글, 특정 `comment_id`를 가지면 해당 댓글의 대댓글.
- **`is_deleted`**: Soft Delete를 위한 플래그. `true`일 경우 "삭제된 댓글입니다"로 표시.
- **`like_count`, `dislike_count`**: 조회 성능 향상을 위한 비정규화된 카운트 컬럼.

### 2.4. `COMMENT_REACTION` 테이블

```sql
CREATE TABLE COMMENT_REACTION (
    reaction_id     BIGINT          PRIMARY KEY AUTO_INCREMENT,
    comment_id      BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    reaction_type   ENUM('LIKE', 'DISLIKE') NOT NULL,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (comment_id) REFERENCES COMMENT(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    UNIQUE KEY uk_comment_user_reaction (comment_id, user_id)
);
```
- **`uk_comment_user_reaction`**: 한 사용자가 한 댓글에 하나의 반응만 할 수 있도록 보장하는 복합 유니크 키.

---

## 3. 인덱스 생성 쿼리

```sql
-- POST 테이블
CREATE INDEX idx_post_user_id ON POST(user_id);

-- COMMENT 테이블
CREATE INDEX idx_comment_post_id ON COMMENT(post_id, created_at);
CREATE INDEX idx_comment_parent_id ON COMMENT(parent_comment_id);
CREATE INDEX idx_comment_user_id ON COMMENT(user_id);

-- COMMENT_REACTION 테이블
-- (uk_comment_user_reaction UNIQUE KEY가 (comment_id, user_id) 복합 인덱스 역할을 함)
CREATE INDEX idx_reaction_user_id ON COMMENT_REACTION(user_id);
```
