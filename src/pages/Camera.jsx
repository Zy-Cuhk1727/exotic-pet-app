function Camera({ pet }) {
  return (
    <div className="page camera-page">
      <section className="camera-stage">
        <div className="camera-toolbar">
          <span className="live-dot" />
          <strong>{pet.name}'s Terrarium Cam</strong>
          <span>{pet.species}</span>
        </div>

        <div className="fake-video" aria-label={`${pet.name} demo camera preview`}>
          <div className="branch" />
          <div className="heat-zone">{pet.cameraTemp}</div>
          <div className="sleeping-pet">{pet.icon}</div>
          <p>{pet.habitat}</p>
        </div>
      </section>

      <section className="camera-actions" aria-label="Camera actions">
        <button type="button">Snapshot</button>
        <button type="button">Record</button>
        <button type="button">Talk</button>
      </section>

      <section className="panel behavior-panel">
        <p className="section-label">Behavior AI</p>
        <h3>{pet.name} activity detection</h3>
        <div className="activity-row">
          <span>Movement score</span>
          <strong>{pet.activity}%</strong>
        </div>
        <div className="progress-track">
          <span style={{ width: `${pet.activity}%` }} />
        </div>
        <p className="muted">
          Mock camera analytics compare current motion with this species' normal daily pattern.
        </p>
      </section>
    </div>
  );
}

export default Camera;
