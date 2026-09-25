import { useEffect, useState } from "react";
import type React from "react";
import "../assets/css/subscribe.css";
import { getPlan } from "../services/planService";
import type { Plan } from "../services/planService";

const Subscribe = ({ id }: { id: string }) => {
    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hoveredColor, setHoveredColor] = useState<string | null>(null);

    useEffect(() => {
        getPlan(id)
            .then(setPlan)
            .catch(() => setError("Failed to load plan. Please try again later."))
            .finally(() => setLoading(false));
    }, [id]);

    return (
        <>
            {loading ? (
                <section className="subscribe">
                    <div className="subscribe-header">
                        <h2 className="subscribe-title">Subscribe to Plan</h2>
                    </div>
                    <div className="subscribe-card subscribe-card-skeleton" />
                </section>
            ) : error ? (
                <section className="subscribe">
                    <div className="subscribe-header">
                        <h2 className="subscribe-title">Subscribe to Plan</h2>
                        <p className="subscribe-error">{error}</p>
                    </div>
                </section>
            ) : plan ? (
                <section
                    className="subscribe"
                    style={{ '--section-hover-bg': hoveredColor ?? 'transparent' } as React.CSSProperties}
                >
                    <div className="subscribe-header">
                        <h2 className="subscribe-title">Subscribe to {plan.name}</h2>
                        <p className="subscribe-subtitle">{plan.description}</p>
                    </div>

                    <div className="subscribe-card">
                        <h3 className="subscribe-plan-name">{plan.name}</h3>
                        <p className="subscribe-plan-price">${plan.price.toFixed(2)} / month</p>
                        <p className="subscribe-plan-description">{plan.description}</p>
                        <button
                            className="subscribe-button"
                            onMouseEnter={() => setHoveredColor(plan.color)}
                            onMouseLeave={() => setHoveredColor(null)}
                        >
                            Subscribe Now
                        </button>
                    </div>
                </section>
            ) : null}
        </>
    );
};

export default Subscribe;