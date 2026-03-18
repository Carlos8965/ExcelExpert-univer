import { useState, useEffect } from "react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Proyecto {
  id: string;
  nombre: string;
  carpetaPreguntas: string;
  archivoExcel: string;
}

export interface PreguntaData {
  numero: number;
  texto: string;
}

// ─── Hook 1: carga la lista de proyectos desde config.json ───────────────────

export const useProyectos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/config.json")
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar config.json");
        return res.json();
      })
      .then((data) => setProyectos(data.proyectos))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { proyectos, loading, error };
};

// ─── Hook 2: carga las preguntas .txt de un proyecto via index.json ──────────

export const usePreguntas = (proyecto: Proyecto | null) => {
  const [preguntas, setPreguntas] = useState<PreguntaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!proyecto) return;

    setLoading(true);
    setError(null);
    setPreguntas([]);

    // 1️⃣ Lee el index.json autogenerado por el script
    fetch(`/${proyecto.carpetaPreguntas}/index.json`)
      .then((res) => {
        if (!res.ok)
          throw new Error(
            `No se encontró index.json en "${proyecto.carpetaPreguntas}". ¿Corriste npm run generate-index?`
          );
        return res.json();
      })
      .then(({ archivos }: { archivos: string[] }) => {
        if (!archivos.length) throw new Error("No hay preguntas en este proyecto.");

        // 2️⃣ Fetch de cada .txt listado en el index, en paralelo
        return Promise.all(
          archivos.map((archivo, i) =>
            fetch(`/${proyecto.carpetaPreguntas}/${archivo}`)
              .then((res) => {
                if (!res.ok) throw new Error(`No se pudo cargar ${archivo}`);
                return res.text();
              })
              .then((texto) => ({
                numero: i + 1,
                texto: texto.trim(),
              }))
          )
        );
      })
      .then(setPreguntas)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [proyecto?.id]); // ✅ Solo se re-ejecuta si cambia el proyecto

  return { preguntas, loading, error };
};