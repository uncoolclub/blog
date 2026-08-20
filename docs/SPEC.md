# 테크 스펙 v0.2

개인 개발 블로그. 네이버 블로그처럼 웹 에디터로 쓰고, 발행 버튼 한 번으로 즉시 공개한다.

## 원칙

- 회사 자산(pudding, 토스 톤) 미사용. 100% 개인 소유.
- 에디터 패키지(`@blog/editor`)가 프로젝트의 본체. 앱은 그걸 소비한다.
- 발행 = D1 UPDATE 한 번. 빌드•배포 파이프라인이 글 발행에 개입하지 않는다.
- 에디터와 발행 글 렌더러는 **같은 extension 세트**(`baseExtensions`)를 쓴다.
  여기가 어긋나면 에디터에서 보이는 것과 발행 글이 달라진다.

## 구조

```
blog/ (pnpm workspace + turborepo)
├─ apps/web              TanStack Start, Cloudflare Workers 배포
│   ├─ /                 글 목록
│   ├─ /posts/$slug      글 상세 (SSR, static-renderer HTML)
│   ├─ /write, /write/$id  관리자 (Cloudflare Access + JWT 검증)
│   └─ /api/upload, /api/images/$key  R2 이미지 파이프라인
└─ packages/editor       Tiptap v3
    ├─ <Editor />        쓰기 모드 (툴바, 자동저장 콜백, 이미지 붙여넣기/드롭)
    ├─ extensions.ts     스키마 단일 정본 (StarterKit + CodeBlockLowlight + Image)
    ├─ html.ts           서버 렌더: @tiptap/static-renderer (Workers에서 DOM 불필요)
    └─ highlight.ts      발행 글 코드블록 클라이언트 하이라이트 (lowlight)
```

## 스택 결정과 이유

| 선택 | 이유 |
|---|---|
| TanStack Start | Vite 기반이라 Cloudflare Workers 배포가 1급. RSC 불필요한 규모 |
| D1 | posts 테이블 하나. SQLite로 충분, 같은 플랫폼 |
| R2 | 이미지. `/api/images/$key`로 서빙(UUID 키 = 영구 캐시) |
| Cloudflare Access | 관리자 1명. 로그인 UI를 코드 0줄로. 단 server fn RPC는 경로 보호가 안 닿아서 앱에서 Access JWT를 직접 검증(`assertAdmin`, jose) |
| @tiptap/static-renderer | `@tiptap/html`은 happy-dom 의존이라 Workers 불가. static-renderer는 순수 함수 |

## 데이터

```sql
posts(id, slug UNIQUE, title, content /* Tiptap JSON */, status draft|published,
      published_at, created_at, updated_at)
```

## 에디터 로드맵

- **E1 코어 (완료)**: StarterKit(제목•리스트•인용 등), 링크(autolink + 붙여넣기), 구분선, 코드블록(lowlight)
- **E2 미디어 (업로드 완료 / 정렬•캡션 남음)**: 이미지 업로드(붙여넣기•드래그•버튼) ✅, 정렬•캡션•리사이즈
- **E3 임베드**: 유튜브, 트위터/X, URL og 카드
- **E4 네이버 감성**: 콜아웃, 이미지 그룹(2~3장), 글자색•배경색

## v1에서 안 하는 것

댓글(필요하면 giscus), 조회수, 검색, 태그, 예약 발행, RSS(M2), 다중 작성자.

## 디자인

Apple Developer 톤. 시스템 폰트 스택, 계조 + accent 1색(#0066cc / 다크 #2997ff),
라이트•다크는 `prefers-color-scheme`. 토큰은 `apps/web/src/styles.css`의 CSS 변수 20여 개.
