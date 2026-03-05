```markdown
# Estrategia de Etiquetado e Impresión Universal 2026
## Una Arquitectura de Aplicaciones Web Progresivas para la Industria de la Indumentaria

La convergencia tecnológica de 2026 ha consolidado a las **Aplicaciones Web Progresivas (PWA)** como la plataforma predominante para soluciones de software empresarial. En este ecosistema, la capacidad de interactuar directamente con el hardware de impresión sin depender de controladores intermedios es un requisito fundamental para la agilidad operativa.

---

## 1. El Ecosistema de Impresión Directa: Web Bluetooth y Web Serial

La arquitectura de hardware se fundamenta en el acceso directo a periféricos desde el navegador, eliminando aplicaciones "puente".

### Integración de Web Bluetooth API para Movilidad
Permite la conexión a dispositivos **Bluetooth Low Energy (BLE)** mediante el perfil GATT.

| Característica Técnica | Especificación en Web Bluetooth (2026) | Aplicación en Indumentaria |
| :--- | :--- | :--- |
| **Perfil de Comunicación** | GATT (Generic Attribute Profile) | Conectividad con impresoras Zebra/Brother portátiles. |
| **Seguridad** | Contexto Seguro (HTTPS) + User Gesture | Protección de datos y prevención de accesos. |
| **Descubrimiento** | `requestDevice()` con filtros de UUID | Identificación automática de impresoras térmicas. |
| **Transferencia** | Escritura en características de tipo "Write" | Envío de comandos ESC/POS y ZPL inalámbricos. |

### Web Serial API y el Soporte RFCOMM
Para estaciones fijas, la Web Serial API proporciona el enlace necesario para impresoras serie-USB. En 2026, el soporte para **RFCOMM** permite comunicarse con dispositivos Bluetooth Classic (SPP), esencial para modelos industriales heredados.

---

## 2. Lenguajes de Control de Bajo Nivel

### El Protocolo ESC/POS
Estándar para impresión térmica de recibos y etiquetas pequeñas.

| Función de Impresión | Comando ESC/POS (Hex) | Impacto Operativo |
| :--- | :--- | :--- |
| **Inicialización** | `1B 40` | Limpieza del búfer para evitar residuos. |
| **Justificación** | `1B 61 n` | Alineación precisa de códigos de barras. |
| **Densidad de Barra** | `1D 77 n` | Ajuste del ancho para legibilidad óptima. |
| **Corte de Papel** | `1D 56 m` | Automatización de la separación de etiquetas. |
| **Generación QR** | `1D 28 6B` | Enlaces a fichas técnicas de prendas. |

### ZPL II: El Estándar Industrial
Zebra Programming Language utiliza coordenadas absolutas (`^FO0,0`). En un SaaS, los diseños se almacenan como plantillas parametrizadas:
`^FO100,100^BY3^BCN,100,Y,N,N^FD{SKU}^FS`

### TSPL: Precisión Basada en Puntos (Dots)
Común en marcas como Xprinter y TSC. La lógica de cálculo depende del DPI:

$$X_{dots} = X_{mm} \times \left( \frac{DPI}{25.4} \right)$$

---

## 3. Gestión de Impresión Silenciosa (Silent Printing)

### Estrategia de Kiosk Printing
Para terminales fijos que utilizan el motor del SO, se implementa el modo Kiosk.

| Entorno | Flag de Lanzamiento | Resultado Esperado |
| :--- | :--- | :--- |
| **Terminal de Venta** | `--kiosk --kiosk-printing` | Pantalla completa con impresión instantánea. |
| **Estación de Empaque** | `--kiosk-printing --disable-print-preview` | Impresión sin interrupción visual. |
| **Gestión Administrada** | Política `SilentPrintingEnabled` | Forzado mediante GPO empresarial. |

---

## 4. Generador de PDF Inteligente

### Implementación con jsPDF y html2canvas
Para hojas autoadhesivas (Avery), se utiliza un factor de escala elevado para garantizar nitidez.

```typescript
const doc = new jsPDF({
  orientation: 'p',
  unit: 'mm',
  format: 'a4',
  hotfixes: ['px_scaling']
});
```

### Grid Dinámico y Optimización de Espacio
Algoritmo de packing para maximizar etiquetas por hoja:

| Especificación de Hoja | Dimensión Etiqueta | Etq. por Fila | Etq. por Columna | Total por Hoja |
| :--- | :--- | :--- | :--- | :--- |
| A4 (210x297mm) | 105 x 37 mm | 2 | 8 | 16 |
| A4 (210x297mm) | 70 x 36 mm | 3 | 8 | 24 |
| A3 (297x420mm) | 105 x 37 mm | 2 | 11 | 22 |

---

## 5. Estandarización de Diseño y CSS

### Precisión Industrial con CSS `@media print`
```css
@media print {
  body { margin: 0; padding: 0; }
  .label-container {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    width: 210mm;
  }
  .label-item {
    width: var(--label-width);
    height: var(--label-height);
    page-break-inside: avoid;
  }
}
```

---

## 6. Resiliencia y Arquitectura Offline-First

### Gestión de Colas en IndexedDB
Los trabajos se encolan localmente con estados: `Pending`, `Sending`, `Completed`, `Error`.

### Capa de Frontend: Hook `usePrinter`
```typescript
export const usePrinter = (type: 'thermal' | 'pdf') => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'printing' | 'error'>('idle');

  const printLabel = async (commands: Uint8Array | string) => {
    setStatus('connecting');
    try {
      isBluetooth ? await bluetoothService.send(commands) : await serialService.send(commands);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      queueService.addToQueue({ commands, timestamp: Date.now() });
    }
  };
  return { printLabel, status };
};
```

---

## 7. Checklist de Implementación (0-100)

1.  **0-10%:** Fundamentos PWA (Service Workers, Manifest).
2.  **10-25%:** Infraestructura IndexedDB para colas offline.
3.  **25-40%:** Módulo Web Bluetooth y Web Serial.
4.  **40-55%:** Traductores de DTO a ZPL/ESC/POS/TSPL.
5.  **55-70%:** Estilos CSS `@media print` y validación de "Safe Zones".
6.  **70-85%:** Motor jsPDF con paginación automática.
7.  **85-95%:** Optimización UX y configuración de modo Kiosk.
8.  **95-100%:** QA Industrial y calibración de hardware.

---

## Conclusión
La **Estrategia de Etiquetado 2026** transforma la PWA en un centro de control industrial. Al utilizar estándares abiertos y arquitecturas resilientes, se garantiza flexibilidad, reducción de costos (TCO) y una operación continua incluso sin conectividad.
```