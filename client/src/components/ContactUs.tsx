import React, { useState } from "react";
import "../assets/css/contact-us.css";

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focus, setFocus] = useState({ name: false, email: false, message: false });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocus({ ...focus, [e.target.name]: true });
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFocus({ ...focus, [e.target.name]: false });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  };

  return (
    <div className="contact-wrapper">
      {
        window.location.href.includes('/contact') && (
          <>
            <br /><br /><br /><br /><br /><br />
          </>
        )
      }
      <section className="contact-section">
        <div className="testimonials-header">
            <h2 className="testimonials-title">Contact Us</h2>
            <p className="testimonials-subtitle">
                  If you have any questions, feedback, or need assistance, feel free to reach out to our support team.
            </p>
        </div>
        <div className="contact-content">
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-group floating-group">
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                autoComplete="off"
                placeholder=" "
                className="form-input"
              />
              <label
                htmlFor="name"
                className={`form-label${focus.name || form.name ? " active" : ""}`}
              >Name</label>
            </div>
            <div className="contact-form-group floating-group">
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                autoComplete="off"
                placeholder=" "
                className="form-input"
              />
              <label
                htmlFor="email"
                className={`form-label${focus.email || form.email ? " active" : ""}`}
              >Email</label>
            </div>
            <div className="contact-form-group floating-group">
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                rows={5}
                placeholder=" "
                className="form-input"
              />
              <label
                htmlFor="message"
                className={`form-label${focus.message || form.message ? " active" : ""}`}
              >Message</label>
            </div>
            <button className="contact-btn" type="submit" disabled={submitted}>
              <div className="circle-small"></div>
              <p>{submitted ? "Message Sent!" : "Send Message"}</p>
            </button>
          </form>
          <div className="contact-info">
            <div className="contact-info-title">
              <h3>
                Alternative ways to reach us:
              </h3>
            </div>
            <div className="contact-info-item">
              <i className="bi bi-envelope"></i>
              <span>support@iptv4ever.com</span>
            </div>
            <div className="contact-info-item">
              <i className="bi bi-geo-alt"></i>
              <span>123 IPTV Street, Streaming City, World</span>
            </div>
            <div className="contact-info-item">
              <i className="bi bi-clock"></i>
              <span>24/7 Support</span>
            </div>
            <div className="contact-info-item">
              <i className="bi bi-whatsapp"></i>
              <span>
                  <p>+1 (555) 123-4567</p>
              </span>
            </div>
            <div className="contact-info-item">
              <i className="bi bi-phone"></i>
              <span>
                  <p>+1 (388) 321-7654</p>
              </span>
            </div>
            <div className="contact-info-item">
              <i className="bi bi-chat"></i>
              <span>
                  <p>Live Chat Support</p>
              </span>
            </div>
            <div className="contact-info-item">
              <i className="bi bi-robot"></i>
              <span>
                  <p>AI assistant</p>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
