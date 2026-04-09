import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../css/ForgotPassword.css';
import PuzzleCaptcha from './PuzzleCaptcha';

function ForgotPasswordModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [step, setStep] = useState('email'); // email, captcha, success
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [recoveredPassword, setRecoveredPassword] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError(t('err_required_email'));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('err_invalid_email'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (validateEmail()) {
      // Verificar se o email existe no localStorage
      const contasCriadas = JSON.parse(localStorage.getItem('contasCriadas')) || [];
      const contaEncontrada = contasCriadas.find(conta => conta.email === email);
      
      if (contaEncontrada) {
        setStep('captcha');
      } else {
        setEmailError(t('forgot_email_not_found'));
      }
    }
  };

  const handleCaptchaComplete = () => {
    // Buscar a senha da conta guardada no localStorage baseada no email
    const contasCriadas = JSON.parse(localStorage.getItem('contasCriadas')) || [];
    const contaEncontrada = contasCriadas.find(conta => conta.email === email);
    
    if (contaEncontrada) {
      setRecoveredPassword(contaEncontrada.senha);
    } else {
      // Fallback se a conta não for encontrada
      setRecoveredPassword(t('forgot_account_not_found_fallback'));
    }
    setStep('success');
  };

  const handleReset = () => {
    setEmail('');
    setEmailError('');
    setRecoveredPassword('');
    setStep('email');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay">
      <div className="forgot-password-modal">
        <button className="forgot-password-close" onClick={handleReset}>
          ✕
        </button>

        {step === 'email' && (
          <div className="forgot-password-content">
            <h2>{t('forgot_title')}</h2>
            <p>{t('forgot_subtitle')}</p>
            
            <form onSubmit={handleEmailSubmit}>
              <div className="forgot-form-group">
                <input
                  type="email"
                  placeholder={t('login_placeholder_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={emailError ? 'forgot-input error' : 'forgot-input'}
                />
                {emailError && <span className="forgot-error">{emailError}</span>}
              </div>
              <button type="submit" className="forgot-btn-continue">
                {t('forgot_verify_email')}
              </button>
            </form>
          </div>
        )}

        {step === 'captcha' && (
          <div className="forgot-password-content">
            <h2>{t('forgot_security_title')}</h2>
            <p>{t('forgot_security_subtitle')}</p>
            <PuzzleCaptcha onComplete={handleCaptchaComplete} />
          </div>
        )}

        {step === 'success' && (
          <div className="forgot-password-content forgot-success">
            <div className="forgot-success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2>{t('forgot_success_title')}</h2>
            <p>{t('forgot_success_subtitle')}</p>
            
            <div className="forgot-password-display">
              <code>{recoveredPassword}</code>
              <button 
                type="button"
                className="forgot-btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText(recoveredPassword);
                  alert(t('forgot_copied_alert'));
                }}
              >
                {t('forgot_copy')}
              </button>
            </div>

            <p className="forgot-info">
              {t('forgot_warning_info')}
            </p>

            <button className="forgot-btn-close" onClick={handleReset}>
              {t('forgot_close')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
