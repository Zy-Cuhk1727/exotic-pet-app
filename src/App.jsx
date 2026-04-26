import { useState } from "react";
import "./App.css";
import Alerts from "./pages/Alerts";
import Camera from "./pages/Camera";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import { reptilePets } from "./data/mockData";

const tabs = [
  { id: "dashboard", label: "Home", icon: "⌂" },
  { id: "chat", label: "AI Chat", icon: "AI" },
  { id: "camera", label: "Camera", icon: "◉" },
  { id: "alerts", label: "Alerts", icon: "!" },
];

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activePetId, setActivePetId] = useState(reptilePets[0].id);
  const activePet = reptilePets.find((pet) => pet.id === activePetId) || reptilePets[0];

  const renderPage = () => {
    if (activeTab === "chat") return <Chat />;
    if (activeTab === "camera") return <Camera pet={activePet} />;
    if (activeTab === "alerts") return <Alerts pet={activePet} pets={reptilePets} />;
    return (
      <Dashboard
        activePetId={activePetId}
        onSelectPet={setActivePetId}
        pet={activePet}
        pets={reptilePets}
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
            <span>{reptilePets.length} reptile profiles + AI chat ready</span>
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
