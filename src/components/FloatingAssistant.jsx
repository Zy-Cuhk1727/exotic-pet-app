import { useMemo, useRef, useState } from "react";

function localReptiMindAnswer(question, activePet) {
  const lower = question.toLowerCase();
  const petLabel = `${activePet.name} the ${activePet.species}`;

  if (lower.includes("feed") || lower.includes("food")) {
    return `For ${petLabel}, feeding should be handled as reminders and logs in this prototype. Timing, prey size, appetite, and safety still need human checking.`;
  }

  if (lower.includes("light") || lower.includes("uvb")) {
    return `For ${petLabel}, light is best shown as a schedule and UVB monitoring target. Set a day/night cycle, then check whether the lamp and UVB reading stay in range.`;
  }

  if (lower.includes("humidity")) {
    return `For ${petLabel}, check humidity first, then adjust misting or ventilation slowly. Avoid making the whole enclosure wet unless the species needs it.`;
  }

  if (lower.includes("temperature")) {
    return `For ${petLabel}, compare the warm side, cool side, and basking zone instead of one single temperature. The app can simulate target settings and alerts.`;
  }

  return `I can help with ${petLabel}'s feeding reminders, light schedule, temperature, humidity, alerts, and care notes.`;
}

function buildAppContext(activePet, pets) {
  return {
    activePetName: activePet.name,
    activePetSpecies: activePet.species,
    pets: pets.map((pet) => ({
      name: pet.name,
      species: pet.species,
      habitat: pet.habitat,
      condition: pet.condition,
      activity: `${pet.activity}%`,
      metrics: pet.metrics,
      alerts: pet.alerts,
    })),
  };
}

async function callAiApi(messages, appContext) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, appContext }),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "AI request failed");
  }

  return data.answer || "I could not read the AI response.";
}

async function saveFloatingSession(sessionId, messages, activePet) {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content;
  const now = new Date().toISOString();

  try {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session: {
          id: sessionId,
          title: firstUserMessage ? `Floating: ${firstUserMessage.slice(0, 48)}` : `Floating chat with ${activePet.name}`,
          assistantAvatarId: "frog",
          createdAt: now,
          updatedAt: now,
          messages,
        },
      }),
    });
  } catch {
    // The floating chat still works when the demo backend is not running.
  }
}

function FloatingAssistant({ activePet, notifications = [], onNavigate, pets }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [panelPosition, setPanelPosition] = useState(null);
  const dragRef = useRef(null);
  const [sessionId] = useState(() => `floating-${Date.now()}`);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi, I am ReptiBuddy. I am looking at ${activePet.name} the ${activePet.species}. Ask me about feeding, light, temperature, humidity, or alerts.`,
    },
  ]);
  const unreadCount = useMemo(
    () => notifications.filter((alert) => !alert.read).length,
    [notifications],
  );

  const sendMessage = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || isLoading) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    saveFloatingSession(sessionId, nextMessages, activePet);
    setInput("");
    setIsLoading(true);

    try {
      const answer = await callAiApi(nextMessages.slice(-8), buildAppContext(activePet, pets));
      const answeredMessages = [...nextMessages, { role: "assistant", content: answer }];
      setMessages(answeredMessages);
      saveFloatingSession(sessionId, answeredMessages, activePet);
    } catch {
      const answeredMessages = [...nextMessages, { role: "assistant", content: localReptiMindAnswer(content, activePet) }];
      setMessages(answeredMessages);
      saveFloatingSession(sessionId, answeredMessages, activePet);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isListening) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) setInput((current) => `${current} ${transcript}`.trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const startPanelDrag = (event) => {
    if (window.matchMedia("(max-width: 1099px)").matches) return;
    if (event.target.closest("button, input, textarea, select")) return;

    const panel = event.currentTarget.closest(".assistant-panel");
    const rect = panel.getBoundingClientRect();
    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
    panel.setPointerCapture?.(event.pointerId);
  };

  const dragPanel = (event) => {
    if (!dragRef.current) return;

    const margin = 12;
    const { offsetX, offsetY, width, height } = dragRef.current;
    const maxX = window.innerWidth - width - margin;
    const maxY = window.innerHeight - height - margin;
    setPanelPosition({
      x: Math.min(Math.max(margin, event.clientX - offsetX), maxX),
      y: Math.min(Math.max(margin, event.clientY - offsetY), maxY),
    });
  };

  const stopPanelDrag = (event) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  return (
    <div className={isOpen ? "floating-assistant open" : "floating-assistant"}>
      {isOpen && (
        <button className="assistant-sheet-scrim" onClick={() => setIsOpen(false)} type="button" aria-label="Close AI assistant" />
      )}

      {isOpen && (
        <section
          className={panelPosition ? "assistant-panel dragged" : "assistant-panel"}
          aria-label="Floating AI assistant"
          style={panelPosition ? { left: panelPosition.x, top: panelPosition.y } : undefined}
          onPointerMove={dragPanel}
          onPointerUp={stopPanelDrag}
          onPointerCancel={stopPanelDrag}
        >
          <div className="assistant-panel-header" onPointerDown={startPanelDrag}>
            <div className="assistant-avatar cute" aria-hidden="true">
              <span />
            </div>
            <div>
              <p className="section-label">AI assistant</p>
              <h3>ReptiBuddy</h3>
              <span>{activePet.name} - {activePet.species}</span>
            </div>
            <div className="assistant-header-actions">
              <button onClick={() => onNavigate?.("/chat")} type="button">History</button>
              <button onClick={() => setIsOpen(false)} type="button">Close</button>
            </div>
          </div>

          <div className="assistant-mini-chat" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`assistant-mini-message ${message.role}`} key={`${message.role}-${index}`}>
                <p>{message.content}</p>
              </article>
            ))}
            {isLoading && (
              <article className="assistant-mini-message assistant">
                <p>Thinking...</p>
              </article>
            )}
          </div>

          <form className="assistant-mini-form" onSubmit={sendMessage}>
            <input
              aria-label="Ask ReptiBuddy"
              onChange={(event) => setInput(event.target.value)}
              placeholder={`Ask about ${activePet.name}...`}
              value={input}
            />
            <button className={isListening ? "voice-button listening" : "voice-button"} onClick={startVoiceInput} type="button" aria-label="Use voice input">
              Mic
            </button>
            <button disabled={!input.trim() || isLoading} type="submit">Send</button>
          </form>
        </section>
      )}

      <button className="assistant-launcher" onClick={() => setIsOpen((current) => !current)} type="button" aria-label="Open AI assistant">
        <span className="assistant-avatar cute" aria-hidden="true">
          <span />
        </span>
        {unreadCount > 0 && <em>{unreadCount}</em>}
      </button>
    </div>
  );
}

export default FloatingAssistant;
