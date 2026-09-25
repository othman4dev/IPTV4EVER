import { useState, useEffect } from "react";
import "../assets/css/announcements.css";
import { getActiveAnnouncements } from "../services/announcementService";
import type { Announcement } from "../services/announcementService";
import { getHomeSections } from "../services/pageLayoutService";

// Fallback shown while loading or if the API returns nothing
const FALLBACK: Announcement[] = [
    { id: 0, order: 0, isActive: true, icon: "🎬", text: "New Premium Channels Added! Check out our latest sports and movie packages" },
    { id: 1, order: 1, isActive: true, icon: "⚡", text: "50% OFF on Annual Subscriptions - Limited Time Offer!" },
    { id: 2, order: 2, isActive: true, icon: "📺", text: "4K Ultra HD Now Available on All Plans" },
    { id: 3, order: 3, isActive: true, icon: "🌍", text: "24/7 Customer Support - We're Here to Help!" },
];

const Announcements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(FALLBACK);
    const [variant, setVariant] = useState("default");
    const [bgColor, setBgColor] = useState("#1a1a1a");
    const [textColor, setTextColor] = useState("#ffffff");
    const [marginTop, setMarginTop] = useState(20);
    const [marginBottom, setMarginBottom] = useState(0);

    useEffect(() => {
        getActiveAnnouncements()
            .then((data) => { if (data.length > 0) setAnnouncements(data); })
            .catch(() => { /* keep fallback */ });

        getHomeSections()
            .then((sections) => {
                const ann = sections.find((s) => s.sectionKey === "announcements");
                if (!ann) return;
                if (ann.variant) setVariant(ann.variant);
                if (ann.config) {
                    try {
                        const parsed = JSON.parse(ann.config) as {
                            bgColor?: string;
                            textColor?: string;
                            marginTop?: number;
                            marginBottom?: number;
                        };
                        if (parsed.bgColor) setBgColor(parsed.bgColor);
                        if (parsed.textColor) setTextColor(parsed.textColor);
                        if (parsed.marginTop !== undefined) setMarginTop(parsed.marginTop);
                        if (parsed.marginBottom !== undefined) setMarginBottom(parsed.marginBottom);
                    } catch { /* keep defaults */ }
                }
            })
            .catch(() => { /* keep defaults */ });
    }, []);

    const items = announcements.length > 0 ? announcements : FALLBACK;

    // ── Minimalistic variant ──────────────────────────────────────────────────
    if (variant === "minimalistic") {
        const first = items[0];
        return (
            <div className="announcements-minimal" style={{ backgroundColor: bgColor, marginTop, marginBottom }}>
                <span className="announcements-minimal-text" style={{ color: textColor }}>
                    <span
                        className="announcement-icon"
                        dangerouslySetInnerHTML={{ __html: first.icon }}
                    />
                    {first.text}
                </span>
            </div>
        );
    }

    // ── Classic (default) variant ─────────────────────────────────────────────
    return (
        <div className="announcements" style={{ backgroundColor: bgColor, marginTop, marginBottom }}>
            <div className="film-strip top"></div>
            <div className="announcement-content">
                <div className="marquee">
                    <div className="marquee-inner">
                        {[...items, ...items].map((a, index) => (
                            <span key={index} className="announcement-item" style={{ color: textColor }}>
                                <span
                                    className="announcement-icon"
                                    dangerouslySetInnerHTML={{ __html: a.icon }}
                                />
                                {a.text}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="film-strip bottom"></div>
        </div>
    );
};

export default Announcements;
