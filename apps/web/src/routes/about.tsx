import { createFileRoute } from '@tanstack/react-router'
import { FaceSketch, GithubIcon, MailIcon } from '../svgs'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: '소개 · yang-meli.tech' }],
  }),
  component: About,
})

const CAREER = [
  {
    org: '라프텔',
    role: 'Frontend Engineer',
    period: '2024.01 — 현재',
    color: 'var(--accent)',
    logo: '/logos/laftel.png',
    bar: { left: '50%', right: '6%' },
  },
  {
    org: '반지하게임즈',
    role: 'Full-Stack Developer',
    period: '2021.08 — 2023.11',
    color: '#d29a2c',
    logo: null,
    bar: { left: '9.7%', width: '37.5%' },
  },
  {
    org: '겟차',
    role: 'Frontend Developer',
    period: '2021.01 — 2021.08',
    color: '#e0402e',
    logo: '/logos/getcha.png',
    bar: { left: '0.5%', width: '9.2%' },
  },
]

const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026']

function About() {
  return (
    <article>
      <div className="about-head">
        <span className="avatar" aria-hidden="true">
          <FaceSketch />
        </span>
        <div>
          <div className="name">양수빈</div>
          <div className="role">Frontend Engineer · Seoul</div>
        </div>
      </div>

      <div className="about-body">
        <p>
          체감의 차이를 만드는 디테일에 집중한다. 터치 인터랙션의 미세한 반응,
          화면 전환의 작은 어긋남처럼 사용자가 말로 설명하지 못해도 분명히
          체감하는 지점을 찾아 다듬는 일을 좋아한다. 그 과정에서 발견한 기준이
          혼자의 감각으로 남지 않도록 디자인 시스템과 컴포넌트, 린트 규칙과
          도구로 구조화한다.
        </p>
        <p>
          신차 구매 플랫폼, 누적 120만 다운로드를 기록한 인디 게임, MAU 160만
          애니메이션 OTT까지 규모와 도메인이 다른 환경에서 일해 왔다. React
          Native 앱과 7개 언어 글로벌 웹, WebView 하이브리드 서비스를 오가며
          웹과 네이티브의 경계에서 제품 경험을 만든다.
        </p>
      </div>

      <div className="career">
        <span className="section-label">Experience</span>
        <div>
          <div className="gantt-axis">
            {YEARS.map((y, i) => (
              <span key={y} style={{ left: `${(i * 100) / 6}%` }}>
                {y}
              </span>
            ))}
          </div>
          <div className="gantt-track" style={{ marginTop: 6 }}>
            {YEARS.slice(1).map((y, i) => (
              <span
                key={y}
                className="gantt-grid"
                style={{ left: `${((i + 1) * 100) / 6}%` }}
              />
            ))}
            {CAREER.map((c, i) => (
              <span
                key={c.org}
                className="gantt-bar"
                style={{ top: 12 + i * 18, background: c.color, ...c.bar }}
              />
            ))}
          </div>
        </div>
        <div className="gantt-legend">
          {CAREER.map((c) => (
            <div key={c.org}>
              <span className="dot" style={{ background: c.color }} />
              {c.logo ? (
                <img className="logo" src={c.logo} alt="" />
              ) : (
                <span className="logo logo-tile">반</span>
              )}
              <span className="org">{c.org}</span>
              <span className="role">{c.role}</span>
              <span className="period">{c.period}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="slogan-card">
        <span className="slogan">
          SMALL CURRENTS SHAPE THE SHORE — SLOWLY, SURELY
        </span>
        <p>
          작은 물결이 해안의 모양을 바꾼다고 믿는다. 크게 한 번이 아니라, 작게
          그리고 꾸준히. 이 블로그는 그 물결들의 기록이다.
        </p>
      </div>

      <div className="contact">
        <span className="section-label">Contact</span>
        <div className="row">
          <a
            href="https://github.com/uncoolclub"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>
          <a href="mailto:azxq1000@gmail.com" aria-label="메일">
            <MailIcon />
          </a>
          <span>깃허브와 메일로 열려 있습니다.</span>
        </div>
      </div>
    </article>
  )
}
