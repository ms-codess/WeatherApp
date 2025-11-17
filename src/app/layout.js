export const metadata = {
  title: 'Weather Trip Planner',
  description: 'Plan trips with live weather insights.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>Weather Trip Planner</h1>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
