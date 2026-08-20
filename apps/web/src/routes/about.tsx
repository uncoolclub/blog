import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [{ title: 'About · yang-meli.tech' }],
  }),
  component: About,
})

function About() {
  return (
    <article className="post">
      <header className="post-header">
        <h1>About</h1>
        <div className="post-meta">
          <span>양수빈</span>
          <span>Frontend / UX Engineer</span>
        </div>
      </header>
      <div className="prose">
        <p>
          양수빈. 라프텔에서 프론트엔드 / UX 엔지니어로 일한다. 웹과 React
          Native 앱을 오가며 화면을 만들고, 디자인 시스템과 토큰을 코드로
          옮기는 일을 좋아한다.
        </p>
        <p>
          요즘 관심사는 AI 네이티브 디자인 시스템. 디자이너와 개발자 사이의
          핸드오프를 사람이 덜 반복하도록 만드는 도구를 실험하고 있다. 이
          블로그도 그 연장선에서 직접 만들었다. 에디터로 쓰고 버튼 한 번으로
          발행되는, 빌드 파이프라인이 글쓰기에 끼어들지 않는 구조다.
        </p>
      </div>
      <ul className="about-links">
        <li>
          <a
            href="https://github.com/uncoolclub"
            target="_blank"
            rel="noreferrer"
          >
            <span>↗ GitHub</span>
            <span className="dim">@uncoolclub</span>
          </a>
        </li>
        <li>
          <a href="mailto:marry@laftel.net">
            <span>↗ Email</span>
            <span className="dim">marry@laftel.net</span>
          </a>
        </li>
      </ul>
      <p className="credits">
        home imagery (Wikimedia Commons): sea glitter © Sunsetbeach (CC BY
        3.0) · pool © Shixart1985 (CC BY 2.0) · Le Morne Beach © dronepicr
        (CC BY 2.0)
      </p>
    </article>
  )
}
