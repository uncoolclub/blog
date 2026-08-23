# 로컬 개발 & 배포

## 로컬 개발

```bash
pnpm install
cd apps/web
pnpm exec wrangler d1 migrations apply blog --local   # 최초 1회
pnpm dev                                              # http://localhost:3000
```

`/write`에서 글을 쓴다. 로컬(dev)은 인증이 없고, D1•R2는 vite plugin이 에뮬레이션한다(`.wrangler/state`).

## 배포

파이프라인 없음. 로컬에서 `pnpm deploy` 한 번이 배포의 전부다.

### 최초 1회

```bash
cd apps/web
wrangler login
wrangler d1 create blog          # 출력된 database_id를 wrangler.jsonc에 반영
wrangler r2 bucket create blog-images
wrangler d1 migrations apply blog --remote
pnpm deploy
```

도메인은 Cloudflare에 있으므로: 대시보드 👉 Workers & Pages 👉 blog-web 👉
Settings 👉 Domains & Routes 👉 `blog.th3shu.dev` 추가로 끝.

### 어드민 보호 (배포 전 필수)

1. Zero Trust 👉 Access 👉 Applications 👉 Self-hosted 앱 생성.
   경로 `blog.th3shu.dev/write*`, 정책은 본인 이메일 One-Time PIN.
2. 앱의 Application Audience(AUD)와 팀 도메인(`https://<team>.cloudflareaccess.com`)을
   `wrangler.jsonc`의 `ACCESS_AUD` / `ACCESS_TEAM_DOMAIN`에 넣고 `pnpm deploy` 한 번 더.

이 값이 비어 있으면 프로덕션 어드민 API는 전부 403(fail-closed). 글 읽기는 영향 없다.

### 이후 배포

```bash
cd apps/web && pnpm deploy
```

### 콘텐츠 이관

로컬에서 쓰던 글•이미지는 프로덕션 D1/R2에 없다. 배포 후 `/write`에서
다시 발행하거나, 로컬 sqlite 내용을 `wrangler d1 execute --remote`로 옮긴다.

## 댓글 (giscus)

GitHub Discussions 기반이라 public 레포에서만 동작한다. 레포 공개 후:

1. Settings에서 Discussions를 켜고 [giscus 앱](https://github.com/apps/giscus)을 설치한다.
2. [giscus.app](https://giscus.app)에서 발급되는 `repoId`•`category`•`categoryId`를
   `apps/web/src/components/comments.tsx`의 `GISCUS`에 채운다.

값이 비어 있는 동안 댓글 섹션은 렌더되지 않는다.
