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

    // Quitar de cualquier lado donde esté
    Object.keys(newConfig).forEach(key => {
      newConfig[key] = newConfig[key].filter(f => f !== field);
    });

    // Agregar al nuevo área (permitiendo duplicados de lógica si se quisiera, pero aquí lo hacemos único)
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
        <span>Campos de tabla dinámica</span>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>
      
      <div style={styles.content}>
        <div style={styles.fieldList}>
          {fields.map(f => (
            <div key={f} style={styles.fieldItem} draggable onDragStart={(e) => e.dataTransfer.setData("fieldName", f)}>
              <input type="checkbox" checked={Object.values(config).some(arr => arr.includes(f))} onChange={() => handleCheck(f)} />
              <span>⣿ {f}</span>
            </div>
          ))}
        </div>

        <div style={styles.quadrants}>
          {[{id:'filter', label:'Filtros'}, {id:'columns', label:'Columnas'}, {id:'rows', label:'Filas'}, {id:'values', label:'Valores'}].map(area => (
            <div key={area.id} style={styles.quadrant}>
              <span style={styles.qTitle}>{area.label}</span>
              <div 
                style={styles.qBox} 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={(e) => onDrop(e, area.id)}
              >
                {config[area.id].map(f => (
                  <div key={f} style={styles.tag}>
                    {f} <span onClick={() => removeField(area.id, f)} style={{cursor:'pointer'}}>×</span>
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

const styles: Record<string, React.CSSProperties> = {
  sidebar: { width: '280px', backgroundColor: '#fff', borderLeft: '1px solid #ccc', display: 'flex', flexDirection: 'column' },
  header: { padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' },
  content: { padding: '10px', flex: 1, overflowY: 'auto' },
  fieldList: { border: '1px solid #ddd', height: '150px', overflowY: 'auto', marginBottom: '10px' },
  fieldItem: { padding: '5px', fontSize: '12px', display: 'flex', gap: '8px', borderBottom: '1px solid #f9f9f9' },
  quadrants: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  quadrant: { display: 'flex', flexDirection: 'column', gap: '4px' },
  qTitle: { fontSize: '11px', fontWeight: 'bold' },
  qBox: { border: '1px solid #ccc', minHeight: '80px', backgroundColor: '#fdfdfd', padding: '5px', display: 'flex', flexDirection: 'column', gap: '4px' },
  tag: { backgroundColor: '#e7f3eb', border: '1px solid #107c41', padding: '2px 6px', borderRadius: '3px', fontSize: '10px', display: 'flex', justifyContent: 'space-between' },
  closeBtn: { border: 'none', background: 'none', cursor: 'pointer' }
};

export default PivotSidebar;