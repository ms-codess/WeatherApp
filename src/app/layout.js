import './globals.css'
import ThemeToggle from '../components/ThemeToggle'

export const metadata = {
  title: 'Weather Trip Planner',
  description: 'Plan trips with live weather insights.',
}

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Trips', href: '/trips' },
  { label: 'Favorites', href: '/trips#favorites' },
]

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <div className="app-shell">
          <header className="top-nav">
            <div className="top-nav__left">
              <div className="top-nav__brand">
                <strong>Weather Trip Planner</strong>
              </div>
              <nav className="top-nav__menu">
                {navigation.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="top-nav__actions">
              <ThemeToggle />
              <a className="btn btn--primary" href="/">
                New Search
              </a>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
