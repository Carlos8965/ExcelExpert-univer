import React, { useState } from 'react';

interface PivotSidebarProps {
  fields: string[];
  onConfigChange: (config: any) => void;
  onClose: () => void;
}

const PivotSidebar: React.FC<PivotSidebarProps> = ({ fields, onConfigChange, onClose }) => {
  const [config, setConfig] = useState<{ [key: string]: string[] }>({
    filter: [],
    columns: [],
    rows: [],
    values: []
  });

  const updateConfig = (newConfig: typeof config) => {
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleCheck = (field: string) => {
    const isSelected = Object.values(config).some(arr => arr.includes(field));
    let newConfig = { ...config };

    if (!isSelected) {
      newConfig.rows = [...newConfig.rows, field];
    } else {
      Object.keys(newConfig).forEach(key => {
        newConfig[key] = newConfig[key].filter(f => f !== field);
      });
    }
    updateConfig(newConfig);
  };

  const onDrop = (e: React.DragEvent, targetArea: string) => {
    e.preventDefault();
    const field = e.dataTransfer.getData("fieldName");
    let newConfig = { ...config };

    Object.keys(newConfig).forEach(key => {
      newConfig[key] = newConfig[key].filter(f => f !== field);
    });

    newConfig[targetArea] = [...newConfig[targetArea], field];
    updateConfig(newConfig);
  };

  const removeField = (area: string, field: string) => {
    const newConfig = { ...config, [area]: config[area].filter(f => f !== field) };
    updateConfig(newConfig);
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <span style={{fontSize: '12px'}}>Campos de tabla dinámica</span>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>
      
      <div style={styles.content}>
        <div style={styles.fieldList}>
          {fields.map(f => (
            <div key={f} style={styles.fieldItem} draggable onDragStart={(e) => e.dataTransfer.setData("fieldName", f)}>
              <input 
                type="checkbox" 
                style={{margin: 0, cursor: 'pointer', transform: 'scale(0.9)'}}
                checked={Object.values(config).some(arr => arr.includes(f))} 
                onChange={() => handleCheck(f)} 
              />
              <span>⣿ {f}</span>
            </div>
          ))}
        </div>

        <div style={styles.quadrants}>
          {[
            {id:'filter', label:'Filtros'}, 
            {id:'columns', label:'Columnas'}, 
            {id:'rows', label:'Filas'}, 
            {id:'values', label:'Valores'}
          ].map(area => (
            <div key={area.id} style={styles.quadrant}>
              <span style={styles.qTitle}>{area.label}</span>
              <div 
                style={styles.qBox} 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={(e) => onDrop(e, area.id)}
              >
                {config[area.id].map(f => (
                  <div key={f} style={styles.tag}>
                    <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{f}</span>
                    <span onClick={() => removeField(area.id, f)} style={{cursor:'pointer', marginLeft:'4px'}}>×</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS MODIFICADOS PARA SER MÁS PEQUEÑOS ---
const styles: Record<string, React.CSSProperties> = {
  sidebar: { 
    width: '230px', // Reducido de 280px
    backgroundColor: '#fff', 
    borderLeft: '1px solid #ccc', 
    display: 'flex', 
    flexDirection: 'column',
    height: '100%' 
  },
  header: { 
    padding: '6px 10px', // Reducido el padding vertical
    borderBottom: '1px solid #eee', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    fontWeight: 'bold' 
  },
  content: { 
    padding: '8px', // Reducido de 10px
    flex: 1, 
    overflowY: 'auto' 
  },
  fieldList: { 
    border: '1px solid #ddd', 
    height: '110px', // Reducido de 150px
    overflowY: 'auto', 
    marginBottom: '8px' 
  },
  fieldItem: { 
    padding: '3px 6px', // Reducido el padding
    fontSize: '11px', // Fuente un punto más pequeña
    display: 'flex', 
    alignItems: 'center',
    gap: '6px', 
    borderBottom: '1px solid #f9f9f9',
    cursor: 'default'
  },
  quadrants: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '6px' // Reducido el espacio entre cuadros
  },
  quadrant: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '2px' 
  },
  qTitle: { 
    fontSize: '10px', // Reducido de 11px
    fontWeight: 'bold',
    color: '#666'
  },
  qBox: { 
    border: '1px solid #ccc', 
    minHeight: '60px', // Reducido de 80px
    maxHeight: '100px',
    overflowY: 'auto',
    backgroundColor: '#fdfdfd', 
    padding: '4px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '3px' 
  },
  tag: { 
    backgroundColor: '#e7f3eb', 
    border: '1px solid #107c41', 
    padding: '1px 4px', // Padding mínimo
    borderRadius: '2px', 
    fontSize: '10px', 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: { border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }
};

export default PivotSidebar;