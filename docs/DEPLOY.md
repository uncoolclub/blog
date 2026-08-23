# 개발 & 배포

## 로컬

```bash
pnpm install
cd apps/web
pnpm exec wrangler d1 migrations apply blog --local   # 최초 1회
pnpm dev                                              # http://localhost:3000
```

`/write`에서 글을 쓴다. dev는 인증이 없고 D1•R2는 로컬 에뮬레이션이다.

## 배포

```bash
cd apps/web && pnpm deploy
```

이게 전부다. 도메인(blog.th3shu.dev)은 wrangler.jsonc의 `routes`가 배포 때 연결한다.

처음 세팅할 때만 필요한 것: `wrangler login`, `d1 create blog`(id를 wrangler.jsonc에),
`r2 bucket create blog-images`, 원격 마이그레이션, 그리고 Zero Trust에서
`blog.th3shu.dev/write*`를 이메일 OTP로 보호하고 AUD•팀 도메인을 wrangler.jsonc에 넣는 것.
AUD가 비어 있으면 어드민 API는 전부 403이다(fail-closed).

## 댓글 (giscus)

public 레포에서만 동작한다. Discussions를 켜고 [giscus 앱](https://github.com/apps/giscus)을
설치한 뒤, [giscus.app](https://giscus.app)이 주는 값을
`apps/web/src/components/comments.tsx`의 `GISCUS`에 채운다. 비어 있으면 렌더되지 않는다.
