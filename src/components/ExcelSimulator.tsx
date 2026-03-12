import { useEffect, useRef, useState } from "react";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import enUS from "@univerjs/preset-sheets-core/locales/en-US";
import * as XLSX from "xlsx";
import Ribbon from "./Ribbon"; // <--- Asegúrate de que el archivo Ribbon.tsx existe en la misma carpeta

// Estilos
import "@univerjs/design/lib/index.css";
import "@univerjs/preset-sheets-core/lib/index.css";

interface Props {
  fileName: string;
}

export const ExcelSimulator = ({ fileName }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<any>(null);
  
  // ESTADOS
  const [timeLeft, setTimeLeft] = useState(2679);
  const [pestanaActiva, setPestanaActiva] = useState('Inicio');

  // 1. Cronómetro
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 2. Inicializar Univer y cargar archivo
  useEffect(() => {
    if (!containerRef.current) return;

    const loadAndInitialize = async () => {
  try {
    if (univerRef.current) univerRef.current.dispose();

    const response = await fetch(`/excel/${fileName}`);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);

    // --- NUEVA LÓGICA: CARGAR TODAS LAS HOJAS ---
    const univerSheets: any = {};
    const sheetOrder: string[] = [];

    workbook.SheetNames.forEach((name, index) => {
      const sheetId = `sheet-${index}`;
      sheetOrder.push(sheetId);
      
      const worksheet = workbook.Sheets[name];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const cellData: any = {};
      jsonData.forEach((row, rIndex) => {
        cellData[rIndex] = {};
        row.forEach((cellValue, cIndex) => {
          if (cellValue !== null && cellValue !== undefined) {
            cellData[rIndex][cIndex] = { v: cellValue.toString(), t: 1 };
          }
        });
      });

      univerSheets[sheetId] = {
        id: sheetId,
        name: name,
        cellData: cellData,
        rowCount: Math.max(jsonData.length + 20, 100),
        columnCount: Math.max((jsonData[0]?.length || 0) + 10, 20)
      };
    });

    const { univerAPI } = createUniver({
      locale: LocaleType.EN_US,
      locales: { [LocaleType.EN_US]: mergeLocales(enUS) },
      presets: [
        UniverSheetsCorePreset({
          container: containerRef.current!,
          header: false,
          footer: true, // Esto habilita las pestañas de abajo
        }),
      ],
    });

    univerRef.current = univerAPI;
    
    // Crear el libro con TODAS las hojas procesadas
    univerAPI.createUniverSheet({
      id: "workbook-loaded",
      name: fileName,
      sheetOrder: sheetOrder,
      sheets: univerSheets
    });

  } catch (e) {
    console.error("Error al cargar:", e);
  }
};
    loadAndInitialize();
    return () => {
        if (univerRef.current) univerRef.current.dispose();
    };
  }, [fileName]);

  // 3. Función para las acciones del Ribbon (DENTRO DEL COMPONENTE)
   // Dentro de tu componente ExcelSimulator
