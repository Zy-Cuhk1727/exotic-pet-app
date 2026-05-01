import { useState } from "react";
import Camera from "./Camera";

const initialSensors = [
  { id: "warm", name: "Warm-side temperature", value: "31.8°C", status: "Online", tone: "green" },
  { id: "cool", name: "Cool-side temperature", value: "26.4°C", status: "Online", tone: "blue" },
  { id: "humid", name: "Humidity sensor", value: "56%", status: "Online", tone: "green" },
  { id: "uvb", name: "UVB / light monitor", value: "4.2 UVI", status: "Online", tone: "orange" },
  { id: "feeder", name: "Feeding reminder", value: "Tomorrow", status: "Reminder", tone: "blue" },
];

function Devices({ pet }) {
  const [sensors] = useState(initialSensors);
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

      <section className="devices-camera">
        <Camera pet={pet} />
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
              <em>{sensor.value}</em>
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
