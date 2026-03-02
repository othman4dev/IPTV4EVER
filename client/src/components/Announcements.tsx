import { useState, useEffect } from "react";
import "../assets/css/announcements.css";
import { getActiveAnnouncements} from "../services/announcementService";
import type { Announcement } from "../services/announcementService";

// Fallback shown while loading or if the API returns nothing
const FALLBACK: Announcement[] = [
    { id: 0, order: 0, isActive: true, icon: "🎬", text: "New Premium Channels Added! Check out our latest sports and movie packages" },
    { id: 1, order: 1, isActive: true, icon: "⚡", text: "50% OFF on Annual Subscriptions - Limited Time Offer!" },
    { id: 2, order: 2, isActive: true, icon: "📺", text: "4K Ultra HD Now Available on All Plans" },
    { id: 3, order: 3, isActive: true, icon: "🌍", text: "24/7 Customer Support - We're Here to Help!" },
];

const Announcements = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>(FALLBACK);

    useEffect(() => {
        getActiveAnnouncements()
            .then((data) => { if (data.length > 0) setAnnouncements(data); })
            .catch(() => { /* keep fallback */ });
    }, []);

    const items = announcements.length > 0 ? announcements : FALLBACK;

    return (
        <div className="announcements">
            <div className="film-strip top"></div>
            <div className="announcement-content">
                <div className="marquee">
                    <div className="marquee-inner">
                        {[...items, ...items].map((a, index) => (
                            <span key={index} className="announcement-item">
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