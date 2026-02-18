import { useState, useEffect, useCallback } from "react";
import "../assets/css/slider.css";

interface Slide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    background?: string;
    bgImage?: string;
    isWhite?: boolean;
}

const slides: Slide[] = [
    {
        id: 1,
        title: "Premium IPTV",
        subtitle: "Unlimited Entertainment",
        description: "Access 10,000+ channels from around the world in stunning 4K quality",
        icon: "bi-tv",
        background: "#fff",
        isWhite: true,
        bgImage: ""
    },
    {
        id: 2,
        title: "Sports Package",
        subtitle: "Never Miss a Game",
        description: "Live sports coverage including Premier League, NBA, NFL, and more",
        icon: "bi-trophy",
        background: "#FF3B3B",
        isWhite: false,
        bgImage: ""
    },
    {
        id: 3,
        title: "Movies & Series",
        subtitle: "Endless Content",
        description: "Stream the latest blockbusters and binge-worthy series on demand",
        icon: "bi-film",
        background: "#fff",
        isWhite: true,
        bgImage: ""
    },
    {
        id: 4,
        title: "Multi-Device",
        subtitle: "Watch Anywhere",
        description: "Compatible with Smart TV, mobile, tablet, and streaming devices",
        icon: "bi-phone",
        background: "#FF3B3B",
        isWhite: false,
        bgImage: ""
    }
];

const Slider = () => {
    const [currentSlide, setCurrentSlide] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartX, setDragStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);

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
        if (!isTransitioning) return;

        const transitionEnd = setTimeout(() => {
            setIsTransitioning(false);

            if (currentSlide === 0) {
                setCurrentSlide(slides.length);
            } else if (currentSlide === slides.length + 1) {
                setCurrentSlide(1);
            }
        }, 500);

        return () => clearTimeout(transitionEnd);
    }, [currentSlide, isTransitioning]);

    useEffect(() => {
        if (!isAutoPlaying) return;
        
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    const actualSlideIndex = currentSlide === 0 ? slides.length - 1 : currentSlide === slides.length + 1 ? 0 : currentSlide - 1;

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
                    {extendedSlides.map((slide, index) => (
                        <div 
                            key={`${slide.id}-${index}`} 
                            className={`slide ${slide.isWhite ? 'slide-white' : 'slide-red'}`}
                            style={{ 
                                backgroundColor: slide.background,
                                backgroundImage: slide.bgImage ? `url(${slide.bgImage})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            <div className="slide-content">
                                <div className={`slide-icon ${slide.isWhite ? 'icon-white' : 'icon-red'}`}>
                                    <i className={`bi ${slide.icon}`}></i>
                                </div>
                                <span className={`slide-subtitle ${slide.isWhite ? 'subtitle-white' : 'subtitle-red'}`}>{slide.subtitle}</span>
                                <h2 className="slide-title">{slide.title}</h2>
                                <p className="slide-description">{slide.description}</p>
                                <button className={`slide-btn ${slide.isWhite ? 'btn-white' : 'btn-red'}`}>
                                    Learn More
                                    <i className="bi bi-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    className={`slider-nav prev ${slides[actualSlideIndex].isWhite ? 'nav-white' : 'nav-red'}`}
                    onClick={prevSlide} 
                    aria-label="Previous slide"
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                <button 
                    className={`slider-nav next ${slides[actualSlideIndex].isWhite ? 'nav-white' : 'nav-red'}`}
                    onClick={nextSlide} 
                    aria-label="Next slide"
                >
                    <i className="bi bi-chevron-right"></i>
                </button>

                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === actualSlideIndex ? 'active' : ''} ${slides[actualSlideIndex].isWhite ? 'dot-white' : 'dot-red'}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Slider;
