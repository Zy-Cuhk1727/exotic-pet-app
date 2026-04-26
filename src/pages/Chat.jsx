import { useMemo, useState } from "react";
import { defaultMessages, quickPrompts } from "../data/mockData";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

function localReptiMindAnswer(question) {
  const lower = question.toLowerCase();

  if (lower.includes("not eating") || lower.includes("refuse") || lower.includes("拒食")) {
    return "Start with the basics: check the basking temperature, confirm a warm-cool gradient, reduce handling stress, and review the last shed. If the animal is losing weight or refuses food for multiple weeks, contact a reptile vet.";
  }

  if (lower.includes("humid") || lower.includes("humidity") || lower.includes("湿度")) {
    return "Raise humidity gradually by adding moist hide substrate, misting lightly, and checking ventilation. Avoid soaking the whole enclosure, because stagnant wet bedding can cause skin and respiratory problems.";
  }

  if (lower.includes("hot") || lower.includes("temperature") || lower.includes("温度")) {
    return "For a bearded dragon, a short basking spot around 38-42°C can be normal, but the cool side should stay much lower. For geckos and snakes, use species-specific ranges and always measure at the animal's level.";
  }

  return "I would check three things first: environment range, recent behavior change, and feeding or shedding history. Keep a short log, compare it with the species target range, and treat serious symptoms as a vet issue.";
}

async function callAiApi(messages) {
  const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const deepSeekKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const provider = deepSeekKey
    ? { url: DEEPSEEK_URL, key: deepSeekKey, model: "deepseek-chat" }
    : { url: OPENAI_URL, key: openAiKey, model: "gpt-4o-mini" };

  if (!provider.key) {
    const lastQuestion = messages.at(-1)?.content || "";
    return localReptiMindAnswer(lastQuestion);
  }

  const response = await fetch(provider.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        {
          role: "system",
          content:
            "You are ReptiMind, a careful reptile husbandry assistant. Give practical, concise advice and recommend a reptile veterinarian for urgent or severe symptoms.",
        },
        ...messages,
      ],
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    throw new Error("AI request failed");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I could not read the AI response.";
}

function Chat() {
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const sendMessage = async (text = input) => {
    const content = text.trim();
    if (!content || isLoading) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const answer = await callAiApi(nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: answer }]);
    } catch {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "The live AI connection failed, so here is demo guidance: check the target temperature, humidity, feeding record, and recent shedding. For severe symptoms, contact a reptile veterinarian.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page chat-page">
      <section className="panel chat-intro">
        <p className="section-label">AI assistant</p>
        <h2>Ask ReptiMind</h2>
        <p className="muted">Works with OpenAI or DeepSeek keys, with local demo answers as backup.</p>
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
            {message.role === "assistant" && <span className="bubble-avatar">🦎</span>}
            <p>{message.content}</p>
          </article>
        ))}
        {isLoading && (
          <article className="message assistant">
            <span className="bubble-avatar">🦎</span>
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
