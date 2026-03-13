import React, { useState } from 'react';

interface PivotSidebarProps {
  fields: string[];
  onConfigChange: (config: any) => void;
  onClose: () => void;
}

const PivotSidebar: React.FC<PivotSidebarProps> = ({ fields, onConfigChange, onClose }) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [rows, setRows] = useState("");
  const [values, setValues] = useState("");

  const handleCheck = (field: string) => {
    const isSelected = selectedFields.includes(field);
    const newFields = isSelected ? selectedFields.filter(f => f !== field) : [...selectedFields, field];
    setSelectedFields(newFields);

    let nr = rows, nv = values;
    if (!isSelected) {
        if (!nr) nr = field; else if (!nv) nv = field;
    } else {
        if (nr === field) nr = ""; else if (nv === field) nv = "";
    }
    setRows(nr); setValues(nv);
    if (nr && nv) onConfigChange({ rows: nr, values: nv });
  };

  return (
    <div style={{ width: '250px', background: '#f3f2f1', borderLeft: '1px solid #ccc', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>Campos</span> <button onClick={onClose}>X</button>
      </div>
      <div style={{ marginTop: '10px', background: '#fff', border: '1px solid #ccc', height: '200px', overflowY: 'auto' }}>
        {fields.map(f => (
          <label key={f} style={{ display: 'block', padding: '5px', fontSize: '12px' }}>
            <input type="checkbox" checked={selectedFields.includes(f)} onChange={() => handleCheck(f)} /> {f}
          </label>
        ))}
      </div>
      <div style={{ marginTop: '20px', fontSize: '12px' }}>
        <div style={{ border: '1px solid #ccc', padding: '5px', marginBottom: '5px' }}>Filas: <b>{rows}</b></div>
        <div style={{ border: '1px solid #ccc', padding: '5px' }}>Valores: <b>{values}</b></div>
      </div>
    </div>
  );
};

export default PivotSidebar;