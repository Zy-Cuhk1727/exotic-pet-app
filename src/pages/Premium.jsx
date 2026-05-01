import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    tagline: "Basic terrarium tracking for one reptile.",
    features: ["1 pet profile", "Manual care checklist", "Basic alerts", "Community browsing"],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$6.99",
    tagline: "Smart monitoring for serious keepers.",
    features: ["5 pet profiles", "Phone push alert demo", "AI care history", "Camera behavior summary"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$14.99",
    tagline: "Multi-device care for breeders and collections.",
    features: ["Unlimited profiles", "Sensor and camera dashboard", "Priority support", "Shop partner discounts"],
  },
];

function Premium() {
  const [currentPlan, setCurrentPlan] = useState("premium");

  return (
    <div className="page subscription-page">
      <section className="premium-hero panel">
        <div>
          <p className="section-label">Premium subscription</p>
          <h2>Upgrade ReptiMind care</h2>
          <p className="muted">
            A prototype billing page showing how members could unlock advanced monitoring, cloud history, and partner perks.
          </p>
        </div>
        <div className="membership-badge">
          <span>Current plan</span>
          <strong>{plans.find((plan) => plan.id === currentPlan)?.name}</strong>
        </div>
      </section>

      <section className="plan-grid" aria-label="Subscription plans">
        {plans.map((plan) => {
          const isActive = currentPlan === plan.id;

          return (
            <article className={isActive ? "plan-card active" : "plan-card"} key={plan.id}>
              <div>
                <p className="section-label">{plan.name}</p>
                <h3>{plan.price}<small>/mo</small></h3>
                <p>{plan.tagline}</p>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button onClick={() => setCurrentPlan(plan.id)} type="button">
                {isActive ? "Selected" : "Choose plan"}
              </button>
            </article>
          );
        })}
      </section>

      <section className="panel billing-panel">
        <div>
          <p className="section-label">Billing preview</p>
          <h3>Subscription state</h3>
          <p className="muted">
            Payment, renewal, and invoice logic are simulated for the MIS2011 prototype.
          </p>
        </div>
        <div className="billing-summary">
          <span>Next renewal</span>
          <strong>Demo only</strong>
          <span>Member level</span>
          <strong>Reptile Guardian</strong>
        </div>
      </section>
    </div>
  );
}

export default Premium;
