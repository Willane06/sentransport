import { useState, useEffect } from 'react';
import './Previsions.css';

function Previsions() {
  const [jours, setJours] = useState([]);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    const API_KEY = process.env.REACT_APP_OWM_KEY;

    if (!API_KEY) {
      setErreur("Cle API manquante (.env)");
      return;
    }

    const url =
      `https://api.openweathermap.org/data/2.5/forecast`
      + `?q=Dakar&appid=${API_KEY}`
      + `&units=metric&lang=fr&cnt=24`;

    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error("Erreur : " + r.status);
        return r.json();
      })
      .then(data => {
        // On groupe les prévisions par jour (1 entrée toutes les 3h)
        // On prend la prévision de midi pour chaque jour suivant
        const aujourdhui = new Date().toLocaleDateString('fr-FR');
        const parJour = {};

        data.list.forEach(item => {
          const date = new Date(item.dt * 1000);
          const dateStr = date.toLocaleDateString('fr-FR');
          const heure = date.getHours();

          // On ignore aujourd'hui, on prend la prévision la plus proche de midi
          if (dateStr === aujourdhui) return;

          if (!parJour[dateStr]) {
            parJour[dateStr] = item;
          } else {
            const heureActuelle = new Date(parJour[dateStr].dt * 1000).getHours();
            if (Math.abs(heure - 12) < Math.abs(heureActuelle - 12)) {
              parJour[dateStr] = item;
            }
          }
        });

        // On garde les 3 premiers jours
        const troisJours = Object.entries(parJour)
          .slice(0, 3)
          .map(([dateStr, item]) => ({
            dateStr,
            temperature: Math.round(item.main.temp),
            description: item.weather[0].description,
            icone: item.weather[0].icon,
            humidite: item.main.humidity,
          }));

        setJours(troisJours);
      })
      .catch(err => setErreur(err.message));
  }, []);

  if (erreur) {
    return (
      <div className="previsions previsions-erreur">
        <p>Prévisions indisponibles</p>
        <p className="previsions-detail">{erreur}</p>
      </div>
    );
  }

  if (jours.length === 0) {
    return <div className="previsions">Chargement des prévisions...</div>;
  }

  return (
    <div className="previsions">
      <h3 className="previsions-titre">Prévisions 3 jours</h3>
      <div className="previsions-liste">
        {jours.map(jour => (
          <div key={jour.dateStr} className="prevision-jour">
            <p className="prevision-date">{jour.dateStr}</p>
            <img
              src={`https://openweathermap.org/img/wn/${jour.icone}@2x.png`}
              alt={jour.description}
              className="prevision-icone"
            />
            <p className="prevision-temp">{jour.temperature}°C</p>
            <p className="prevision-desc">{jour.description}</p>
            <p className="prevision-humidite">💧 {jour.humidite}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Previsions;