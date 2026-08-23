# 테크 스펙

네이버 블로그처럼 웹 에디터로 쓰고, 발행 버튼 한 번으로 즉시 공개되는 개인 블로그.
글 하나 고치는 데 빌드 파이프라인이 끼어들지 않는 것이 이 프로젝트의 유일한 요구사항이다.

## 원칙

- 발행 = D1 UPDATE 한 번. 빌드•배포는 글 발행에 관여하지 않는다.
- 에디터 패키지(`@blog/editor`)가 본체고, 앱은 그걸 소비한다.
- 에디터와 발행 글 렌더러는 같은 extension 세트(`extensions.ts`)를 쓴다.
  여기가 어긋나면 쓰면서 본 화면과 발행된 화면이 달라진다.

## 구조

```
apps/web                 TanStack Start, Cloudflare Workers
├─ /                     글 목록 (대표 카드 + 리스트)
├─ /posts/$slug          글 상세 (SSR, static-renderer HTML)
├─ /about                소개
├─ /write, /write/$id    관리자 (Cloudflare Access + JWT 검증)
└─ /api/upload, /api/images/$key   R2 이미지 파이프라인

packages/editor          Tiptap v3
├─ Editor.tsx            쓰기 모드
├─ Toolbar.tsx           서식 버튼
├─ extensions.ts         스키마 단일 정본
├─ html.ts               서버 렌더 (@tiptap/static-renderer)
└─ highlight.ts          발행 글 코드 하이라이트 (lowlight)
```

## 스택을 고른 이유

| 선택 | 이유 |
|---|---|
| TanStack Start | Vite 기반이라 Workers 배포가 1급. RSC가 필요 없는 규모 |
| D1 | posts 테이블 하나. SQLite로 충분하고 Workers와 같은 플랫폼 |
| R2 | 이미지 저장. `/api/images/$key`로 서빙 (UUID 키 = 영구 캐시) |
| Cloudflare Access | 관리자 1명. 로그인 UI를 코드 0줄로 해결. 단 server fn RPC는 경로 보호가 닿지 않아 앱에서 Access JWT를 직접 검증한다 (`assertAdmin`, jose) |
| @tiptap/static-renderer | `@tiptap/html`은 happy-dom 의존이라 Workers에서 못 쓴다. static-renderer는 순수 함수 |

## 데이터

```sql
posts(id, slug UNIQUE, title, content /* Tiptap JSON */, status draft|published,
      published_at, created_at, updated_at)
```

글 목록의 발췌와 커버는 저장하지 않고 content에서 파생한다
(첫 이미지 = 썸네일, 이미지가 없으면 id 기반 모티프 커버).

## 하지 않는 것

조회수, 검색, 태그, 예약 발행, RSS, 다중 작성자.
댓글은 giscus(GitHub Discussions)로 외주 — [DEPLOY.md](DEPLOY.md) 참고.
