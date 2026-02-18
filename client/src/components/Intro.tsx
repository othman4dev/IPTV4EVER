import Logo from '../assets/images/iptv4ever-logo.svg';
import '../assets/css/intro.css';

const Intro = () => {
    return (
        <div className="intro">
            <div className="intro-head">
                <h1 className="intro-title">
                    Unlimited Entertainment at Your Fingertips
                </h1>
                <p className="intro-subtitle">Your Premium Streaming Experience</p>
                
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="circle-small"></div>
                        <div className="feature-icon">
                            <i class="bi bi-grid-3x3"></i>
                        </div>
                        <h3>10,000+ Channels</h3>
                        <p>Access thousands of live TV channels from around the world</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="circle-small"></div>
                        <div className="feature-icon">
                            <i className="bi bi-film"></i>
                        </div>
                        <h3>Movies & Series</h3>
                        <p>Stream the latest movies and binge-worthy TV series</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="circle-small"></div>
                        <div className="feature-icon">
                            <i class="bi bi-stars"></i>
                        </div>
                        <h3>Ultra HD Quality</h3>
                        <p>Crystal clear streaming in 4K and Full HD resolution</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="circle-small"></div>
                        <div className="feature-icon">
                            <i class="bi bi-tablet"></i>
                        </div>
                        <h3>Multi-Device</h3>
                        <p>Watch on Smart TV, phone, tablet, or any device</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="circle-small"></div>
                        <div className="feature-icon">
                            <i className="bi bi-headset"></i>
                        </div>
                        <h3>24/7 Support</h3>
                        <p>Round-the-clock customer support for all your needs</p>
                    </div>
                    
                    <div className="feature-card">
                        <div className="circle-small"></div>
                        <div className="feature-icon">
                            <i className="bi bi-shield-check"></i>
                        </div>
                        <h3>Secure & Reliable</h3>
                        <p>Stable connections with 99.9% uptime guarantee</p>
                    </div>
                </div>
                
                <div className="intro-button-wrapper">
                    <button type="button" className="intro-button" onClick={() => window.location.href = '/login'}>
                        <p>Get Started</p>
                        <div className="circle-small"></div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Intro;