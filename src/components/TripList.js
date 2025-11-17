export default function TripList({ trips = [] }) {
  if (!trips.length) {
    return <p>No trips planned yet.</p>;
  }

  return (
    <ul>
      {trips.map((trip) => (
        <li key={trip.id}>
          <strong>{trip.name}</strong> — {trip.origin} → {trip.destination}
        </li>
      ))}
    </ul>
  );
}