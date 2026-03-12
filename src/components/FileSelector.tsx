import React from 'react';
import { usePreguntas } from '../hooks/usePreguntas';

interface FileSelectorProps {
  onSelect: (archivoExcel: string) => void;
}

const FileSelector: React.FC<FileSelectorProps> = ({ onSelect }) => {
  const { proyectos, loading, error } = usePreguntas();

  if (loading) return <div style={styles.container}><h2>Cargando proyectos...</h2></div>;
  if (error) return <div style={styles.container}><h2>Error: {error}</h2></div>;

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#1a2035', marginBottom: '30px' }}>Seleccione un Proyecto Excel</h2>
      <div style={styles.grid}>
        {proyectos.map((proyecto) => (
          <button
            key={proyecto.id}
            onClick={() => onSelect(proyecto.archivoExcel)} // Enviamos el nombre del archivo
            style={styles.card}
          >
            <h3 style={styles.title}>{proyecto.nombre}</h3>
            <p style={styles.subtitle}>📁 {proyecto.archivoExcel}</p>
            <span style={styles.badge}>Abrir en Simulador</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ... (Aquí pegas los mismos estilos que me pasaste)
const styles: Record<string, React.CSSProperties> = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#f0f2f5',
      padding: '20px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
      maxWidth: '1000px',
      width: '100%',
    },
    card: {
      padding: '24px 20px',
      cursor: 'pointer',
      border: '1px solid #ddd',
      borderRadius: '12px',
      background: '#fff',
      textAlign: 'center',
      transition: 'transform 0.2s',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },
    title: { margin: 0, fontSize: '18px', color: '#217346' },
    subtitle: { margin: 0, fontSize: '13px', color: '#666' },
    badge: {
      marginTop: '10px',
      padding: '6px 15px',
      background: '#217346',
      color: 'white',
      borderRadius: '20px',
      fontSize: '12px',
    }
};

export default FileSelector;