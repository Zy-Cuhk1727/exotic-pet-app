import { useState } from "react";

const conditionOptions = [
  { label: "Normal", tone: "green" },
  { label: "Molting watch", tone: "blue" },
  { label: "Breeding season watch", tone: "orange" },
  { label: "Injured", tone: "yellow" },
  { label: "Missing", tone: "red" },
  { label: "Deceased", tone: "black" },
];

const emptyPetForm = {
  name: "",
  species: "",
  image: "",
  imageName: "",
  habitat: "",
  temperature: "28",
  humidity: "55",
  activity: "55",
  conditionLabel: "Normal",
  conditionTone: "green",
  conditionDetail: "",
  action: "",
  actionDetail: "",
  deathCause: "",
};

function getMetricValue(pet, labels, fallback) {
  const metric = pet.metrics.find((item) => labels.includes(item.label));
  return metric ? String(metric.value) : fallback;
}

function petToForm(pet) {
  const option = conditionOptions.find((item) => item.label === pet.condition?.label) || conditionOptions[0];

  return {
    name: pet.name || "",
    species: pet.species || "",
    image: pet.image || "",
    imageName: "Current profile photo",
    habitat: pet.habitat || "",
    temperature: getMetricValue(pet, ["Temperature", "Warm side"], "28"),
    humidity: getMetricValue(pet, ["Humidity"], "55"),
    activity: String(pet.activity ?? getMetricValue(pet, ["Activity"], "55")),
    conditionLabel: option.label,
    conditionTone: option.tone,
    conditionDetail: pet.condition?.detail || "",
    action: pet.action || "",
    actionDetail: pet.actionDetail || "",
    deathCause: pet.condition?.deathCause || "",
  };
}

function validatePetForm(form) {
  const missingFields = [];
  const requiredTextFields = [
    ["name", "Name"],
    ["species", "Species"],
    ["image", "Local pet photo"],
    ["habitat", "Habitat"],
    ["conditionDetail", "Condition detail"],
    ["action", "Suggested action"],
    ["actionDetail", "Action detail"],
  ];

  requiredTextFields.forEach(([field, label]) => {
    if (!String(form[field] || "").trim()) missingFields.push(label);
  });

  [
    ["temperature", "Temperature"],
    ["humidity", "Humidity"],
    ["activity", "Activity"],
  ].forEach(([field, label]) => {
    if (!String(form[field] || "").trim() || !Number.isFinite(Number(form[field]))) {
      missingFields.push(label);
    }
  });

  if (form.conditionLabel === "Deceased" && !form.deathCause.trim()) {
    missingFields.push("Suspected cause");
  }

  return missingFields;
}

function getDisplayUnit(unit) {
  return unit === "鎺矯" || unit === "C" ? "掳C" : unit;
}

function isTemperatureMetric(metric) {
  return ["鎺矯", "掳C", "°C", "C"].includes(metric.unit);
}

function formatMetric(metric, useCelsius) {
  const unit = getDisplayUnit(metric.unit).replace("掳", "°");
  if (!isTemperatureMetric(metric) || useCelsius) return { value: metric.value, unit };

  const celsius = Number.parseFloat(String(metric.value).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(celsius)) return { value: metric.value, unit };

  return { value: (celsius * 1.8 + 32).toFixed(1), unit: "°F" };
}
function Dashboard({
  activePetId,
  onSelectPet,
  onAddPet,
  onEditPet,
  onDeletePet,
  pet,
  pets,
  mockPetIds = [],
  notifications = [],
  onDeleteNotification,
  onMarkAllNotificationsRead,
  onMarkNotificationRead,
  useCelsius = true,
}) {
  const builtInPets = pets.filter((item) => mockPetIds.includes(item.id));
  const customPets = pets.filter((item) => !mockPetIds.includes(item.id));
  const activePetIsCustom = customPets.some((item) => item.id === activePetId);
  const selectedCustomPet = customPets.find((item) => item.id === activePetId);
  const canEditActivePet = !mockPetIds.includes(pet.id);
  const allAlerts = notifications;
  const unreadAlertCount = allAlerts.filter((alert) => !alert.read).length;
  const activeAlertCount = allAlerts.filter((alert) => alert.petId === pet.id && !alert.read).length;
  const feedingReminder = pet.species.toLowerCase().includes("python")
    ? "Next feeding reminder: this weekend, 9:20"
    : pet.species.toLowerCase().includes("frog")
    ? "Next feeding reminder: tomorrow, 9:20"
    : "Next feeding reminder: tomorrow, 9:20";
  const lightSchedule = "Light schedule: 08:00-20:00";
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPetId, setEditingPetId] = useState("");
  const [newPet, setNewPet] = useState(emptyPetForm);
  const [isSavingPet, setIsSavingPet] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isDeletingPet, setIsDeletingPet] = useState(false);
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const isEditingPet = Boolean(editingPetId);
  const visibleAlerts = allAlerts.slice(0, alertsExpanded ? 50 : 3);

  const updateNewPet = (field, value) => {
    if (field === "conditionLabel") {
      const option = conditionOptions.find((item) => item.label === value) || conditionOptions[0];
      setNewPet((current) => ({ ...current, conditionLabel: option.label, conditionTone: option.tone }));
      return;
    }

    setNewPet((current) => ({ ...current, [field]: value }));
  };

  const openAddPet = () => {
    setEditingPetId("");
    setNewPet(emptyPetForm);
    setSaveError("");
    setIsAddOpen(true);
  };

  const openEditPet = () => {
    if (!canEditActivePet) return;
    setEditingPetId(pet.id);
    setNewPet(petToForm(pet));
    setSaveError("");
    setIsAddOpen(true);
  };

  const closePetForm = () => {
    setIsAddOpen(false);
    setEditingPetId("");
    setSaveError("");
  };

  const updateImageFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setNewPet((current) => ({
        ...current,
        image: String(reader.result || ""),
        imageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  const submitNewPet = async (event) => {
    event.preventDefault();
    if (isSavingPet) return;

    const missingFields = validatePetForm(newPet);
    if (missingFields.length > 0) {
      setSaveError(`Please fill: ${missingFields.join(", ")}.`);
      return;
    }

    setIsSavingPet(true);
    setSaveError("");
    try {
      if (isEditingPet) {
        await onEditPet(editingPetId, newPet);
      } else {
        await onAddPet(newPet);
      }
      closePetForm();
      setNewPet(emptyPetForm);
    } catch (error) {
      setSaveError(error.message || "Failed to save pet. Please restart the backend server.");
    } finally {
      setIsSavingPet(false);
    }
  };

  const deleteActivePet = async () => {
    if (pets.length <= 1 || isDeletingPet) return;
    const confirmed = window.confirm(`Delete ${pet.name}? This removes saved custom pets from local data.`);
    if (!confirmed) return;

    setIsDeletingPet(true);
    try {
      await onDeletePet(pet.id);
    } finally {
      setIsDeletingPet(false);
    }
  };

  return (
    <div className="page dashboard-page">
      <section className="home-command-center" aria-label="Home pet overview">
        <aside className="pet-dialog-sidebar">
          <div className="home-section-head">
            <div>
              <p className="section-label">Pets</p>
              <h2>My reptiles</h2>
            </div>
            {unreadAlertCount > 0 && <span className="alert-dot-badge">{unreadAlertCount}</span>}
          </div>

          <div className="pet-dialog-list">
            {pets.map((item) => (
              <button
                className={item.id === activePetId ? "pet-dialog-item active" : "pet-dialog-item"}
                key={item.id}
                onClick={() => onSelectPet(item.id)}
                type="button"
              >
                <span className="pet-dialog-photo">
                  <img alt="" src={item.image} />
                  {allAlerts.some((alert) => alert.petId === item.id && !alert.read) && <em />}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.species}</small>
                </span>
                <i className={`condition-dot ${item.condition.tone}`}>{item.condition.label}</i>
              </button>
            ))}
          </div>

          <button className="pet-add-card compact-add" onClick={openAddPet} type="button">
            <span>+</span>
            <strong>Add pet</strong>
            <small>Profile and sensor targets</small>
          </button>
        </aside>

        <article className="home-status-panel">
          <div className="status-top-row">
            <div>
              <p className="section-label">Current status</p>
              <h2>{pet.name}</h2>
              <p className="muted">{pet.species} - {pet.habitat}</p>
            </div>
            <div className="status-avatar-wrap">
              {activeAlertCount > 0 && <span className="alert-dot-badge">{activeAlertCount}</span>}
              <img alt={pet.species} src={pet.image} />
            </div>
          </div>

          <div className={`condition-banner ${pet.condition.tone}`}>
            <strong>{pet.condition.label}</strong>
            <span>{pet.condition.detail}</span>
          </div>

          <div className="home-care-row">
            <article>
              <span>Feeding</span>
              <strong>{feedingReminder}</strong>
            </article>
            <article>
              <span>Lighting</span>
              <strong>{lightSchedule}</strong>
            </article>
          </div>

          <div className="pet-action-buttons inline-actions">
            {canEditActivePet && (
              <button className="edit-pet-button" onClick={openEditPet} type="button">
                Edit
              </button>
            )}
            <button className="delete-pet-button" disabled={pets.length <= 1 || isDeletingPet} onClick={deleteActivePet} type="button">
              {isDeletingPet ? "Deleting..." : "Delete"}
            </button>
          </div>
        </article>
      </section>

      <section className="metric-grid" aria-label="Current sensor readings">
        {pet.metrics.map((metric) => {
          const formattedMetric = formatMetric(metric, useCelsius);

          return (
            <article className={`metric-card ${metric.tone}`} key={metric.label}>
              <p>{metric.label}</p>
              <strong>
                {formattedMetric.value}
                <small>{formattedMetric.unit}</small>
              </strong>
              <span>{metric.status}</span>
            </article>
          );
        })}
      </section>

      <section className="pet-switcher" aria-label="Reptile profiles">
        {builtInPets.map((item) => (
          <button
            className={item.id === activePetId ? "pet-chip active" : "pet-chip"}
            key={item.id}
            onClick={() => onSelectPet(item.id)}
            type="button"
          >
            <span>
              <img alt="" src={item.image} />
            </span>
            <strong>{item.name}</strong>
            <small>{item.species}</small>
            <em className={`condition-dot ${item.condition.tone}`}>{item.condition.label}</em>
          </button>
        ))}
        {customPets.length > 0 && (
          <label className={activePetIsCustom ? "pet-more active" : "pet-more"}>
            <div className="pet-more-preview">
              <span>
                {selectedCustomPet ? <img alt="" src={selectedCustomPet.image} /> : "+"}
              </span>
              <div>
                <strong>{selectedCustomPet?.name || "Custom pets"}</strong>
                <small>{selectedCustomPet?.species || `${customPets.length} saved profiles`}</small>
              </div>
            </div>
            <div className="pet-more-select">
              <select value={activePetIsCustom ? activePetId : ""} onChange={(event) => onSelectPet(event.target.value)}>
                <option value="" disabled>
                  Select pet
                </option>
                {customPets.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} 路 {item.species}
                  </option>
                ))}
              </select>
            </div>
          </label>
        )}
        <button className="pet-add-card" onClick={openAddPet} type="button">
          <span>+</span>
          <strong>Add pet</strong>
          <small>Web photo + custom data</small>
        </button>
      </section>

      {isAddOpen && (
        <section className="add-pet-panel panel" aria-label={isEditingPet ? "Edit pet" : "Add new pet"}>
          <div className="panel-heading">
            <div>
              <p className="section-label">Custom profile</p>
              <h3>{isEditingPet ? `Edit ${newPet.name}` : "Add a reptile pet"}</h3>
            </div>
            <button className="ghost-button" onClick={closePetForm} type="button">Close</button>
          </div>

          <form className="add-pet-form" onSubmit={submitNewPet}>
            <label>
              Name
              <input value={newPet.name} onChange={(event) => updateNewPet("name", event.target.value)} placeholder="e.g. Kiwi" />
            </label>
            <label>
              Species
              <input value={newPet.species} onChange={(event) => updateNewPet("species", event.target.value)} placeholder="e.g. Green Iguana" />
            </label>
            <label className="wide-field image-upload-field">
              Local pet photo
              <input accept="image/*" type="file" onChange={(event) => updateImageFile(event.target.files?.[0])} />
              <span className="file-upload-control">
                <strong>Choose file</strong>
                <em>{newPet.imageName || "No file selected"}</em>
              </span>
              <div className="image-upload-preview">
                {newPet.image ? <img alt="Pet preview" src={newPet.image} /> : <span>No image selected</span>}
                <strong>{newPet.imageName || "Choose a photo from this computer"}</strong>
              </div>
            </label>
            <label className="wide-field">
              Habitat
              <input value={newPet.habitat} onChange={(event) => updateNewPet("habitat", event.target.value)} placeholder="Custom enclosure" />
            </label>
            <label>
              Temperature
              <input type="number" step="0.1" value={newPet.temperature} onChange={(event) => updateNewPet("temperature", event.target.value)} />
            </label>
            <label>
              Humidity
              <input type="number" value={newPet.humidity} onChange={(event) => updateNewPet("humidity", event.target.value)} />
            </label>
            <label>
              Activity
              <input type="number" value={newPet.activity} onChange={(event) => updateNewPet("activity", event.target.value)} />
            </label>
            <label>
              Condition
              <select value={newPet.conditionLabel} onChange={(event) => updateNewPet("conditionLabel", event.target.value)}>
                {conditionOptions.map((option) => (
                  <option key={option.label} value={option.label}>{option.label}</option>
                ))}
              </select>
            </label>
            {newPet.conditionLabel === "Deceased" && (
              <label>
                Suspected cause
                <select value={newPet.deathCause} onChange={(event) => updateNewPet("deathCause", event.target.value)}>
                  <option value="">Select cause</option>
                  <option value="Hypothermia">Hypothermia</option>
                  <option value="Dehydration">Dehydration</option>
                  <option value="Hunger">Hunger</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </label>
            )}
            <label className="wide-field">
              Condition detail
              <input value={newPet.conditionDetail} onChange={(event) => updateNewPet("conditionDetail", event.target.value)} placeholder="What should the system monitor?" />
            </label>
            <label>
              Suggested action
              <input value={newPet.action} onChange={(event) => updateNewPet("action", event.target.value)} placeholder="Monitor new profile" />
            </label>
            <label className="wide-field">
              Action detail
              <input value={newPet.actionDetail} onChange={(event) => updateNewPet("actionDetail", event.target.value)} placeholder="Care advice shown in alerts and AI context" />
            </label>
            <button className="submit-pet-button" disabled={isSavingPet} type="submit">
              {isSavingPet ? "Saving..." : isEditingPet ? "Save changes" : "Create pet"}
            </button>
            {saveError && <p className="form-error">{saveError}</p>}
          </form>
        </section>
      )}

      <section className="hero-panel">
        <div>
          <p className="section-label">Live habitat</p>
          <h2>
            {pet.name} is {pet.mood.toLowerCase()}
          </h2>
          <p className="muted">
            {pet.species} 路 {pet.habitat} 路 Last sensor sync: {pet.lastSync}
          </p>
          <div className={`condition-banner ${pet.condition.tone}`}>
            <strong>{pet.condition.label}</strong>
            <span>{pet.condition.detail}</span>
          </div>
        </div>
        <div className="cartoon-pet" aria-label={`${pet.species} profile`}>
          <img alt={pet.species} src={pet.image} />
        </div>
        <div className="pet-action-buttons">
          {canEditActivePet && (
            <button className="edit-pet-button" onClick={openEditPet} type="button">
              Edit
            </button>
          )}
          <button className="delete-pet-button" disabled={pets.length <= 1 || isDeletingPet} onClick={deleteActivePet} type="button">
            {isDeletingPet ? "Deleting..." : "Delete"}
          </button>
        </div>
      </section>

      <section className="panel home-alerts-panel">
        <div className="panel-heading">
          <div>
            <p className="section-label">Recent alerts</p>
            <h3>{unreadAlertCount} unread / {allAlerts.length} total</h3>
          </div>
          <div className="alert-panel-actions">
            {unreadAlertCount > 0 && <span className="alert-dot-badge">{unreadAlertCount}</span>}
            {allAlerts.length > 0 && (
              <button className="ghost-button" onClick={onMarkAllNotificationsRead} type="button">
                Mark all read
              </button>
            )}
          </div>
        </div>
        <div className="home-alert-list">
          {(allAlerts.length > 0 ? visibleAlerts : [{
            id: "no-alerts",
            petName: pet.name,
            petId: pet.id,
            title: "No active alerts",
            message: "All monitored readings are stable in this demo.",
            severity: "Low",
            time: "Now",
            image: pet.image,
            read: true,
          }]).map((alert) => (
            <article className={`home-alert-row ${alert.severity.toLowerCase()} ${alert.read ? "read" : "unread"}`} key={alert.id}>
              <img alt="" src={alert.image} />
              <div>
                <strong>{alert.petName}: {alert.title}</strong>
                <span>{alert.message}</span>
                <small className={`alert-severity-badge ${alert.severity.toLowerCase()}`}>{alert.severity}</small>
              </div>
              <em>{alert.read ? "Read" : alert.time}</em>
              {alert.id !== "no-alerts" && (
                <div className="home-alert-actions">
                  {!alert.read && (
                    <button onClick={() => onMarkNotificationRead(alert.id)} type="button">
                      Read
                    </button>
                  )}
                  <button onClick={() => onDeleteNotification(alert.id)} type="button">
                    Delete
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
        {allAlerts.length > 3 && (
          <button className="alert-expand-button" onClick={() => setAlertsExpanded((current) => !current)} type="button">
            {alertsExpanded ? "Show latest 3" : `Show details (${Math.min(allAlerts.length, 50)} total)`}
          </button>
        )}
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
        <p>{pet.condition.detail}</p>
        <strong>{activeAlertCount} unread alert{activeAlertCount === 1 ? "" : "s"}</strong>
      </section>
    </div>
  );
}

export default Dashboard;



