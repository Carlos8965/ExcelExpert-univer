import { useState } from "react";
import FileSelector from "./components/FileSelector"; 
import ExcelSimulator from "./components/ExcelSimulator"; 

export default function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (!selectedFile) {
    return <FileSelector onSelect={(archivo) => setSelectedFile(archivo)} />;
  }

  return (
    // 1. Usamos un DIV, no un botón
    <div style={{ width: "100vw", height: "100vh", position: "relative", display: "flex", flexDirection: "column" }}>
      
      {/* 2. El botón de cerrar es un elemento separado */}
      <div 
        onClick={() => setSelectedFile(null)}
        style={{
          backgroundColor: "#d13438",
          color: "white",
          textAlign: "center",
          padding: "5px",
          cursor: "pointer",
          fontWeight: "bold",
          zIndex: 1000
        }}
      >
        Cerrar Archivo // Volver al Menú
      </div>

      {/* 3. El simulador está afuera del botón */}
      <ExcelSimulator fileName={selectedFile} />
      
    </div>
  );
}