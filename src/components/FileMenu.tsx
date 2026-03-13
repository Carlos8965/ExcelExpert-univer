import React from 'react';

interface FileMenuProps {
  onClose: () => void;
  recentFiles: string[];
  onOpenOptions: () => void; // <--- 1. AGREGAR A LA INTERFACE
}

// 2. RECIBIRLA AQUÍ (Dentro de las llaves)
const FileMenu: React.FC<FileMenuProps> = ({ onClose, recentFiles, onOpenOptions }) => {
  
  const menuItems = [
    { label: 'Inicio', icon: '🏠', active: true },
    { label: 'Nuevo', icon: '📄' },
    { label: 'Abrir', icon: '📂' },
    { label: 'Información', icon: 'ℹ️' },
    { label: 'Guardar', icon: '💾' },
    { label: 'Guardar como', icon: '💾' },
    { label: 'Imprimir', icon: '🖨️' },
    { label: 'Compartir', icon: '📤' },
    { label: 'Exportar', icon: '📥' },
    { label: 'Publicar', icon: '☁️' },
    { label: 'Cerrar', icon: '❌' },
  ];

  const templates = [
    { name: 'Libro en blanco', img: '📊' },
    { name: 'Bienvenida a Excel', img: '🟢' },
    { name: 'Tutorial de fórmulas', img: 'ƒx' },
    { name: 'Tabla dinámica', img: '📑' },
    { name: 'Presupuesto personal', img: '💰' },
  ];

  return (
    <div style={styles.overlay}>
      {/* BARRA LATERAL */}
      <div style={styles.sidebar}>
        <button onClick={onClose} style={styles.backBtn}>←</button>
        <div style={styles.menuList}>
          {menuItems.map((item) => (
            <div key={item.label} style={{ ...styles.menuItem, backgroundColor: item.active ? '#185c37' : 'transparent' }}>
              <span style={{ marginRight: '15px' }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div><div style={styles.bottomMenu}>
          <div style={styles.menuItem}>👤 Cuenta</div>
          <div style={styles.menuItem}>💬 Comentarios</div>
          
          {/* 3. USARLA AQUÍ */}
          <div style={styles.menuItem} onClick={onOpenOptions}>
             ⚙️ Opciones
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={styles.mainContent}>
        <header style={styles.header}>Buenas noches</header>
        
        {/* SECCIÓN PLANTILLAS */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>Nueva <span style={{fontSize: '12px', fontWeight: 'normal', color: '#217346', cursor: 'pointer'}}>Más plantillas →</span></div>
          <div style={styles.templateGrid}>
            {templates.map(t => (
              <div key={t.name} style={styles.templateCard}>
                <div style={styles.templateIcon}>{t.img}</div>
                <div style={styles.templateName}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN RECIENTES */}
        <div style={styles.section}>
          <div style={styles.tabsRecent}>
            <span style={styles.activeTab}>Recientes</span>
            <span style={styles.tab}>Anclado</span>
          </div>
          <div style={styles.recentList}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th align="left">Nombre</th>
                  <th align="left">Fecha de modificación</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map((file, index) => (
                // Cambia la key para que use el índice (index)
                <tr key={`${file}-${index}`} style={styles.tableRow}>
                    <td style={styles.fileName}>📗 {file}</td>
                    <td style={styles.fileDate}>Hace {Math.floor(Math.random()*10)} h</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: '#fff', zIndex: 9999, display: 'flex' },
  sidebar: { width: '200px', backgroundColor: '#217346', color: 'white', display: 'flex', flexDirection: 'column', paddingTop: '40px' },
  backBtn: { background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', alignSelf: 'flex-start', marginLeft: '20px', marginBottom: '20px' },
  menuList: { flex: 1 },
  menuItem: { padding: '12px 25px', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center' },
  bottomMenu: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' },
  mainContent: { flex: 1, padding: '40px 60px', overflowY: 'auto', backgroundColor: '#fff', color: '#333' },
  header: { fontSize: '28px', marginBottom: '30px' },
  section: { marginBottom: '40px' },
  sectionHeader: { fontWeight: 'bold', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  templateGrid: { display: 'flex', gap: '15px' },
  templateCard: { width: '130px', cursor: 'pointer' },
  templateIcon: { height: '90px', border: '1px solid #e1dfdd', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '30px', marginBottom: '8px', backgroundColor: '#f3f2f1' },
  templateName: { fontSize: '12px', textAlign: 'center' },
  tabsRecent: { borderBottom: '1px solid #e1dfdd', marginBottom: '15px', display: 'flex', gap: '20px' },
  activeTab: { borderBottom: '3px solid #217346', paddingBottom: '5px', fontWeight: 'bold', fontSize: '14px' },
  tab: { color: '#666', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { color: '#666', fontSize: '12px' },
  tableRow: { borderBottom: '1px solid #f3f2f1' },
  fileName: { padding: '10px 0', fontSize: '13px', fontWeight: '500' },
  fileDate: { color: '#666', fontSize: '12px' }
};

export default FileMenu;