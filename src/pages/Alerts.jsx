function Alerts({ pet, pets }) {
  const allAlerts = pets.flatMap((item) =>
    item.alerts.map((alert) => ({
      ...alert,
      image: item.image,
      petName: item.name,
      species: item.species,
    })),
  );

  return (
    <div className="page alerts-page">
      <section className="panel alert-summary">
        <p className="section-label">Alert center</p>
        <h2>{allAlerts.length} items across {pets.length} reptiles</h2>
        <p className="muted">
          Currently focused on {pet.name}, with cross-pet monitoring for the web dashboard.
        </p>
      </section>

      <section className="alert-list" aria-label="Recent alerts">
        {allAlerts.map((alert) => (
          <article className={`alert-card ${alert.severity.toLowerCase()}`} key={`${alert.petName}-${alert.title}`}>
            <div className="alert-icon">
              <img alt="" src={alert.image} />
            </div>
            <div>
              <div className="alert-title-row">
                <h3>{alert.petName}: {alert.title}</h3>
                <span>{alert.time}</span>
              </div>
              <p>{alert.message}</p>
              <strong>{alert.severity} priority · {alert.species}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="panel action-plan">
        <p className="section-label">Suggested action</p>
        <h3>{pet.action}</h3>
        <p>{pet.actionDetail}</p>
      </section>
    </div>
  );
}

export default Alerts;
