function buildPoints(data, field) {
  const width = 300;
  const height = 120;
  const values = data.map((item) => item[field]);
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;

  return data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((item[field] - min) / (max - min)) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function Dashboard({ activePetId, onSelectPet, pet, pets }) {
  return (
    <div className="page dashboard-page">
      <section className="pet-switcher" aria-label="Reptile profiles">
        {pets.map((item) => (
          <button
            className={item.id === activePetId ? "pet-chip active" : "pet-chip"}
            key={item.id}
            onClick={() => onSelectPet(item.id)}
            type="button"
          >
            <span>{item.icon}</span>
            <strong>{item.name}</strong>
            <small>{item.species}</small>
          </button>
        ))}
      </section>

      <section className="hero-panel">
        <div>
          <p className="section-label">Live habitat</p>
          <h2>
            {pet.name} is {pet.mood.toLowerCase()}
          </h2>
          <p className="muted">
            {pet.species} · {pet.habitat} · Last sensor sync: {pet.lastSync}
          </p>
        </div>
        <div className="cartoon-pet" aria-label={`${pet.species} profile`}>
          <span>{pet.icon}</span>
        </div>
      </section>

      <section className="metric-grid" aria-label="Current sensor readings">
        {pet.metrics.map((metric) => (
          <article className={`metric-card ${metric.tone}`} key={metric.label}>
            <p>{metric.label}</p>
            <strong>
              {metric.value}
              <small>{metric.unit}</small>
            </strong>
            <span>{metric.status}</span>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="section-label">12-hour trend</p>
            <h3>Temperature & humidity</h3>
          </div>
          <span className="pill">Mock IoT data</span>
        </div>

        <svg className="chart" viewBox="0 0 300 150" role="img" aria-label="Temperature and humidity trend chart">
          <line x1="0" y1="126" x2="300" y2="126" />
          <line x1="0" y1="80" x2="300" y2="80" />
          <line x1="0" y1="34" x2="300" y2="34" />
          <polyline points={buildPoints(pet.trend, "humidity")} className="humidity-line" />
          <polyline points={buildPoints(pet.trend, "temp")} className="temp-line" />
          {pet.trend.map((item, index) => (
            <text key={item.time} x={(index / (pet.trend.length - 1)) * 300} y="146">
              {item.time.slice(0, 2)}
            </text>
          ))}
        </svg>

        <div className="legend">
          <span><i className="dot temp" /> Temperature</span>
          <span><i className="dot humidity" /> Humidity</span>
        </div>
      </section>

      <section className="care-summary">
        <div>
          <p className="section-label">Today</p>
          <h3>Care checklist</h3>
        </div>
        <ul>
          {pet.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="species-panel">
        <p className="section-label">Species profile</p>
        <h3>{pet.species}</h3>
        <p>{pet.habitat}</p>
        <strong>{pet.alerts.length} active alert{pet.alerts.length === 1 ? "" : "s"}</strong>
      </section>
    </div>
  );
}

export default Dashboard;