const ejecutarAccion = (nombre: string, valor?: any) => {
  if (!univerRef.current) return;
  const api = univerRef.current;
  const activeSheet = api.getActiveWorkbook()?.getActiveSheet();
  const range = activeSheet?.getSelection()?.getActiveRange();
  if (!range || !activeSheet) return;

  switch (nombre) {
    case 'bold':
      const isBold = range.getFontWeight() === 'bold';
      range.setFontWeight(isBold ? 'normal' : 'bold');
      break;
    case 'italic':
      const isItalic = range.getFontStyle() === 'italic';
      range.setFontStyle(isItalic ? 'normal' : 'italic');
      break;
    case 'underline':
      const hasUnderline = range.getUnderline()?.s === 1;
      range.setUnderline({ s: hasUnderline ? 0 : 1 });
      break;
    case 'fontFamily': range.setFontFamily(valor); break;
    case 'fontSize': range.setFontSize(Number(valor)); break;
    case 'fill': range.setBackgroundColor(valor); break;
    case 'color': range.setFontColor(valor); break;

    // Alineación
    case 'alignLeft': range.setHorizontalAlignment(1); break;
    case 'alignCenter': range.setHorizontalAlignment(2); break;
    case 'alignRight': range.setHorizontalAlignment(3); break;
    case 'vAlignTop': range.setVerticalAlignment(1); break;
    case 'vAlignCenter': range.setVerticalAlignment(2); break;
    case 'vAlignBottom': range.setVerticalAlignment(3); break;
    case 'wrapText': range.setWrap(!range.getWrap()); break;
    case 'merge': range.merge(); break;

    // Número
    case 'numberFormat':
      if (valor === '$') range.setNumberFormat('$ #,##0.00');
      else if (valor === '%') range.setNumberFormat('0.00%');
      else if (valor === 'Currency') range.setNumberFormat('$ #,##0.00');
      else range.setNumberFormat('General');
      break;

    // Celdas
    case 'insertRow': activeSheet.insertRowsBefore(range.getRange().startRow, 1); break;
    case 'deleteRow': activeSheet.deleteRows(range.getRange().startRow, 1); break;
    case 'rowHeight': activeSheet.setRowHeight(range.getRange().startRow, 30); break;

    // Edición
    case 'autosum':
      const r = range.getRange();
      range.setValue(`=SUM(${activeSheet.getRange(r.startRow - 1, r.startColumn).getA1Notation()})`);
      break;
    case 'clear': range.clear(1); break; // 1 = Limpiar contenido y formato

    default:
      console.log("Acción en desarrollo:", nombre);
  }
};

  return (
    <div style={styles.mainWrapper}>
      {/* 1. HEADER VERDE */}
      <header style={styles.topHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>Excel Simulator</span>
          <span style={{ opacity: 0.8 }}>{fileName}</span>
        </div>
        <div style={{ fontSize: '11px' }}>auth: proyecto: {fileName.toLowerCase()}</div>
      </header>

      {/* 2. RIBBON PERSONALIZADO */}
      <Ribbon 
        pestanaActiva={pestanaActiva} 
        setPestanaActiva={setPestanaActiva} 
        accion={ejecutarAccion} 
      />

      {/* 3. CONTENEDOR DE EXCEL */}
      <div style={styles.excelContainer}>
        <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      </div>

      {/* 4. PANEL DE TAREAS INFERIOR */}
      <div style={styles.taskPanel}>
        <div style={styles.taskHeader}>
          <button style={styles.menuBtn} onClick={() => window.location.reload()}>← Menú</button>
          <div style={styles.timer}>🕒 {formatTime(timeLeft)}</div>
          <div style={{ flex: 1, textAlign: 'center' }}>1 / 2</div>
          <button style={styles.submitBtn}>Submit Project</button>
        </div>

        <div style={styles.taskContent}>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>Pregunta 1 de 2</h3>
          <p style={{ fontSize: '13px', color: '#333' }}>
            <b>Instrucción:</b> En la hoja de trabajo actual, aplique formato de <b>Negrita</b> a los encabezados y use el Ribbon para alinear al centro.
          </p>
        </div>

        <div style={styles.taskFooter}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button style={styles.navBtnDisabled}>Anterior</button>
                <button style={styles.navBtn}>Siguiente</button>
            </div>
            <button style={styles.markComplete}>Mark Complete</button>
        </div>
      </div>
    </div>
  );
};

// ESTILOS UNIFICADOS
const styles: Record<string, React.CSSProperties> = {
  mainWrapper: { display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' },
  topHeader: { backgroundColor: '#217346', color: 'white', padding: '0 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '30px' },
  excelContainer: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  taskPanel: {  height: '220px',  display: 'flex',  flexDirection: 'column',backgroundColor: '#fff', borderTop: '1px solid #d2d2d2',  boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' },
  taskContent: {  padding: '20px',flex: 1,  backgroundColor: '#ffffff',  color: '#333'},
  taskHeader: { backgroundColor: '#1a2035', color: 'white', padding: '5px 20px', display: 'flex', alignItems: 'center' },
  taskFooter: { padding: '8px 20px', display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8f9fa', borderTop: '1px solid #eee' },
  timer: { background: 'rgba(255,255,255,0.1)', padding: '2px 10px', borderRadius: '4px', margin: '0 20px' },
  submitBtn: { background: 'transparent', border: '1px solid #fff', color: 'white', padding: '2px 10px', borderRadius: '4px', cursor: 'pointer' },
  menuBtn: { background: '#2c3e50', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' },
  navBtn: { padding: '4px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' },
  navBtnDisabled: { padding: '4px 12px', border: '1px solid #eee', color: '#ccc', cursor: 'not-allowed' },
  markComplete: { background: 'none', border: 'none', color: '#666', fontSize: '12px', cursor: 'pointer' }
};

export default ExcelSimulator;