import React, { useState } from 'react';

interface OptionsModalProps {
  onClose: () => void;
  onAccept: (tabs: string[]) => void;
  currentTabs: string[];
}

const OptionsModal: React.FC<OptionsModalProps> = ({ onClose, onAccept, currentTabs }) => {
  const [activeCategory, setActiveCategory] = useState('Personalizar cinta de opciones');
  
  // Lista maestra de todas las pestañas posibles en orden
  const masterTabs = ['Inicio', 'Insertar', 'Disposición de página', 'Fórmulas', 'Datos', 'Revisar', 'Vista', 'Programador', 'Ayuda']; 


  // Estado local para los checkboxes antes de dar "Aceptar"
  const [tempTabs, setTempTabs] = useState<string[]>(currentTabs);

  const toggleTab = (tab: string) => {
    if (tempTabs.includes(tab)) {
      setTempTabs(tempTabs.filter(t => t !== tab));
    } else {
      // Insertar manteniendo el orden de masterTabs
      const newTabs = [...tempTabs, tab].sort((a, b) => masterTabs.indexOf(a) - masterTabs.indexOf(b));
      setTempTabs(newTabs);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.window}>
        <div style={styles.titleBar}><span>Opciones de Excel</span></div>
        <div style={styles.mainBody}>
          <div style={styles.sidebar}>
            {['General', 'Fórmulas', 'Personalizar cinta de opciones', 'Complementos'].map(cat => (
              <div key={cat} onClick={() => setActiveCategory(cat)} 
                   style={{...styles.sidebarItem, backgroundColor: activeCategory === cat ? '#0078d4' : 'transparent', color: activeCategory === cat ? 'white' : '#333'}}>
                {cat}
              </div>
            ))}
          </div>

          <div style={styles.content}>
            {activeCategory === 'Personalizar cinta de opciones' ? (
              <>
                <h4 style={{margin: '0 0 10px 0'}}>Personalizar la cinta de opciones</h4>
                <div style={styles.listbox}>
                  {masterTabs.map(tab => (
                    <label key={tab} style={styles.listItemCheck}>
                      <input 
                        type="checkbox" 
                        checked={tempTabs.includes(tab)} 
                        onChange={() => toggleTab(tab)}
                      />
                      <span style={{marginLeft: '8px'}}>{tab}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : <div style={{color:'#999'}}>Sección no disponible en el simulador</div>}
          </div>
        </div>

        <div style={styles.footer}>
          {/* Al aceptar, enviamos la pestaña 'Archivo' + las seleccionadas */}
          <button style={styles.btnOk} onClick={() => onAccept(['Archivo', ...tempTabs])}>Aceptar</button>
          <button style={styles.btnCancel} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 11000, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  window: { width: '850px', height: '550px', backgroundColor: '#f0f0f0', border: '1px solid #999', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' },
  titleBar: { padding: '5px 10px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#333' },
  closeX: { border: 'none', background: 'none', cursor: 'pointer' },
  mainBody: { flex: 1, display: 'flex', backgroundColor: 'white', margin: '0 10px', border: '1px solid #ccc' },
  sidebar: { width: '220px', borderRight: '1px solid #eee', overflowY: 'auto' },
  sidebarItem: { padding: '6px 12px', fontSize: '12px', cursor: 'pointer' },
  content: { flex: 1, padding: '20px', overflowY: 'auto' },
  contentTitle: { margin: '0 0 15px 0', fontSize: '14px', fontWeight: 'normal' },
  dualList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  listSection: { display: 'flex', flexDirection: 'column', gap: '5px' },
  listLabel: { fontSize: '11px', color: '#333' },
  listbox: { border: '1px solid #ccc', height: '300px', backgroundColor: 'white', overflowY: 'auto' },
  listItem: { padding: '3px 8px', fontSize: '12px' },
  listItemCheck: { padding: '3px 8px', fontSize: '12px', display: 'flex', alignItems: 'center' },
  footer: { padding: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  btnOk: { padding: '4px 25px', backgroundColor: '#e1e1e1', border: '1px solid #adadad', fontSize: '12px' },
  btnCancel: { padding: '4px 25px', backgroundColor: '#e1e1e1', border: '1px solid #adadad', fontSize: '12px' },
  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }
};

export default OptionsModal;