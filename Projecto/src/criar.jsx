import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TermsModal from './components/TermsModal';
import PrivacyModal from './components/PrivacyModal';
import './css/Criar.css';

function CriarConta() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmaSenha: ''
  });

  const [erros, setErros] = useState({});
  const [mostraSenha, setMostraSenha] = useState(false);
  const [mostraConfirmaSenha, setMostraConfirmaSenha] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar erro do campo ao digitar
    if (erros[name]) {
      setErros(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const toggleMostraSenha = () => setMostraSenha(!mostraSenha);
  const toggleMostraConfirmaSenha = () => setMostraConfirmaSenha(!mostraConfirmaSenha);

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    if (!formData.senha) {
      novosErros.senha = 'Palavra-passe é obrigatória';
    } else if (formData.senha.length < 8) {
      novosErros.senha = 'Palavra-passe deve ter pelo menos 8 caracteres';
    }

    if (!formData.confirmaSenha) {
      novosErros.confirmaSenha = 'Confirmação é obrigatória';
    } else if (formData.senha !== formData.confirmaSenha) {
      novosErros.confirmaSenha = 'Palavras-passe não correspondem';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    // TODO: Quando tiver base de dados, enviar os dados para o backend
    console.log('Dados do formulário:', formData);
    setShowSuccess(true);

    // Criar conta e guardar em localStorage (remover quando tiver backend)
    const contas = JSON.parse(localStorage.getItem('contasCriadas')) || [];
    contas.push({
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha,
      status: 'pendente' // Indica que a conta está aguardando verificação
    });
    localStorage.setItem('contasCriadas', JSON.stringify(contas));
    
    // Limpar formulário
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmaSenha: ''
    });
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigate('/');
  };

  return (
    <div className="criar-root">
      <Navbar />

      {/* TERMS MODAL */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

      {/* PRIVACY MODAL */}
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="criar-overlay">
          <div className="criar-success-modal">
            <svg className="criar-success-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0088FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <h2>Conta Criada com Sucesso!</h2>
            <p>Um administrador irá verificar seus dados e ativar sua conta em breve.</p>
            <button onClick={handleCloseSuccess} className="criar-success-btn">
              Voltar para Home
            </button>
          </div>
        </div>
      )}

      <div className="criar-container">
        <div className="criar-form-container">
        {/* Título e subtítulo */}
        <div className="criar-header">
          <h1>Criar conta</h1>
          <p>Insira seus dados e aguarde a verificação</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="criar-form">
          <div className="criar-form-group">
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              value={formData.nome}
              onChange={handleChange}
              className={erros.nome ? 'criar-input erro' : 'criar-input'}
            />
            {erros.nome && <span className="criar-erro">{erros.nome}</span>}
          </div>

          <div className="criar-form-group">
            <input
              type="email"
              name="email"
              placeholder="email@dominio.com"
              value={formData.email}
              onChange={handleChange}
              className={erros.email ? 'criar-input erro' : 'criar-input'}
            />
            {erros.email && <span className="criar-erro">{erros.email}</span>}
          </div>

          <div className="criar-form-group">
            <div className="criar-password-wrapper">
              <input
                type={mostraSenha ? 'text' : 'password'}
                name="senha"
                placeholder="Palavra-passe"
                value={formData.senha}
                onChange={handleChange}
                className={erros.senha ? 'criar-input erro' : 'criar-input'}
              />
              <svg 
                className="criar-eye-icon" 
                onClick={toggleMostraSenha}
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {mostraSenha ? (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </>
                )}
              </svg>
            </div>
            {erros.senha && <span className="criar-erro">{erros.senha}</span>}
          </div>

          <div className="criar-form-group">
            <div className="criar-password-wrapper">
              <input
                type={mostraConfirmaSenha ? 'text' : 'password'}
                name="confirmaSenha"
                placeholder="Confirmar Palavra-passe"
                value={formData.confirmaSenha}
                onChange={handleChange}
                className={erros.confirmaSenha ? 'criar-input erro' : 'criar-input'}
              />
              <svg 
                className="criar-eye-icon" 
                onClick={toggleMostraConfirmaSenha}
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {mostraConfirmaSenha ? (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </>
                ) : (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </>
                )}
              </svg>
            </div>
            {erros.confirmaSenha && <span className="criar-erro">{erros.confirmaSenha}</span>}
          </div>

          <button type="submit" className="criar-btn-continuar">
            Continuar
          </button>
        </form>

        {/* Login link */}
        <div className="criar-login-link">
          <span>Já tem conta?</span>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/entrar'); }}>Entre</a>
        </div>

        {/* Footer links */}
        <div className="criar-footer-links">
          <p>Ao clicar em continuar, você concorda com os nossos</p>
          <div className="criar-links">
            <a href="#termos" onClick={(e) => { e.preventDefault(); setShowTermsModal(true); }}>Termos de Serviço</a>
            <span> e com a </span>
            <a href="#privacidade" onClick={(e) => { e.preventDefault(); setShowPrivacyModal(true); }}>Política de Privacidade</a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

export default CriarConta;
