import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validatePassword, validateConfirmPassword } from '../../scripts/validation';
import { resetPassword } from '../../services/authService';
import '../../assets/css/login.css';
import logo from '../../assets/images/iptv4ever-logo.svg';
import sidePicture from '../../assets/images/movie-grid.png';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');
  
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  useEffect(() => {
    if (!token) {
      setApiError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setApiError('Invalid reset token');
      return;
    }

    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(password, confirmPassword);
    
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.message);
      return;
    }
    if (!confirmPasswordValidation.isValid) {
      setConfirmPasswordError(confirmPasswordValidation.message);
      return;
    }
    
    setPasswordError('');
    setConfirmPasswordError('');
    setApiError('');
    setIsLoading(true);

    try {
      const response = await resetPassword(token, password);
      setSuccessMessage(response.message);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setApiError(error.message || 'Failed to reset password. Please try again.');
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
            <p>Set new password</p>
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
                Enter your new password below.
              </p>

              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-step">
                  <div className="form-group">
                    <label htmlFor="password" className={`form-label ${passwordFocused || password ? 'active' : ''}`}>
                      New Password
                    </label>
                    <input
                      ref={passwordInputRef}
                      type="password"
                      id="password"
                      className={`form-input ${passwordError ? 'error' : ''}`}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(password !== '')}
                      autoFocus
                      disabled={!token || !!apiError}
                    />
                    {passwordError && <span className="form-error">{passwordError}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword" className={`form-label ${confirmPasswordFocused || confirmPassword ? 'active' : ''}`}>
                      Confirm New Password
                    </label>
                    <input
                      ref={confirmPasswordInputRef}
                      type="password"
                      id="confirmPassword"
                      className={`form-input ${confirmPasswordError ? 'error' : ''}`}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmPasswordError('');
                        setApiError('');
                      }}
                      onFocus={() => setConfirmPasswordFocused(true)}
                      onBlur={() => setConfirmPasswordFocused(confirmPassword !== '')}
                      disabled={!token || !!apiError}
                    />
                    {confirmPasswordError && <span className="form-error">{confirmPasswordError}</span>}
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
                      disabled={isLoading || !token || !!apiError}
                    >
                      <div className="circle-small" ></div>
                      <p>{isLoading ? 'Resetting...' : 'Reset Password'}</p>
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

export default ResetPassword;
