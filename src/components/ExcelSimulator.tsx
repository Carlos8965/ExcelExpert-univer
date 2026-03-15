import { useEffect, useRef, useState } from "react";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import enUS from "@univerjs/preset-sheets-core/locales/en-US";
import * as XLSX from "xlsx"; 
import EvaluationBar from "./EvaluationBar";

import "@univerjs/design/lib/index.css";
import "@univerjs/preset-sheets-core/lib/index.css";
import "@univerjs/ui/lib/index.css"; 

interface Props { fileName: string; }

export const ExcelSimulator = ({ fileName }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<any>(null);
  const initializedRef = useRef(false); // ✅ Para evitar inicializar dos veces
  
  const [timeLeft, setTimeLeft] = useState(2700);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState("Hoja 1");
  
  const [pasoActual] = useState(1);
  const [totalPasos] = useState(1);
  const [completado] = useState(false);
  const [estadoEvaluacion] = useState<'pendiente' | 'completado' | 'incorrecto'>('pendiente');
  const [mensajeEvaluacion] = useState("");

  // ✅ INICIALIZAR CUANDO EL COMPONENTE SE MONTE
  useEffect(() => {
    // Evitar inicializar múltiples veces
    if (initializedRef.current) {
      console.log('⚠️ Ya está inicializado, saltando...');
      return;
    }
    
    initializedRef.current = true;
    console.log('🚀 Iniciando inicialización...');

    // Esperar un tick para asegurar que el DOM se renderizó
    setTimeout(() => {
      const container = containerRef.current;
      console.log('📍 containerRef.current:', container);
      
      if (!container) {
        console.error('❌ Container es null');
        setError("No se pudo encontrar el contenedor de Excel");
        setLoading(false);
        return;
      }

      initializeUniver(fileName, container);
    }, 0);

    return () => {
      console.log('🧹 Cleanup');
      univerRef.current?.dispose();
    };
  }, [fileName]);

  // === FUNCIÓN DE INICIALIZACIÓN ===
  const initializeUniver = async (file: string, container: HTMLDivElement) => {
    console.log('🔧 Inicializando Univer en:', container);
    
    try {
      console.log('📄 Cargando:', file);
      
      const res = await fetch(`/datos/${file}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${file}`);
      }
      
      const ab = await res.arrayBuffer();
      const wb = XLSX.read(ab, { cellNF: true });
      
      console.log('📊 Sheets:', wb.SheetNames);
      if (wb.SheetNames.length > 0) {
        setSheetName(wb.SheetNames[0]);
      }
      
      const univerSheets: any = {};
      const sheetOrder: string[] = [];

      wb.SheetNames.forEach((name, i) => {
        const id = `sheet-${i}`; 
        sheetOrder.push(id);
        const ws = wb.Sheets[name];
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z100');
        const cellData: any = {};
        
        for (let r = range.s.r; r <= range.e.r; r++) {
          cellData[r] = {};
          for (let c = range.s.c; c <= range.e.c; c++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c })];
            if (cell) {
              cellData[r][c] = { 
                v: cell.w || cell.v?.toString(), 
                t: 1, 
                s: null
              };
            }
          }
        }
        univerSheets[id] = { id, name, cellData, rowCount: 100, columnCount: 20 };
      });

      console.log('🏗️ Creando Univer...');
      
      const { univerAPI } = createUniver({
        locale: LocaleType.EN_US,
        locales: { [LocaleType.EN_US]: mergeLocales(enUS) },
        presets: [
          UniverSheetsCorePreset({ 
            container: container, 
            header: false, 
            footer: { 
              sheetBar: true,
              statisticBar: false,
              menus: false,
              zoomSlider: false
            }
          })
        ],
      });
      
      univerRef.current = univerAPI;
      
      univerAPI.createUniverSheet({ 
        id: "workbook-1", 
        name: file.replace('.xlsx', ''), 
        sheetOrder, 
        sheets: univerSheets 
      });
      
      console.log('✅ Univer listo!');
      setLoading(false);
      
    } catch (e: any) {
      console.error('❌ Error:', e);
      setError(e.message);
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleEvaluate = () => console.log('Evaluar');
  const handleMarkComplete = () => console.log('Marcar');

  // ✅ RENDER PRINCIPAL - SIEMPRE MUESTRA EL CONTENEDOR
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: '#217346', 
        color: 'white', 
        padding: '10px',
        textAlign: 'center'
      }}>
        {sheetName} - {fileName}
      </div>

      {/* Contenido */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        
        {/* ✅ CONTENEDOR SIEMPRE PRESENTE */}
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          background: loading ? '#f5f5f5' : '#fff'
        }}>
          <div 
            ref={containerRef}  // ← SIEMPRE SE RENDERIZA
            style={{ 
              height: '100%', 
              width: '100%',
              opacity: loading ? 0 : 1  // Invisible mientras carga
            }}
          />
          
          {/* Overlay de carga */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '20px',
              background: '#f5f5f5',
              zIndex: 1000
            }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                border: '5px solid #f3f3f3', 
                borderTop: '5px solid #217346', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              <p>Cargando {fileName}...</p>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
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
            </div>
          )}
        </div>
      </div>

      {/* EvaluationBar */}
      <div style={{ borderTop: '2px solid #ddd', height: '200px', background: '#fff' }}>
        <EvaluationBar
          tituloPregunta="Tarea"
          textoInstruccion="Instrucción de prueba"
          mensajeEvaluacion={mensajeEvaluacion}
          estadoEvaluacion={estadoEvaluacion}
          onEvaluate={handleEvaluate}
          tiempoRestante={formatTime(timeLeft)}
          pasoActual={pasoActual}
          totalPasos={totalPasos}
          completado={completado}
          onMarkComplete={handleMarkComplete}
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