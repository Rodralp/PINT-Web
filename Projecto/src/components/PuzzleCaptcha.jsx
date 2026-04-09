import { useState, useEffect, useRef } from 'react';

function PuzzleCaptcha({ onComplete }) {
  const [positions, setPositions] = useState([]);
  const [targetPosition, setTargetPosition] = useState(null);
  const [userSelected, setUserSelected] = useState(false);
  const [feedback, setFeedback] = useState('');
  const gridRef = useRef(null);

  useEffect(() => {
    generatePuzzle();
  }, []);

  const generatePuzzle = () => {
    const puzzleSize = 9;
    const items = [];
    const circleSize = 30;
    const padding = 10;
    const containerWidth = gridRef.current?.clientWidth || 250;
    const containerHeight = gridRef.current?.clientHeight || 250;
    
    // Gera 9 posições aleatórias dentro dos limites
    for (let i = 0; i < puzzleSize; i++) {
      const maxX = Math.max(padding, containerWidth - circleSize - padding);
      const maxY = Math.max(padding, containerHeight - circleSize - padding);
      
      items.push({
        id: i,
        x: Math.random() * (maxX - padding) + padding,
        y: Math.random() * (maxY - padding) + padding
      });
    }

    setPositions(items);
    
    // Seleciona uma posição alvo aleatória
    const target = Math.floor(Math.random() * puzzleSize);
    setTargetPosition(target);
    setUserSelected(false);
    setFeedback('');
  };

  const handlePuzzleClick = (id) => {
    if (userSelected) return;

    if (id === targetPosition) {
      setFeedback('success');
      setUserSelected(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    } else {
      setFeedback('error');
      setTimeout(() => {
        generatePuzzle();
      }, 600);
    }
  };

  if (targetPosition === null) return <div>Carregando puzzle...</div>;

  return (
    <div className="puzzle-captcha-container">
      <div className="puzzle-instructions">
        <p>Clique no círculo <span className="puzzle-highlight">destacado</span></p>
      </div>

      <div ref={gridRef} className={`puzzle-grid ${feedback}`}>
        {positions.map((item) => (
          <button
            key={item.id}
            className={`puzzle-item ${item.id === targetPosition ? 'target' : ''} ${
              feedback === 'error' && item.id === targetPosition ? 'error-highlight' : ''
            }`}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`
            }}
            onClick={() => handlePuzzleClick(item.id)}
            disabled={userSelected}
          >
            {item.id === targetPosition && <span className="circle-pulse">●</span>}
            {item.id !== targetPosition && <span>●</span>}
          </button>
        ))}
      </div>

      {feedback === 'error' && (
        <p className="puzzle-error-msg">Errado! Tente novamente.</p>
      )}

      <button 
        type="button"
        className="puzzle-btn-retry"
        onClick={generatePuzzle}
      >
        Novo Puzzle
      </button>
    </div>
  );
}

export default PuzzleCaptcha;
