import { readdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const BASE = "./public/Preguntas_proyecto";

if (!existsSync(BASE)) {
  console.error(`❌ No existe la carpeta: ${BASE}`);
  process.exit(1);
}

const proyectos = readdirSync(BASE, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

if (!proyectos.length) {
  console.warn("⚠️ No se encontraron subcarpetas en Preguntas_proyecto.");
  process.exit(0);
}

for (const proyecto of proyectos) {
  const carpeta = join(BASE, proyecto);

  const archivos = readdirSync(carpeta)
    .filter((f) => f.endsWith(".txt"))
    .sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      return numA - numB;
    });

  const indexPath = join(carpeta, "index.json");
  writeFileSync(indexPath, JSON.stringify({ archivos }, null, 2), "utf-8");
  console.log(`✅ ${proyecto}: ${archivos.length} pregunta(s) → ${indexPath}`);
}

console.log("\n🎉 index.json generados correctamente.");