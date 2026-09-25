import { useEffect, useMemo, useState } from "react";
import "../assets/css/hero.css";
import down from "../assets/images/4-down.svg";
import movieGrid from "../assets/images/movie-grid.png";
import {
  getActiveHeroEntries,
  type HeroSectionEntry,
} from "../services/heroService";
import { getFileUrl } from "../services/uploadService";

const FALLBACK_HERO: Omit<HeroSectionEntry, "id" | "createdAt" | "updatedAt"> = {
  titleLine1Prefix: "Premium",
  titleLine1Highlight: "IPTV",
  titleLine1Suffix: "at",
  titleLine2Prefix: "the",
  titleLine2Highlight: "Best",
  titleLine2Suffix: "Prices",
  subtitle: "Unbeatable Deals on the Ultimate IPTV Experience",
  primaryButtonText: "Get Started",
  primaryButtonLink: "/plans",
  secondaryButtonText: "Learn More",
  secondaryButtonLink: "/contact",
  mediaType: "image",
  mediaPath: "",
  order: 1,
  isActive: true,
};

const Hero = () => {
    const [hero, setHero] = useState(FALLBACK_HERO);

    useEffect(() => {
        const loadHero = async () => {
            try {
                const activeEntries = await getActiveHeroEntries();
                if (activeEntries.length > 0) {
                    const [activeHero] = activeEntries.sort((a, b) => a.order - b.order);
                    setHero(activeHero);
                }
            } catch {
                setHero(FALLBACK_HERO);
            }
        };

        loadHero();
    }, []);

    const mediaUrl = useMemo(
        () => (hero.mediaPath ? getFileUrl(hero.mediaPath) : ""),
        [hero.mediaPath],
    );

    const sectionStyle = useMemo(() => {
        if (hero.mediaType !== "image") return undefined;
        const fallback = `url(${movieGrid})`;
        return {
            backgroundImage: mediaUrl ? `url(${mediaUrl})` : fallback,
        };
    }, [hero.mediaType, mediaUrl]);

    const navigateTo = (link: string) => {
        if (!link) return;
        if (link.startsWith("http://") || link.startsWith("https://")) {
            window.location.href = link;
            return;
        }
        window.location.href = link;
    };

    return (
        <section className="hero-section" style={sectionStyle}>
            {hero.mediaType === "video" && mediaUrl && (
                <video
                    className="hero-bg-video"
                    src={mediaUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            )}
            <div className="hero-bg-overlay" />
            <div className="hero-content">
                <h1>
                    {hero.titleLine1Prefix} <span className="highlight">{hero.titleLine1Highlight}</span> {hero.titleLine1Suffix}
                </h1>
                <h1>
                    {hero.titleLine2Prefix} <span className="highlight">{hero.titleLine2Highlight}</span> {hero.titleLine2Suffix}
                </h1>
                <p className="hero-subtitle">{hero.subtitle}</p>
                
                <div className="hero-buttons">
                    <button
                        type="button"
                        className="hero-btn primary"
                        onClick={() => navigateTo(hero.primaryButtonLink)}
                    >
                        <p>{hero.primaryButtonText}</p>
                        <div className="circle-small"></div>
                    </button>
                    <button
                        type="button"
                        className="hero-btn secondary"
                        onClick={() => navigateTo(hero.secondaryButtonLink)}
                    >
                        <p>{hero.secondaryButtonText}</p>
                        <div className="circle-small"></div>
                    </button>
                </div>
            </div>
            <div className="big-circle"></div>
            
            <button type="button" className="scroll-button" aria-label="Scroll down">
                <img src={down} alt="" />
            </button>
        </section>
    )
}

export default Hero;