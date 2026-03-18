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
import { usePreguntas, type Proyecto } from "../hooks/usePreguntas";

// Estilos
import "@univerjs/design/lib/index.css";
import "@univerjs/preset-sheets-core/lib/index.css";
import "@univerjs/ui/lib/index.css"
import advancedEnUS from "@univerjs/preset-sheets-advanced/locales/en-US";

interface Props {
  proyecto: Proyecto;           // ✅ Recibe el objeto completo
  onGoToMainMenu: () => void;
}

export const ExcelSimulator = ({ proyecto, onGoToMainMenu }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const univerRef = useRef<any>(null);

  const fileName = proyecto.archivoExcel; // ✅ Extraído del objeto proyecto

  // --- PREGUNTAS desde hook ---
  const { preguntas, loading: loadingPreguntas } = usePreguntas(proyecto);

  // --- NAVEGACIÓN DE TAREAS ---
  const [pasoActual, setPasoActual] = useState(1); // índice 1-based
  const totalPasos = preguntas.length || 1;
  const preguntaActual = preguntas[pasoActual - 1] ?? null;

  // Estado de completado por tarea (objeto indexado por número de pregunta)
  const [tareasCompletadas, setTareasCompletadas] = useState<Record<number, boolean>>({});
  const completadoActual = tareasCompletadas[pasoActual] ?? false;
  const todasCompletadas =
    preguntas.length > 0 && preguntas.every((p) => tareasCompletadas[p.numero]);

  // --- ESTADOS DE EVALUACIÓN ---
  const [estadoEvaluacion, setEstadoEvaluacion] = useState<
    "pendiente" | "completado" | "incorrecto"
  >("pendiente");
  const [mensajeEvaluacion, setMensajeEvaluacion] = useState("");

  // Sincroniza estado de evaluación al cambiar de tarea
  useEffect(() => {
    if (completadoActual) {
      setEstadoEvaluacion("completado");
      setMensajeEvaluacion("Tarea marcada como completada.");
    } else {
      setEstadoEvaluacion("pendiente");
      setMensajeEvaluacion("");
    }
  }, [pasoActual, completadoActual]);

  // --- ESTADOS DE UI ---
  const [tabsVisibles, setTabsVisibles] = useState([
    "Archivo", "Inicio", "Insertar", "Disposición de página",
    "Fórmulas", "Datos", "Revisar", "Vista", "Ayuda",
  ]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState("Inicio");
  const [showPivotPanel, setShowPivotPanel] = useState(false);
  const [fields, setFields] = useState<string[]>([]);
  const [sourceSheetName, setSourceSheetName] = useState<string>("");

  // --- TIMER ---
  const DURACION_SEGUNDOS = 45 * 60;
  const [timeLeft, setTimeLeft] = useState(DURACION_SEGUNDOS);
  const isTimerWarning = timeLeft <= 5 * 60;
  const isTimeUp = timeLeft === 0;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  useEffect(() => {
    if (isTimeUp) {
      onGoToMainMenu();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimeUp]);

  // --- HANDLERS DE EVALUACIÓN ---
  const handleMarkComplete = () => {
    const nuevoEstado = !completadoActual;
    setTareasCompletadas((prev) => ({ ...prev, [pasoActual]: nuevoEstado }));
  };

  const handleEvaluate = () => {
    alert("Proyecto enviado correctamente.");
    onGoToMainMenu();
  };

  // --- NAVEGACIÓN ENTRE TAREAS ---
  const irATarea = (numero: number) => {
    if (numero < 1 || numero > totalPasos) return;
    setPasoActual(numero);
  };

  // --- LÓGICA DE PESTAÑAS ---
  const manejarCambioPestana = (tab: string) => {
    if (tab === "Archivo") {
      setShowFileMenu(true);
    } else {
      setPestanaActiva(tab);
    }
  };

  // --- LÓGICA DEL ANALIZADOR PIVOT ---
  const abrirAnalizador = () => {
    if (!univerRef.current) return;
    try {
      const activeWorkbook = univerRef.current.getActiveWorkbook();
      const sheets = activeWorkbook.getSheets();
      const dataSheet =
        sheets.find((s: any) => {
          const name = s.getSheetName ? s.getSheetName() : s.name;
          return name.includes("Video") || name.includes("Regio");
        }) || sheets[0];

      const name = dataSheet.getSheetName
        ? dataSheet.getSheetName()
        : "Videojuegos";
      setSourceSheetName(name);

      const range = dataSheet.getRange(0, 0, 1, 20);
      const rawValues = range.getValues();
      if (!rawValues || !rawValues[0]) return;

      const fieldNames = rawValues[0]
        .map((h: any) => (h && typeof h === "object" ? h?.v : h))
        .filter((h: any) => h !== null && h !== undefined && h !== "");

      setFields(fieldNames);
      setShowPivotPanel(true);
    } catch (err) {
      console.error("Error al abrir analizador:", err);
    }
  };

  const manejarCambioPivot = (config: any) => {
    if (!config.rows.length || !config.values.length || !univerRef.current) return;
    const api = univerRef.current;
    const activeWorkbook = api.getActiveWorkbook();
    const sheets = activeWorkbook.getSheets();
    const sourceSheet = sheets.find(
      (s: any) =>
        (s.getSheetName ? s.getSheetName() : s.name) === sourceSheetName
    );
    if (!sourceSheet) return;

    const totalFilas = 100;
    const allData = sourceSheet.getRange(0, 0, totalFilas, 15).getValues();
    const headers = allData[0].map((h: any) =>
      h && typeof h === "object" ? h?.v : h
    );

    const idxRows = config.rows.map((f: string) => headers.indexOf(f));
    const idxCols = config.columns.map((f: string) => headers.indexOf(f));
    const idxVals = config.values.map((f: string) => headers.indexOf(f));

    const matrix: Record<string, Record<string, number>> = {};
    const colSet = new Set<string>();

    for (let i = 1; i < allData.length; i++) {
      const rowKey = idxRows
        .map((idx: number) => {
          const cell = allData[i][idx];
          return (cell && typeof cell === "object" ? cell?.v : cell) || "";
        })
        .filter(Boolean)
        .join(" - ");

      const colKey =
        idxCols.length > 0
          ? idxCols
              .map((idx: number) => {
                const cell = allData[i][idx];
                return (cell && typeof cell === "object" ? cell?.v : cell) || "";
              })
              .filter(Boolean)
              .join(" - ")
          : "Total";

      if (rowKey) {
        if (!matrix[rowKey]) matrix[rowKey] = {};
        let sumaFila = 0;
        idxVals.forEach((idx: number) => {
          const cell = allData[i][idx];
          const rawV = cell && typeof cell === "object" ? cell?.v : cell;
          sumaFila += parseFloat(String(rawV || "0").replace(/[$,]/g, "")) || 0;
        });
        matrix[rowKey][colKey] = (matrix[rowKey][colKey] || 0) + sumaFila;
        colSet.add(colKey);
      }
    }

    const sortedCols = Array.from(colSet).sort();
    const finalTable: any[][] = [];
    finalTable.push([`Suma de ${config.values.join(", ")}`, ...sortedCols, "Total general"]);

    Object.entries(matrix).forEach(([rowName, rowData]) => {
      let rowSum = 0;
      const newRow = [rowName];
      sortedCols.forEach((colName) => {
        const val = rowData[colName] || 0;
        newRow.push(val.toFixed(2));
        rowSum += val;
      });
      newRow.push(rowSum.toFixed(2));
      finalTable.push(newRow);
    });

    const pivotSheet = activeWorkbook.getActiveSheet();
    pivotSheet.clear(1);
    finalTable.forEach((r, i) =>
      r.forEach((v, j) => pivotSheet.getRange(i, j).setValue(v))
    );
    pivotSheet
      .getRange(0, 0, 1, finalTable[0].length)
      .setFontWeight("bold")
      .setBackgroundColor("#f2f2f2");
  };

  // --- CARGA DE ARCHIVO EXCEL ---
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
          const id = `sheet-${i}`;
          sheetOrder.push(id);
          const ws = wb.Sheets[name];
          const range = XLSX.utils.decode_range(ws["!ref"] || "A1:Z100");
          const cellData: any = {};
          for (let r = range.s.r; r <= range.e.r; r++) {
            cellData[r] = {};
            for (let c = range.s.c; c <= range.e.c; c++) {
              const cell = ws[XLSX.utils.encode_cell({ r, c })];
              if (cell)
                cellData[r][c] = {
                  v: cell.w || cell.v?.toString(),
                  t: 1,
                  s:
                    r === 0
                      ? { bg: { rgb: "#800080" }, cl: { rgb: "#FFFFFF" }, bl: 1 }
                      : null,
                };
            }
          }
          univerSheets[id] = { id, name, cellData, rowCount: 100, columnCount: 20 };
        });

        const { univerAPI } = createUniver({
          locale: LocaleType.EN_US,
          locales: { [LocaleType.EN_US]: mergeLocales(enUS, advancedEnUS) },
          presets: [
            UniverSheetsCorePreset({
              container: containerRef.current!,
              header: false,
              footer: {
                sheetBar: true,
              },
            }),

          ],
        });
        univerRef.current = univerAPI;
        univerAPI.createUniverSheet({
          id: "wb",
          name: fileName,
          sheetOrder,
          sheets: univerSheets,
        });
      } catch (e) {
        console.error(e);
      }
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
      case "insertPivotTable":
        const num = workbook.getSheets().length;
        const newName = `Hoja de Pivot ${num}`;
        api.executeCommand("sheet.command.insert-sheet", { name: newName });
        setTimeout(() => {
          const sheets = workbook.getSheets();
          const newSheet = sheets.find(
            (s: any) => (s.getSheetName ? s.getSheetName() : s.name) === newName
          );
          if (newSheet) {
            workbook.setActiveSheet(newSheet);
            abrirAnalizador();
          }
        }, 600);
        break;
      case "abrirAnalizador":
        abrirAnalizador();
        break;
      case "bold":
        const range = activeSheet.getSelection().getActiveRange();
        range?.setFontWeight(range.getFontWeight() === "bold" ? "normal" : "bold");
        break;
      case "fill":
        activeSheet.getSelection().getActiveRange()?.setBackgroundColor(valor);
        break;
      default:
        console.log("Acción:", nombre);
    }
  };

  return (
    <div style={styles.mainWrapper}>
      {/* VENTANA DE OPCIONES */}
      {showOptions && (
        <OptionsModal
          onClose={() => setShowOptions(false)}
          onAccept={(nuevasTabs) => {
            const listaLimpia = Array.from(new Set(["Archivo", ...nuevasTabs]));
            setTabsVisibles(listaLimpia);
            setShowOptions(false);
          }}
          currentTabs={tabsVisibles}
        />
      )}

      {/* MENU DE ARCHIVO */}
      {showFileMenu && (
        <FileMenu
          onClose={() => setShowFileMenu(false)}
          onOpenOptions={() => {
            setShowFileMenu(false);
            setShowOptions(true);
          }}
          recentFiles={[fileName]}
        />
      )}

      {/* HEADER */}
      <header style={styles.topHeader}>
        <span>Excel Simulator — {proyecto.nombre}</span>
      </header>

      {/* RIBBON */}
      <Ribbon
        pestanaActiva={pestanaActiva}
        setPestanaActiva={manejarCambioPestana}
        accion={ejecutarAccion}
        tabsDisponibles={tabsVisibles}
      />

      {/* ÁREA CENTRAL: Excel + Pivot */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <div style={styles.excelContainer}>
          {loadingPreguntas && (
            <div style={styles.loadingOverlay}>Cargando preguntas...</div>
          )}
          <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
        </div>

        {showPivotPanel && (
          <PivotSidebar
            fields={fields}
            onClose={() => setShowPivotPanel(false)}
            onConfigChange={manejarCambioPivot}
          />
        )}
      </div>

      {/* EVALUATION BAR — fija en la parte inferior */}
      <EvaluationBar
        tituloPregunta={`Tarea ${pasoActual}: ${proyecto.nombre}`}
        textoInstruccion={preguntaActual?.texto ?? "Cargando instrucción..."}
        mensajeEvaluacion={mensajeEvaluacion}
        estadoEvaluacion={estadoEvaluacion}
        onEvaluate={handleEvaluate}
        completado={completadoActual}
        onMarkComplete={handleMarkComplete}
        todasLasTareasCompletadas={todasCompletadas}
        pasoActual={pasoActual}
        totalPasos={totalPasos}
        hasPreviousTask={pasoActual > 1}
        hasNextTask={pasoActual < totalPasos}
        onPreviousTask={() => irATarea(pasoActual - 1)}
        onNextTask={() => irATarea(pasoActual + 1)}
        tiempoRestante={formatTime(timeLeft)}
        isTimerWarning={isTimerWarning}
        isTimeUp={isTimeUp}
        onGoToMainMenu={onGoToMainMenu}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  mainWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
  },
  topHeader: {
    backgroundColor: "#217346",
    color: "white",
    padding: "5px 15px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  excelContainer: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
    minHeight: 0,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.7)",
    fontSize: "15px",
    color: "#555",
    zIndex: 10,
  },
};

export default ExcelSimulator;
