import { useEffect, useState } from "react";
import type React from "react";
import "../assets/css/pricing.css";
import { getPlans } from "../services/planService";
import type { Plan } from "../services/planService";

const Pricing = () => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredColor, setHoveredColor] = useState<string | null>(null);

    useEffect(() => {
        getPlans()
            .then(setPlans)
            .catch(() => setError("Failed to load plans. Please try again later."))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="pricing">
                <div className="pricing-header">
                    <h2 className="pricing-title">Choose Your Plan</h2>
                </div>
                <div className="pricing-cards">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="pricing-card pricing-card-skeleton" />
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="pricing">
                <div className="pricing-header">
                    <h2 className="pricing-title">Choose Your Plan</h2>
                    <p className="pricing-error">{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section
            className="pricing"
            style={{ '--section-hover-bg': hoveredColor ?? 'transparent' } as React.CSSProperties}
        >
            <div className="pricing-header">
                <h2 className="pricing-title">Choose Your Plan</h2>
                <p className="pricing-subtitle">
                    Select the perfect plan for your entertainment needs. All plans include free trial.
                </p>
            </div>

            <div className="pricing-cards">
                {plans.map((plan, index) => {
                    const isMiddle = index === Math.floor(plans.length / 2);

                    return (
                        <div
                            key={plan.id}
                            className={`pricing-card`}
                            style={{ '--plan-color': plan.color } as React.CSSProperties}
                            onMouseEnter={() => setHoveredColor(plan.color)}
                            onMouseLeave={() => setHoveredColor(null)}
                        >
                            {isMiddle && (
                                <div className="pricing-badge">Popular</div>
                            )}

                            {plan.name === "Free" ? (
                            <div className="pricing-card-header">
                                <div className="free">Free</div>
                            </div>
                            ) : (
                                <div className="pricing-card-header">
                                    <h3 className="plan-name">{plan.name}</h3>
                                    <div className="plan-price">
                                            <>
                                                <span className="currency">$</span>
                                                <span className="amount">{plan.pricePerMonth}</span>
                                                <span className="period">/month</span>
                                            </>
                                    </div>
                                </div>
                            )}

                            <div className="pricing-card-features">
                                <ul className="features-list">
                                    {plan.features.map((feature) => (
                                        <li key={feature.id} className="feature-item">
                                            <i className="bi bi-check-circle-fill"></i>
                                            <span>{feature.description}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button className="pricing-btn">
                                <span>{plan.buttonText}</span>
                                <div className="circle-small"></div>
                            </button>
                        </div>
                    );
                })}
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

