import './globals.css';

export const metadata = {
  title: 'Weather Trip Planner',
  description: 'Plan trips with live weather insights.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="top-nav">
            <div className="top-nav__brand">
              <strong>Weather Trip Planner</strong>
              <span>Forecast-aware itineraries</span>
            </div>
            <nav className="top-nav__actions">
              <a className="btn pill-link" href="/trips">
                Trips
              </a>
              <a className="btn btn--primary" href="/">
                New Search
              </a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
