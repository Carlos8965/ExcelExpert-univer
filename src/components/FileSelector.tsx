import React from 'react';

interface ProyectoConfig {
  nombre: string;
  archivoExcel: string;
  carpetaPreguntas: string;
}

interface FileSelectorProps {
  onSelectFile: (fileName: string) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({ onSelectFile }) => {
  const [proyectos, setProyectos] = React.useState<ProyectoConfig[]>([]);
  const [cargando, setCargando] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const cargarProyectos = async () => {
      try {
        console.log('🔍 [FileSelector] Iniciando carga...');
        setCargando(true);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('/config.json', { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ [FileSelector] Proyectos cargados:', data.proyectos?.length);
        
        if (Array.isArray(data.proyectos) && data.proyectos.length > 0) {
          const proyectosLimpios = data.proyectos.map((p: any) => ({
            nombre: String(p.nombre || ''),
            archivoExcel: String(p.archivoExcel || ''),
            carpetaPreguntas: String(p.carpetaPreguntas || '')
          }));
          
          console.log('📦 [FileSelector] Seteando proyectos:', proyectosLimpios);
          setProyectos(proyectosLimpios);
        } else {
          throw new Error('proyectos no es un array válido o está vacío');
        }
      } catch (err: any) {
        console.error('❌ [FileSelector] Error:', err);
        setError(err.message || 'Error desconocido');
      } finally {
        console.log('🏁 [FileSelector] cargando=false, proyectos:', proyectos.length);
        setCargando(false);
      }
    };

    cargarProyectos();
  }, []); // ✅ Array vacío = solo al montar

  // ✅ Debug simple sin causar re-renders
  console.log('🎨 [FileSelector] Renderizado:', { 
    cargando, 
    error, 
    proyectosCount: proyectos.length 
  });

  if (cargando) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Selecciona un Proyecto</h2>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Cargando proyectos disponibles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Error al Cargar</h2>
        <div style={styles.error}>
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>
            🔄 Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!proyectos || proyectos.length === 0) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Sin Proyectos</h2>
        <div style={styles.error}>
          <p>⚠️ No hay proyectos disponibles.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Selecciona un Proyecto</h2>
      <div style={styles.grid}>
        {proyectos.map((proyecto, index) => {
          const nombreArchivo = proyecto.archivoExcel.split('/').pop() || proyecto.archivoExcel;
          
          return (
            <button
              key={`${proyecto.nombre}-${index}`}
              onClick={() => {
                console.log('👆 Click en:', nombreArchivo);
                onSelectFile(nombreArchivo);
              }}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
            >
              <div style={styles.icon}>📊</div>
              <h3 style={styles.cardTitle}>{proyecto.nombre}</h3>
              <p style={styles.cardFile}>{nombreArchivo}</p>
              <span style={styles.badge}>
                {proyecto.carpetaPreguntas.split('/').pop()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  title: {
    textAlign: 'center' as const,
    color: '#217346',
    marginBottom: '40px',
    fontSize: '32px',
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: 'white',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center' as const,
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '12px',
  },
  icon: { fontSize: '48px', marginBottom: '8px' },
  cardTitle: { margin: '8px 0', color: '#333', fontSize: '20px', fontWeight: 600 },
  cardFile: { margin: '4px 0', color: '#666', fontSize: '14px', fontStyle: 'italic' },
  badge: {
    background: '#217346',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    marginTop: '8px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    color: '#666',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #217346',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  error: {
    background: '#fff3f3',
    border: '2px solid #d13438',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center' as const,
    color: '#d13438',
  },
  retryBtn: {
    marginTop: '16px',
    padding: '10px 24px',
    background: '#217346',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
};

export default FileSelector;