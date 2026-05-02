const downloadUrl = "https://github.com/Zy-Cuhk1727/exotic-pet-app/archive/refs/heads/main.zip";

const featureCards = [
  ["AI Care Assistant", "Ask species-aware questions about feeding, humidity, shedding, and alerts."],
  ["Habitat Monitoring", "Track temperature, humidity, movement, and care reminders in a mobile-first dashboard."],
  ["Smart Alerts", "Review color-coded alert severity and expand the latest notification details."],
  ["Community + Shop", "Share reptile moments, interact with keepers, and browse reptile supplies."],
];

function DownloadPage() {
  return (
    <main className="download-page">
      <section className="download-hero">
        <div className="download-copy">
          <p className="section-label">ReptiMind prototype</p>
          <h1>AI Reptile Care in Your Pocket</h1>
          <p>
            A mobile-first reptile care app for habitat monitoring, smart alerts,
            community sharing, supply shopping, and contextual AI advice.
          </p>
          <div className="download-actions">
            <a className="download-primary" href={downloadUrl}>
              Download Project
            </a>
            <a className="download-secondary" href="/">
              Open Demo
            </a>
          </div>
        </div>

        <div className="download-phone" aria-label="ReptiMind app preview">
          <div className="download-phone-top">
            <div>
              <span>ReptiMind</span>
              <strong>Spike</strong>
            </div>
            <img alt="" src="/pets/bearded-dragon.webp" />
          </div>
          <div className="download-metric-row">
            <article>
              <span>Temperature</span>
              <strong>31.8°C</strong>
            </article>
            <article>
              <span>Humidity</span>
              <strong>56%</strong>
            </article>
          </div>
          <div className="download-alert-card">
            <span>High alert</span>
            <strong>Warm zone rising</strong>
            <p>Check basking lamp output and ventilation.</p>
          </div>
          <div className="download-nav-preview">
            <span>Home</span>
            <span>Devices</span>
            <span>Community</span>
            <span>Shop</span>
          </div>
        </div>
      </section>

      <section className="download-showcase">
        <div className="download-poster-card">
          <div>
            <p className="section-label">Poster concept</p>
            <h2>Monitor. Protect. Care.</h2>
            <p>Use this area as the visual companion for your generated promotional poster.</p>
          </div>
          <div className="poster-pet-strip">
            <img alt="" src="/pets/leopard-gecko.jpg" />
            <img alt="" src="/pets/ball-python.webp" />
            <img alt="" src="/pets/pacman-frog.webp" />
          </div>
        </div>

        <div className="download-feature-grid">
          {featureCards.map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default DownloadPage;
