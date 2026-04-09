import { useEffect } from 'react';
import '../css/TermsModal.css';

function PrivacyModal({ isOpen, onClose }) {
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
          <h1 className="terms-modal-title">Politica de Privacidade</h1>
          <button className="terms-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="terms-modal-content">
          <section className="terms-section">
            <h2>1. Responsável pelo tratamento dos dados</h2>
            <p>A Softinsa é a entidade responsável pelo tratamento dos seus dados pessoais no âmbito da Plataforma de Badges.</p>
          </section>

          <section className="terms-section">
            <h2>2. Que dados recolhemos?</h2>
            <p>Ao utilizar a plataforma, podemos recolher as seguintes categorias de dados:</p>
            <ul>
              <li>Dados de identificação profissional: nome, email corporativo, área de atuação e função na empresa.</li>
              <li>Dados de autenticação: password (armazenada de forma cifrada) e histórico de acessos.</li>
              <li>Dados de evidências: certificados, diplomas, relatórios e outros documentos que o utilizador enviar para concorrer a badges.</li>
              <li>Histórico de badges: badges obtidos, badges em processo de validação e progresso nos percursos de aprendizagem.</li>
              <li>Dados de gamificação: pontuação atribuída, conquistas especiais e marcos alcançados.</li>
              <li>Dados de comunicação: notificações enviadas, lembretes e preferências de contacto.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. Como utilizamos os seus dados?</h2>
            <p>Os seus dados são utilizados exclusivamente para as seguintes finalidades:</p>
            <ul>
              <li>Gestão da sua conta e autenticação na plataforma.</li>
              <li>Submissão, validação e aprovação de candidaturas a badges.</li>
              <li>Emissão e publicação de badges digitais.</li>
              <li>Criação de rankings internos por área ou Service Line, para efeitos de reconhecimento profissional.</li>
              <li>Envio de notificações sobre o estado dos seus pedidos, expiração de badges e lembretes de objetivos.</li>
              <li>Geração de relatórios agregados e anónimos para melhoria da plataforma e gestão de talento.</li>
              <li>Partilha pública apenas quando o utilizador autorizar expressamente.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Qual o fundamento legal para o tratamento?</h2>
            <p>O tratamento dos seus dados baseia-se em:</p>
            <ul>
              <li>Execução do contrato de trabalho ou de formação profissional (gestão de competências e progressão).</li>
              <li>Consentimento explícito do utilizador para partilha pública de badges ou integração com redes profissionais.</li>
              <li>Interesse legítimo da Softinsa em gerir o talento interno, certificar competências e promover a aprendizagem contínua.</li>
              <li>Obrigações legais aplicáveis, nomeadamente em matéria de arquivo e auditoria.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Com quem partilhamos os seus dados?</h2>
            <p>Os seus dados podem ser acedidos ou partilhados com:</p>
            <ul>
              <li>Talent Managers e Service Line Leaders no âmbito do processo de validação de badges.</li>
              <li>Administradores da plataforma para gestão técnica e configuração.</li>
              <li>Fornecedores técnicos subcontratados (ex: alojamento da plataforma, serviço de email), que estão vinculados contratualmente ao RGPD.</li>
              <li>Redes profissionais (ex: LinkedIn) apenas mediante autorização expressa do utilizador.</li>
              <li>Autoridades públicas quando obrigatório por lei.</li>
            </ul>
            <p>Os seus dados não são vendidos nem cedidos a terceiros para fins de marketing.</p>
          </section>

          <section className="terms-section">
            <h2>6. Página pública de badges</h2>
            <p>Cada badge aprovado tem uma página pública acessível por um link único. Essa página contém apenas:</p>
            <ul>
              <li>Nome do consultor</li>
              <li>Badge obtido</li>
              <li>Data de atribuição</li>
              <li>Competências certificadas</li>
            </ul>
            <p>O utilizador pode solicitar a remoção da página pública a qualquer momento, contactando o encarregado de proteção de dados.</p>
          </section>

          <section className="terms-section">
            <h2>7. Por quanto tempo guardamos os seus dados?</h2>
            <p>Tipo de dado e prazo de conservação:</p>
            <ul>
              <li>Evidências submetidas: Durante a validade do badge + 2 anos</li>
              <li>Badges sem expiração: Indefinidamente (histórico profissional)</li>
              <li>Histórico de acessos e decisões: 5 anos após a última interação</li>
              <li>Dados de registo: Enquanto o utilizador estiver ativo na plataforma</li>
            </ul>
            <p>Após estes prazos, os dados serão anonimizados ou eliminados de forma segura.</p>
          </section>

          <section className="terms-section">
            <h2>8. Quais são os seus direitos?</h2>
            <p>Enquanto titular dos dados, tem direito a:</p>
            <ul>
              <li>Aceder aos seus dados pessoais que tratamos.</li>
              <li>Retificar dados incompletos ou desatualizados.</li>
              <li>Solicitar o apagamento dos seus dados, salvo obrigações legais de conservação.</li>
              <li>Limitar o tratamento em certas circunstâncias.</li>
              <li>Portabilidade dos dados que nos forneceu.</li>
              <li>Opor-se à criação de rankings públicos ou à partilha de badges.</li>
              <li>Retirar o consentimento a qualquer momento, sem comprometer a licitude do tratamento realizado até então.</li>
            </ul>
            <p>Pode exercer estes direitos através do contacto indicado no ponto 11.</p>
          </section>

          <section className="terms-section">
            <h2>9. Como protegemos os seus dados?</h2>
            <p>Adotamos medidas técnicas e organizativas adequadas, incluindo:</p>
            <ul>
              <li>Comunicação encriptada (HTTPS) entre o seu dispositivo e a plataforma.</li>
              <li>Armazenamento cifrado de passwords.</li>
              <li>Controlo de acessos baseado em perfis.</li>
              <li>Registo de auditoria para todas as ações de validação e aprovação.</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>10. Dados de menores</h2>
            <p>A plataforma destina-se exclusivamente a colaboradores da Softinsa, presumindo-se que todos têm idade igual ou superior a 18 anos.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyModal;
