export const reptilePets = [
  {
    id: "spike",
    name: "Spike",
    species: "Bearded Dragon",
    icon: "BD",
    habitat: "Desert terrarium",
    mood: "Active and stable",
    lastSync: "30 seconds ago",
    cameraTemp: "32°C",
    activity: 76,
    action: "Reduce heat lamp output",
    actionDetail:
      "Lower the basking lamp by 10%, then check whether the basking zone returns below 33°C within 15 minutes.",
    metrics: [
      { label: "Temperature", value: "31.8", unit: "°C", status: "Warm", tone: "orange" },
      { label: "Humidity", value: "56", unit: "%", status: "Ideal", tone: "green" },
      { label: "UVB", value: "4.2", unit: "UVI", status: "Good", tone: "blue" },
    ],
    trend: [
      { time: "08:00", temp: 28.4, humidity: 52 },
      { time: "10:00", temp: 29.1, humidity: 53 },
      { time: "12:00", temp: 30.6, humidity: 54 },
      { time: "14:00", temp: 32.0, humidity: 55 },
      { time: "16:00", temp: 31.8, humidity: 56 },
      { time: "18:00", temp: 30.7, humidity: 57 },
    ],
    checklist: ["Feeding logged at 09:20", "Water bowl checked", "Basking lamp schedule normal"],
    alerts: [
      {
        title: "Temperature too high",
        message: "Basking zone reached 34.2°C. Lower heat lamp output by 10%.",
        time: "2 min ago",
        severity: "High",
      },
      {
        title: "Activity declined",
        message: "Spike moved 68% less than usual during the afternoon window.",
        time: "1 hour ago",
        severity: "Medium",
      },
    ],
  },
  {
    id: "mochi",
    name: "Mochi",
    species: "Leopard Gecko",
    icon: "LG",
    habitat: "Warm hide enclosure",
    mood: "Resting after shedding",
    lastSync: "1 minute ago",
    cameraTemp: "29°C",
    activity: 48,
    action: "Check warm hide",
    actionDetail:
      "Keep the warm hide near 30°C and confirm the moist hide is available during shedding.",
    metrics: [
      { label: "Temperature", value: "29.2", unit: "°C", status: "Ideal", tone: "green" },
      { label: "Humidity", value: "38", unit: "%", status: "Ideal", tone: "green" },
      { label: "Moist hide", value: "72", unit: "%", status: "Ready", tone: "blue" },
    ],
    trend: [
      { time: "08:00", temp: 27.2, humidity: 35 },
      { time: "10:00", temp: 28.3, humidity: 37 },
      { time: "12:00", temp: 29.0, humidity: 38 },
      { time: "14:00", temp: 29.4, humidity: 39 },
      { time: "16:00", temp: 29.2, humidity: 38 },
      { time: "18:00", temp: 28.6, humidity: 37 },
    ],
    checklist: ["Meal skipped: normal post-shed watch", "Moist hide refreshed", "Calcium dish checked"],
    alerts: [
      {
        title: "Feeding watch",
        message: "Mochi skipped one feeding after shedding. Monitor weight and appetite.",
        time: "35 min ago",
        severity: "Low",
      },
    ],
  },
  {
    id: "noodle",
    name: "Noodle",
    species: "Ball Python",
    icon: "BP",
    habitat: "Tropical hide system",
    mood: "Hidden but normal",
    lastSync: "45 seconds ago",
    cameraTemp: "27°C",
    activity: 33,
    action: "Raise humidity slowly",
    actionDetail:
      "Add water to the substrate corner and keep ventilation stable. Avoid soaking the entire enclosure.",
    metrics: [
      { label: "Warm side", value: "31.0", unit: "°C", status: "Ideal", tone: "green" },
      { label: "Humidity", value: "61", unit: "%", status: "Low", tone: "orange" },
      { label: "Cool side", value: "26.4", unit: "°C", status: "Good", tone: "blue" },
    ],
    trend: [
      { time: "08:00", temp: 29.8, humidity: 66 },
      { time: "10:00", temp: 30.1, humidity: 64 },
      { time: "12:00", temp: 30.4, humidity: 62 },
      { time: "14:00", temp: 30.9, humidity: 61 },
      { time: "16:00", temp: 31.0, humidity: 61 },
      { time: "18:00", temp: 30.3, humidity: 63 },
    ],
    checklist: ["Hide security checked", "Water bowl full", "Humidity target needs attention"],
    alerts: [
      {
        title: "Humidity below target",
        message: "Noodle's enclosure dropped to 61%. Target is closer to 65-75%.",
        time: "8 min ago",
        severity: "Medium",
      },
    ],
  },
  {
    id: "lotus",
    name: "Lotus",
    species: "Pacman Frog",
    icon: "PF",
    habitat: "Bioactive moist tank",
    mood: "Quiet and hydrated",
    lastSync: "20 seconds ago",
    cameraTemp: "25°C",
    activity: 58,
    action: "Keep substrate moist",
    actionDetail:
      "Maintain damp but not waterlogged substrate, and verify the cool corner remains available.",
    metrics: [
      { label: "Temperature", value: "25.6", unit: "°C", status: "Ideal", tone: "green" },
      { label: "Humidity", value: "82", unit: "%", status: "Ideal", tone: "green" },
      { label: "Soil", value: "76", unit: "%", status: "Moist", tone: "blue" },
    ],
    trend: [
      { time: "08:00", temp: 24.7, humidity: 80 },
      { time: "10:00", temp: 25.0, humidity: 81 },
      { time: "12:00", temp: 25.4, humidity: 82 },
      { time: "14:00", temp: 25.7, humidity: 83 },
      { time: "16:00", temp: 25.6, humidity: 82 },
      { time: "18:00", temp: 25.1, humidity: 81 },
    ],
    checklist: ["Substrate moisture checked", "Water changed", "Feeding day tomorrow"],
    alerts: [
      {
        title: "Maintenance reminder",
        message: "Bioactive tank glass needs spot cleaning before the next feeding.",
        time: "Today",
        severity: "Low",
      },
    ],
  },
];

export const quickPrompts = [
  "My leopard gecko is not eating. What should I check first?",
  "Is 34°C too hot for a bearded dragon basking spot?",
  "How can I raise humidity safely for a ball python?",
];

export const defaultMessages = [
  {
    role: "assistant",
    content:
      "Hi, I am ReptiMind. Ask me about temperature, humidity, feeding, shedding, or daily reptile care.",
  },
];
