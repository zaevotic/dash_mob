import React, { useState } from 'react';
import { Delete, Check, X, Space } from 'lucide-react';

const ROW1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const ROW3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

export const CustomKeyboard = ({ value = '', onChange, onClose, title = 'TYPE ALARM LABEL' }) => {
  const [text, setText] = useState(value);
  const [isShift, setIsShift] = useState(true);

  const handleKeyPress = (char) => {
    const nextChar = isShift ? char.toUpperCase() : char.toLowerCase();
    const newText = text + nextChar;
    setText(newText);
    onChange(newText);
  };

  const handleBackspace = () => {
    const newText = text.slice(0, -1);
    setText(newText);
    onChange(newText);
  };

  const handleSpace = () => {
    const newText = text + ' ';
    setText(newText);
    onChange(newText);
  };

  const handleClear = () => {
    setText('');
    onChange('');
  };

  const handleDone = () => {
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 9, 8, 0.9)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg1)',
          border: '1px solid var(--red-ember)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          boxShadow: 'var(--shadow-ember)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        {/* Header & Display Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--mono)', color: 'var(--text2)', textTransform: 'uppercase' }}>
            {title}
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text2)', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Input Text Box Preview */}
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          fontSize: '1.2rem',
          fontFamily: 'var(--mono)',
          color: 'var(--text)',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{text || <span style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Type label...</span>}</span>
          {text.length > 0 && (
            <button onClick={handleClear} style={{ fontSize: '0.65rem', background: 'var(--bg3)', padding: '2px 6px', border: 'none', color: 'var(--text2)' }}>
              CLEAR
            </button>
          )}
        </div>

        {/* Custom QWERTY Keyboard Keys */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            {ROW1.map(char => (
              <button
                key={char}
                type="button"
                onClick={() => handleKeyPress(char)}
                style={{
                  flex: 1,
                  maxWidth: '44px',
                  height: '42px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border2)',
                  color: 'var(--text)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  fontFamily: 'var(--mono)',
                  borderRadius: '4px'
                }}
              >
                {isShift ? char : char.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', padding: '0 12px' }}>
            {ROW2.map(char => (
              <button
                key={char}
                type="button"
                onClick={() => handleKeyPress(char)}
                style={{
                  flex: 1,
                  maxWidth: '44px',
                  height: '42px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border2)',
                  color: 'var(--text)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  fontFamily: 'var(--mono)',
                  borderRadius: '4px'
                }}
              >
                {isShift ? char : char.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Row 3 (Shift, Keys, Backspace) */}
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setIsShift(!isShift)}
              style={{
                flex: 1.2,
                maxWidth: '60px',
                height: '42px',
                background: isShift ? 'var(--red-mute)' : 'var(--bg2)',
                border: `1px solid ${isShift ? 'var(--red-ember)' : 'var(--border2)'}`,
                color: isShift ? 'var(--red-ember)' : 'var(--text2)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                fontFamily: 'var(--mono)',
                borderRadius: '4px'
              }}
            >
              SHIFT
            </button>

            {ROW3.map(char => (
              <button
                key={char}
                type="button"
                onClick={() => handleKeyPress(char)}
                style={{
                  flex: 1,
                  maxWidth: '44px',
                  height: '42px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border2)',
                  color: 'var(--text)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  fontFamily: 'var(--mono)',
                  borderRadius: '4px'
                }}
              >
                {isShift ? char : char.toLowerCase()}
              </button>
            ))}

            <button
              type="button"
              onClick={handleBackspace}
              style={{
                flex: 1.2,
                maxWidth: '60px',
                height: '42px',
                background: 'var(--bg3)',
                border: '1px solid var(--border2)',
                color: 'var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
            >
              <Delete size={18} />
            </button>
          </div>

          {/* Row 4 (Spacebar & Done) */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '4px' }}>
            <button
              type="button"
              onClick={handleSpace}
              style={{
                flex: 3,
                height: '42px',
                background: 'var(--bg2)',
                border: '1px solid var(--border2)',
                color: 'var(--text2)',
                fontSize: '0.8rem',
                fontFamily: 'var(--mono)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Space size={16} /> SPACE
            </button>

            <button
              type="button"
              onClick={handleDone}
              className="btn-primary"
              style={{
                flex: 1.5,
                height: '42px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                fontFamily: 'var(--mono)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} /> DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
