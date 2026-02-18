import { useState, useEffect, useCallback } from "react";
import "../assets/css/testimonials.css";

interface Testimonial {
    id: number;
    name: string;
    tier: "Premium" | "Standard" | "Basic";
    rating: number;
    text: string;
    avatar?: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Sarah Johnson",
        tier: "Premium",
        rating: 5,
        text: "Absolutely amazing service! The streaming quality is exceptional and I love having access to channels from around the world. Best IPTV provider I've ever used.",
    },
    {
        id: 2,
        name: "Michael Chen",
        tier: "Standard",
        rating: 5,
        text: "Great value for money. Never had any buffering issues and the customer support is top-notch. Highly recommended!",
    },
    {
        id: 3,
        name: "Emma Davis",
        tier: "Premium",
        rating: 4,
        text: "I've been using this service for 6 months now and couldn't be happier. The sports package is incredible - never miss a game!",
    },
    {
        id: 4,
        name: "James Wilson",
        tier: "Basic",
        rating: 5,
        text: "Simple, reliable, and affordable. Perfect for my needs. The interface is user-friendly and works great on all my devices.",
    },
    {
        id: 5,
        name: "Olivia Martinez",
        tier: "Premium",
        rating: 5,
        text: "Outstanding quality and selection. The 4K streams are crystal clear. This service has completely replaced my cable subscription.",
    },
    {
        id: 6,
        name: "David Brown",
        tier: "Standard",
        rating: 4,
        text: "Very satisfied with the service. Good channel variety and stable connection. Would definitely recommend to friends and family.",
    },
];

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const nextTestimonial = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    const prevTestimonial = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const goToTestimonial = (index: number) => {
        if (isTransitioning || index === currentIndex) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    // Auto-play effect
    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(nextTestimonial, 7000); // 7 seconds
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextTestimonial]);

    const getTestimonialPosition = (index: number) => {
        let diff = index - currentIndex;
        
        // Normalize diff to handle circular array
        if (diff > testimonials.length / 2) {
            diff -= testimonials.length;
        } else if (diff < -testimonials.length / 2) {
            diff += testimonials.length;
        }
        
        if (diff === 0) return "center";
        if (diff === 1) return "right";
        if (diff === -1) return "left";
        if (diff > 1) return "far-right";
        if (diff < -1) return "far-left";
        return "far-right";
    };

    const renderStars = (rating: number) => {
        return (
            <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                    <i
                        key={i}
                        className={`bi ${i < rating ? "bi-star-fill" : "bi-star"}`}
                    ></i>
                ))}
            </div>
        );
    };

    const getTierBadgeClass = (tier: string) => {
        switch (tier) {
            case "Premium":
                return "badge-premium";
            case "Standard":
                return "badge-standard";
            case "Basic":
                return "badge-basic";
            default:
                return "";
        }
    };

    return (
        <section 
            className="testimonials"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className="testimonials-header">
                <h2 className="testimonials-title">What Our Customers Say</h2>
                <p className="testimonials-subtitle">
                    Join thousands of satisfied viewers enjoying premium entertainment
                </p>
            </div>

            <div className="testimonials-carousel">
                <div className="testimonials-container">
                    <div className="testimonials-track">
                        {testimonials.map((testimonial, index) => {
                            const position = getTestimonialPosition(index);

                            return (
                                <div
                                    key={testimonial.id}
                                    className={`testimonial-card testimonial-${position}`}
                                    onClick={() => position !== "center" && goToTestimonial(index)}
                                    style={{ cursor: position !== "center" ? "pointer" : "default" }}
                                >
                                    <div className="testimonial-content">
                                        <div className="testimonial-author">
                                            <div className="author-avatar">
                                                {testimonial.avatar ? (
                                                    <img src={testimonial.avatar} alt={testimonial.name} />
                                                ) : (
                                                    <span>{testimonial.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="author-info">
                                                <h4 className="author-name">{testimonial.name}</h4>
                                                <span className={`author-badge ${getTierBadgeClass(testimonial.tier)}`}>
                                                    <i className="bi bi-patch-check-fill"></i>
                                                    {testimonial.tier} User
                                                </span>
                                            </div>
                                        </div>
                                        {renderStars(testimonial.rating)}
                                        <p className="testimonial-text">"{testimonial.text}"</p>
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            className="testimonial-arrow arrow-left"
                            onClick={prevTestimonial}
                            aria-label="Previous testimonial"
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>

                        <button
                            className="testimonial-arrow arrow-right"
                            onClick={nextTestimonial}
                            aria-label="Next testimonial"
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="testimonials-dots">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        className={`testimonial-dot ${index === currentIndex ? "active" : ""}`}
                        onClick={() => goToTestimonial(index)}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Testimonials;