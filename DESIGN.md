# Blog Design System

## 1. Atmosphere & Identity

조용한 정밀함(quiet precision). UX 엔지니어 개인 사이트 계열(rauno.me, paco.me)의 문법: 672px 한 컬럼, 넉넉한 여백, 뉴트럴 그레이 스케일, 장식 0. 시그니처는 파도 로고와 블루 한 색뿐이다. 슬로건 "SMALL CURRENTS SHAPE THE SHORE — SLOWLY, SURELY"는 소개 페이지의 카드 한 장으로만 놓인다.

## 2. Logo

곡선의 단일 정본은 `apps/web/src/svgs/wave.tsx`.

- **글리프**: 앞으로 말리는 파도 + 그 면을 타는 서핑보드 (🏄에서 사람만 뺀 구성).
- **헤더** = 블루 타일(#2f2fff, 라운드 10px) + 흰 풀 글리프.
- **푸터** = `muted` 변형 (칩 배경 + 회색 획), 회색 아이콘들과 같은 온도.
- **파비콘** (`public/favicon.svg`) = 작은 크기 전용 단순화: 보드 없이 굵은 파도 한 획(스트로크 9). 16px에서도 읽힌다.
- 홈 카드 커버도 같은 글리프를 잉크색으로 공유한다.

## 3. Color

| Role | Token | Light | Dark |
|---|---|---|---|
| Page | `--bg` | `#ffffff` | `#111113` |
| Surface | `--bg-soft` | `#f6f6f8` | `#1b1b1f` |
| Chip | `--chip` | `#f2f2f4` | `#232327` |
| Hairline | `--border` | `#eaeaee` | `#26262b` |
| Text | `--text` | `#19191c` | `#ececf0` |
| Text 2~4 | `--text-2/3/4` | `#5a5a62` / `#84848c` / `#b0b0b8` | 대응 밝음 |
| Accent | `--accent` | `#2f2fff` | `#6b6bff` |

그레이는 전부 뉴트럴(노랑 기 없음). 블루는 로고•링크•hover•진행률 바에만 아껴 쓴다. 예외적 웜 톤 둘: 소개 아바타 자리 표시(살구), 커버 그라디언트(콘텐츠 액센트).

## 4. Typography

- 본문: `--font-sans` (system-ui, Helvetica Neue, Apple SD Gothic Neo, Pretendard). 16.5px / 1.85.
- 라벨•날짜•메타: `--font-label` = **Space Grotesk** (Google Fonts). 코딩 폰트 아님.
- 코드: `--font-mono` (SF Mono 계열) — 코드 블록•인라인 코드에만.
- 제목: 글 상세 29px/650, 홈 대표 카드 22px/650, 트래킹 −0.02em 내외.

## 5. Layout & Components

- **셸**: 672px 컬럼(`.shell`), 헤더(마크 + 글/소개 아이콘 내비) / main / 한 줄 푸터(muted 마크 + © / GitHub•RSS•메일 아이콘).
- **홈**: 최신 1건 풀폭 대형 카드(커버 300px + 발췌) 👉 다음 2건 2열 카드 👉 나머지 리스트(제목 + 날짜, 연도 그룹).
- **글 상세**: 상단 2.5px 블루 진행률 바(스크롤 연동), 제목 + "날짜 · N words" 메타, prose, 이전/다음 고스트 카드 페어, giscus 댓글(설정 시).
- **소개**: 아바타 + 이름 👉 소개 문단 👉 커리어 간트(연도 축 + 기간 바 + 범례) 👉 슬로건 카드 👉 연락.
- **prose**: 조용한 코드 패널(라운드 8px, 테두리 없음), 이미지 라운드 10px + 헤어라인, 인용은 하프라인.

## 6. Motion & Interaction

- hover = 색 전이만(제목 👉 블루, 배경 👉 `--hover`). 트랜스폼 애니메이션 없음.
- 진행률 바는 스크롤 핸들러가 DOM에 직접 반영(리렌더 없음).

## 7. Accessibility

- WCAG 2.2 AA 목표. 아이콘 내비•푸터 아이콘은 전부 `aria-label` + `title`.
- 장식 SVG(마크•커버•아바타)는 `aria-hidden`.
- 다크 모드는 `prefers-color-scheme` 토큰 스왑.

## 8. 남은 채움 목록

- giscus 설정값 (`posts.$slug.tsx`의 `GISCUS`) — 채우면 댓글 활성화.
- 커리어 간트의 실제 입사 연월 비율•기간 텍스트 (`about.tsx`).
- 프로필 사진 (아바타 자리 표시 교체).
- RSS 라우트 (`/rss.xml`) — 푸터 링크만 있고 미구현 (SPEC M2).
- posts 커버 이미지 필드 — 생기면 id 기반 그라디언트 커버 교체.
