import { useEffect, useMemo, useState, type CSSProperties } from "react";
import "../assets/css/hero2.css";
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
  heroStyle: "minimalistic",
  textMode: "difference",
  textColor: "#ffffff",
};

const scrollToContent = () => {
  const heroEl = document.querySelector(".hero2-section");
  if (!heroEl) return;
  const next = heroEl.nextElementSibling as HTMLElement | null;
  if (next) {
    next.scrollIntoView({ behavior: "smooth" });
  }
};

const navigateTo = (link: string) => {
  if (!link) return;
  window.location.href = link;
};

const Hero2 = () => {
  const [hero, setHero] = useState(FALLBACK_HERO);

  useEffect(() => {
    getActiveHeroEntries()
      .then((entries) => {
        if (entries.length > 0) {
          const [first] = entries.sort((a, b) => a.order - b.order);
          setHero(first);
        }
      })
      .catch(() => {
        setHero(FALLBACK_HERO);
      });
  }, []);

  const mediaUrl = useMemo(
    () => (hero.mediaPath ? getFileUrl(hero.mediaPath) : ""),
    [hero.mediaPath],
  );

  const hasMedia = Boolean(mediaUrl);

  const isSolidText = (hero.textMode ?? "difference") === "solid";
  const textColor = hero.textColor ?? "#ffffff";

  // Applied to both title and subtitle when textMode = "solid"
  const solidTextStyle: CSSProperties | undefined = isSolidText
    ? { color: textColor, mixBlendMode: "normal" }
    : undefined;

  return (
    <section className="hero2-section">
      {/* Full-screen background media */}
      {hasMedia ? (
        hero.mediaType === "video" ? (
          <video
            className="hero2-bg-media"
            src={mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        ) : (
          <img
            className="hero2-bg-media"
            src={mediaUrl}
            alt=""
            aria-hidden="true"
          />
        )
      ) : (
        <div className="hero2-bg-fallback" aria-hidden="true" />
      )}

        {/* Centered content */}
        <div className="hero2-content">
          {/* Headline */}
          <h1 className={`hero2-title${isSolidText ? " hero2-title--solid" : ""}`} style={solidTextStyle}>
          <span className="hero2-title-line">
            {hero.titleLine1Prefix && <>{hero.titleLine1Prefix} </>}
            <span className="hero2-highlight">{hero.titleLine1Highlight}</span>
            {hero.titleLine1Suffix && <> {hero.titleLine1Suffix}</>}
          </span>
          <span className="hero2-title-line">
            {hero.titleLine2Prefix && <>{hero.titleLine2Prefix} </>}
            <span className="hero2-highlight">{hero.titleLine2Highlight}</span>
            {hero.titleLine2Suffix && <> {hero.titleLine2Suffix}</>}
          </span>
          </h1>

          <p className="hero2-subtitle" style={solidTextStyle}>{hero.subtitle}</p>
e
        <div className="hero2-buttons">
          <button
            type="button"
            className="h2-btn h2-btn-primary"
            onClick={() => navigateTo(hero.primaryButtonLink)}
          >
            <p>{hero.primaryButtonText}</p>
            <div className="h2-circle-small" />
          </button>
          <button
            type="button"
            className="h2-btn h2-btn-secondary"
            onClick={() => navigateTo(hero.secondaryButtonLink)}
          >
            <p>{hero.secondaryButtonText}</p>
            <div className="h2-circle-small" />
          </button>
        </div>
      </div>

      {/* Scroll cue */}
      <button
        type="button"
        className="hero2-scroll-cue"
        onClick={scrollToContent}
        aria-label="Scroll to content"
      >
        <div className="hero2-scroll-mouse">
          <div className="hero2-scroll-wheel" />
        </div>
        Scroll
      </button>
    </section>
  );
};

export default Hero2;
