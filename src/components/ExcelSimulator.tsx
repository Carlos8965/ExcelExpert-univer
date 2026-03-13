import { useEffect, useRef, useState } from "react";
import { createUniver, LocaleType, mergeLocales } from "@univerjs/presets";
import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
import enUS from "@univerjs/preset-sheets-core/locales/en-US";
import * as XLSX from "xlsx"; 
import Ribbon from "./Ribbon";
import PivotSidebar from "./PivotSidebar";

// Estilos
import "@univerjs/design/lib/index.css";
import "@univerjs/preset-sheets-core/lib/index.css";
import "@univerjs/ui/lib/index.css"; 

interface Props { fileName: string; }

export const ExcelSimulator = ({ fileName }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<any>(null);
  
  const [timeLeft, setTimeLeft] = useState(2679);
  const [pestanaActiva, setPestanaActiva] = useState('Inicio');
  const [showPivotPanel, setShowPivotPanel] = useState(false);
  const [fields, setFields] = useState<string[]>([]);
  const [sourceSheetName, setSourceSheetName] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // --- LÓGICA DEL ANALIZADOR ---
  const abrirAnalizador = () => {
    if (!univerRef.current) return;
    try {
      const activeWorkbook = univerRef.current.getActiveWorkbook();
      const sheets = activeWorkbook.getSheets();
      
      const dataSheet = sheets.find((s: any) => {
        const name = s.getSheetName ? s.getSheetName() : s.name;
        return name.includes("Video") || name.includes("Regio");
      }) || sheets[0];

      const name = dataSheet.getSheetName ? dataSheet.getSheetName() : "Videojuegos";
      setSourceSheetName(name);

      const range = dataSheet.getRange(0, 0, 1, 20);
      const rawValues = range.getValues();
      
      // Verificación de seguridad para rawValues
      if (!rawValues || !rawValues[0]) return;

      const fieldNames = rawValues[0]
        .map((h: any) => {
          if (!h) return null; // Si la celda es null, retornamos null
          return typeof h === 'object' ? h?.v : h; // Usamos ?. para leer v de forma segura
        })
        .filter((h: any) => h !== null && h !== undefined && h !== "");
      
      setFields(fieldNames);
      setShowPivotPanel(true); 
    } catch (err) {
      console.error("Error al abrir analizador:", err);
    }
  };

  const manejarCambioPivot = (config: any) => {
    if (!config.rows || !config.values || !univerRef.current) return;
    
    const api = univerRef.current;
    const activeWorkbook = api.getActiveWorkbook();
    const sheets = activeWorkbook.getSheets();
    const sourceSheet = sheets.find((s: any) => (s.getSheetName ? s.getSheetName() : s.name) === sourceSheetName);

    if (!sourceSheet) return;

    const totalFilas = sourceSheet.getRowCount ? sourceSheet.getRowCount() : 100;
    const allData = sourceSheet.getRange(0, 0, totalFilas, 15).getValues();
    
    // SEGURIDAD: Validar que existan datos
    if (!allData || !allData[0]) return;

    // FIX: Mapeo de encabezados con verificación de nulidad
    const headers = allData[0].map((h: any) => {
        if (!h) return "";
        return typeof h === 'object' ? h?.v : h;
    });
    
    const idxRow = headers.indexOf(config.rows);
    const idxVal = headers.indexOf(config.values);

    if (idxRow === -1 || idxVal === -1) return;

    const grouped: Record<string, number> = {};
    for (let i = 1; i < allData.length; i++) {
      const cellRow = allData[i][idxRow];
      const cellVal = allData[i][idxVal];

      // Extraer valores de forma segura evitando el error de 'null'
      const cat = (cellRow && typeof cellRow === 'object') ? cellRow?.v : cellRow;
      const rawV = (cellVal && typeof cellVal === 'object') ? cellVal?.v : cellVal;
      
      if (cat !== null && cat !== undefined && cat !== "") {
        const val = parseFloat(String(rawV || "0").replace(/[$,]/g, '')) || 0;
        grouped[String(cat)] = (grouped[String(cat)] || 0) + val;
      }
    }

    // El resto de la función para escribir en la hoja...
    const pivotSheet = activeWorkbook.getActiveSheet();
    pivotSheet.clear(1);
    const rows = [[`Etiquetas de ${config.rows}`, `Suma de ${config.values}`]];
    Object.entries(grouped).forEach(([k, v]) => rows.push([k, v.toFixed(2)]));
    
    rows.forEach((row, r) => {
      row.forEach((v, c) => {
        pivotSheet.getRange(r, c).setValue(v);
      });
    });

    // Formato final
    pivotSheet.getRange(0, 0, 1, 2).setFontWeight('bold').setBackgroundColor('#f2f2f2');
    if (rows.length > 1) {
        pivotSheet.getRange(rows.length - 1, 0, 1, 2).setFontWeight('bold');
    }
  };

  // --- CARGA DE ARCHIVO ---
  useEffect(() => {
    if (!containerRef.current) return;
    const init = async () => {
      try {
        if (univerRef.current) univerRef.current.dispose();
        const res = await fetch(`/excel/${fileName}`);
        const ab = await res.arrayBuffer();
        const wb = XLSX.read(ab, { cellNF: true, cellDates: true });

        const univerSheets: any = {};
        const sheetOrder: string[] = [];

        wb.SheetNames.forEach((name, i) => {
          const id = `sheet-${i}`; sheetOrder.push(id);
          const ws = wb.Sheets[name];
          const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:Z100');
          const cellData: any = {};

          for (let r = range.s.r; r <= range.e.r; r++) {
            cellData[r] = {};
            for (let c = range.s.c; c <= range.e.c; c++) {
              const cellAddress = XLSX.utils.encode_cell({ r, c });
              const cell = ws[cellAddress];
              if (cell) {
                cellData[r][c] = { 
                  v: cell.w || cell.v?.toString(), 
                  t: 1, 
                  s: (r === 0 ? { bg: { rgb: '#800080' }, cl: { rgb: '#FFFFFF' }, bl: 1 } : null) 
                };
              }
            }
          }
          univerSheets[id] = { id, name, cellData, rowCount: 100, columnCount: 20 };
        });

        const { univerAPI } = createUniver({
          locale: LocaleType.EN_US,
          locales: { [LocaleType.EN_US]: mergeLocales(enUS) },
          presets: [UniverSheetsCorePreset({ container: containerRef.current!, header: false, footer: true })],
        });
        univerRef.current = univerAPI;
        univerAPI.createUniverSheet({ id: "wb", name: fileName, sheetOrder, sheets: univerSheets });
      } catch (e) { console.error(e); }
    };
    init();
    return () => univerRef.current?.dispose();
  }, [fileName]);

  // --- ACCIONES DEL RIBBON ---
  const ejecutarAccion = (nombre: string, valor?: any) => {
    if (!univerRef.current) return;
    const api = univerRef.current;
    const workbook = api.getActiveWorkbook();
    const activeSheet = workbook.getActiveSheet();

    switch (nombre) {
      case 'insertPivotTable':
        const num = workbook.getSheets().length;
        const newName = `Hoja de Pivot ${num}`;
        api.executeCommand('sheet.command.insert-sheet', { name: newName });
        
        setTimeout(() => {
          const sheets = workbook.getSheets();
          const newSheet = sheets.find((s: any) => (s.getSheetName ? s.getSheetName() : s.name) === newName);
          if (newSheet) {
            workbook.setActiveSheet(newSheet);
            abrirAnalizador(); 
          }
        }, 600);
        break;

      case 'abrirAnalizador':
        abrirAnalizador();
        break;

      case 'bold':
        const range = activeSheet.getSelection().getActiveRange();
        range?.setFontWeight(range.getFontWeight() === 'bold' ? 'normal' : 'bold');
        break;
      
      case 'fill':
        activeSheet.getSelection().getActiveRange()?.setBackgroundColor(valor);
        break;
        
      default:
        console.log("Acción no implementada:", nombre);
    }
  };

  return (
    <div style={styles.mainWrapper}>
      <header style={styles.topHeader}><span>Excel Simulator - {fileName}</span></header>
      <Ribbon pestanaActiva={pestanaActiva} setPestanaActiva={setPestanaActiva} accion={ejecutarAccion} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={styles.excelContainer}><div ref={containerRef} style={{ height: '100%' }} /></div>
        {showPivotPanel && (
          <PivotSidebar 
            fields={fields} 
            onClose={() => setShowPivotPanel(false)} 
            onConfigChange={manejarCambioPivot} 
          />
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  mainWrapper: { display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' },
  topHeader: { backgroundColor: '#217346', color: 'white', padding: '5px 15px', height: '30px', display: 'flex', alignItems: 'center' },
  excelContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
};

export default ExcelSimulator;