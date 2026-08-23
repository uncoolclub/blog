# 로컬 개발 & 배포

## 로컬 개발

```bash
pnpm install
cd apps/web
pnpm exec wrangler d1 migrations apply blog --local   # 최초 1회
pnpm dev                                              # http://localhost:3000
```

`/write`에서 글을 쓴다. 로컬(dev)은 인증이 없고, D1•R2는 vite plugin이 에뮬레이션한다(`.wrangler/state`).

## 배포 파이프라인

`main`에 push하면 GitHub Actions(`.github/workflows/deploy.yml`)가
빌드 👉 D1 마이그레이션 👉 `wrangler deploy`를 실행한다.

### 최초 1회 셋업

1. **Cloudflare 리소스 생성** (로컬에서 `wrangler login` 후):

   ```bash
   cd apps/web
   wrangler d1 create blog          # 출력된 database_id를 wrangler.jsonc에 반영
   wrangler r2 bucket create blog-images
   ```

2. **GitHub Secrets 등록** (repo Settings 👉 Secrets and variables 👉 Actions):
   - `CLOUDFLARE_API_TOKEN` — dash.cloudflare.com 👉 My Profile 👉 API Tokens.
     "Edit Cloudflare Workers" 템플릿 + D1 Edit 권한 추가
   - `CLOUDFLARE_ACCOUNT_ID` — 대시보드 우측 사이드바

3. **도메인 연결**: 대시보드 👉 Workers & Pages 👉 blog-web 👉 Settings 👉
   Domains & Routes 👉 커스텀 도메인 추가

4. **어드민 보호 (필수)**: Zero Trust 👉 Access 👉 Applications 👉 Self-hosted
   - 경로: `도메인/write*`, 정책: 본인 이메일 One-Time PIN
   - 앱의 Application Audience(AUD)와 팀 도메인(`https://<team>.cloudflareaccess.com`)을
     `wrangler.jsonc`의 `ACCESS_AUD` / `ACCESS_TEAM_DOMAIN`에 넣고 재배포
   - 이 값이 비어 있으면 프로덕션 어드민 API는 전부 403(fail-closed). 글 읽기는 영향 없음

5. **콘텐츠 이관**: 로컬에서 쓰던 글•이미지는 프로덕션 D1/R2에 없다.
   배포 후 `/write`에서 다시 발행하거나, 로컬 sqlite 👉 `wrangler d1 execute --remote`로 옮긴다.

## 댓글 (giscus)

GitHub Discussions 기반이라 public 레포에서만 동작한다. 레포 공개 후:

1. Settings에서 Discussions를 켜고 [giscus 앱](https://github.com/apps/giscus)을 설치한다.
2. [giscus.app](https://giscus.app)에서 발급되는 `repoId`•`category`•`categoryId`를
   `apps/web/src/components/comments.tsx`의 `GISCUS`에 채운다.

값이 비어 있는 동안 댓글 섹션은 렌더되지 않는다.
