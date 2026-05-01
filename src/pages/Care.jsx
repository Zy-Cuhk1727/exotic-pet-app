import { useMemo, useState } from "react";

function getAllAlerts(pets) {
  return pets.flatMap((pet) =>
    pet.alerts.map((alert) => ({
      ...alert,
      petName: pet.name,
      image: pet.image,
      species: pet.species,
    })),
  );
}

function Care({ pet, pets }) {
  const alerts = useMemo(() => getAllAlerts(pets), [pets]);
  const defaultAlert = alerts[0] || {
    title: "Temperature risk detected",
    message: `${pet.name}'s enclosure moved outside the safe range.`,
    severity: "High",
    time: "Just now",
    petName: pet.name,
    species: pet.species,
    image: pet.image,
  };
  const [selectedAlert, setSelectedAlert] = useState(defaultAlert);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [sentCount, setSentCount] = useState(1);

  const sendDemoPush = (alert) => {
    setSelectedAlert(alert);
    setSentCount((count) => count + 1);
  };

  return (
    <div className="page care-page">
      <section className="panel care-intro">
        <div>
          <p className="section-label">Phone alert demo</p>
          <h2>System-level push concept</h2>
          <p className="muted">
            This page visually simulates the lock-screen notification flow that would happen when ReptiMind detects an abnormal pet condition.
          </p>
        </div>
        <button className={pushEnabled ? "setting-toggle on compact-toggle" : "setting-toggle compact-toggle"} onClick={() => setPushEnabled(!pushEnabled)} type="button">
          <span>Phone push</span>
          <strong>{pushEnabled ? "On" : "Off"}</strong>
        </button>
      </section>

      <section className="phone-demo-wrap">
        <div className="phone-lockscreen" aria-label="Phone lock screen notification preview">
          <div className="phone-status-row">
            <span>9:41</span>
            <strong>ReptiMind</strong>
          </div>
          <div className="phone-date">Friday, May 1</div>
          <article className={pushEnabled ? "phone-notification active" : "phone-notification muted-alert"}>
            <img alt="" src={selectedAlert.image} />
            <div>
              <strong>{selectedAlert.petName}: {selectedAlert.title}</strong>
              <p>{pushEnabled ? selectedAlert.message : "Notifications are muted in this demo."}</p>
              <span>{selectedAlert.severity} priority - sent {sentCount}x</span>
            </div>
          </article>
          <article className="phone-notification secondary">
            <div>
              <strong>Suggested care action</strong>
              <p>{pet.action}</p>
              <span>{pet.actionDetail}</span>
            </div>
          </article>
        </div>
      </section>

      <section className="panel escalation-panel">
        <p className="section-label">Alert workflow</p>
        <div className="workflow-steps">
          <article>
            <strong>1</strong>
            <span>Sensor or camera detects abnormal pattern</span>
          </article>
          <article>
            <strong>2</strong>
            <span>AI compares it with species care range</span>
          </article>
          <article>
            <strong>3</strong>
            <span>Phone push notification is sent</span>
          </article>
          <article>
            <strong>4</strong>
            <span>User opens care action in the app</span>
          </article>
        </div>
      </section>

      <section className="alert-list care-alert-list" aria-label="Alerts that can trigger phone notifications">
        {alerts.map((alert) => (
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
              <strong>{alert.severity} priority - {alert.species}</strong>
              <button className="push-demo-button" onClick={() => sendDemoPush(alert)} type="button">
                Send demo push
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Care;
