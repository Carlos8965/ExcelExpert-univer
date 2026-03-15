import { useEffect, useRef, useState } from "react";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import enUS from "@univerjs/preset-sheets-core/locales/en-US";
import * as XLSX from "xlsx"; 
import Ribbon from "./Ribbon";
import PivotSidebar from "./PivotSidebar";
import FileMenu from "./FileMenu";
import OptionsModal from "./OptionsModal";
import EvaluationBar from "./EvaluationBar";

import "@univerjs/design/lib/index.css";
import "@univerjs/preset-sheets-core/lib/index.css";
import "@univerjs/ui/lib/index.css"; 

interface Props { fileName: string; }

export const ExcelSimulator = ({ fileName }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (msg: string) => {
    console.log(msg);
    setDebugInfo(prev => [...prev, msg]);
  };

  // === INICIALIZAR UNA SOLA VEZ ===
  useEffect(() => {
    addDebug('🚀 [ExcelSimulator] useEffect INICIADO');
    addDebug(`📁 fileName: ${fileName}`);
    addDebug(`🔍 containerRef: ${containerRef.current ? 'OK' : 'NULL'}`);

    // ✅ VERIFICAR CONDICIONES
    if (!containerRef.current) {
      addDebug('❌ containerRef es NULL - esperando render...');
      const timer = setTimeout(() => {
        if (containerRef.current) {
          addDebug('✅ containerRef ahora está disponible');
          initializeUniver();
        } else {
          addDebug('❌ containerRef sigue siendo NULL después de 500ms');
          setError('Error: Contenedor no disponible');
          setLoading(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    initializeUniver();

    return () => {
      addDebug('🧹 Cleanup');
      univerRef.current?.dispose();
    };
  }, [fileName]);

  // === FUNCIÓN DE INICIALIZACIÓN ===
  const initializeUniver = async () => {
    try {
      addDebug('🔧 initializeUniver llamado');
      
      // ✅ CARGAR EXCEL DIRECTAMENTE (sin config.json)
      const filePath = `/datos/${fileName}`;
      addDebug(`📄 Cargando: ${filePath}`);
      
      const res = await fetch(filePath);
      addDebug(`📊 Status: ${res.status}`);
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${filePath}`);
      }
      
      const ab = await res.arrayBuffer();
      addDebug(`💾 Tamaño: ${ab.byteLength} bytes`);
      
      const wb = XLSX.read(ab, { cellNF: true, cellDates: true });
      addDebug(`📑 Sheets: ${JSON.stringify(wb.SheetNames)}`);
      
      if (wb.SheetNames.length === 0) {
        throw new Error('Excel sin hojas');
      }
      
      // ✅ PREPARAR DATOS
      const univerSheets: any = {};
      const sheetOrder: string[] = [];

      wb.SheetNames.forEach((name, i) => {
        const id = `sheet-${i}`; 
        sheetOrder.push(id);
        const ws = wb.Sheets[name];
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z100');
        const cellData: any = {};
        
        addDebug(`📝 Sheet "${name}": ${range.e.r + 1} filas x ${range.e.c + 1} cols`);
        
        for (let r = range.s.r; r <= range.e.r; r++) {
          cellData[r] = {};
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c })];
            if (cell) {
              cellData[r][c] = { 
                v: cell.w || cell.v?.toString(), 
                t: cell.t || 1,
                s: null
              };
            }
          }
        }
        
        univerSheets[id] = { 
          id, 
          name, 
          cellData, 
          rowCount: Math.max(range.e.r + 1, 100), 
          columnCount: Math.max(range.e.c + 1, 26) 
        };
      });

      // ✅ CREAR UNIVER
      addDebug('🏗️ Creando Univer...');
      
      const { univerAPI } = createUniver({
        locale: LocaleType.EN_US,
        locales: { [LocaleType.EN_US]: mergeLocales(enUS) },
        presets: [
          UniverSheetsCorePreset({ 
            container: containerRef.current!, 
            header: false, 
            footer: { 
              sheetBar: true,
              statisticBar: true,
              menus: true,
              zoomSlider: true
            }
          })
        ],
      });
      
      univerRef.current = univerAPI;
      
      univerAPI.createUniverSheet({ 
        id: "workbook-1", 
        name: fileName.replace('.xlsx', ''), 
        sheetOrder, 
        sheets: univerSheets 
      });
      
      addDebug('✅ Univer CREADO exitosamente');
      setLoading(false);
      
    } catch (e: any) {
      addDebug(`❌ ERROR: ${e.message}`);
      setError(e.message);
      setLoading(false);
    }
  };

  // === HANDLERS SIMPLIFICADOS ===
  const [timeLeft] = useState(2700);
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // === RENDER ===
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#217346', color: 'white', padding: '10px', textAlign: 'center' }}>
        {fileName}
      </div>
      
      {/* Ribbon */}
      <Ribbon 
        pestanaActiva="Inicio" 
        setPestanaActiva={() => {}} 
        accion={() => {}}
        tabsDisponibles={['Archivo', 'Inicio', 'Insertar']}
      />

      {/* Contenido Principal */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* Contenedor de Excel - SIEMPRE PRESENTE */}
        <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
          <div 
            ref={containerRef} 
            style={{ height: '100%', width: '100%' }}
            id="excel-container"
          />
          
          {/* Loading Overlay */}
          {loading && !error && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '20px',
              background: '#f5f5f5',
              zIndex: 1000
            }}>
              <div style={{ 
                width: '50px', height: '50px',
                border: '5px solid #f3f3f3',
                borderTop: '5px solid #217346',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p>Cargando {fileName}...</p>
              
              {/* Debug Info */}
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                maxWidth: '400px',
                textAlign: 'left',
                background: '#fff',
                padding: '10px',
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {debugInfo.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
          
          {/* Error Overlay */}
          {error && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '20px',
              background: '#fff3f3',
              zIndex: 1000,
              padding: '40px'
            }}>
              <h2 style={{ color: '#d13438', margin: 0 }}>❌ Error</h2>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                style={{ 
                  padding: '10px 20px',
                  background: '#217346',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                🔄 Reintentar
              </button>
              <div style={{ fontSize: '11px', color: '#666', maxWidth: '400px' }}>
                {debugInfo.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EvaluationBar Simplificado */}
      <div style={{ borderTop: '2px solid #ddd', height: '200px', background: '#fff' }}>
        <EvaluationBar
          tituloPregunta="Tarea"
          textoInstruccion="Instrucción"
          mensajeEvaluacion=""
          estadoEvaluacion="pendiente"
          onEvaluate={() => {}}
          tiempoRestante={formatTime(timeLeft)}
          pasoActual={1}
          totalPasos={1}
          completado={false}
          onMarkComplete={() => {}}
          todasLasTareasCompletadas={true}
          onPreviousTask={() => {}}
          onNextTask={() => {}}
          hasPreviousTask={false}
          hasNextTask={false}
          onGoToMainMenu={() => window.location.reload()}
        />
      </div>
    </div>
  );
};

export default ExcelSimulator;