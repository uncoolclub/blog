import { createFileRoute } from '@tanstack/react-router'
import { FaceSketch, GithubIcon, MailIcon } from '../svgs'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: '소개 · yang-meli.tech' }],
  }),
  component: About,
})

function About() {
  return (
    <article>
      <div className="about-head">
        {/* 실제 사진이 생기면 <img>로 교체 */}
        <span className="avatar" aria-hidden="true">
          <FaceSketch />
        </span>
        <div>
          <div className="name">양수빈</div>
          <div className="role">Frontend / UX Engineer · Seoul</div>
        </div>
      </div>

      <div className="about-body">
        <p>
          라프텔에서 프론트엔드 / UX 엔지니어로 일한다. 웹과 React Native 앱을
          오가며 화면을 만들고, 디자인 시스템과 토큰을 코드로 옮기는 일을
          좋아한다.
        </p>
        <p>
          요즘 관심사는 AI 네이티브 디자인 시스템. 디자이너와 개발자 사이의
          핸드오프를 사람이 덜 반복하도록 만드는 도구를 실험하고 있다. 이
          블로그도 그 연장선에서 직접 만들었다.
        </p>
      </div>

      <div className="career">
        <span className="section-label">커리어</span>
        <div>
          <div className="gantt-axis">
            <span>2022</span>
            <span>2023</span>
            <span>2024</span>
            <span>2025</span>
            <span>2026</span>
          </div>
          <div className="gantt-track" style={{ marginTop: 8 }}>
            <span className="gantt-grid" style={{ left: '25%' }} />
            <span className="gantt-grid" style={{ left: '50%' }} />
            <span className="gantt-grid" style={{ left: '75%' }} />
            {/* 기간이 확정되면 left/right를 실제 연월 비율로 조정 */}
            <span
              className="gantt-bar"
              style={{ top: 27, left: '21%', right: '3%' }}
            />
          </div>
        </div>
        <div className="gantt-legend">
          <div>
            <span className="dot" />
            <span className="org">라프텔</span>
            <span className="role">Frontend / UX Engineer</span>
            <span className="period">— 현재</span>
          </div>
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
        <span className="section-label">연락</span>
        <div className="row">
          <a
            href="https://github.com/uncoolclub"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <GithubIcon />
          </a>
          <a href="mailto:marry@laftel.net" aria-label="메일">
            <MailIcon />
          </a>
          <span>깃허브와 메일로 열려 있습니다.</span>
        </div>
      </div>
    </article>
  )
}
