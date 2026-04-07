import DashboardLayout from '../components/DashboardLayout';

function Dashboard() {
  return (
    <DashboardLayout>
      <div className="container-fluid p-0">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3 fw-bold text-dark">Dashboard Container</h1>
            <p className="text-secondary">A página da dashboard já dá para fazer scroll e está reativa via Bootstrap (experimente redimensionar a janela).</p>
          </div>
        </div>

        <div className="row g-4">
          {/* Cartões responsivos para testar layout de grelha em diferentes ecrãs */}
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold">12</h5>
                <p className="card-text text-muted">Badges obtidos este mês</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <h5 className="card-title text-success fw-bold">4 dias</h5>
                <p className="card-text text-muted">Sequência de acesso</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <h5 className="card-title text-warning fw-bold">5</h5>
                <p className="card-text text-muted">Pedidos em validação</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body">
                <h5 className="card-title text-info fw-bold">#15</h5>
                <p className="card-text text-muted">Ranking global</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div 
              style={{ minHeight: '80vh', background: 'linear-gradient(135deg, #ffffff, #f8f9fa)', borderRadius: '1rem', padding: '24px' }}
              className="shadow-sm border-0 d-flex flex-column align-items-center justify-content-center text-center"
            >
              <h4 className="text-secondary fw-semibold">Área de Experiência</h4>
              <p className="text-muted">Área longa para testar o scroll independente e assegurar que a Sidebar/Topbar permanecem fixas.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
