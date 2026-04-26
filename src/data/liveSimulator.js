function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = 1) {
  return Number(value.toFixed(digits));
}

function getCurrentTimeLabel() {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
}

function getMetricValue(metrics, labels, fallback) {
  const metric = metrics.find((item) => labels.includes(item.label));
  return metric ? Number(metric.value) : fallback;
}

function updateMetric(metrics, label, nextValue, nextStatus) {
  return metrics.map((metric) =>
    metric.label === label
      ? {
          ...metric,
          value: String(nextValue),
          status: nextStatus || metric.status,
        }
      : metric,
  );
}

function getHumidityStatus(species, humidity) {
  if (species === "Ball Python") return humidity < 65 ? "Low" : humidity > 78 ? "High" : "Ideal";
  if (species === "Pacman Frog") return humidity < 75 ? "Low" : humidity > 88 ? "High" : "Ideal";
  if (species === "Leopard Gecko") return humidity < 30 ? "Low" : humidity > 45 ? "High" : "Ideal";
  return humidity < 35 ? "Low" : humidity > 60 ? "High" : "Ideal";
}

function getTemperatureStatus(species, temp) {
  if (species === "Bearded Dragon") return temp > 33 ? "Warm" : temp < 28 ? "Low" : "Ideal";
  if (species === "Leopard Gecko") return temp > 32 ? "Warm" : temp < 27 ? "Low" : "Ideal";
  if (species === "Ball Python") return temp > 33 ? "Warm" : temp < 29 ? "Low" : "Ideal";
  if (species === "Pacman Frog") return temp > 28 ? "Warm" : temp < 23 ? "Low" : "Ideal";
  return "Ideal";
}

function getTerminalStatusAlerts(pet) {
  if (pet.condition?.label === "Deceased") {
    const deathCause = pet.condition?.deathCause || "Unknown";
    return [
      {
        title: "Death recorded",
        message: `${pet.name} is marked deceased. Suspected cause: ${deathCause}. No other live husbandry alerts will be generated for this profile.`,
        time: "Just now",
        severity: "Critical",
        isLive: true,
      },
    ];
  }

  if (pet.condition?.label === "Missing") {
    return [
      {
        title: "Pet missing from camera",
        message: `${pet.name} is not visible in the latest camera scan. Check enclosure doors, hides, canopy, and nearby room area immediately.`,
        time: "Just now",
        severity: "Critical",
        isLive: true,
      },
    ];
  }

  return null;
}

function updateAlerts(pet, temp, humidity, activity) {
  const terminalStatusAlerts = getTerminalStatusAlerts(pet);
  if (terminalStatusAlerts) return terminalStatusAlerts;

  const alerts = pet.alerts.filter((alert) => !alert.isLive);
  const humidityStatus = getHumidityStatus(pet.species, humidity);
  const temperatureStatus = getTemperatureStatus(pet.species, temp);

  if (temperatureStatus === "Warm") {
    alerts.unshift({
      title: "Live temperature watch",
      message: `${pet.name}'s latest temperature is ${temp}°C, which is above the comfort range in this prototype.`,
      time: "Just now",
      severity: "Medium",
      isLive: true,
    });
  }

  if (humidityStatus === "Low" || humidityStatus === "High") {
    alerts.unshift({
      title: "Live humidity watch",
      message: `${pet.name}'s latest humidity is ${humidity}%, marked as ${humidityStatus.toLowerCase()}.`,
      time: "Just now",
      severity: humidityStatus === "Low" ? "Medium" : "Low",
      isLive: true,
    });
  }

  if (activity < 30) {
    alerts.unshift({
      title: "Live activity watch",
      message: `${pet.name}'s simulated activity dropped to ${activity}%.`,
      time: "Just now",
      severity: "Low",
      isLive: true,
    });
  }

  return alerts.slice(0, 4);
}

export function simulatePetTick(pets) {
  const time = getCurrentTimeLabel();

  return pets.map((pet) => {
    const isMissing = pet.condition?.label === "Missing";
    const isDeceased = pet.condition?.label === "Deceased";
    const previousTemp = getMetricValue(pet.metrics, ["Temperature", "Warm side"], pet.trend.at(-1)?.temp || 28);
    const previousHumidity = getMetricValue(pet.metrics, ["Humidity"], pet.trend.at(-1)?.humidity || 50);

    const temp = round(clamp(previousTemp + (Math.random() - 0.46) * 0.45, 20, 38));
    const humidity = Math.round(clamp(previousHumidity + (Math.random() - 0.5) * 2.4, 25, 92));
    const activity = isMissing || isDeceased ? 0 : Math.round(clamp(pet.activity + (Math.random() - 0.5) * 8, 18, 92));

    let metrics = updateMetric(pet.metrics, "Temperature", temp, getTemperatureStatus(pet.species, temp));
    metrics = updateMetric(metrics, "Warm side", temp, getTemperatureStatus(pet.species, temp));
    metrics = updateMetric(metrics, "Humidity", humidity, getHumidityStatus(pet.species, humidity));

    const trend = [...pet.trend.slice(-5), { time, temp, humidity }];

    return {
      ...pet,
      metrics,
      trend,
      activity,
      lastSync: "Just now",
      cameraTemp: `${temp}°C`,
      alerts: updateAlerts(pet, temp, humidity, activity),
    };
  });
}

export function clearInitialTrend(pets) {
  return pets.map((pet) => ({
    ...pet,
    trend: [],
    alerts: getTerminalStatusAlerts(pet) || pet.alerts,
  }));
}

