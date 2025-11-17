export default function WeatherCard({ forecast }) {
  if (!forecast) {
    return <div>Search for a destination to view weather.</div>;
  }

  return (
    <article>
      <h3>{forecast.location}</h3>
      <p>{forecast.summary}</p>
      <p>High: {forecast.high}° | Low: {forecast.low}°</p>
    </article>
  );
}