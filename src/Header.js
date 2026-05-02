import './Header.css';

function Header() {
  const dateAujourdhui = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="header">
      <h1 className="header-titre">SénTransport</h1>
      <p className="header-soustitre">
        Votre guide du transport en commun à Dakar
      </p>
      <p className="header-date">{dateAujourdhui}</p>
    </header>
  );
}

export default Header;