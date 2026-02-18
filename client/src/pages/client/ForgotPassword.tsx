import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../scripts/validation';
import { forgotPassword } from '../../services/authService';
import '../../assets/css/login.css';
import logo from '../../assets/images/iptv4ever-logo.svg';
import sidePicture from '../../assets/images/movie-grid.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [emailFocused, setEmailFocused] = useState(false);

  useEffect(() => {
    const checkAutofill = () => {
      if (emailInputRef.current?.value) setEmailFocused(true);
    };
    checkAutofill();
    const timer = setTimeout(checkAutofill, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.message);
      return;
    }
    
    setEmailError('');
    setApiError('');
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      setSuccessMessage(response.message);
      setEmail('');
      
      // Optionally redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 9000);
    } catch (error: any) {
      setApiError(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container" style={{backgroundImage:'url(' + sidePicture + ')'}}>
      <div className="login-form-section">
        <div className="login-form-wrapper">
          <div className="login-logo">
            <img src={logo} alt="IPTV4EVER Logo" />
            <p>Reset your password</p>
          </div>

          {successMessage && (
            <div className="success-message">
              <i className="bi bi-hand-thumbs-up-fill"></i>
              {successMessage}
            </div>
          )}

          {!successMessage && (
            <>
              <p style={{ color: '#666', textAlign: 'center', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-step">
                  <div className="form-group">
                    <label htmlFor="email" className={`form-label ${emailFocused || email ? 'active' : ''}`}>
                      Email Address
                    </label>
                    <input
                      ref={emailInputRef}
                      type="email"
                      id="email"
                      className={`form-input ${emailError ? 'error' : ''}`}
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                        setApiError('');
                      }}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(email !== '')}
                      autoFocus
                    />
                    {emailError && <span className="form-error">{emailError}</span>}
                    {apiError && <span className="form-error">{apiError}</span>}
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => navigate('/login')}
                      disabled={isLoading}
                    >
                      <div className="circle-small" ></div>
                      <p>Back to Login</p>
                    </button>
                    <button
                      type="submit"
                      className="btn primary"
                      disabled={isLoading}
                    >
                      <div className="circle-small" ></div>
                      <p>{isLoading ? 'Sending...' : 'Send Reset Link'}</p>
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}

          <div className="login-footer">
            <p>
              Remember your password? <a href="/login">Sign in</a>
            </p>
          </div>
        </div>
      </div>

      <div className="login-illustration-section">
        
      </div>
    </div>
  );
};

export default ForgotPassword;
