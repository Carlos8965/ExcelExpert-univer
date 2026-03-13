import React from 'react';

interface RibbonProps {
  pestanaActiva: string;
  setPestanaActiva: (tab: string) => void;
  accion: (nombre: string, valor?: any) => void;
  tabsDisponibles: string[]; // Nueva prop para recibir las pestañas visibles
}

const Ribbon: React.FC<RibbonProps> = ({ pestanaActiva, setPestanaActiva, accion, tabsDisponibles }) => {

  return (
    <div className="ribbon-container">
      <style>{`
        .ribbon-container { background: #f3f2f1; border-bottom: 1px solid #d2d2d2; display: flex; flex-direction: column; font-family: 'Segoe UI', sans-serif; }
        .tabs-row { display: flex; background: #fff; padding-left: 10px; border-bottom: 1px solid #e1dfdd; }
        .tab { padding: 8px 16px; cursor: pointer; font-size: 13px; color: #333; border-bottom: 3px solid transparent; }
        .tab.active { color: #107c41; border-bottom: 3px solid #107c41; font-weight: 600; }
        .tools-row { display: flex; padding: 4px 10px; height: 95px; overflow-x: auto; align-items: flex-start; }
        .group { display: flex; flex-direction: column; justify-content: space-between; height: 100%; border-right: 1px solid #c8c6c4; padding: 0 8px; }
        .group-content { display: flex; gap: 4px; align-items: flex-start; flex-grow: 1; }
        .group-label { font-size: 10px; color: #666; text-align: center; margin-top: auto; padding-bottom: 2px; }
        .btn { display: flex; background: transparent; border: 1px solid transparent; border-radius: 4px; cursor: pointer; color: #333; position: relative; }
        .btn:hover { background: #e1dfdd; border: 1px solid #c8c6c4; }
        .btn-large { flex-direction: column; align-items: center; min-width: 50px; font-size: 11px; padding: 4px; text-align: center; }
        .btn-large .icon { font-size: 24px; }
        .btn-small { flex-direction: row; align-items: center; padding: 2px 6px; font-size: 11px; gap: 6px; width: 100%; }
        .btn-icon { width: 26px; height: 26px; justify-content: center; align-items: center; font-size: 13px; }
        .col { display: flex; flex-direction: column; gap: 1px; }
        .row { display: flex; gap: 2px; }
        .select-input { border: 1px solid #c8c6c4; border-radius: 2px; padding: 1px; font-size: 11px; height: 20px; outline: none; }
        .color-input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
      `}</style>

      <div className="tabs-row">
        {tabsDisponibles.map((tab, index) => (
          <div 
            key={`${tab}-${index}`} // <--- CAMBIA ESTO: Nombre + Índice
            className={`tab ${pestanaActiva === tab ? 'active' : ''}`} 
            onClick={() => setPestanaActiva(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="tools-row">
        {/* PESTAÑA INICIO */}
        {pestanaActiva === 'Inicio' && (
          <>
            <div className="group">
              <div className="group-content">
                <button className="btn btn-large" onClick={() => accion('pegar')}><span className="icon">📋</span>Pegar</button>
                <div className="col">
                  <button className="btn btn-small" onClick={() => accion('cortar')}>✂️ Cortar</button>
                  <button className="btn btn-small" onClick={() => accion('copiar')}>📄 Copiar</button>
                </div>
              </div>
              <span className="group-label">Portapapeles</span>
            </div>

            <div className="group">
              <div className="group-content col">
                <div className="row">
                  <select className="select-input" style={{ width: '80px' }} onChange={(e) => accion('fontFamily', e.target.value)}>
                    <option>Arial</option><option>Calibri</option><option>Verdana</option>
                  </select>
                  <select className="select-input" onChange={(e) => accion('fontSize', e.target.value)}>
                    <option>11</option><option>12</option><option>14</option><option>16</option>
                  </select>
                </div>
                <div className="row">
                  <button className="btn btn-icon" onClick={() => accion('bold')}><b>N</b></button>
                  <button className="btn btn-icon" onClick={() => accion('italic')}><i>K</i></button>
                  <button className="btn btn-icon" onClick={() => accion('underline')}><u>S</u></button>
                  <button className="btn btn-icon">🪣<input type="color" className="color-input" onChange={(e) => accion('fill', e.target.value)}/></button>
                  <button className="btn btn-icon" style={{borderBottom:'2px solid red'}}>A<input type="color" className="color-input" onChange={(e) => accion('color', e.target.value)}/></button>
                </div>
              </div>
              <span className="group-label">Fuente</span>
            </div>

            <div className="group">
              <div className="group-content col">
                <div className="row">
                  <button className="btn btn-icon" onClick={() => accion('vAlignTop')}>⏫</button>
                  <button className="btn btn-icon" onClick={() => accion('vAlignCenter')}>🟰</button>
                  <button className="btn btn-icon" onClick={() => accion('vAlignBottom')}>⏬</button>
                </div>
                <div className="row">
                  <button className="btn btn-icon" onClick={() => accion('alignLeft')}>⬅️</button>
                  <button className="btn btn-icon" onClick={() => accion('alignCenter')}>⏺️</button>
                  <button className="btn btn-icon" onClick={() => accion('alignRight')}>➡️</button>
                  <button className="btn btn-icon" onClick={() => accion('wrapText')}>📝</button>
                </div>
              </div>
              <button className="btn btn-small" onClick={() => accion('merge')}>🔗 Combinar y centrar</button>
              <span className="group-label">Alineación</span>
            </div>

            <div className="group">
              <div className="group-content col">
                <select className="select-input" style={{width:'100%'}} onChange={(e) => accion('numberFormat', e.target.value)}>
                  <option value="General">General</option>
                  <option value="Currency">Moneda</option>
                  <option value="Percent">Porcentaje</option>
                  <option value="Date">Fecha</option>
                </select>
                <div className="row">
                  <button className="btn btn-icon" onClick={() => accion('numberFormat', '$')}>$</button>
                  <button className="btn btn-icon" onClick={() => accion('numberFormat', '%')}>%</button>
                  <button className="btn btn-icon" onClick={() => accion('decimalInc')}>.00</button>
                  <button className="btn btn-icon" onClick={() => accion('decimalDec')}>.0</button>
                </div>
              </div>
              <span className="group-label">Número</span>
            </div>
            
            <div className="group">
              <div className="group-content">
                <button className="btn btn-large" onClick={() => accion('condFormat')}><span className="icon">🚥</span>Formato Condicional</button>
                <button className="btn btn-large" onClick={() => accion('tableFormat')}><span className="icon">🎨</span>Formato Tabla</button>
              </div>
              <span className="group-label">Estilos</span>
            </div>

            <div className="group">
              <div className="group-content row">
                <div className="col">
                  <button className="btn btn-small" onClick={() => accion('insertRow')}>➕ Insertar</button>
                  <button className="btn btn-small" onClick={() => accion('deleteRow')}>➖ Eliminar</button>
                  <button className="btn btn-small" onClick={() => accion('rowHeight')}>📐 Formato</button>
                </div>
              </div>
              <span className="group-label">Celdas</span>
            </div>

            <div className="group">
              <div className="group-content">
                <button className="btn btn-large" onClick={() => accion('autosum')}><span className="icon">∑</span>Autosuma</button>
                <div className="col">
                  <button className="btn btn-small" onClick={() => accion('clear')}>🧹 Borrar</button>
                  <button className="btn btn-small" onClick={() => accion('filter')}>🔍 Ordenar</button>
                </div>
              </div>
              <span className="group-label">Edición</span>
            </div>
          </>
        )}

        {/* PESTAÑA INSERTAR <--- NUEVA SECCIÓN */}
        {pestanaActiva === 'Insertar' && (
          <>
            <div className="group">
              <div className="group-content">
                <button 
                  className="btn btn-large" 
                  onClick={() => accion('insertPivotTable')}
                >
                  <span className="icon">📊</span>
                  Tabla dinámica
                </button>
                <button className="btn btn-large" onClick={() => accion('tableFormat')}>
                  <span className="icon">▦</span>
                  Tabla
                </button>
                <button className="btn btn-large" onClick={() => accion('abrirAnalizador')}>
                  <span className="icon">🔧</span>
                  Analizar Campos
                </button>
              </div>
              <span className="group-label">Tablas</span>
            </div>

            <div className="group">
              <div className="group-content">
                <button className="btn btn-large"><span className="icon">🖼️</span>Ilustraciones</button>
                <button className="btn btn-large"><span className="icon">♾️</span>Formas</button>
              </div>
              <span className="group-label">Ilustraciones</span>
            </div>

            <div className="group">
              <div className="group-content">
                <button className="btn btn-large"><span className="icon">📈</span>Gráficos</button>
                <button className="btn btn-large"><span className="icon">📉</span>Líneas</button>
              </div>
              <span className="group-label">Gráficos</span>
            </div>
          </>
        )}

      {pestanaActiva === 'Programador' && (
  <>
    <div className="group">
      <div className="group-content">
        <button className="btn btn-large" onClick={() => accion('visualBasic')}>
          <span className="icon" style={{ color: '#2b579a' }}>📄</span>
          Visual Basic
        </button>
        <button className="btn btn-large" onClick={() => accion('macros')}>
          <span className="icon" style={{ color: '#217346' }}>▶️</span>
          Macros
        </button>
      </div>
      <span className="group-label">Código</span>
    </div>

    <div className="group">
      <div className="group-content">
        <button className="btn btn-large"><span className="icon">📥</span>Complementos</button>
      </div>
      <span className="group-label">Complementos</span>
    </div>

    <div className="group">
      <div className="group-content">
        <button className="btn btn-large"><span className="icon">🖼️</span>Insertar</button>
        <button className="btn btn-large"><span className="icon">⚙️</span>Propiedades</button>
      </div>
      <span className="group-label">Controles</span>
    </div>
  </>
      )}
      </div>
    </div>
  );
}

export default Ribbon;