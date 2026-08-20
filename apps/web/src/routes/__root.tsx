import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'
import editorCss from '@blog/editor/styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'yang-meli.tech' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: editorCss },
    ],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
  notFoundComponent: () => (
    <div className="empty">
      <p>페이지를 찾을 수 없어요.</p>
      <Link to="/">홈으로</Link>
    </div>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const TICKER = 'yang-meli.tech ● write → publish → live ● no pipeline ● '

function RootLayout() {
  return (
    <>
      <div className="ticker" aria-hidden>
        <div className="ticker-track">
          <span>{TICKER.repeat(4)}</span>
          <span>{TICKER.repeat(4)}</span>
        </div>
      </div>
      <header className="site-header">
        <Link to="/" className="site-title">
          yang-meli.tech
        </Link>
        <nav className="site-nav">
          <Link to="/">Index</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <main className="layout">
        <Outlet />
      </main>
    </>
  )
}
