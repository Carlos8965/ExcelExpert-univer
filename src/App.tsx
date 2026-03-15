import { useState } from "react";
import FileSelector from "./components/FileSelector"; 
import ExcelSimulator from "./components/ExcelSimulator"; 

export default function App() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // ✅ Debug simple SIN setState que cause re-renders
  console.log('🎯 [App.tsx] Render | selectedFile:', selectedFile);

  // ✅ Si NO hay archivo seleccionado → Mostrar FileSelector
  if (!selectedFile) {
    console.log('📋 [App.tsx] Mostrando FileSelector');
    return (
      <FileSelector 
        onSelectFile={(archivo: string) => {
          console.log('👆 [App.tsx] onSelectFile llamado con:', archivo);
          setSelectedFile(archivo);
          console.log('✅ [App.tsx] setSelectedFile completado:', archivo);
        }} 
      />
    );
  }

  // ✅ Si HAY archivo seleccionado → Mostrar ExcelSimulator
  console.log('📊 [App.tsx] Mostrando ExcelSimulator con:', selectedFile);
  
  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      position: "relative", 
      display: "flex", 
      flexDirection: "column" 
    }}>
      {/* Botón de cerrar / volver al menú */}
      <div 
        onClick={() => {
          console.log('❌ [App.tsx] Cerrar archivo');
          setSelectedFile(null);
        }}
        style={{
          backgroundColor: "#d13438",
          color: "white",
          textAlign: "center",
          padding: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          zIndex: 1000,
          fontSize: "14px",
          userSelect: "none",
        }}
      >
        ← Cerrar Archivo // Volver al Menú
      </div>

      {/* Simulador de Excel */}
      <ExcelSimulator fileName={selectedFile} />
    </div>
  );
}