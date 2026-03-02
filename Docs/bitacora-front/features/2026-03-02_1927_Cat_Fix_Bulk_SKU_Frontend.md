# Catálogo: Feature Edición Masiva (Bulk Edit) de SKU Autonumérico y Fix Cierres (Closures)

## 🎯 Objetivo de la Modificación
Facilitar la carga del catálogo dotando a la herramienta superior del "Bulk Edit" (donde se asignaba masivamente costos y beneficios a N-variantes), un nuevo input de "SKU", programado para **autonumerar iterativamente** si recibe un prefijo y un número. Ej: `REM-01` -> `REM-02` -> `REM-03`. Además se habilitó paralelamente el envío de Stock y Categoría hacia el backend.

## 🛠 Cambios Realizados

**1. Habilitación de Endpoints PUT (`catalogApi.ts` & Componentes en Vite)**
- En `NuevoProductoPage.tsx`, liberamos el mapping oculto de `stockInicial`. Previo a esto, el Submit ignoraba cualquier Input tippeado asumiendo que el Stock era Inmutable Post-Creación.

**2. Componente Funcional de SKU Masivo (`NuevoProductoPage.tsx`)**
- Incorporamos en la constelación condicional `{seleccionadas.size > 0}` una caja de tipo Text delimitadora de un nuevo *use-state* llamado `bulkSku`.
- Enlazamos la función iteradora transaccional `aplicarASeleccionadas` del *useState*.

**3. Patrón Autonumérico (Regresar String Base + Padding):**
- Realizamos un test de validación con Expresión Regular `/^(.*?)(\d+)$/`. Esto extrae dos grupos atómicos de un string como "REMERITA-009": 
  - `match[1]` -> "REMERITA-" (Prefijo o SkuBase).
  - `match[2]` -> "009" (Numérico Escalable).
- Contabilizamos la longitud total de la segunda parte (`length == 3`) para conservarla dinámicamente (`.padStart` conservando la cadena de ceros).

**4. FIX de Bug: Closures y React StrictMode (Doble Render)**
- **Incidente:** El usuario reportó que la numeración siempre iniciaba en el index general `N > 20`. 
- **Reparación:** React (por StrictMode en local, y por asincronía general del estado `prev => `) capturaba los Closures de iteración mutables por fuera de la actualización del DOM o salteaba elementos `false` (invisibles) de un objeto nativo `Set()` caótico en iteraciones asimétricas.
- **La Solución:** Primero, extrajimos una constante array pre-ordenado `Array.from(seleccionadas).sort((a,b) => a-b);`. Posteriormente, aislamos TODO el ciclo `for` iterativo, el contador primitivo `let skuCounter = 0;` y el parsing lógico ADENTRO del bloque atómico garantizado por React `setFilas(prev => { ... } )`.

## 🧠 Explicación Didáctica
Crear 50 camisas rojas genera 50 líneas. Ir a la línea N y escribir "CH-44" es un micro-proceso extenuante. El Bulk Edit masivo ayuda con eso, pero los SKU, por naturaleza universal, no pueden estar duplicados. Para resolver la paradoja, la nueva barrera de Regex no aplica el texto como "estampa", sino que crea un molde a rellenar: Corta tú bloque "XX-YY" donde estén los números, incrementa matemáticamente, y lo rellena con `padStart` para emular dígitos vacíos como 00.
Por otro lado, la asincronía desfasaba el contador a 23 porque la CPU barría las opciones no seleccionadas (saltos al vacío). Centralizar la matemática adentro del engranaje ciego del _Setter (`prev => `)_ erradicó el error asegurando que el inicio será estrictamente `0` cada milisegundo que interactúes con el DOM de la aplicación.
