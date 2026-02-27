```markdown
# 🛠 Especificaciones Técnicas para la Base de Datos (Indumentaria 2.0)

## 1. Jerarquía Maestro-Categoría (Nivel NCM)
La base debe permitir clasificar productos según la **Nomenclatura Común del MERCOSUR (NCM)** para automatizar la tributación y el comercio exterior.

| Categoría Principal | Familia (Nivel 2) | NCM Base (Referencia) |
| :--- | :--- | :--- |
| **Ropa (Apparel)** | Tops, Bottoms, Outerwear, Dresses | 6105, 6203, 6204 (+1) |
| **Calzado (Footwear)** | Athletic, Casual, Formal, Sandalias | 6402, 6403, 6405 (+1) |
| **Accesorios** | Bolsos, Joyería, Sombreros, Lentes | 4202, 7117, 9004 (+1) |
| **Ropa Interior** | Lencería, Sleepwear, Hosiery | 6107, 6108, 6208 (+1) |
| **Deporte** | Performance, Outdoor, Athleisure | 6112, 6114, 6211 (+1) |
| **Ropa de Trabajo** | Uniformes, Seguridad (EPP) | 6211, 6307 (+1) |

---

## 2. Matriz de Atributos Dinámicos (EAV o JSONB)
Para evitar migraciones constantes, los atributos específicos por rubro deben gestionarse de forma dinámica.

*   **Ropa:** Talle, Color, Material, Estampado, Fit (Slim/Boxy), Largo de Manga. (+1)
*   **Calzado:** Talle, Color, Material, Ancho, Tipo de Suela, Amortiguación, Altura de Taco, Drop (mm).
*   **Ropa Interior:** Talle, Copa, Contorno, Color, Nivel de Soporte, Tipo de Taza.
*   **Deporte:** Talle, Color, Tecnología de Tela (CoolMax/Gore-Tex), Transpirabilidad, Compresión. (+1)
*   **Ropa de Trabajo:** Talle, Color, Certificación (ANSI/ISO), Ignífugo (NFPA), Alta Visibilidad. (+1)
*   **Accesorios:** Talle Único, Capacidad (Litros), Resistencia al Agua, Material de Cierre.

---

## 3. Sistema Maestro de Conversión de Talles
El núcleo debe almacenar el **Rango de Medidas de Usuario (cm)** para traducir entre escalas internacionales.

*   **Ropa Adultos:** Normalizar escalas entre USA (0-20+), UK (2-22+), Europa (30-50+), Brasil (32-52+), México (26-44+) y Argentina (IRAM 75300: 30-60). (+1)
*   **Calzado:** Mapear Largo del Pie (cm) a escalas USA, EU, México, Argentina y UK.
*   **Niños/Bebés:** Conversión basada en Altura (cm) vs Edad (USA/UK).

---

## 4. Metadatos de Cumplimiento y Logística (SKU Level)
Cada variante (SKU) debe poseer datos granulares para fletes y aduanas.

*   **Logística:** Peso Neto/Bruto (kg), Dimensiones de Empaque (L x A x H), Tipo de Almacenamiento (Colgado/Doblado), GTIN/EAN-13, RFID Tag ID. (+1)
*   **Cumplimiento LatAm:** Composición de Fibra (ISO decreciente %), País de Origen (Hecho en...), CUIT/RFC del Importador, Instrucciones de Lavado (ISO 3758). (+3)

---

## 5. Casos de Borde y Lógica de Negocio
*   **Packs y Bundles:** Diferenciar entre "Pack SKU Único" (pre-empaquetado), "Virtual Bundle" (descompuesto en picking) y "Pre-packs Mayoristas" (curvas de talles). (+2)
*   **Talle Único (OS):** Debe incluir metadatos de dimensiones físicas (cm) para e-commerce.

---

## 💾 Propuesta de Esquema de Base de Datos Híbrida
Se recomienda un modelo relacional para el núcleo y JSONB para los atributos dinámicos para maximizar la flexibilidad.

1.  **Core Relacional:** Tablas para `Products` (Parent), `ProductVariants` (SKU), `Categories` (Jerárquica), `Inventory`, `Warehouses` y `Tenants`. (+1)
2.  **Módulo de Atributos (EAV):** Tablas `AttributeDefinitions` (Nombre, Tipo), `AttributeValues` (Diccionario de valores) y `ProductAttributeMapping`.
3.  **Auditoría y Seguridad:** Uso de columnas JSONB para registrar el historial completo de cambios y las respuestas de ARCA para auditoría de punta a punta.
```


```markdown
# 📋 Instrucción Técnica: Configuración Dinámica de Variantes (UX-Driven)

**Objetivo:** Implementar un sistema de atributos que filtre automáticamente las opciones de carga basándose en el nicho del negocio (Tenant) y la categoría del producto, eliminando el ruido visual y optimizando el tiempo de carga masiva.

---

## 1. Lógica de "Nicho de Negocio" (Tenant Level)
El sistema debe permitir que cada Inquilino (Tenant) active los rubros que maneja en su configuración inicial.

*   **Configuración del Tenant:** El usuario selecciona "Ropa" y "Calzado".
*   **Resultado:** El sistema oculta automáticamente todas las definiciones de atributos de "Ropa de Trabajo", "Lencería" o "Blanquería" para ese cliente específico.

---

## 2. Esquema de Base de Datos para Filtrado Inteligente
Se requiere una relación de **Muchos a Muchos** entre Categorías y Atributos:

*   **Tabla `DefinicionAtributos`:** Contiene todos los atributos posibles (Talle, Color, Copa, Suela, etc.).
*   **Tabla `MapeoAtributosCategoria`:** Define qué atributos "viven" en cada categoría.
    *   *Ejemplo:* Categoría "Remeras" $\rightarrow$ Talle, Color, Material.
    *   *Ejemplo:* Categoría "Zapatos" $\rightarrow$ Talle, Color, Tipo de Suela.

---

## 3. Flujo de Carga en el Frontend (React)
Para maximizar la eficiencia sin perder rendimiento, el proceso debe ser:

1.  **Selección de Categoría:** El usuario elige "Remera".
2.  **Filtro Dinámico:** El backend devuelve solo los atributos vinculados a "Remeras" para ese `TenantId`.
3.  **Generación de Matriz:** React renderiza la grilla de carga masiva (Bulk Import) usando únicamente esos campos.

---

## 4. Instrucción 
> "Diseñá el esquema de base de datos de forma que los atributos de las variantes sean contextuales. Si un producto pertenece a la categoría 'Calzado', el sistema debe ignorar atributos de 'Ropa Interior' como 'Copa' o 'Contorno'. Implementá una tabla de configuración por Tenant que permita activar o desactivar familias de atributos completas para que la interfaz de carga sea limpia y ultra-rápida."

---

## 🚀 Beneficios de este enfoque
*   **Velocidad de Carga:** El usuario solo completa los campos que importan para su rubro.
*   **Integridad de Datos:** Evitás que alguien cargue por error un "Talle de Corpiño" en una "Zapatilla".
*   **Escalabilidad:** Podés agregar nuevos atributos (como "Nivel de Protección UV" para ropa deportiva) y activarlos solo para los clientes que lo necesiten, sin afectar a los locales de ropa clásica.
```