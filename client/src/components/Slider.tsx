import { useState, useEffect, useCallback } from "react";
import "../assets/css/slider.css";
import { getActiveSlides, type Slide } from "../services/slideService";
import { getFileUrl } from "../services/uploadService";

// Fallback slides for when API is unavailable
const FALLBACK_SLIDES: Slide[] = [
    {
        id: 1,
        title: "Premium IPTV",
        subtitle: "Unlimited Entertainment",
        description: "Access 10,000+ channels from around the world in stunning 4K quality",
        icon: "bi-tv",
        background: "#ffffff",
        textColor: "#1a1a2e",
        backgroundDim: 30,
        hasTextBorder: false,
        bgImage: undefined,
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 2,
        title: "Sports Package",
        subtitle: "Never Miss a Game",
        description: "Live sports coverage including Premier League, NBA, NFL, and more",
        icon: "bi-trophy",
        background: "#FF3B3B",
        textColor: "#ffffff",
        backgroundDim: 30,
        hasTextBorder: false,
        bgImage: undefined,
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 3,
        title: "Movies & Series",
        subtitle: "Endless Content",
        description: "Stream the latest blockbusters and binge-worthy series on demand",
        icon: "bi-film",
        background: "#ffffff",
        textColor: "#1a1a2e",
        backgroundDim: 30,
        hasTextBorder: false,
        bgImage: undefined,
        order: 3,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 4,
        title: "Multi-Device",
        subtitle: "Watch Anywhere",
        description: "Compatible with Smart TV, mobile, tablet, and streaming devices",
        icon: "bi-phone",
        background: "#FF3B3B",
        textColor: "#ffffff",
        backgroundDim: 30,
        hasTextBorder: false,
        bgImage: undefined,
        order: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

const Slider = () => {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);

    // Fetch slides on mount
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const data = await getActiveSlides();
                if (data && data.length > 0) {
                    setSlides(data);
                } else {
                    setSlides(FALLBACK_SLIDES);
                }
            } catch (error) {
                console.error("Failed to load slides:", error);
                setSlides(FALLBACK_SLIDES);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();
    }, []);

    // Create extended slides array with clones for infinite loop
    const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];

    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => prev + 1);
    }, [isTransitioning]);

    const prevSlide = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => prev - 1);
    };

    const goToSlide = (index: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentSlide(index + 1);
    };

    // Drag handlers
    const handleDragStart = (clientX: number) => {
        if (isTransitioning) return;
        setIsDragging(true);
        setDragStartX(clientX);
        setDragOffset(0);
        setIsAutoPlaying(false);
    };

    const handleDragMove = (clientX: number) => {
        if (!isDragging) return;
        const offset = clientX - dragStartX;
        setDragOffset(offset);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        // Threshold for slide change (50px or 20% of viewport width)
        const threshold = Math.max(50, window.innerWidth * 0.2);

        if (Math.abs(dragOffset) > threshold) {
            if (dragOffset > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }

        setDragOffset(0);
        setTimeout(() => setIsAutoPlaying(true), 1000);
    };

    // Mouse events
    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        handleDragStart(e.clientX);
    };

    const onMouseMove = (e: React.MouseEvent) => {
        handleDragMove(e.clientX);
    };

    const onMouseUp = () => {
        handleDragEnd();
    };

    const onMouseLeave = () => {
        if (isDragging) {
            handleDragEnd();
        }
    };

    // Touch events
    const onTouchStart = (e: React.TouchEvent) => {
        handleDragStart(e.touches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        handleDragMove(e.touches[0].clientX);
    };

    const onTouchEnd = () => {
        handleDragEnd();
    };

    // Handle infinite loop wrap-around
    useEffect(() => {
        if (!isTransitioning || slides.length === 0) return;

        const transitionEnd = setTimeout(() => {
            setIsTransitioning(false);

            if (currentSlide === 0) {
                setCurrentSlide(slides.length);
            } else if (currentSlide === slides.length + 1) {
                setCurrentSlide(1);
            }
        }, 500);

        return () => clearTimeout(transitionEnd);
    }, [currentSlide, isTransitioning, slides.length]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    if (loading || slides.length === 0) {
        return (
            <section className="slider">
                <div className="slider-container">
                    <div style={{
                        width: "100%",
                        height: "500px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f5f5f5",
                        color: "#999"
                    }}>
                        {loading ? "Loading slides..." : "No slides available"}
                    </div>
                </div>
            </section>
        );
    }

    const actualSlideIndex = currentSlide === 0 ? slides.length - 1 : currentSlide === slides.length + 1 ? 0 : currentSlide - 1;
    const currentSlideData = slides[actualSlideIndex];

    return (
        <section 
            className="slider"
            onMouseEnter={() => !isDragging && setIsAutoPlaying(false)}
            onMouseLeave={() => !isDragging && setIsAutoPlaying(true)}
        >
            <div 
                className="slider-container"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
                <div 
                    className={`slides-wrapper ${isTransitioning ? 'transitioning' : ''}`}
                    style={{ 
                        transform: `translateX(calc(-${currentSlide * 100}% + ${dragOffset}px))`,
                        userSelect: 'none'
                    }}
                >
                    {extendedSlides.map((slide, index) => {
                        const bgImageUrl = slide.bgImage ? getFileUrl(slide.bgImage) : '';
                        const overlayOpacity = (slide.backgroundDim ?? 30) / 100;
                        const textBorderStyle = slide.hasTextBorder ? {
                            textShadow: `-1px -1px 0 ${slide.textBorderColor}, 1px -1px 0 ${slide.textBorderColor}, -1px 1px 0 ${slide.textBorderColor}, 1px 1px 0 ${slide.textBorderColor}, -2px 0 0 ${slide.textBorderColor}, 2px 0 0 ${slide.textBorderColor}, 0 -2px 0 ${slide.textBorderColor}, 0 2px 0 ${slide.textBorderColor}`
                        } : {};
                        return (
                            <div 
                                key={`${slide.id}-${index}`} 
                                className="slide"
                                style={{ 
                                    backgroundColor: slide.background,
                                }}
                            >
                                {bgImageUrl && (
                                    <div 
                                        className="slide-bg-image"
                                        style={{
                                            backgroundImage: `url(${bgImageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundAttachment: 'fixed'
                                        }}
                                    />
                                )}
                                <div 
                                    className="slide-overlay"
                                    style={{
                                        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
                                    }}
                                />
                                <div className="slide-content">
                                    <div className="slide-icon" style={{ color: slide.background, backgroundColor: slide.textColor }}>
                                        <i className={`bi ${slide.icon}`}></i>
                                    </div>
                                    <span 
                                        className="slide-subtitle"
                                        style={{ color: slide.background, backgroundColor: slide.textColor }}
                                    >
                                        {slide.subtitle}
                                    </span>
                                    <h2 
                                        className="slide-title"
                                        style={{ color: slide.textColor, ...textBorderStyle }}
                                    >
                                        {slide.title}
                                    </h2>
                                    <p 
                                        className="slide-description"
                                        style={{ color: slide.textColor, ...textBorderStyle }}
                                    >
                                        {slide.description}
                                    </p>
                                    <button 
                                        className="slide-btn"
                                        style={{ 
                                            backgroundColor: slide.textColor,
                                            color: slide.background,
                                            borderColor: slide.textColor
                                        }}
                                    >
                                        Learn More
                                        <i className="bi bi-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button 
                    className="slider-nav prev"
                    onClick={prevSlide} 
                    aria-label="Previous slide"
                    style={{ color: '#000000'}}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                <button 
                    className="slider-nav next"
                    onClick={nextSlide} 
                    aria-label="Next slide"
                    style={{ color: '#000000'}}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>

                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === actualSlideIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                            style={{
                                backgroundColor: index === actualSlideIndex ? currentSlideData.textColor : 'transparent',
                                borderColor: currentSlideData.textColor
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Slider;
