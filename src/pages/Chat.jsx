import { useEffect, useMemo, useState } from "react";
import { defaultMessages, quickPrompts } from "../data/mockData";

function createSession(messages = defaultMessages) {
  return {
    id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
    title: "New reptile chat",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages,
  };
}

function getTitleFromMessages(messages) {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content;
  return firstUserMessage ? firstUserMessage.slice(0, 54) : "New reptile chat";
}

function localReptiMindAnswer(question) {
  const lower = question.toLowerCase();

  if (lower.includes("not eating") || lower.includes("refuse")) {
    return "Start with the basics: check the basking temperature, confirm a warm-cool gradient, reduce handling stress, and review the last shed. If the animal is losing weight or refuses food for multiple weeks, contact a reptile vet.";
  }

  if (lower.includes("humid") || lower.includes("humidity")) {
    return "Raise humidity gradually by adding moist hide substrate, misting lightly, and checking ventilation. Avoid soaking the whole enclosure, because stagnant wet bedding can cause skin and respiratory problems.";
  }

  if (lower.includes("hot") || lower.includes("temperature")) {
    return "For a bearded dragon, a short basking spot around 38-42°C can be normal, but the cool side should stay much lower. For geckos and snakes, use species-specific ranges and always measure at the animal's level.";
  }

  return "I would check three things first: environment range, recent behavior change, and feeding or shedding history. Keep a short log, compare it with the species target range, and treat serious symptoms as a vet issue.";
}

function buildAppContext(activePet, pets) {
  return {
    activePetId: activePet.id,
    activePetName: activePet.name,
    activePetSpecies: activePet.species,
    pets: pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      habitat: pet.habitat,
      mood: pet.mood,
      lastSync: pet.lastSync,
      activity: `${pet.activity}%`,
      metrics: pet.metrics.map((metric) => ({
        label: metric.label,
        value: `${metric.value}${metric.unit}`,
        status: metric.status,
      })),
      alerts: pet.alerts.map((alert) => ({
        title: alert.title,
        severity: alert.severity,
        message: alert.message,
      })),
      suggestedAction: pet.action,
      suggestedActionDetail: pet.actionDetail,
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

async function fetchSessions() {
  const response = await fetch("/api/sessions");
  const data = await response.json().catch(() => ({}));
  return Array.isArray(data.sessions) ? data.sessions : [];
}

async function saveSession(session) {
  await fetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session }),
  });
}

async function deleteSession(id) {
  await fetch(`/api/sessions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

function Chat({ activePet, pets }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const activeSession = sessions.find((session) => session.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || defaultMessages;
  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  useEffect(() => {
    let isMounted = true;

    fetchSessions().then((savedSessions) => {
      if (!isMounted) return;

      if (savedSessions.length > 0) {
        setSessions(savedSessions);
        setActiveSessionId(savedSessions[0].id);
        return;
      }

      const firstSession = createSession();
      setSessions([firstSession]);
      setActiveSessionId(firstSession.id);
      saveSession(firstSession);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateActiveSession = (nextMessages) => {
    const now = new Date().toISOString();
    const nextSession = {
      ...activeSession,
      title: getTitleFromMessages(nextMessages),
      updatedAt: now,
      messages: nextMessages,
    };

    setSessions((currentSessions) =>
      currentSessions.map((session) => (session.id === nextSession.id ? nextSession : session)),
    );
    saveSession(nextSession);
  };

  const startNewChat = () => {
    const nextSession = createSession();
    setSessions((currentSessions) => [nextSession, ...currentSessions]);
    setActiveSessionId(nextSession.id);
    setInput("");
    saveSession(nextSession);
  };

  const removeChat = async (id) => {
    const nextSessions = sessions.filter((session) => session.id !== id);
    setSessions(nextSessions);
    await deleteSession(id);

    if (id === activeSessionId) {
      if (nextSessions.length > 0) {
        setActiveSessionId(nextSessions[0].id);
      } else {
        const nextSession = createSession();
        setSessions([nextSession]);
        setActiveSessionId(nextSession.id);
        saveSession(nextSession);
      }
    }
  };

  const sendMessage = async (text = input) => {
    const content = text.trim();
    if (!content || isLoading || !activeSession) return;

    const nextMessages = [...messages, { role: "user", content }];
    updateActiveSession(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const appContext = buildAppContext(activePet, pets);
      const answer = await callAiApi(nextMessages, appContext);
      updateActiveSession([...nextMessages, { role: "assistant", content: answer }]);
    } catch {
      const fallback = localReptiMindAnswer(content);
      updateActiveSession([
        ...nextMessages,
        {
          role: "assistant",
          content: `Live AI is not connected yet, so here is demo guidance: ${fallback}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page chat-page">
      <section className="chat-history panel">
        <div className="history-heading">
          <div>
            <p className="section-label">History</p>
            <h3>Chats</h3>
          </div>
          <button onClick={startNewChat} type="button">New</button>
        </div>

        <div className="history-list">
          {sessions.map((session) => (
            <article className={session.id === activeSessionId ? "history-item active" : "history-item"} key={session.id}>
              <button onClick={() => setActiveSessionId(session.id)} type="button">
                <strong>{session.title}</strong>
                <span>{new Date(session.updatedAt).toLocaleString()}</span>
              </button>
              <button aria-label="Delete chat" onClick={() => removeChat(session.id)} type="button">
                ×
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel chat-intro">
        <p className="section-label">AI assistant</p>
        <h2>Ask ReptiMind</h2>
        <p className="muted">Connected through a local backend, with chat history saved on this computer.</p>
      </section>

      <section className="quick-prompts" aria-label="Suggested questions">
        {quickPrompts.map((prompt) => (
          <button key={prompt} onClick={() => sendMessage(prompt)} type="button">
            {prompt}
          </button>
        ))}
      </section>

      <section className="chat-window" aria-live="polite">
        {messages.map((message, index) => (
          <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
            {message.role === "assistant" && <span className="bubble-avatar">AI</span>}
            <p>{message.content}</p>
          </article>
        ))}
        {isLoading && (
          <article className="message assistant">
            <span className="bubble-avatar">AI</span>
            <p>Thinking...</p>
          </article>
        )}
      </section>

      <form
        className="chat-form"
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage();
        }}
      >
        <input
          aria-label="Ask a reptile care question"
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about shedding, feeding, humidity..."
          value={input}
        />
        <button disabled={!canSend} type="submit">
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
