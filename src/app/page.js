import SearchBar from '../components/SearchBar';
import Map from '../components/Map';
import WeatherCard from '../components/WeatherCard';
import TripForm from '../components/TripForm';

export default function HomePage() {
  return (
    <section>
      <SearchBar />
      <div className="map-weather">
        <Map />
        <WeatherCard />
      </div>
      <TripForm />
    </section>
  );
}
