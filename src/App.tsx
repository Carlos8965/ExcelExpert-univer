import { useState } from "react";
import FileSelector from "./components/FileSelector";
import ExcelSimulator from "./components/ExcelSimulator";
import type { Proyecto } from "./hooks/usePreguntas";

export default function App() {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);

  if (!proyecto) {
    return <FileSelector onSelect={(p) => setProyecto(p)} />;
  }

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column" }}>
      <ExcelSimulator
        proyecto={proyecto}
        onGoToMainMenu={() => setProyecto(null)}
      />
    </div>
  );
}