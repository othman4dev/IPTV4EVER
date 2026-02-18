import "../assets/css/announcements.css";

const Announcements = () => {
    const announcements = [
        "🎬 New Premium Channels Added! Check out our latest sports and movie packages",
        "⚡ 50% OFF on Annual Subscriptions - Limited Time Offer!",
        "📺 4K Ultra HD Now Available on All Plans",
        "🌍 24/7 Customer Support - We're Here to Help!",
    ];

    return (
        <div className="announcements">
            <div className="film-strip top"></div>
            <div className="announcement-content">
                <div className="marquee">
                    <div className="marquee-inner">
                        {announcements.map((text, index) => (
                            <span key={index} className="announcement-item">
                                {text}
                            </span>
                        ))}
                        {announcements.map((text, index) => (
                            <span key={`dup-${index}`} className="announcement-item">
                                {text}
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