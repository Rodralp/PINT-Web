import { useState } from 'react';
import '../css/ForgotPassword.css';
import PuzzleCaptcha from './PuzzleCaptcha';

function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState('email'); // email, captcha, success
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [recoveredPassword, setRecoveredPassword] = useState('');

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email é obrigatório');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email inválido');
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
        setEmailError('Nenhuma conta encontrada com este email');
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
      setRecoveredPassword('CONTA_NAO_ENCONTRADA');
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
            <h2>Recuperar Senha</h2>
            <p>Insira o email associado à sua conta</p>
            
            <form onSubmit={handleEmailSubmit}>
              <div className="forgot-form-group">
                <input
                  type="email"
                  placeholder="seu.email@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={emailError ? 'forgot-input error' : 'forgot-input'}
                />
                {emailError && <span className="forgot-error">{emailError}</span>}
              </div>
              <button type="submit" className="forgot-btn-continue">
                Verificar Email
              </button>
            </form>
          </div>
        )}

        {step === 'captcha' && (
          <div className="forgot-password-content">
            <h2>Verificação de Segurança</h2>
            <p>Complete o puzzle para continuar</p>
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
            <h2>Senha Recuperada</h2>
            <p>Aqui está sua senha temporária:</p>
            
            <div className="forgot-password-display">
              <code>{recoveredPassword}</code>
              <button 
                type="button"
                className="forgot-btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText(recoveredPassword);
                  alert('Senha copiada para clipboard!');
                }}
              >
                Copiar
              </button>
            </div>

            <p className="forgot-info">
              ⚠️ Esta é a sua senha original. Recomendamos que a altere após fazer login.
            </p>

            <button className="forgot-btn-close" onClick={handleReset}>
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
