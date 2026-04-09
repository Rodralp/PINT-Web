import { useEffect } from 'react';
import '../css/TermsModal.css';

function TermsModal({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="terms-modal-overlay" onClick={handleBackdropClick}>
      <div className="terms-modal-container">
        <div className="terms-modal-header">
          <h1 className="terms-modal-title">Termos de Servico</h1>
          <button className="terms-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="terms-modal-content">
          <section className="terms-section">
            <h2>1. Aceitação dos termos</h2>
            <p>Ao aceder ou utilizar a plataforma, o utilizador declara ter lido, compreendido e aceitado estes Termos na íntegra. Caso não concorde com algum dos pontos, não deverá utilizar a plataforma.</p>
          </section>

          <section className="terms-section">
            <h2>2. Utilizadores abrangidos</h2>
            <p>A plataforma destina-se exclusivamente a colaboradores da Softinsa, bem como a gestores (Talent Managers e Service Line Leaders) no exercício das suas funções.</p>
          </section>

          <section className="terms-section">
            <h2>3. Criação de conta e segurança</h2>
            <p>O utilizador compromete-se a fornecer informações verdadeiras, completas e atualizadas durante o registo. A password é pessoal e intransmissível. O utilizador é responsável por todas as atividades realizadas na sua conta. Na primeira autenticação, o utilizador deverá alterar a password fornecida. O utilizador pode solicitar a recuperação da password através do email associado à conta.</p>
          </section>

          <section className="terms-section">
            <h2>4. Submissão de evidências</h2>
            <p>Para concorrer a um badge, o utilizador deverá submeter as evidências solicitadas (certificados, diplomas, relatórios, etc.). O utilizador declara que todas as evidências submetidas são verdadeiras, autênticas e lhe pertencem. A Softinsa reserva-se o direito de solicitar documentação complementar ou de rejeitar evidências que considere insuficientes ou falsas.</p>
          </section>

          <section className="terms-section">
            <h2>5. Processo de validação e aprovação</h2>
            <p>As candidaturas serão analisadas primeiro pelo Talent Manager e depois pelo Service Line Leader da área respetiva. O utilizador será notificado por email sobre aprovações, rejeições ou pedidos de correção. Todas as decisões são finais nos termos do regulamento interno da Softinsa.</p>
          </section>

          <section className="terms-section">
            <h2>6. Obtenção e utilização de badges</h2>
            <p>Um badge é atribuído apenas quando todos os requisitos de um determinado nível estiverem cumpridos. Alguns badges podem ter data de expiração, sendo essa informação visível na página do badge. O utilizador compromete-se a não adulterar, falsificar ou utilizar indevidamente qualquer badge.</p>
          </section>

          <section className="terms-section">
            <h2>7. Publicação e partilha de badges</h2>
            <p>O utilizador pode autorizar que os seus badges sejam exibidos na galeria pública da plataforma. O utilizador pode partilhar voluntariamente os seus badges no LinkedIn ou noutras redes profissionais. Caso pretenda incluir um badge na assinatura de email corporativo, deverá ativar essa funcionalidade nas definições da conta.</p>
          </section>

          <section className="terms-section">
            <h2>8. Sistema de pontuação e gamificação</h2>
            <p>A Softinsa pode atribuir pontos a cada badge, de acordo com critérios definidos internamente. Os pontos servem para identificar talento e evolução profissional, podendo ser considerados em processos de reconhecimento ou compensação. Mesmo que um badge expire, a pontuação obtida mantém-se no histórico do utilizador.</p>
          </section>

          <section className="terms-section">
            <h2>9. Notificações e lembretes</h2>
            <p>Ao aceitar estes Termos, o utilizador consente receber notificações por email e/ou push relativas a: confirmação de candidatura a um badge, aprovação ou rejeição de pedidos, expiração de badges e lembretes de objetivos e prazos definidos na timeline pessoal.</p>
          </section>

          <section className="terms-section">
            <h2>10. Conduta proibida</h2>
            <p>O utilizador não deverá: partilhar as suas credenciais de acesso com terceiros; utilizar a plataforma para fins não profissionais ou não autorizados; submeter evidências falsas ou de terceiros sem consentimento; tentar aceder a dados de outros utilizadores sem permissão.</p>
          </section>

          <section className="terms-section">
            <h2>11. Suspensão ou cancelamento de conta</h2>
            <p>A Softinsa reserva-se o direito de suspender ou cancelar contas em caso de violação destes Termos, utilização indevida da plataforma ou por solicitação dos recursos humanos da empresa.</p>
          </section>

          <section className="terms-section">
            <h2>12. Alterações aos termos</h2>
            <p>Estes Termos podem ser atualizados periodicamente. As alterações serão comunicadas aos utilizadores com antecedência mínima de 15 dias, salvo quando exigido por lei.</p>
          </section>

          <section className="terms-section">
            <h2>13. Legislação aplicável</h2>
            <p>Estes Termos regem-se pela legislação portuguesa. Qualquer litígio será submetido aos tribunais da comarca de Lisboa.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;
