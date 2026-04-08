import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './css/entrar.css';

function Entrar() {
  const navigate = useNavigate();
  // Preencher ou limpar campos de dados caso o utilizador tenha escolhido "Guardar dados de login" usando o localStorage
  const savedLoginData = localStorage.getItem('loginData');
  const initialFormData = savedLoginData ? JSON.parse(savedLoginData) : {
    email: '',
    senha: '',
    guardarDados: false
  };

  const [formData, setFormData] = useState(initialFormData);
  const [erros, setErros] = useState({});
  const [mostraSenha, setMostraSenha] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: inputValue
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

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErros.email = 'Email inválido';
    }

    if (!formData.senha) {
      novosErros.senha = 'Palavra-passe é obrigatória';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const valodarExistenciaConta = () => {
    // Comparar dados do formulário com localStorage ContasCriadas enquanto não tiver base de dados
    const contasCriadas = JSON.parse(localStorage.getItem('contasCriadas')) || [];
    const contaEncontrada = contasCriadas.find(conta => conta.email === formData.email && conta.senha === formData.senha);

    if (contaEncontrada) {
      return contaEncontrada;
    }

    setErros(prev => ({
      ...prev,
      email: 'Email ou palavra-passe incorretos',
      senha: 'Email ou palavra-passe incorretos'
    }));
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    const contaEncontrada = valodarExistenciaConta();

    if (!contaEncontrada) {
      return;
    }

    // TODO: Quando tiver base de dados, enviar os dados para o backend
    console.log('Dados do login:', formData);
    setShowSuccess(true);

    // Guardar dados de login no localStorage ou sessionStorage se a checkbox estiver marcada
    const dadosLogin = {
      ...formData,
      nome: contaEncontrada.nome
    };

    if (formData.guardarDados) {
      localStorage.setItem('loginData', JSON.stringify(dadosLogin));
    } else {
      localStorage.removeItem('loginData');
      sessionStorage.setItem('loginData', JSON.stringify(dadosLogin));
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigate('/dashboard');
  };

  return (
    <div className="entrar-root">
      <Navbar />

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="entrar-overlay">
          <div className="entrar-success-modal">
            <svg className="entrar-success-icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0088FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <h2>Login Realizado com Sucesso!</h2>
            <p>Bem-vindo ao sistema Softinsa.</p>
            <button onClick={handleCloseSuccess} className="entrar-success-btn">
              Ir para Dashboard
            </button>
          </div>
        </div>
      )}

      <div className="entrar-container">
        <div className="entrar-form-container">
          {/* Logo */}
          <div className="entrar-logo">
            <img src="/SoftinsaLogo.png" alt="Softinsa Logo" />
          </div>

          {/* Título e subtítulo */}
          <div className="entrar-header">
            <h1>Entrar na conta</h1>
            <p>Insira seu e-mail para entrar neste aplicativo</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="entrar-form">
            <div className="entrar-form-group">
              <input
                type="email"
                name="email"
                placeholder="email@dominio.com"
                value={formData.email}
                onChange={handleChange}
                className={erros.email ? 'entrar-input erro' : 'entrar-input'}
              />
              {erros.email && <span className="entrar-erro">{erros.email}</span>}
            </div>

            <div className="entrar-form-group">
              <div className="entrar-password-wrapper">
                <input
                  type={mostraSenha ? 'text' : 'password'}
                  name="senha"
                  placeholder="Palavra-passe"
                  value={formData.senha}
                  onChange={handleChange}
                  className={erros.senha ? 'entrar-input erro' : 'entrar-input'}
                />
                <svg 
                  className="entrar-eye-icon" 
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
              {erros.senha && <span className="entrar-erro">{erros.senha}</span>}
            </div>

            <div className="entrar-form-group entrar-checkbox-group">
              <input
                type="checkbox"
                name="guardarDados"
                id="guardarDados"
                checked={formData.guardarDados}
                onChange={handleChange}
              />
              <label htmlFor="guardarDados">Guardar dados de login</label>
            </div>

            <button type="submit" className="entrar-btn-continuar">
              Continuar
            </button>
          </form>

          {/* Forgot password link */}
          <div className="entrar-forgot-link">
            <a href="#esquecer">Esqueceu a senha?</a>
          </div>

          {/* Signup link */}
          <div className="entrar-signup-link">
            <span>Ainda não tem conta?</span>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/criar'); }}>Registar</a>
          </div>

          {/* Footer links */}
          <div className="entrar-footer-links">
            <p>Ao clicar em continuar, você concorda com os nossos</p>
            <div className="entrar-links">
              <a href="#termos">Termos de Serviço</a>
              <span> e com a </span>
              <a href="#privacidade">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Entrar;