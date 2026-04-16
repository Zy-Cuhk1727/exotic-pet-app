import { useMemo, useState } from "react";
import "./App.css";

const petProfiles = {
  gecko: {
    name: "Leopard Gecko",
    cn: "豹纹守宫",
    idealTemp: [28, 32],
    idealHumidity: [30, 40],
    notes: "需要暖区、冷区和相对稳定的中低湿度环境。",
  },
  hedgehog: {
    name: "Hedgehog",
    cn: "刺猬",
    idealTemp: [24, 27],
    idealHumidity: [40, 60],
    notes: "温度过低可能引发伪冬眠风险。",
  },
  snake: {
    name: "Corn Snake",
    cn: "玉米蛇",
    idealTemp: [26, 30],
    idealHumidity: [40, 60],
    notes: "需要温度梯度和安全躲避空间。",
  },
  frog: {
    name: "Pacman Frog",
    cn: "角蛙",
    idealTemp: [24, 28],
    idealHumidity: [70, 85],
    notes: "对湿度非常敏感，环境过干风险较高。",
  },
};

function getStatus(value, [min, max]) {
  if (value < min) return "过低";
  if (value > max) return "过高";
  return "理想";
}

function getScore(temp, humidity, profile) {
  let score = 100;
  const [tMin, tMax] = profile.idealTemp;
  const [hMin, hMax] = profile.idealHumidity;

  if (temp < tMin) score -= Math.min(35, (tMin - temp) * 6);
  if (temp > tMax) score -= Math.min(35, (temp - tMax) * 6);
  if (humidity < hMin) score -= Math.min(35, (hMin - humidity) * 1.8);
  if (humidity > hMax) score -= Math.min(35, (humidity - hMax) * 1.8);

  return Math.max(0, Math.round(score));
}

function getAdvice(temp, humidity, petKey) {
  const profile = petProfiles[petKey];
  const advice = [];

  if (temp < profile.idealTemp[0]) {
    advice.push("建议逐步提高加热强度，并检查暖区温度是否达到标准。");
  }
  if (temp > profile.idealTemp[1]) {
    advice.push("建议降低加热强度或加强通风，避免环境过热。");
  }
  if (humidity < profile.idealHumidity[0]) {
    advice.push("建议增加喷雾、湿盒或调整垫材来提高湿度。");
  }
  if (humidity > profile.idealHumidity[1]) {
    advice.push("建议加强通风并减少过多水分积聚。");
  }

  if (petKey === "hedgehog" && temp < 23) {
    advice.push("警告：刺猬温度过低，可能存在伪冬眠风险。");
  }
  if (petKey === "frog" && humidity < 65) {
    advice.push("警告：角蛙对干燥环境敏感，需要尽快恢复湿度。");
  }
  if (petKey === "gecko" && humidity > 55) {
    advice.push("提示：豹纹守宫长期高湿可能带来皮肤和卫生问题。");
  }

  if (advice.length === 0) {
    advice.push("当前环境状态良好，建议继续保持并定时监测。");
  }

  return advice;
}

function App() {
  const [pet, setPet] = useState("gecko");
  const [petName, setPetName] = useState("Mochi");
  const [temp, setTemp] = useState(29);
  const [humidity, setHumidity] = useState(38);
  const [lightHours, setLightHours] = useState(8);

  const profile = petProfiles[pet];
  const tempStatus = getStatus(temp, profile.idealTemp);
  const humidityStatus = getStatus(humidity, profile.idealHumidity);
  const score = useMemo(() => getScore(temp, humidity, profile), [temp, humidity, profile]);
  const advice = useMemo(() => getAdvice(temp, humidity, pet), [temp, humidity, pet]);

  const overall =
    score >= 85 ? "稳定" : score >= 65 ? "需要注意" : "风险较高";

  return (
    <div className="app">
      <div className="container">
        <header className="hero">
          <div>
            <p className="tag">Exotic Pet Habitat Monitor</p>
            <h1>异宠生活环境检测网页端</h1>
            <p className="subtitle">
              用于监测异宠饲养环境中的温度、湿度和基础照护条件，适合作为课程项目网页原型。
            </p>
          </div>
          <div className="score-card">
            <p>当前宠物：{petName}</p>
            <p>种类：{profile.cn}</p>
            <h2>{score}/100</h2>
            <span>{overall}</span>
          </div>
        </header>

        <main className="grid">
          <section className="card">
            <h3>环境输入</h3>

            <label>宠物名字</label>
            <input value={petName} onChange={(e) => setPetName(e.target.value)} />

            <label>异宠种类</label>
            <select value={pet} onChange={(e) => setPet(e.target.value)}>
              <option value="gecko">豹纹守宫 Leopard Gecko</option>
              <option value="hedgehog">刺猬 Hedgehog</option>
              <option value="snake">玉米蛇 Corn Snake</option>
              <option value="frog">角蛙 Pacman Frog</option>
            </select>

            <label>温度（°C）</label>
            <input
              type="number"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
            />

            <label>湿度（%）</label>
            <input
              type="number"
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
            />

            <label>光照时长（小时）</label>
            <input
              type="number"
              value={lightHours}
              onChange={(e) => setLightHours(Number(e.target.value))}
            />
          </section>

          <section className="card">
            <h3>实时检测结果</h3>
            <div className="metric">
              <strong>温度：</strong> {temp}°C（{tempStatus}）
            </div>
            <div className="metric">
              <strong>湿度：</strong> {humidity}%（{humidityStatus}）
            </div>
            <div className="metric">
              <strong>光照：</strong> {lightHours} 小时
            </div>
            <div className="metric">
              <strong>适配评分：</strong> {score}/100
            </div>
            <div className="metric">
              <strong>物种参考：</strong> {profile.cn}
            </div>
          </section>

          <section className="card">
            <h3>风险提醒与建议</h3>
            <ul>
              {advice.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h3>异宠档案</h3>
            <p><strong>英文名：</strong>{profile.name}</p>
            <p><strong>中文名：</strong>{profile.cn}</p>
            <p>
              <strong>理想温度：</strong>
              {profile.idealTemp[0]} - {profile.idealTemp[1]} °C
            </p>
            <p>
              <strong>理想湿度：</strong>
              {profile.idealHumidity[0]} - {profile.idealHumidity[1]} %
            </p>
            <p><strong>说明：</strong>{profile.notes}</p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;