<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/banner-dark.svg">
    <img src="docs/images/banner.svg" alt="Small Currents" width="400">
  </picture>
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-1342ff.svg" alt="license MIT"></a>
    <img src="https://img.shields.io/badge/cloudflare-workers-f38020.svg" alt="cloudflare workers">
  </p>
</div>

에디터로 쓰고, 버튼 한 번으로 발행하는 개인 블로그. TanStack Start + Cloudflare (Workers•D1•R2).

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

GitHub Discussions 기반이라 public 레포에서만 동작한다. 레포 공개 후:

1. Settings에서 Discussions를 켜고 [giscus 앱](https://github.com/apps/giscus)을 설치한다.
2. [giscus.app](https://giscus.app)에서 발급되는 `repoId`•`category`•`categoryId`를 `apps/web/src/components/comments.tsx`의 `GISCUS`에 채운다.

값이 비어 있는 동안 댓글 섹션은 렌더되지 않는다.

## 문서

설계 배경은 [docs/SPEC.md](docs/SPEC.md), 디자인 시스템은 [DESIGN.md](DESIGN.md).

## License

MIT © 양수빈. See [LICENSE](LICENSE) for details.

<img src="apps/web/public/favicon.svg" width="26" alt="">
