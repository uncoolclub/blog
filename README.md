<div align="center">
  <a href="https://yang-meli.tech">
    <img src="apps/web/public/favicon.svg" width="80" alt="Small Currents 로고">
  </a>
  <h1>Small Currents</h1>
  <p>에디터로 쓰고, 버튼 한 번으로 발행하는 개인 블로그.</p>
  <p><sub>SMALL CURRENTS SHAPE THE SHORE — SLOWLY, SURELY</sub></p>
</div>

<br>

## 특징

- **발행 = UPDATE 쿼리 한 번.** 빌드 파이프라인이 글쓰기에 끼어들지 않는다.
- **에디터가 본체.** 쓰기 화면과 발행 글이 같은 Tiptap extension 세트를 공유해서, 쓰면서 본 화면이 곧 발행된 화면이다.
- **이미지는 붙여넣기.** 붙여넣기•드래그가 그대로 R2 업로드가 된다.
- **조용한 지면.** 672px 한 컬럼, 읽기 진행률 바, 글마다 순환하는 커버 모티프.

## 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | [TanStack Start](https://tanstack.com/start) | Vite 기반이라 Workers 배포가 1급 |
| 런타임 | Cloudflare Workers | 글 저장소(D1)•이미지(R2)와 같은 플랫폼 |
| 에디터 | [Tiptap](https://tiptap.dev) v3 | 스키마 단일 정본(`@blog/editor`) |
| 어드민 인증 | Cloudflare Access | 로그인 UI 코드 0줄, server fn은 JWT 직접 검증 |

## 구조

```
apps/web          TanStack Start 앱 (라우트, server fn, D1/R2 바인딩)
packages/editor   Tiptap 에디터 + 렌더러 (@blog/editor)
```

## 로컬 개발

```bash
pnpm install
cd apps/web
pnpm exec wrangler d1 migrations apply blog --local   # 최초 1회
pnpm dev                                              # http://localhost:3000
```

`/write`에서 글을 쓴다. 로컬(dev)은 인증이 없고, D1•R2는 vite plugin이 에뮬레이션한다(`.wrangler/state`).

## 배포

```bash
cd apps/web
wrangler login
wrangler d1 create blog          # 출력된 database_id를 wrangler.jsonc에 반영
wrangler r2 bucket create blog-images
wrangler d1 migrations apply blog --remote
pnpm deploy                      # build + wrangler deploy
```

커스텀 도메인은 Cloudflare 대시보드 👉 Workers 👉 blog-web 👉 Settings 👉 Domains에서 연결한다.

### 어드민 보호 (배포 전 필수)

1. Zero Trust 👉 Access 👉 Applications 👉 Self-hosted 앱을 만들고 `도메인/write*` 경로를 보호한다. 정책은 본인 이메일 One-Time PIN.
2. 앱의 **Application Audience (AUD)** 태그와 팀 도메인(`https://<team>.cloudflareaccess.com`)을 `wrangler.jsonc`의 `ACCESS_AUD` / `ACCESS_TEAM_DOMAIN`에 넣고 재배포한다.

이 값이 비어 있으면 프로덕션 어드민 API는 전부 403이다(fail-closed). 글 읽기는 영향이 없다.

## 댓글 (giscus)

GitHub Discussions 기반이라 **public 레포에서만** 동작한다. 레포 공개 후:

1. Settings에서 Discussions를 켜고 [giscus 앱](https://github.com/apps/giscus)을 설치한다.
2. [giscus.app](https://giscus.app)에서 발급되는 `repoId`•`category`•`categoryId`를 `apps/web/src/components/comments.tsx`의 `GISCUS`에 채운다.

값이 비어 있는 동안 댓글 섹션은 렌더되지 않는다.

## 문서

설계 배경은 [docs/SPEC.md](docs/SPEC.md), 디자인 시스템은 [DESIGN.md](DESIGN.md).
