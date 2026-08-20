# blog

Tiptap 에디터로 쓰고 즉시 발행하는 개인 블로그. TanStack Start + Cloudflare (Workers•D1•R2).
설계 배경과 구조는 [docs/SPEC.md](docs/SPEC.md).

## 로컬 개발

```bash
pnpm install
cd apps/web
pnpm exec wrangler d1 migrations apply blog --local   # 최초 1회
pnpm dev                                              # http://localhost:3000
```

- `/write`에서 글 작성. 로컬(dev)은 인증 없음.
- D1•R2는 vite plugin이 로컬 에뮬레이션(`.wrangler/state`).

## 배포 (최초 1회 셋업)

```bash
cd apps/web
wrangler login
wrangler d1 create blog          # 출력된 database_id를 wrangler.jsonc에 반영
wrangler r2 bucket create blog-images
wrangler d1 migrations apply blog --remote
pnpm deploy                      # build + wrangler deploy
```

이후 커스텀 도메인: Cloudflare 대시보드 👉 Workers 👉 blog-web 👉 Settings 👉 Domains에 도메인 연결.

### 어드민 보호 (배포 전 필수)

1. Zero Trust 👉 Access 👉 Applications 👉 Self-hosted 앱 생성, 경로 `도메인/write*` 보호,
   정책은 본인 이메일 One-Time PIN.
2. 앱의 **Application Audience (AUD)** 태그와 팀 도메인(`https://<team>.cloudflareaccess.com`)을
   `wrangler.jsonc`의 `ACCESS_AUD` / `ACCESS_TEAM_DOMAIN`에 넣고 재배포.

이 값이 비어 있으면 프로덕션 어드민 API는 전부 403이다(fail-closed). 글 읽기는 영향 없음.

## 구조

```
apps/web          TanStack Start 앱 (라우트, server fn, D1/R2 바인딩)
packages/editor   Tiptap 에디터 + 렌더러 (@blog/editor)
```
