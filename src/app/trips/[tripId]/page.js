export default function TripDetailPage({ params }) {
  const { tripId } = params;

  return (
    <section>
      <h2>Trip Detail</h2>
      <p>Trip ID: {tripId}</p>
      <p>Weather forecast and itinerary details render here.</p>
    </section>
  );
}