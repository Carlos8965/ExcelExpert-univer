import React from "react";

// En EvaluationBar.tsx, actualizar la interfaz:
export interface EvaluationBarProps {
  tituloPregunta: string;
  textoInstruccion: string;
  mensajeEvaluacion: string;
  // ✅ Solo tres estados: pendiente, completado o incorrecto
  estadoEvaluacion: "pendiente" | "completado" | "incorrecto";
  onEvaluate: () => void;

  tiempoRestante?: string;
  isTimerWarning?: boolean;
  isTimeUp?: boolean;

  pasoActual?: number;
  totalPasos?: number;
  completado?: boolean;
  onMarkComplete?: () => void;

  todasLasTareasCompletadas?: boolean;

  onPreviousTask?: () => void;
  onNextTask?: () => void;
  hasPreviousTask?: boolean;
  hasNextTask?: boolean;

  onGoToMainMenu?: () => void;
  onHeightChange?: (height: number) => void;
}

const EvaluationBar: React.FC<EvaluationBarProps> = ({
  tituloPregunta,
  textoInstruccion,
  mensajeEvaluacion,
  estadoEvaluacion,
  onEvaluate,

  tiempoRestante = "45:00",
  isTimerWarning = false,
  isTimeUp = false,

  pasoActual = 1,
  totalPasos = 1,
  completado = false,
  onMarkComplete,

  todasLasTareasCompletadas = false,

  onPreviousTask,
  onNextTask,
  hasPreviousTask = false,
  hasNextTask = false,

  onGoToMainMenu,
}) => {
  const canSubmit = todasLasTareasCompletadas && !isTimeUp;

  // En EvaluationBar.tsx, actualizar getStatusColor y getStatusIcon:
  const getStatusColor = (): string => {
    switch (estadoEvaluacion) {
      case "completado":
        return "#2d7a2d";
      default:
        return "#666";
    }
  };

  const getStatusIcon = (): string => {
    switch (estadoEvaluacion) {
      case "completado":
        return "✓";
      default:
        return "⏳";
    }
  };

  return (
    <div style={styles.container}>
      {/* ========== TOP BAR ========== */}
      <div style={styles.topBar}>
        {onGoToMainMenu && (
          <button
            onClick={onGoToMainMenu}
            style={styles.menuBtn}
            aria-label="Volver al menú principal"
            title="Volver al menú principal"
          >
            ← Menú
          </button>
        )}

        <div
          style={{
            ...styles.timer,
            color: isTimerWarning || isTimeUp ? "#e05c5c" : "white",
            fontWeight: isTimerWarning || isTimeUp ? 600 : 500,
          }}
        >
          <span style={styles.timerIcon}>⏱</span>
          <span style={styles.timerText}>
            {tiempoRestante}
            {isTimeUp && " • Finalizado"}
          </span>
        </div>

        <div style={styles.stepIndicator}>
          <span style={styles.stepBadge}>{pasoActual}</span>
          <span style={styles.stepSeparator}>/</span>
          <span style={styles.stepTotal}>{totalPasos}</span>
        </div>

        <button
          onClick={onEvaluate}
          disabled={!canSubmit}
          style={{
            ...styles.submitBtn,
            opacity: canSubmit ? 1 : 0.5,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
          aria-label="Enviar tarea para evaluación"
          title={
            isTimeUp
              ? "El tiempo ha finalizado"
              : !todasLasTareasCompletadas
                ? `Completa todas las tareas primero`
                : "Enviar y volver al menú" // ✅ Tooltip actualizado
          }
        >
          Submit Project
        </button>
      </div>

      {/* ========== CONTENT AREA ========== */}
      <div style={styles.contentArea}>
        <div style={styles.questionCard}>
          <h3 style={styles.questionTitle}>{tituloPregunta}</h3>
          <p style={styles.questionText}>
            <strong>Instrucción:</strong> {textoInstruccion}
          </p>

          {mensajeEvaluacion && (
            <div
              style={{
                ...styles.feedback,
                color: getStatusColor(),
                marginTop: "16px",
                padding: "10px 14px",
                background: `${getStatusColor()}10`,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  ...styles.feedbackIcon,
                  background: getStatusColor(),
                }}
              >
                {getStatusIcon()}
              </span>
              {mensajeEvaluacion}
            </div>
          )}
        </div>
      </div>

      {/* ========== BOTTOM BAR ========== */}
      <div style={styles.bottomBar}>
        <div style={styles.navigationGroup}>
          <button
            onClick={onPreviousTask}
            disabled={!hasPreviousTask || isTimeUp}
            style={{
              ...styles.navBtn,
              opacity: !hasPreviousTask || isTimeUp ? 0.4 : 1,
              cursor: !hasPreviousTask || isTimeUp ? "not-allowed" : "pointer",
            }}
            aria-label="Tarea anterior"
            title={
              !hasPreviousTask
                ? "Primera tarea"
                : isTimeUp
                  ? "Tiempo finalizado"
                  : "Tarea anterior"
            }
          >
            ← Anterior
          </button>

          <span style={styles.taskCounter}>
            Tarea {pasoActual} de {totalPasos}
          </span>

          <button
            onClick={onNextTask}
            disabled={!hasNextTask || isTimeUp || !completado}
            style={{
              ...styles.navBtn,
              opacity: !hasNextTask || isTimeUp || !completado ? 0.4 : 1,
              cursor:
                !hasNextTask || isTimeUp || !completado
                  ? "not-allowed"
                  : "pointer",
            }}
            aria-label="Siguiente tarea"
            title={
              !hasNextTask
                ? "Última tarea"
                : isTimeUp
                  ? "Tiempo finalizado"
                  : !completado
                    ? "Debes marcar como completado primero"
                    : "Siguiente tarea"
            }
          >
            Siguiente →
          </button>
        </div>

        <button
          onClick={onMarkComplete}
          disabled={isTimeUp}
          style={{
            ...styles.markBtn,
            ...(completado ? styles.markBtnCompleted : {}),
            opacity: isTimeUp ? 0.5 : 1,
            cursor: isTimeUp ? "not-allowed" : "pointer",
          }}
          aria-label={
            completado ? "Desmarcar como completado" : "Marcar como completado"
          }
          title={
            isTimeUp
              ? "El tiempo ha finalizado"
              : completado
                ? "Click para desmarcar"
                : "Marcar tarea como completada"
          }
        >
          <div
            style={{
              ...styles.checkCircle,
              display: completado ? "flex" : "none",
            }}
          >
            ✓
          </div>
          <span>{completado ? "Completed" : "Mark Complete"}</span>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: "#fff",
    borderTop: "1px solid #c8c6c4",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    fontFamily:
      '"Segoe UI", "Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    overflow: "hidden",
    zIndex: 100,
    height: "25vh",
    minHeight: "180px",
    maxHeight: "400px",
  },

  topBar: {
    background: "#1a2035",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    height: "48px",
    color: "white",
    gap: "8px",
    fontSize: "14px",
    flexShrink: 0,
  },

  menuBtn: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "white",
    padding: "5px 12px",
    fontSize: "13px",
    borderRadius: "3px",
    cursor: "pointer",
    transition: "background 0.15s",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  timer: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    whiteSpace: "nowrap",
    transition: "color 0.3s ease",
  },

  timerIcon: {
    fontSize: "16px",
  },

  timerText: {
    fontVariantNumeric: "tabular-nums",
  },

  stepIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "rgba(255,255,255,0.85)",
  },

  stepBadge: {
    background: "#2a3a5c",
    padding: "2px 10px",
    borderRadius: "3px",
    fontWeight: 600,
    fontSize: "13px",
  },

  stepSeparator: {
    opacity: 0.5,
    fontSize: "13px",
  },

  stepTotal: {
    opacity: 0.7,
    fontSize: "13px",
  },

  submitBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.5)",
    color: "white",
    padding: "5px 14px",
    fontSize: "13px",
    borderRadius: "3px",
    transition: "background 0.15s, opacity 0.15s",
    fontWeight: 500,
  },

  contentArea: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 16px",
    overflow: "auto",
    minHeight: 0,
  },

  questionCard: {
    background: "white",
    borderRadius: "4px",
    padding: "24px 28px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#222",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    maxWidth: "800px",
    width: "100%",
  },

  questionTitle: {
    margin: "0 0 12px 0",
    fontSize: "17px",
    color: "#1a2035",
  },

  questionText: {
    margin: 0,
    color: "#444",
  },

  feedback: {
    fontSize: "14px",
    fontWeight: 500,
  },

  feedbackIcon: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    flexShrink: 0,
  },

  bottomBar: {
    background: "white",
    borderTop: "1px solid #ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    height: "52px",
    flexShrink: 0,
    gap: "12px",
  },

  navigationGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  navBtn: {
    background: "#f3f2f1",
    border: "1px solid #a19f9d",
    color: "#333",
    padding: "6px 14px",
    fontSize: "13px",
    borderRadius: "3px",
    cursor: "pointer",
    transition: "background 0.15s",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  taskCounter: {
    fontSize: "13px",
    color: "#666",
    minWidth: "100px",
    textAlign: "center",
    fontWeight: 500,
  },

  markBtn: {
    background: "transparent",
    border: "none",
    padding: "10px 36px",
    fontSize: "14px",
    color: "#333",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderRadius: "3px",
    transition: "background 0.15s, opacity 0.15s",
    fontWeight: 500,
  },

  markBtnCompleted: {
    color: "#2d7a2d",
    fontWeight: 600,
  },

  checkCircle: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#2d7a2d",
    color: "white",
    fontSize: "11px",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};

export default EvaluationBar;
