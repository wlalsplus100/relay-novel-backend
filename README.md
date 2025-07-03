# relay-novel-backend

## API 명세서

### 1. 인증 (Auth)

- **Base URL:** `/api/auth`

#### 회원가입

- **URL:** `/api/auth/signup`
- **Method:** POST
- **인증:** 불필요
- **Body:**
    ```json
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    ```
- **Response:**
    - 201 성공
        ```json
        {
            "message": "회원가입 성공",
            "user": { "id": "string", "username": "string" }
        }
        ```
    - 400 이미 가입된 이메일
    - 500 서버 에러

#### 로그인

- **URL:** `/api/auth/login`
- **Method:** POST
- **인증:** 불필요
- **Body:**
    ```json
    {
        "email": "string",
        "password": "string"
    }
    ```
- **Response:**
    - 200 성공
        ```json
        {
            "message": "로그인 성공!",
            "token": "JWT 토큰",
            "user": { "id": "string", "username": "string" }
        }
        ```
    - 404 등록되지 않은 유저
    - 401 비밀번호 불일치
    - 500 서버 에러

---

### 2. 소설 (Story)

- **Base URL:** `/api/stories`

#### 소설 생성

- **URL:** `/api/stories/`
- **Method:** POST
- **인증:** 필요
- **Body:**
    ```json
    {
        "title": "string",
        "description": "string",
        "isPublic": true
    }
    ```
- **Response:**
    - 201 성공
        ```json
        {
          "message": "소설 생성 완료",
          "story": { ... }
        }
        ```

#### 전체 공개 소설 목록 조회

- **URL:** `/api/stories/`
- **Method:** GET
- **인증:** 불필요
- **Response:**
    ```json
    {
      "stories": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "author": { "username": "string" },
          "parts": [ ... ]
        }
      ]
    }
    ```

#### 소설 상세 조회

- **URL:** `/api/stories/:id`
- **Method:** GET
- **인증:** 불필요
- **Response:**
    - 200 성공
        ```json
        {
          "story": {
            "id": "string",
            "title": "string",
            "description": "string",
            "author": { "username": "string" },
            "parts": [ ... ]
          }
        }
        ```
    - 404 소설 없음

---

### 3. 파트 (Part)

- **Base URL:** `/api/stories`

#### 파트 생성 (이어쓰기)

- **URL:** `/api/stories/:id/parts`
- **Method:** POST
- **인증:** 필요
- **Body:**
    ```json
    {
        "content": "string"
    }
    ```
- **Response:**
    - 201 성공
        ```json
        {
          "message": "이어쓰기 성공",
          "part": { ... }
        }
        ```
    - 404 소설 없음
    - 403 참여하지 않음/이미 작성함/차례 아님

#### 파트 목록 조회

- **URL:** `/api/stories/:id/parts`
- **Method:** GET
- **인증:** 불필요
- **Response:**
    ```json
    {
        "parts": [
            {
                "order": 1,
                "content": "string",
                "author": { "username": "string" }
            }
        ]
    }
    ```

#### 특정 순서의 파트 조회

- **URL:** `/api/stories/:id/parts/:order`
- **Method:** GET
- **인증:** 불필요
- **Response:**
    - 200 성공
        ```json
        {
            "part": {
                "order": 1,
                "content": "string",
                "author": { "username": "string" }
            }
        }
        ```
    - 404 해당 파트 없음

---

### 4. 참여 (Participation)

- **Base URL:** `/api/stories`

#### 소설 참여하기

- **URL:** `/api/stories/:id/participate`
- **Method:** POST
- **인증:** 필요
- **Response:**
    - 201 성공
        ```json
        {
          "message": "참여 완료",
          "participation": { ... }
        }
        ```
    - 400 이미 참여함

#### 참여자 목록 조회

- **URL:** `/api/stories/:id/participants`
- **Method:** GET
- **인증:** 불필요
- **Response:**
    ```json
    [
        {
            "user": { "username": "string" },
            "turnOrder": 1
        }
    ]
    ```

#### 현재 차례인 유저 조회

- **URL:** `/api/stories/:id/turn`
- **Method:** GET
- **인증:** 필요
- **Response:**
    - 200 성공
        ```json
        {
            "user": { "username": "string" },
            "turnOrder": 1
        }
        ```
    - 200 모든 차례 완료
        ```json
        {
            "message": "모든 차례 완료",
            "user": null
        }
        ```
