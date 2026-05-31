import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';
import arrets from './arrets.json';

// Corriger les icones Leaflet (bug webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Calculer la distance entre 2 points GPS (formule de Haversine, en km)
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Composant interne pour centrer la carte (Exercice 2)
function BoutonCentrer({ position }) {
  const map = useMap();
  if (!position) return null;
  return (
    <button
      className="bouton-centrer"
      onClick={() => map.setView(position, 15)}
    >
      📍 Centrer sur ma position
    </button>
  );
}

function Carte() {
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [arretsProches, setArretsProches] = useState([]);

  const DAKAR = [14.6928, -17.4467];

  // Géolocalisation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setPositionUtilisateur([pos.coords.latitude, pos.coords.longitude]);
        },
        () => console.log("Geolocation refusee")
      );
    }
  }, []);

  // Calculer les 3 arrêts les plus proches (Exercice 3)
  useEffect(() => {
    if (positionUtilisateur && arrets.length > 0) {
      const avecDistances = arrets.map(a => ({
        ...a,
        distance: calculerDistance(
          positionUtilisateur[0], positionUtilisateur[1],
          a.lat, a.lon
        )
      }));
      const top3 = avecDistances
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      setArretsProches(top3);
    }
  }, [positionUtilisateur]);

  return (
    <div className="carte-container">
      <h2 className="carte-titre">Carte des arrets</h2>

      {/* Exercice 3 : 3 arrêts les plus proches */}
      {arretsProches.length > 0 && (
        <div className="arrets-proches-liste">
          <p className="arrets-proches-titre">Les 3 arrêts les plus proches :</p>
          {arretsProches.map((a, index) => (
            <p key={a.id} className="arret-proche">
              <strong>{index + 1}. {a.nom}</strong> — {a.distance.toFixed(1)} km — Lignes : {a.lignes.join(", ")}
            </p>
          ))}
        </div>
      )}

      <MapContainer key="carte-dakar" center={DAKAR} zoom={13} className="carte">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />

        {/* Exercice 2 : bouton centrer */}
        <BoutonCentrer position={positionUtilisateur} />

        {arrets.map(a => (
          <Marker key={a.id} position={[a.lat, a.lon]}>
            <Popup>
              <strong>{a.nom}</strong><br />
              Lignes : {a.lignes.join(", ")}
              {arretsProches.length > 0 && arretsProches[0].id === a.id && (
                <><br /><em style={{ color: '#e67e22' }}>Arrêt le plus proche ✓</em></>
              )}
            </Popup>
          </Marker>
        ))}

        {positionUtilisateur && (
          <Marker position={positionUtilisateur}>
            <Popup>Vous etes ici</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Carte;