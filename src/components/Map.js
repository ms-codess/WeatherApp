export default function Map({ coordinates }) {
  return (
    <div>
      <p>Map placeholder</p>
      {coordinates ? <p>Lat: {coordinates.lat}, Lng: {coordinates.lng}</p> : <p>No location selected</p>}
    </div>
  );
}