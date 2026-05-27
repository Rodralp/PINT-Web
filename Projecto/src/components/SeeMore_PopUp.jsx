import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import '../css/SeeMore_PopUp.css';

/**
 * SeeMore_PopUp - Componente reutilizável para exibir listas em modal
 *
 * Props:
 * - isOpen: boolean - Se o modal está aberto
 * - onClose: function - Função chamada para fechar o modal
 * - title: string - Título do modal
 * - items: array - Lista de items a exibir
 * - renderItem: function - Função que renderiza cada item (item, index) => JSX
 * - maxItems?: number - Limite de items a mostrar (opcional)
 * - emptyMessage?: string - Mensagem quando não há items
 */
function SeeMore_PopUp({
  isOpen,
  onClose,
  title,
  items,
  renderItem,
  maxItems,
  emptyMessage = 'Nenhum item para mostrar.',
}) {
  if (!isOpen) {
    return null;
  }

  const displayItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className="seemore-modal-overlay" onClick={onClose}>
      <div className="seemore-modal" onClick={(event) => event.stopPropagation()}>
        <div className="seemore-modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="seemore-modal-close-btn"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="seemore-modal-content">
          {displayItems.length > 0 ? (
            <div className="seemore-list">
              {displayItems.map((item, index) => (
                <div key={index} className="seemore-list-item">
                  {renderItem(item, index)}
                </div>
              ))}
            </div>
          ) : (
            <div className="seemore-empty-state">{emptyMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}

SeeMore_PopUp.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  maxItems: PropTypes.number,
  emptyMessage: PropTypes.string,
};

export default SeeMore_PopUp;
