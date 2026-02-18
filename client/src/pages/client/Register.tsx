import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePasswordStrong, validateName, validateConfirmPassword, calculatePasswordStrength } from '../../scripts/validation';
import { registerUser } from '../../services/authService';
import '../../assets/css/login.css';
import logo from '../../assets/images/iptv4ever-logo.svg';
import sidePicture from '../../assets/images/movie-grid.png';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Password strength
  const passwordStrength = calculatePasswordStrength(password);

  // Check for autofill
  useEffect(() => {
    const checkAutofill = () => {
      if (firstNameInputRef.current?.value) setFirstNameFocused(true);
      if (lastNameInputRef.current?.value) setLastNameFocused(true);
      if (emailInputRef.current?.value) setEmailFocused(true);
      if (passwordInputRef.current?.value) setPasswordFocused(true);
      if (confirmPasswordInputRef.current?.value) setConfirmPasswordFocused(true);
    };

    checkAutofill();
    const timer = setTimeout(checkAutofill, 100);
    return () => clearTimeout(timer);
  }, [step]);

  const handleStep1Next = () => {
    const firstNameValidation = validateName(firstName, 'First name');
    const lastNameValidation = validateName(lastName, 'Last name');
    
    if (!firstNameValidation.isValid) {
      setFirstNameError(firstNameValidation.message);
      return;
    }
    if (!lastNameValidation.isValid) {
      setLastNameError(lastNameValidation.message);
      return;
    }
    
    setFirstNameError('');
    setLastNameError('');
    setStep(2);
  };

  const handleStep2Next = () => {
    const emailValidation = validateEmail(email);
    
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }
    
    setEmailError('');
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const passwordValidation = validatePasswordStrong(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
    
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    if (!confirmPasswordValidation.isValid) {
      setConfirmPasswordError(confirmPasswordValidation.message);
      return;
    }
    if (!agreeToTerms) {
      setTermsError('You must agree to the terms and conditions');
      return;
    }
    
    setPasswordError('');
    setConfirmPasswordError('');
    setTermsError('');
    setApiError('');
    setIsLoading(true);

    try {
      await registerUser({
        name: `${firstName} ${lastName}`,
        email,
        password,
      });
      setSuccessMessage('Registration successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setApiError(error.message || 'Registration failed. Please try again.');
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
            <p>Create your account</p>
          </div>

          <div className="login-step-indicator">
            <div className={`step-dot ${step === 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step === 2 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step === 3 ? 'active' : ''}`}></div>
          </div>

          {successMessage && (
            <div className="success-message">
              <i className="bi bi-hand-thumbs-up-fill"></i>
              {successMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="login-step">
                <div className="form-group">
                  <label htmlFor="firstName" className={`form-label ${firstNameFocused || firstName ? 'active' : ''}`}>
                    First Name
                  </label>
                  <input
                    ref={firstNameInputRef}
                    type="text"
                    id="firstName"
                    className={`form-input ${firstNameError ? 'error' : ''}`}
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFirstNameError('');
                    }}
                    onFocus={() => setFirstNameFocused(true)}
                    onBlur={() => setFirstNameFocused(firstName !== '')}
                    onKeyPress={(e) => e.key === 'Enter' && handleStep1Next()}
                    autoFocus
                  />
                  {firstNameError && <span className="form-error">{firstNameError}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName" className={`form-label ${lastNameFocused || lastName ? 'active' : ''}`}>
                    Last Name
                  </label>
                  <input
                    ref={lastNameInputRef}
                    type="text"
                    id="lastName"
                    className={`form-input ${lastNameError ? 'error' : ''}`}
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setLastNameError('');
                    }}
                    onFocus={() => setLastNameFocused(true)}
                    onBlur={() => setLastNameFocused(lastName !== '')}
                    onKeyPress={(e) => e.key === 'Enter' && handleStep1Next()}
                  />
                  {lastNameError && <span className="form-error">{lastNameError}</span>}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn primary" onClick={handleStep1Next}>
                    <div className="circle-small" ></div>
                    <p>Next</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Email */}
            {step === 2 && (
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
                    onKeyPress={(e) => e.key === 'Enter' && handleStep2Next()}
                    autoFocus
                  />
                  {emailError && <span className="form-error">{emailError}</span>}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={() => setStep(1)}>
                    <div className="circle-small" ></div>
                    <p>Back</p>
                  </button>
                  <button type="button" className="btn primary" onClick={handleStep2Next}>
                    <div className="circle-small" ></div>
                    <p>Next</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
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
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(password !== '')}
                    autoFocus
                  />
                  {passwordError && <span className="form-error">{passwordError}</span>}
                  
                  {/* Password Strength Meter */}
                  {password && (
                    <div className="password-strength-meter">
                      <div className="strength-bars">
                        {[1, 2, 3, 4, 5].map((bar) => (
                          <div
                            key={bar}
                            className="strength-bar"
                            style={{
                              backgroundColor: bar <= passwordStrength.score ? passwordStrength.color : '#e0e0e0',
                            }}
                          />
                        ))}
                      </div>
                      {passwordStrength.label && (
                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className={`form-label ${confirmPasswordFocused || confirmPassword ? 'active' : ''}`}>
                    Confirm Password
                  </label>
                  <input
                    ref={confirmPasswordInputRef}
                    type="password"
                    id="confirmPassword"
                    className={`form-input ${confirmPasswordError ? 'error' : ''}`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmPasswordError('');
                      setApiError('');
                    }}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(confirmPassword !== '')}
                  />
                  {confirmPasswordError && <span className="form-error">{confirmPasswordError}</span>}
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => {
                        setAgreeToTerms(e.target.checked);
                        setTermsError('');
                      }}
                      style={{ marginRight: '0.5rem' }}
                    />
                    I agree to the <a href="/terms" style={{ color: '#dc2626' }}>Terms and Conditions</a>
                  </label>
                  {termsError && <span className="form-error">{termsError}</span>}
                  {apiError && <span className="form-error">{apiError}</span>}
                </div>

                <div className="form-actions">
                  <button type="button" className="btn secondary" onClick={() => setStep(2)} disabled={isLoading}>
                    <div className="circle-small" ></div>
                    Back
                  </button>
                  <button type="submit" className="btn primary" disabled={isLoading}>
                    <div className="circle-small" ></div>
                    <p>{isLoading ? 'Creating account...' : 'Sign Up'}</p>
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="login-footer">
            <p>
              Already have an account? <a href="/login">Sign in</a>
            </p>
          </div>
        </div>
      </div>

      <div className="login-illustration-section">
        
      </div>
    </div>
  );
};

export default Register;
