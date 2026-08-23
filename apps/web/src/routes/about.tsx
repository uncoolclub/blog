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
    start: '2024.01',
    end: null,
    color: '#8068f8',
    logo: '/logos/laftel.png',
    bar: { left: '50%', right: '0%' },
  },
  {
    org: '반지하게임즈',
    role: 'Full-Stack Developer',
    start: '2021.08',
    end: '2023.11',
    color: '#2eb8d8',
    logo: '/logos/banjiha.png',
    bar: { left: '9.7%', width: '37.5%' },
  },
  {
    org: '겟차',
    role: 'Frontend Developer',
    start: '2021.01',
    end: '2021.08',
    color: '#e0402e',
    logo: '/logos/getcha.png',
    bar: { left: '0%', width: '9.7%' },
    labelOut: true,
  },
]

const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026']

function formatPeriod(start: string, end: string | null): string {
  const [sy, sm] = start.split('.').map(Number)
  const now = new Date()
  const [ey, em] = end
    ? end.split('.').map(Number)
    : [now.getFullYear(), now.getMonth() + 1]
  const months = (ey - sy) * 12 + (em - sm)
  const y = Math.floor(months / 12)
  const m = months % 12
  const dur = [y > 0 && `${y}년`, m > 0 && `${m}개월`].filter(Boolean).join(' ')
  return `${start} — ${end ?? '현재'} (${dur})`
}

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
          서비스가 지향하는 가치를 충분히 이해하고, 그 가치가 사용자의 경험
          속에서 자연스럽게 드러나도록 만드는 일을 좋아합니다. 좋은 제품은
          개별 기능의 완성도만으로 만들어지는 것이 아니라, 무엇을 중요하게
          여기는지에 대한 팀의 공통된 이해에서 시작된다고 믿습니다. 같은
          방향을 바라보는 사람들과 생각을 나누고, 그 생각을 구체적인 경험으로
          번역해 나가는 과정에서 가장 큰 즐거움을 느낍니다.
        </p>
        <p>
          개발에서는 복잡함을 감추는 것보다 불필요한 복잡함 자체를 줄이는
          설계를 지향합니다. 사용자가 제품을 이해하기 위해 들이는 노력뿐
          아니라, 동료가 코드를 읽고 판단하고 확장하는 데 필요한 인지적
          비용까지 설계의 일부라고 생각합니다. 좋은 구조란 영리한 구조보다
          다음 사람이 자연스럽게 이해할 수 있는 구조에 가깝다고 믿습니다.
        </p>
        <p>
          한편으로는 제가 제품과 팀에 어떤 방식으로 더 좋은 기여를 할 수
          있는지 자주 고민합니다. 특정 기술을 더 많이 아는 것보다는 문제를
          바라보는 해상도를 높이고, 이전보다 나은 질문을 할 수 있는 사람이
          되는 데 관심이 있습니다. 최근에는 특히 사용자 경험에 깊이 빠져
          있습니다. 작은 인터랙션과 문장 하나, 화면 사이의 흐름이 사용자가
          제품을 어떻게 받아들이게 만드는지 관찰하고, 기술이 그 경험을
          어디까지 섬세하게 뒷받침할 수 있는지를 탐구하고 있습니다.
        </p>
        <p>
          결국 오래 함께 제품을 만들고 싶은 동료, 그리고 자신이 만드는 것에
          애정을 잃지 않는 개발자가 되고 싶습니다.
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
          <div className="gantt-chart">
            {YEARS.slice(1).map((y, i) => (
              <span
                key={y}
                className="gantt-grid"
                style={{ left: `${((i + 1) * 100) / 6}%` }}
              />
            ))}
            {CAREER.map((c) => (
              <div key={c.org} className="gantt-lane">
                <span
                  className="gantt-pill"
                  style={{
                    background: `color-mix(in srgb, ${c.color} 14%, var(--bg))`,
                    color: c.color,
                    ...c.bar,
                  }}
                >
                  <img src={c.logo} alt="" />
                  {!c.labelOut && c.org}
                </span>
                {c.labelOut && (
                  <span
                    className="gantt-out-label"
                    style={{
                      left: `calc(${c.bar.left} + ${c.bar.width} + 10px)`,
                      color: c.color,
                    }}
                  >
                    {c.org}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="gantt-legend">
          {CAREER.map((c) => (
            <div key={c.org}>
              <span className="dot" style={{ background: c.color }} />
              <span className="org">{c.org}</span>
              <span className="role">{c.role}</span>
              <span className="period">{formatPeriod(c.start, c.end)}</span>
            </div>
          ))}
        </div>
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
        </div>
      </div>
    </article>
  )
}
