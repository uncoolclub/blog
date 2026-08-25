import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from '@tanstack/react-router'

import {
  DocIcon,
  GithubIcon,
  MailIcon,
  MoonIcon,
  RssIcon,
  SunIcon,
  UserIcon,
  StarMark,
} from '../svgs'

const THEME_INIT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`

function toggleTheme() {
  const root = document.documentElement
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches
  const next = dark ? 'light' : 'dark'
  root.classList.add('theme-switching')
  root.dataset.theme = next
  try {
    localStorage.setItem('theme', next)
  } catch {}
  setTimeout(() => root.classList.remove('theme-switching'), 300)
}
import appCss from '../styles.css?url'
import editorCss from '@blog/editor/styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: '양수빈 블로그' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Gowun+Batang:wght@400;700&display=swap',
      },
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
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  const pathname = useLocation({ select: (l) => l.pathname })
  const hideFooter = pathname === '/about'
  return (
    <div className={hideFooter ? 'shell no-footer' : 'shell'}>
      <header className="site-header">
        <Link to="/" aria-label="홈으로">
          <StarMark />
        </Link>
        <nav className="site-nav">
          <Link to="/" aria-label="글" title="글">
            <DocIcon />
          </Link>
          <Link to="/about" aria-label="소개" title="소개">
            <UserIcon />
          </Link>
          <button
            type="button"
            className="theme-toggle"
            aria-label="테마 전환"
            title="테마 전환"
            onClick={toggleTheme}
          >
            <SunIcon />
            <MoonIcon />
          </button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      {!hideFooter && (
        <footer className="site-footer">
          <div className="left">
            <StarMark small muted />
            <span>© 2026</span>
          </div>
          <div className="links">
            <a
              href="https://github.com/uncoolclub"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <GithubIcon />
            </a>
            <a href="/rss.xml" aria-label="RSS">
              <RssIcon />
            </a>
            <a href="mailto:marry@laftel.net" aria-label="메일">
              <MailIcon />
            </a>
          </div>
        </footer>
      )}
    </div>
  )
}
