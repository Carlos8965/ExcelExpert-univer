import { useState, useEffect } from 'react';

interface Proyecto {
  id: string;
  nombre: string;
  carpetaPreguntas: string;
  archivoExcel: string;
}

export const usePreguntas = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/config.json')
      .then(res => {
        if (!res.ok) throw new Error("No se pudo cargar config.json");
        return res.json();
      })
      .then(data => {
        setProyectos(data.proyectos);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { proyectos, loading, error };
};