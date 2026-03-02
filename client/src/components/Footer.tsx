import "../assets/css/footer.css";
import logo from "../assets/images/iptv4ever-logo.svg";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <img src={logo} alt="iptv4ever Logo" className="footer-logo" />
          <div className="footer-desc">
            iptv4ever.com brings you premium IPTV streaming with unbeatable reliability, global channels, and 24/7 support. Enjoy the future of TV, today.
          </div>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter"><i className="bi bi-twitter"></i></a>
            <a href="#" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
            <a href="#" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-links-title">Quick Links</div>
          <a href="/home">Home</a>
          <a href="/products">Products</a>
          <a href="/blogs">Blogs</a>
          <a href="/contact">Contact</a>
          <a href="/about">About</a>
        </div>
        <div className="footer-links">
          <div className="footer-links-title">Support</div>
          <a href="/faq">FAQ</a>
          <a href="/help">Help Center</a>
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/refund">Refund Policy</a>
        </div>
        <div className="footer-links">
          <div className="footer-links-title">Quick Links</div>
          <a href="/home">Home</a>
          <a href="/products">Products</a>
          <a href="/blogs">Blogs</a>
          <a href="/contact">Contact</a>
          <a href="/about">About</a>
        </div>
        {/* <div className="footer-newsletter">
          <div className="footer-newsletter-title">Subscribe to our Newsletter</div>
          <form className="footer-newsletter-form" onSubmit={e => e.preventDefault()}>
            <input
              className="footer-newsletter-input"
              type="email"
              placeholder="Your email address"
              required
            />
            <button className="footer-newsletter-btn" type="submit">
              Subscribe
            </button>
          </form>
          <div style={{ color: '#fff8', fontSize: '0.95rem', marginTop: 6 }}>
            Get the latest updates, offers, and IPTV tips straight to your inbox.
          </div>
        </div> */}
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} IPTV4EVER.com. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
