import { useEffect, useState } from "react";

const initialSensors = [
  { id: "warm", name: "Warm-side temperature", value: "31.8掳C", status: "Online", tone: "green" },
  { id: "cool", name: "Cool-side temperature", value: "26.4掳C", status: "Online", tone: "blue" },
  { id: "humid", name: "Humidity sensor", value: "56%", status: "Online", tone: "green" },
  { id: "uvb", name: "UVB / light monitor", value: "4.2 UVI", status: "Online", tone: "orange" },
  { id: "feeder", name: "Feeding reminder", value: "Tomorrow", status: "Reminder", tone: "blue" },
];

function formatTemperatureText(value, useCelsius) {
  const celsius = Number.parseFloat(String(value).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(celsius)) return value;
  return useCelsius ? `${celsius.toFixed(1)}°C` : `${(celsius * 1.8 + 32).toFixed(1)}°F`;
}

function formatSensorValue(sensor, useCelsius) {
  if (!sensor.name.toLowerCase().includes("temperature")) return sensor.value;
  return formatTemperatureText(sensor.value, useCelsius);
}
function Devices({ pet, useCelsius = true }) {
  const [sensors] = useState(initialSensors);
  const [petPosition, setPetPosition] = useState({ x: 50, y: 20, rotation: -3 });
  const [controls, setControls] = useState({
    heatLamp: true,
    misting: false,
    uvbLamp: true,
    nightMode: false,
  });
  const [targets, setTargets] = useState({
    baskingTemp: "32",
    humidity: "60",
    lightStart: "08:00",
    lightEnd: "20:00",
    feedingCycle: "Every 3 days",
  });

  const toggleControl = (key) => {
    setControls((current) => ({ ...current, [key]: !current[key] }));
  };

  const updateTarget = (key, value) => {
    setTargets((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPetPosition({
        x: 34 + Math.random() * 32,
        y: 10 + Math.random() * 20,
        rotation: -8 + Math.random() * 16,
      });
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [pet.id]);

  return (
    <div className="page devices-page">
      <section className="panel devices-overview">
        <div>
          <p className="section-label">Devices</p>
          <h2>{pet.name}'s habitat controls</h2>
          <p className="muted">
            Camera, sensors, manual controls, light schedule, and feeding reminders are simulated for the prototype.
          </p>
        </div>
        <div className="device-health">
          <span>4 online</span>
          <strong>Stable</strong>
        </div>
      </section>

      <section className="panel device-camera-hero">
        <div className="device-camera-topbar">
          <div>
            <p className="section-label">Live camera</p>
            <h3>{pet.name}'s Terrarium Cam</h3>
          </div>
          <span>{pet.species}</span>
        </div>

        <div className="device-camera-stage" aria-label={`${pet.name} habitat camera preview`}>
          <div className="device-camera-light">{formatTemperatureText(pet.cameraTemp, useCelsius)}</div>
          <div className="device-vine one" />
          <div className="device-vine two" />
          <div className="device-leaf-cluster left">
            <span />
            <span />
            <span />
          </div>
          <div className="device-leaf-cluster right">
            <span />
            <span />
            <span />
          </div>
          <div className="device-branch" />
          <div className="device-branch small" />
          <div className="device-hide" />
          <div className="device-water">
            <span />
          </div>
          <div className="device-rock left" />
          <div className="device-rock right" />
          <div className="device-ground" />
          <div className="device-pebbles">
            <span />
            <span />
            <span />
            <span />
          </div>
          <img
            className="device-moving-pet"
            alt={pet.species}
            src={pet.image}
            style={{
              left: `${petPosition.x}%`,
              bottom: `${petPosition.y}%`,
              transform: `translate(-50%, 0) rotate(${petPosition.rotation}deg)`,
            }}
          />
          <p>{pet.habitat}</p>
        </div>

        <div className="device-camera-actions" aria-label="Camera actions">
          <button type="button">Snapshot</button>
          <button type="button">Record</button>
          <button type="button">Talk</button>
        </div>

        <section className="device-behavior-strip">
          <div>
            <p className="section-label">Behavior AI</p>
            <h3>{pet.name} activity detection</h3>
          </div>
          <div className={`condition-banner compact ${pet.condition.tone}`}>
            <strong>{pet.condition.label}</strong>
            <span>{pet.condition.detail}</span>
          </div>
          <div className="device-movement-score">
            <span>Movement score</span>
            <strong>{pet.activity}%</strong>
          </div>
        </section>
      </section>

      <section className="panel sensor-panel">
        <p className="section-label">Sensors</p>
        <h3>Live readings</h3>
        <div className="sensor-list">
          {sensors.map((sensor) => (
            <article className={`sensor-row ${sensor.tone}`} key={sensor.id}>
              <div>
                <strong>{sensor.name}</strong>
                <span>{sensor.status}</span>
              </div>
              <em>{formatSensorValue(sensor, useCelsius)}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="panel manual-control-panel">
        <p className="section-label">Manual control</p>
        <h3>Quick actions</h3>
        <div className="settings-grid">
          {[
            ["heatLamp", "Heat lamp"],
            ["misting", "Misting"],
            ["uvbLamp", "UVB light"],
            ["nightMode", "Night mode"],
          ].map(([key, label]) => (
            <button className={controls[key] ? "setting-toggle on" : "setting-toggle"} key={key} onClick={() => toggleControl(key)} type="button">
              <span>{label}</span>
              <strong>{controls[key] ? "On" : "Off"}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="panel target-settings-panel">
        <p className="section-label">Care settings</p>
        <h3>Targets and reminders</h3>
        <form className="target-settings-form">
          <label>
            Basking target
            <input value={targets.baskingTemp} onChange={(event) => updateTarget("baskingTemp", event.target.value)} />
          </label>
          <label>
            Humidity target
            <input value={targets.humidity} onChange={(event) => updateTarget("humidity", event.target.value)} />
          </label>
          <label>
            Light on
            <input value={targets.lightStart} onChange={(event) => updateTarget("lightStart", event.target.value)} />
          </label>
          <label>
            Light off
            <input value={targets.lightEnd} onChange={(event) => updateTarget("lightEnd", event.target.value)} />
          </label>
          <label className="wide-field">
            Feeding reminder
            <select value={targets.feedingCycle} onChange={(event) => updateTarget("feedingCycle", event.target.value)}>
              <option>Every day</option>
              <option>Every 2 days</option>
              <option>Every 3 days</option>
              <option>Weekly</option>
              <option>Manual only</option>
            </select>
          </label>
        </form>
      </section>
    </div>
  );
}

export default Devices;


