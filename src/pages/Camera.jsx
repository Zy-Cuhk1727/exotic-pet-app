function getDisplayTemperature(value) {
  return String(value || "").replace("掳C", "°C").replace(/(\d)C$/, "$1°C");
}

function Camera({ pet }) {
  const isMissing = pet.condition?.label === "Missing";
  const isDeceased = pet.condition?.label === "Deceased";

  return (
    <div className="page camera-page">
      <section className="camera-stage">
        <div className="camera-toolbar">
          <span className="live-dot" />
          <strong>{pet.name}'s Terrarium Cam</strong>
          <span>{pet.species}</span>
        </div>

        <div className="fake-video" aria-label={`${pet.name} demo camera preview`}>
          <div className="terrarium-sun" />
          <div className="terrarium-vines">
            <span />
            <span />
            <span />
          </div>
          <div className="terrarium-leaves left">
            <span />
            <span />
            <span />
          </div>
          <div className="terrarium-leaves right">
            <span />
            <span />
            <span />
          </div>
          <div className="terrarium-hide" />
          <div className="terrarium-water">
            <span />
          </div>
          <div className="substrate">
            <span />
            <span />
            <span />
          </div>
          <div className="branch" />
          <div className="branch secondary" />
          <div className="heat-zone">{getDisplayTemperature(pet.cameraTemp)}</div>
          {isMissing || isDeceased ? (
            <div className={isDeceased ? "missing-camera-note deceased" : "missing-camera-note"}>
              {isDeceased ? "No movement detected" : "No animal detected"}
            </div>
          ) : (
            <img className="sleeping-pet" alt={pet.species} src={pet.image} />
          )}
          <p>{isDeceased ? "Death status recorded" : isMissing ? "Empty enclosure scan" : pet.habitat}</p>
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
        <div className={`condition-banner compact ${pet.condition.tone}`}>
          <strong>{pet.condition.label}</strong>
          <span>{pet.condition.detail}</span>
        </div>
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


