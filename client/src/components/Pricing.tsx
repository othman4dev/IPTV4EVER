import "../assets/css/pricing.css";

interface PricingPlan {
    id: number;
    name: string;
    tier: "Premium" | "Standard" | "Basic";
    price: number;
    period: string;
    badge?: string;
    features: string[];
    highlighted?: boolean;
}

const pricingPlans: PricingPlan[] = [
    {
        id: 1,
        name: "Basic",
        tier: "Basic",
        price: 9.99,
        period: "month",
        features: [
            "2,000+ Live Channels",
            "HD Quality",
            "1 Device Connection",
            "7-Day EPG Guide",
            "Movies & Series Library",
            "24/7 Customer Support"
        ],
        highlighted: false
    },
    {
        id: 2,
        name: "Standard",
        tier: "Standard",
        price: 14.99,
        period: "month",
        badge: "Popular",
        features: [
            "5,000+ Live Channels",
            "Full HD Quality",
            "2 Device Connections",
            "14-Day EPG Guide",
            "Premium Movies & Series",
            "Sports Channels",
            "Priority Support",
            "Catch-up TV"
        ],
        highlighted: true
    },
    {
        id: 3,
        name: "Premium",
        tier: "Premium",
        price: 19.99,
        period: "month",
        badge: "Best Value",
        features: [
            "10,000+ Live Channels",
            "4K Ultra HD Quality",
            "5 Device Connections",
            "30-Day EPG Guide",
            "All Movies & Series",
            "All Sports Packages",
            "PPV Events Included",
            "Dedicated Support",
            "Anti-Freeze Technology"
        ],
        highlighted: false
    }
];

const Pricing = () => {
    const getTierClass = (tier: string) => {
        switch (tier) {
            case "Premium":
                return "tier-premium";
            case "Standard":
                return "tier-standard";
            case "Basic":
                return "tier-basic";
            default:
                return "";
        }
    };

    return (
        <section className="pricing">
            <div className="pricing-header">
                <h2 className="pricing-title">Choose Your Plan</h2>
                <p className="pricing-subtitle">
                    Select the perfect plan for your entertainment needs. All plans include free trial.
                </p>
            </div>

            <div className="pricing-cards">
                {pricingPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`pricing-card ${getTierClass(plan.tier)} ${plan.highlighted ? "highlighted" : ""}`}
                    >
                        {plan.badge && (
                            <div className="pricing-badge">{plan.badge}</div>
                        )}

                        <div className="pricing-card-header">
                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                <span className="currency">$</span>
                                <span className="amount">{plan.price}</span>
                                <span className="period">/{plan.period}</span>
                            </div>
                        </div>

                        <div className="pricing-card-features">
                            <ul className="features-list">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="feature-item">
                                        <i className="bi bi-check-circle-fill"></i>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className={`pricing-btn ${getTierClass(plan.tier)}`}>
                            <span>Subscribe Now</span>
                            <div className="circle-small"></div>
                        </button>
                    </div>
                ))}
            </div>

            <div className="pricing-footer">
                <p className="pricing-note">
                    <i className="bi bi-shield-check"></i>
                    30-day money-back guarantee on all plans
                </p>
            </div>
        </section>
    );
};

export default Pricing;
