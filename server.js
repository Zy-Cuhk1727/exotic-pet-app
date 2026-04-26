import http from "node:http";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

function loadLocalEnv() {
  if (!existsSync(".env")) return;

  const lines = readFileSync(".env", "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT || 3001);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const DEEPSEEK_MAX_TOKENS = Number(process.env.DEEPSEEK_MAX_TOKENS || 700);
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const LOG_DIR = "logs";
const USAGE_LOG_PATH = `${LOG_DIR}/ai-usage.jsonl`;
const LOCAL_DATA_DIR = "local-data";
const CHAT_SESSIONS_PATH = `${LOCAL_DATA_DIR}/chat-sessions.json`;

const systemPrompt = `
You are ReptiMind, an AI assistant for reptile pet care.
Answer in the same language as the user when possible.
Give practical husbandry advice for reptiles such as bearded dragons, leopard geckos, ball pythons, and Pacman frogs.
Focus on temperature, humidity, UVB, feeding, shedding, behavior, and basic enclosure checks.
Be concise, calm, and useful.
When current app data is provided, use it to answer questions about pets, readings, alerts, activity, and suggested actions.
If the user asks for a value that is not in the current app data, say that the prototype does not have that reading yet instead of inventing it.
Do not claim to diagnose disease. For urgent symptoms, weight loss, injury, breathing issues, or prolonged refusal to eat, recommend contacting a qualified reptile veterinarian.
`.trim();

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "http://127.0.0.1:5173",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function ensureLocalDataFile() {
  if (!existsSync(LOCAL_DATA_DIR)) {
    mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }

  if (!existsSync(CHAT_SESSIONS_PATH)) {
    writeFileSync(CHAT_SESSIONS_PATH, "[]\n", "utf8");
  }
}

function readSessions() {
  ensureLocalDataFile();

  try {
    const sessions = JSON.parse(readFileSync(CHAT_SESSIONS_PATH, "utf8"));
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions) {
  ensureLocalDataFile();
  writeFileSync(CHAT_SESSIONS_PATH, `${JSON.stringify(sessions, null, 2)}\n`, "utf8");
}

function normalizeSession(session) {
  const now = new Date().toISOString();
  const messages = Array.isArray(session.messages)
    ? session.messages
        .filter((message) => message && ["user", "assistant"].includes(message.role))
        .map((message) => ({
          role: message.role,
          content: String(message.content || "").slice(0, 4000),
        }))
        .slice(-80)
    : [];

  return {
    id: String(session.id || randomUUID()),
    title: String(session.title || "New chat").slice(0, 80),
    createdAt: String(session.createdAt || now),
    updatedAt: now,
    messages,
  };
}

async function handleSessions(request, response) {
  if (request.method === "GET" && request.url === "/api/sessions") {
    const sessions = readSessions().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    sendJson(response, 200, { sessions });
    return;
  }

  if (request.method === "POST" && request.url === "/api/sessions") {
    const body = await readJsonBody(request);
    const nextSession = normalizeSession(body.session || {});
    const sessions = readSessions();
    const existingIndex = sessions.findIndex((session) => session.id === nextSession.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = {
        ...sessions[existingIndex],
        ...nextSession,
        createdAt: sessions[existingIndex].createdAt || nextSession.createdAt,
      };
    } else {
      sessions.push(nextSession);
    }

    writeSessions(sessions);
    sendJson(response, 200, { session: nextSession });
    return;
  }

  if (request.method === "DELETE" && request.url.startsWith("/api/sessions/")) {
    const id = decodeURIComponent(request.url.replace("/api/sessions/", ""));
    writeSessions(readSessions().filter((session) => session.id !== id));
    sendJson(response, 200, { ok: true });
    return;
  }

  sendJson(response, 404, { error: "Not found." });
}

function logUsage({ usage, model, activePetName, latestUserMessage }) {
  if (!usage) return;

  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }

  const record = {
    timestamp: new Date().toISOString(),
    provider: "deepseek",
    model,
    activePetName,
    promptTokens: usage.prompt_tokens ?? usage.promptTokens ?? null,
    completionTokens: usage.completion_tokens ?? usage.completionTokens ?? null,
    totalTokens: usage.total_tokens ?? usage.totalTokens ?? null,
    latestUserMessage: String(latestUserMessage || "").slice(0, 200),
  };

  appendFileSync(USAGE_LOG_PATH, `${JSON.stringify(record)}\n`, "utf8");
  console.log(
    `[AI usage] model=${record.model} prompt=${record.promptTokens} completion=${record.completionTokens} total=${record.totalTokens}`,
  );
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large"));
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((message) => message && ["user", "assistant"].includes(message.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 1500),
    }))
    .slice(-8);
}

