import { useState } from "react";

const initialDevices = [
  { id: "cam-01", name: "Terrarium Camera", type: "Camera", status: "Online", battery: "Plugged in" },
  { id: "temp-02", name: "Heat Zone Sensor", type: "Temperature", status: "Online", battery: "86%" },
  { id: "uvb-03", name: "UVB Monitor", type: "UVB", status: "Offline", battery: "12%" },
];

const helpItems = ["FAQ", "Contact support", "Setup tutorial", "Care emergency checklist"];

function Profile({
  activePetId,
  isCelsius = true,
  isDarkMode = false,
  isPushEnabled = true,
  notificationCount = 0,
  onNavigate,
  onSelectPet,
  onToggleCelsius,
  onToggleDarkMode,
  onTogglePush,
  pets,
}) {
  const [selectedPetId, setSelectedPetId] = useState(activePetId);
  const [devices, setDevices] = useState(initialDevices);
  const [draftSaved, setDraftSaved] = useState(false);

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) || pets[0];
  const [draft, setDraft] = useState({
    name: selectedPet?.name || "",
    species: selectedPet?.species || "",
    habitat: selectedPet?.habitat || "",
  });

  const choosePet = (pet) => {
    setSelectedPetId(pet.id);
    setDraft({ name: pet.name, species: pet.species, habitat: pet.habitat });
    setDraftSaved(false);
  };

  const addDevice = () => {
    const nextIndex = devices.length + 1;
    setDevices((currentDevices) => [
      ...currentDevices,
      {
        id: `new-${Date.now()}`,
        name: `New Sensor ${nextIndex}`,
        type: "Pairing",
        status: "Searching",
        battery: "Demo",
      },
    ]);
  };

  const preferenceRows = [
    ["pushAlerts", "Push notifications", isPushEnabled, onTogglePush],
    ["celsius", "Temperature in Celsius", isCelsius, onToggleCelsius],
    ["darkMode", "Dark mode", isDarkMode, onToggleDarkMode],
  ];

  const openLiveProfile = () => {
    if (selectedPet) onSelectPet(selectedPet.id);
    onNavigate("/");
  };

  return (
    <div className="page profile-page">
      <section className="panel user-profile-card">
        <img alt="" src="/avatars/Vulkan.jpg" />
        <div>
          <p className="section-label">My account</p>
          <h2>Vulkan</h2>
          <p className="muted">Reptile Guardian member - Premium trial</p>
        </div>
        <span className="member-chip">Level 4</span>
      </section>

      <section className="panel profile-section">
        <div className="panel-heading">
          <div>
            <p className="section-label">Pet profiles</p>
            <h3>Basic information</h3>
          </div>
          <button className="ghost-button" onClick={openLiveProfile} type="button">Open live profile</button>
        </div>

        <div className="profile-pet-list">
          {pets.map((pet) => (
            <button
              className={pet.id === selectedPetId ? "profile-pet-item active" : "profile-pet-item"}
              key={pet.id}
              onClick={() => choosePet(pet)}
              type="button"
            >
              <img alt="" src={pet.image} />
              <span>
                <strong>{pet.name}</strong>
                <small>{pet.species}</small>
              </span>
            </button>
          ))}
        </div>

        <form
          className="profile-edit-form"
          onSubmit={(event) => {
            event.preventDefault();
            setDraftSaved(true);
          }}
        >
          <label>
            Name
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <label>
            Species
            <input value={draft.species} onChange={(event) => setDraft({ ...draft, species: event.target.value })} />
          </label>
          <label className="wide-field">
            Habitat
            <input value={draft.habitat} onChange={(event) => setDraft({ ...draft, habitat: event.target.value })} />
          </label>
          <button className="submit-pet-button" type="submit">Save profile draft</button>
          {draftSaved && <p className="profile-save-note">Draft saved in this demo screen.</p>}
        </form>
      </section>

      <section className="panel profile-section">
        <div className="panel-heading">
          <div>
            <p className="section-label">Hardware</p>
            <h3>Connected devices</h3>
          </div>
          <button className="ghost-button" onClick={addDevice} type="button">Add device</button>
        </div>
        <div className="device-list">
          {devices.map((device) => (
            <article className="device-row" key={device.id}>
              <span className={device.status.toLowerCase()} />
              <div>
                <strong>{device.name}</strong>
                <small>{device.type} - {device.battery}</small>
              </div>
              <em>{device.status}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="panel profile-section">
        <p className="section-label">Current plan</p>
        <div className="current-plan-row">
          <div>
            <h3>Premium</h3>
            <p className="muted">Phone alert demo, multi-pet monitoring, and AI history enabled.</p>
          </div>
          <button className="ghost-button" onClick={() => onNavigate("/premium")} type="button">Manage</button>
        </div>
      </section>

      <section className="panel profile-section">
        <p className="section-label">AI history</p>
        <div className="current-plan-row">
          <div>
            <h3>Chat records</h3>
            <p className="muted">Review saved ReptiBuddy and full AI assistant conversations.</p>
          </div>
          <button className="ghost-button" onClick={() => onNavigate("/chat")} type="button">Open</button>
        </div>
      </section>

      <section className="panel profile-section">
        <p className="section-label">Notifications</p>
        <div className="current-plan-row">
          <div>
            <h3>{notificationCount} unread</h3>
            <p className="muted">Unread environment and care alerts are shown on the Home page.</p>
          </div>
          <button className="ghost-button" onClick={() => onNavigate("/")} type="button">View</button>
        </div>
      </section>

      <section className="panel profile-section">
        <p className="section-label">Preferences</p>
        <div className="settings-grid">
          {preferenceRows.map(([key, label, isOn, onToggle]) => (
            <button className={isOn ? "setting-toggle on" : "setting-toggle"} key={key} onClick={onToggle} type="button">
              <span>{label}</span>
              <strong>{isOn ? "On" : "Off"}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="panel profile-section">
        <p className="section-label">Help and support</p>
        <div className="help-grid">
          {helpItems.map((item) => (
            <button key={item} type="button">{item}</button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Profile;
