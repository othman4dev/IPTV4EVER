import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../scripts/validation';
import { loginUser } from '../../services/authService';
import '../../assets/css/login.css';
import logo from '../../assets/images/iptv4ever-logo.svg';
import sidePicture from '../../assets/images/movie-grid.png';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Check for autofill and update label state
  useEffect(() => {
    const checkAutofill = () => {
      if (emailInputRef.current) {
        const hasValue = emailInputRef.current.value !== '' || emailInputRef.current.matches(':-webkit-autofill');
        if (hasValue) setEmailFocused(true);
      }
      if (passwordInputRef.current) {
        const hasValue = passwordInputRef.current.value !== '' || passwordInputRef.current.matches(':-webkit-autofill');
        if (hasValue) setPasswordFocused(true);
      }
    };

    checkAutofill();
    const timer = setTimeout(checkAutofill, 100);

    const emailInput = emailInputRef.current;
    const passwordInput = passwordInputRef.current;

    const onAutoFillStart = (e: AnimationEvent) => {
      if (e.animationName === 'onAutoFillStart') {
        checkAutofill();
      }
    };

    emailInput?.addEventListener('animationstart', onAutoFillStart as any);
    passwordInput?.addEventListener('animationstart', onAutoFillStart as any);

    return () => {
      clearTimeout(timer);
      emailInput?.removeEventListener('animationstart', onAutoFillStart as any);
      passwordInput?.removeEventListener('animationstart', onAutoFillStart as any);
    };
  }, [step]);

  const handleEmailNext = () => {
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.message);
      return;
    }
    setEmailError('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setPasswordError('');
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setPasswordError(validation.message);
      return;
    }
    
    setPasswordError('');
    setApiError('');
    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });
      setSuccessMessage('Login successful! Redirecting...');
      
      // Redirect after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      setApiError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEmailNext();
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="login-container" style={{backgroundImage:'url(' + sidePicture + ')'}}>
      <div className="login-form-section">
        <div className="login-form-wrapper">
          <div className="login-logo">
            <img src={logo} alt="IPTV4EVER Logo" />
            <p>Sign in to your account</p>
          </div>

          <div className="login-step-indicator">
            <div className={`step-dot ${step === 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step === 2 ? 'active' : ''}`}></div>
          </div>

          {successMessage && (
            <div className="success-message">
              <i className="bi bi-hand-thumbs-up-fill"></i>
              {successMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {step === 1 && (
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
                    }}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(email !== '')}
                    onKeyPress={handleEmailKeyPress}
                    autoFocus
                  />
                  {emailError && <span className="form-error">{emailError}</span>}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn primary"
                    onClick={handleEmailNext}
                  >
                    <div className="circle-small" ></div>
                    <p>Next</p>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="login-step">
                <div className="form-group">
                  <label htmlFor="password" className={`form-label ${passwordFocused || password ? 'active' : ''}`}>
                    Password
                  </label>
                  <input
                    ref={passwordInputRef}
                    type="password"
                    id="password"
                    className={`form-input ${passwordError ? 'error' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                      setApiError('');
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(password !== '')}
                    onKeyPress={handlePasswordKeyPress}
                    autoFocus
                  />
                  {passwordError && <span className="form-error">{passwordError}</span>}
                  {apiError && <span className="form-error">{apiError}</span>}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <div className="circle-small" ></div>
                    <p>Back</p>
                  </button>
                  <button
                    type="submit"
                    className="btn primary"
                    disabled={isLoading}
                  >
                    <div className="circle-small" ></div>
                    <p>{isLoading ? 'Signing in...' : 'Sign In'}</p>
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="login-footer">
            <p>
              <a href="/forgot-password">Forgot password?</a>
            </p>
            <p style={{ marginTop: '1rem' }}>
              Don't have an account? <a href="/register">Sign up</a>
            </p>
          </div>
        </div>
      </div>

      <div className="login-illustration-section"></div>
    </div>
  );
};

export default Login;