function normalizeAppContext(appContext) {
  if (!appContext || typeof appContext !== "object" || !Array.isArray(appContext.pets)) {
    return null;
  }

  return {
    activePetName: String(appContext.activePetName || "").slice(0, 80),
    activePetSpecies: String(appContext.activePetSpecies || "").slice(0, 80),
    pets: appContext.pets.slice(0, 8).map((pet) => ({
      name: String(pet.name || "").slice(0, 80),
      species: String(pet.species || "").slice(0, 80),
      habitat: String(pet.habitat || "").slice(0, 120),
      mood: String(pet.mood || "").slice(0, 120),
      lastSync: String(pet.lastSync || "").slice(0, 80),
      activity: String(pet.activity || "").slice(0, 40),
      metrics: Array.isArray(pet.metrics)
        ? pet.metrics.slice(0, 6).map((metric) => ({
            label: String(metric.label || "").slice(0, 60),
            value: String(metric.value || "").slice(0, 60),
            status: String(metric.status || "").slice(0, 60),
          }))
        : [],
      alerts: Array.isArray(pet.alerts)
        ? pet.alerts.slice(0, 4).map((alert) => ({
            title: String(alert.title || "").slice(0, 100),
            severity: String(alert.severity || "").slice(0, 40),
            message: String(alert.message || "").slice(0, 180),
          }))
        : [],
      suggestedAction: String(pet.suggestedAction || "").slice(0, 140),
      suggestedActionDetail: String(pet.suggestedActionDetail || "").slice(0, 260),
    })),
  };
}

function formatAppContext(appContext) {
  if (!appContext) return "";

  const petSummaries = appContext.pets
    .map((pet) => {
      const metrics = pet.metrics
        .map((metric) => `${metric.label}: ${metric.value} (${metric.status})`)
        .join("; ");
      const alerts = pet.alerts.length
        ? pet.alerts
            .map((alert) => `${alert.severity} - ${alert.title}: ${alert.message}`)
            .join("; ")
        : "No active alerts";

      return [
        `Pet: ${pet.name}`,
        `Species: ${pet.species}`,
        `Habitat: ${pet.habitat}`,
        `Mood: ${pet.mood}`,
        `Last sync: ${pet.lastSync}`,
        `Activity: ${pet.activity}`,
        `Metrics: ${metrics || "No metrics"}`,
        `Alerts: ${alerts}`,
        `Suggested action: ${pet.suggestedAction}. ${pet.suggestedActionDetail}`,
      ].join("\n");
    })
    .join("\n\n");

  return `
Current ReptiMind app data:
Active pet: ${appContext.activePetName} (${appContext.activePetSpecies})

${petSummaries}
`.trim();
}

async function handleChat(request, response) {
  if (!DEEPSEEK_API_KEY) {
    sendJson(response, 500, {
      error: "DEEPSEEK_API_KEY is not set on the backend server.",
    });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const messages = normalizeMessages(body.messages);
    const appContext = normalizeAppContext(body.appContext);
    const appContextPrompt = formatAppContext(appContext);
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";

    if (messages.length === 0) {
      sendJson(response, 400, { error: "messages must include at least one user message." });
      return;
    }

    const aiResponse = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...(appContextPrompt ? [{ role: "system", content: appContextPrompt }] : []),
          ...messages,
        ],
        max_tokens: DEEPSEEK_MAX_TOKENS,
        temperature: 0.4,
      }),
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      sendJson(response, aiResponse.status, {
        error: data.error?.message || "DeepSeek request failed.",
      });
      return;
    }

    sendJson(response, 200, {
      answer: data.choices?.[0]?.message?.content || "I could not read the AI response.",
    });

    logUsage({
      usage: data.usage,
      model: DEEPSEEK_MODEL,
      activePetName: appContext?.activePetName,
      latestUserMessage,
    });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error." });
  }
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === "POST" && request.url === "/api/chat") {
    handleChat(request, response);
    return;
  }

  if (request.url === "/api/sessions" || request.url.startsWith("/api/sessions/")) {
    handleSessions(request, response).catch((error) => {
      sendJson(response, 500, { error: error.message || "Server error." });
    });
    return;
  }

  sendJson(response, 404, { error: "Not found." });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`ReptiMind AI server running at http://127.0.0.1:${PORT}`);
  console.log("Using provider: deepseek");
  console.log(`Using model: ${DEEPSEEK_MODEL}`);
  console.log(`Max output tokens: ${DEEPSEEK_MAX_TOKENS}`);
});
