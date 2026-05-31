import { useState, useEffect } from 'react';
import './ListeIncidents.css';

function ListeIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/incidents")
      .then(r => {
        if (!r.ok) throw new Error("Erreur serveur : " + r.status);
        return r.json();
      })
      .then(data => {
        setIncidents(data);
        setChargement(false);
      })
      .catch(err => {
        setErreur(err.message);
        setChargement(false);
      });
  }, []);

  if (chargement) {
    return <div className="liste-incidents">Chargement des incidents...</div>;
  }

  if (erreur) {
    return (
      <div className="liste-incidents liste-erreur">
        <p>Incidents indisponibles</p>
        <p className="liste-detail">{erreur}</p>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="liste-incidents">
        <h2 className="liste-titre">Incidents signalés</h2>
        <p className="liste-vide">Aucun incident signalé pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="liste-incidents">
      <h2 className="liste-titre">Incidents signalés ({incidents.length})</h2>
      <div className="liste-container">
        {incidents.map(incident => (
          <div key={incident.id} className="incident-card">
            <div className="incident-header">
              <span className="incident-ligne">Ligne {incident.ligne}</span>
              <span className="incident-id">#{incident.id}</span>
            </div>
            <p className="incident-description">{incident.description}</p>
            <p className="incident-lieu">📍 {incident.lieu}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListeIncidents;