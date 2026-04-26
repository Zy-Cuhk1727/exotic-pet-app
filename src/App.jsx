import { useEffect, useState } from "react";
import "./App.css";
import Alerts from "./pages/Alerts";
import Camera from "./pages/Camera";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import { reptilePets } from "./data/mockData";
import { clearInitialTrend, simulatePetTick } from "./data/liveSimulator";

const tabs = [
  { id: "dashboard", label: "Home", icon: "H" },
  { id: "chat", label: "AI Chat", icon: "AI" },
  { id: "camera", label: "Camera", icon: "C" },
  { id: "alerts", label: "Alerts", icon: "!" },
];

const CUSTOM_PETS_STORAGE_KEY = "reptimind-custom-pets";
const DELETED_PETS_STORAGE_KEY = "reptimind-deleted-pets";

function readLocalArray(key) {
  try {
    const value = window.localStorage.getItem(key);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalArray(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local fallback can fail in private browsing or when image data is too large.
  }
}

async function fetchCustomPets() {
  try {
    const response = await fetch("/api/custom-pets");
    const data = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(data.pets)) return data.pets;
  } catch {
    // Fall back to browser storage when the backend is not reachable through ngrok.
  }

  return readLocalArray(CUSTOM_PETS_STORAGE_KEY);
}

async function fetchDeletedPetIds() {
  try {
    const response = await fetch("/api/deleted-pets");
    const data = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(data.ids)) return data.ids;
  } catch {
    // Fall back to browser storage when the backend is not reachable through ngrok.
  }

  return readLocalArray(DELETED_PETS_STORAGE_KEY);
}

async function saveCustomPet(pet) {
  try {
    const response = await fetch("/api/custom-pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pet }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) return data.pet || pet;
  } catch {
    // Fall back to browser storage when the backend is not reachable through ngrok.
  }

  const pets = readLocalArray(CUSTOM_PETS_STORAGE_KEY);
  const existingIndex = pets.findIndex((item) => item.id === pet.id);
  const nextPets =
    existingIndex >= 0 ? pets.map((item) => (item.id === pet.id ? pet : item)) : [...pets, pet];
  writeLocalArray(CUSTOM_PETS_STORAGE_KEY, nextPets);
  return pet;
}

function buildPetProfile(petInput, existingPet) {
  const id = existingPet?.id || `pet-${Date.now()}`;
  const temperature = Number(petInput.temperature);
  const humidity = Number(petInput.humidity);
  const activityInput = Number(petInput.activity);
  const now = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
  const isMissing = petInput.conditionLabel === "Missing";
  const isDeceased = petInput.conditionLabel === "Deceased";
  const deathCause = isDeceased ? petInput.deathCause : "";
  const activity = isMissing || isDeceased ? 0 : activityInput;

  return {
    ...existingPet,
    id,
    name: petInput.name.trim(),
    species: petInput.species.trim(),
    icon: petInput.species.trim().slice(0, 2).toUpperCase() || "PT",
    image: petInput.image.trim(),
    habitat: petInput.habitat.trim(),
    mood: isDeceased ? "Deceased" : isMissing ? "Missing from camera" : "Custom profile monitoring",
    condition: {
      label: petInput.conditionLabel,
      tone: petInput.conditionTone,
      detail: petInput.conditionDetail.trim(),
      deathCause,
    },
    lastSync: "Just now",
    cameraTemp: `${temperature.toFixed(1)}°C`,
    activity,
    action: petInput.action.trim(),
    actionDetail: petInput.actionDetail.trim(),
    metrics: [
      { label: "Temperature", value: temperature.toFixed(1), unit: "°C", status: "Custom", tone: "green" },
      { label: "Humidity", value: String(Math.round(humidity)), unit: "%", status: "Custom", tone: "green" },
      { label: "Activity", value: String(activity), unit: "%", status: isDeceased ? "Stopped" : "Live", tone: "blue" },
    ],
    trend: [{ time: now, temp: temperature, humidity }],
    checklist: existingPet?.checklist?.length
      ? existingPet.checklist
      : ["New pet profile created", "Initial enclosure check needed", "Observe first live mock samples"],
    alerts:
      isDeceased
        ? [
            {
              title: "Death recorded",
              message: `${petInput.name.trim()} is marked deceased. Suspected cause: ${deathCause}.`,
              time: "Just now",
              severity: "Critical",
            },
          ]
        : isMissing
        ? [
            {
              title: "Pet missing from camera",
              message: `${petInput.name.trim()} is not visible in the latest camera scan.`,
              time: "Just now",
              severity: "Critical",
            },
          ]
        : [],
  };
}

async function deleteCustomPet(id) {
  try {
    const response = await fetch(`/api/custom-pets/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) return;
  } catch {
    // Fall back to browser storage when the backend is not reachable through ngrok.
  }

  writeLocalArray(
    CUSTOM_PETS_STORAGE_KEY,
    readLocalArray(CUSTOM_PETS_STORAGE_KEY).filter((pet) => pet.id !== id),
  );
}

async function saveDeletedBuiltInPet(id) {
  try {
    const response = await fetch("/api/deleted-pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) return;
  } catch {
    // Fall back to browser storage when the backend is not reachable through ngrok.
  }

  writeLocalArray(DELETED_PETS_STORAGE_KEY, [...new Set([...readLocalArray(DELETED_PETS_STORAGE_KEY), id])]);
}

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [pets, setPets] = useState(() => clearInitialTrend(reptilePets));
  const [activePetId, setActivePetId] = useState(reptilePets[0].id);
  const activePet = pets.find((pet) => pet.id === activePetId) || pets[0];
  const mockPetIds = reptilePets.map((pet) => pet.id);

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchCustomPets(), fetchDeletedPetIds()]).then(([customPets, deletedPetIds]) => {
      if (!isMounted) return;
      const builtInPets = reptilePets.filter((pet) => !deletedPetIds.includes(pet.id));
      setPets(clearInitialTrend([...builtInPets, ...customPets]));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const addPet = async (petInput) => {
    const id = `pet-${Date.now()}`;
    const temperature = Number(petInput.temperature || 28);
    const humidity = Number(petInput.humidity || 55);
    const now = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date());
    const isMissing = petInput.conditionLabel === "Missing";
    const isDeceased = petInput.conditionLabel === "Deceased";
    const deathCause = petInput.deathCause || "Unknown";

    const nextPet = {
      id,
      name: petInput.name.trim(),
      species: petInput.species.trim(),
      icon: petInput.species.trim().slice(0, 2).toUpperCase() || "PT",
      image: petInput.image.trim(),
      habitat: petInput.habitat.trim() || "Custom enclosure",
      mood: isDeceased ? "Deceased" : isMissing ? "Missing from camera" : "New profile monitoring",
      condition: {
        label: petInput.conditionLabel,
        tone: petInput.conditionTone,
        detail:
          petInput.conditionDetail.trim() ||
          (isDeceased
            ? `Deceased. Suspected cause: ${deathCause}.`
            : "Custom pet condition set by user."),
        deathCause: isDeceased ? deathCause : "",
      },
      lastSync: "Just now",
      cameraTemp: `${temperature.toFixed(1)}°C`,
      activity: isMissing || isDeceased ? 0 : Number(petInput.activity || 55),
      action: petInput.action.trim() || (isDeceased ? "Review cause of death" : "Monitor new profile"),
      actionDetail:
        petInput.actionDetail.trim() ||
        (isDeceased
          ? `Record suspected cause of death as ${deathCause}; review recent temperature, humidity, feeding, and water records.`
          : "Watch the first live samples and adjust care settings if needed."),
      metrics: [
        { label: "Temperature", value: temperature.toFixed(1), unit: "°C", status: "Custom", tone: "green" },
        { label: "Humidity", value: String(Math.round(humidity)), unit: "%", status: "Custom", tone: "green" },
        { label: "Activity", value: String(isMissing || isDeceased ? 0 : Number(petInput.activity || 55)), unit: "%", status: isDeceased ? "Stopped" : "Live", tone: "blue" },
      ],
      trend: [{ time: now, temp: temperature, humidity }],
      checklist: ["New pet profile created", "Initial enclosure check needed", "Observe first live mock samples"],
      alerts:
        isDeceased
          ? [
              {
                title: "Death recorded",
                message: `${petInput.name.trim()} is marked deceased. Suspected cause: ${deathCause}.`,
                time: "Just now",
                severity: "Critical",
              },
            ]
          : petInput.conditionLabel === "Missing"
          ? [
              {
                title: "Pet missing from camera",
                message: `${petInput.name.trim()} is not visible in the latest camera scan.`,
                time: "Just now",
                severity: "Critical",
              },
            ]
          : [],
    };

    const savedPet = await saveCustomPet(nextPet);
    setPets((currentPets) => [...currentPets, savedPet]);
    setActivePetId(savedPet.id);
  };

  const editPet = async (id, petInput) => {
    if (mockPetIds.includes(id)) {
      throw new Error("MockData pets cannot be edited.");
    }

    const existingPet = pets.find((item) => item.id === id);
    if (!existingPet) {
      throw new Error("Could not find this pet.");
    }

    const savedPet = await saveCustomPet(buildPetProfile(petInput, existingPet));
    setPets((currentPets) => currentPets.map((item) => (item.id === id ? savedPet : item)));
    setActivePetId(savedPet.id);
  };

  const deletePet = async (id) => {
    const nextPets = pets.filter((item) => item.id !== id);
    const isBuiltInPet = reptilePets.some((item) => item.id === id);

    if (!isBuiltInPet) {
      await deleteCustomPet(id);
    } else {
      await saveDeletedBuiltInPet(id);
    }

    setPets(nextPets);
    if (activePetId === id) {
      setActivePetId(nextPets[0]?.id || reptilePets[0].id);
    }
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPets((currentPets) => simulatePetTick(currentPets));
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const renderPage = () => {
    if (activeTab === "chat") return <Chat activePet={activePet} pets={pets} />;
    if (activeTab === "camera") return <Camera pet={activePet} />;
    if (activeTab === "alerts") return <Alerts pet={activePet} pets={pets} />;
    return (
      <Dashboard
        activePetId={activePetId}
        onSelectPet={setActivePetId}
        onAddPet={addPet}
        onEditPet={editPet}
        onDeletePet={deletePet}
        pet={activePet}
        pets={pets}
        mockPetIds={mockPetIds}
      />
    );
  };

  return (
    <div className="app-shell">
      <main className="app-frame" aria-label="ReptiMind prototype">
        <header className="app-header">
          <div>
            <p className="eyebrow">ReptiMind</p>
            <h1>AI Reptile Care</h1>
          </div>
          <div className="pet-avatar" aria-hidden="true">
            <img alt="" src={activePet.image} />
          </div>
        </header>

        <aside className="web-sidebar" aria-label="Desktop navigation">
          <div className="brand-block">
            <div className="pet-avatar" aria-hidden="true">
              <img alt="" src={activePet.image} />
            </div>
            <div>
              <p className="eyebrow">ReptiMind</p>
              <h1>AI Reptile Care</h1>
            </div>
          </div>

          <nav className="side-nav">
            {tabs.map((tab) => (
              <button
                className={activeTab === tab.id ? "side-nav-item active" : "side-nav-item"}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                <span className="nav-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <section className="desktop-status">
            <p className="section-label">System status</p>
            <strong>Prototype online</strong>
            <span>{pets.length} reptile profiles + live mock IoT data</span>
          </section>
        </aside>

        <section className="screen">{renderPage()}</section>

        <nav className="bottom-nav" aria-label="Main navigation">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.id ? "nav-item active" : "nav-item"}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <span className="nav-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}

export default App;

