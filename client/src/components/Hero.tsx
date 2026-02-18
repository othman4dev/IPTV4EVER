import "../assets/css/hero.css"
import down from "../assets/images/4-down.svg"

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>Premium <span className="highlight">IPTV</span> at</h1>
                <h1>the <span className="highlight">Best</span> Prices</h1>
                <p className="hero-subtitle">Unbeatable Deals on the Ultimate IPTV Experience</p>
                
                <div className="hero-buttons">
                    <button type="button" className="hero-btn primary">
                        <p>Get Started</p>
                        <div className="circle-small"></div>
                    </button>
                    <button type="button" className="hero-btn secondary">
                        <p>Learn More</p>
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