# 🏥 Sistema de Vigilancia Activa de IAAS
## Clínica Infantil Colsubsidio

### 📋 Descripción del Proyecto

Sistema web para la **identificación activa y seguimiento de Infecciones Asociadas a la Atención en Salud (IAAS)** en pacientes pediátricos hospitalizados.

**Objetivo:** Permitir que el personal clínico reporte de forma rápida y sencilla cualquier sospecha de deterioro infeccioso en pacientes con >48 horas de hospitalización o cirugía reciente, facilitando el seguimiento epidemiológico y la gestión de casos.

---

## 🎯 Funcionalidades Requeridas

### 1. FORMULARIO DE REPORTE (Vista Principal)
Formulario moderno, responsive y fácil de usar para reportar casos sospechosos.

**Campos del formulario:**

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| Cama | Texto corto | ✅ | Número/código de cama |
| Nombre del paciente | Texto | ✅ | Nombre completo |
| Identificación | Texto | ✅ | Documento de identidad |
| Fecha de ingreso | Date picker | ✅ | Para calcular días de estancia |
| Características | Checkbox múltiple | ✅ | Ver opciones abajo |
| Sospecha de deterioro | Checkbox múltiple | ✅ | Ver opciones abajo |
| Descripción del evento | Textarea | ✅ | Descripción breve |
| Quien registra | Texto | ✅ | Nombre del profesional |
| Fecha/hora del reporte | Auto | ✅ | Se genera automáticamente |

**Opciones de "Características":**
- Más de 48 horas de hospitalización
- Cirugía reciente

**Opciones de "Sospecha de deterioro infeccioso por":**
- Reaparición de la fiebre
- Aumento de la fiebre con respecto a días previos
- Presenta datos clínicos de sepsis (que antes no tenía)
- Secreción purulenta por herida
- Calor, dolor y eritema en sitio de cirugía previa
- Datos de flebitis
- Panel viral positivo (inicial negativo)
- Otro dato que sugiera infección asociada a la salud

---

### 2. DASHBOARD DE SEGUIMIENTO (Vista Admin/Epidemiología)

Panel para visualizar y gestionar todos los casos reportados.

**Funcionalidades del Dashboard:**

- **Tabla de casos:** Listado de todos los reportes con filtros por fecha, estado, tipo de sospecha
- **Estados de caso:** Pendiente → En revisión → Confirmado IAAS / Descartado
- **Indicadores:**
  - Total de reportes (día/semana/mes)
  - Casos por tipo de sospecha (gráfico de barras)
  - Casos por estado (pendientes, confirmados, descartados)
  - Tasa de confirmación
- **Acciones por caso:**
  - Ver detalle completo
  - Cambiar estado
  - Agregar notas de seguimiento
  - Clasificación final (tipo de IAAS si se confirma)

**Clasificación de IAAS confirmadas:**
- Infección del sitio quirúrgico (ISQ)
- Infección del torrente sanguíneo asociada a catéter (ITS-AC)
- Neumonía asociada a ventilador (NAV)
- Infección urinaria asociada a catéter (ITU-AC)
- Otra IAAS

---

## 🛠️ Stack Tecnológico Sugerido

```
Frontend: HTML5 + CSS3 + JavaScript (Vanilla o con framework ligero)
Backend/DB: Supabase (PostgreSQL + Auth + Realtime)
Hosting: Vercel o Netlify
Estilo: Moderno, limpio, colores institucionales (morado/violeta como en el form original)
```

---

## 📁 Estructura de Archivos Sugerida

```
vigilancia-iaas/
├── index.html          # Formulario de reporte
├── dashboard.html      # Panel de seguimiento
├── css/
│   └── styles.css      # Estilos globales
├── js/
│   ├── app.js          # Lógica del formulario
│   ├── dashboard.js    # Lógica del dashboard
│   └── supabase.js     # Conexión a Supabase
├── assets/
│   └── logo.png        # Logo institucional (si aplica)
└── README.md
```

---

## 🗄️ Esquema de Base de Datos (Supabase)

### Tabla: `reportes_iaas`

```sql
CREATE TABLE reportes_iaas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Datos del paciente
  cama VARCHAR(20) NOT NULL,
  nombre_paciente VARCHAR(200) NOT NULL,
  identificacion VARCHAR(50) NOT NULL,
  fecha_ingreso DATE NOT NULL,
  
  -- Características (almacenar como array o JSON)
  caracteristicas JSONB NOT NULL,
  -- Ejemplo: ["mas_48h", "cirugia_reciente"]
  
  -- Sospecha de deterioro (array)
  sospecha_deterioro JSONB NOT NULL,
  -- Ejemplo: ["fiebre_reaparicion", "sepsis", "flebitis"]
  
  -- Descripción
  descripcion_evento TEXT NOT NULL,
  
  -- Quien reporta
  quien_registra VARCHAR(200) NOT NULL,
  
  -- Seguimiento
  estado VARCHAR(50) DEFAULT 'pendiente',
  -- Valores: pendiente, en_revision, confirmado, descartado
  
  clasificacion_iaas VARCHAR(100),
  -- Si se confirma: ISQ, ITS-AC, NAV, ITU-AC, otra
  
  notas_seguimiento TEXT,
  fecha_cierre TIMESTAMP WITH TIME ZONE,
  cerrado_por VARCHAR(200)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_reportes_estado ON reportes_iaas(estado);
CREATE INDEX idx_reportes_fecha ON reportes_iaas(created_at);
```

---

## 🎨 Diseño UI/UX

### Paleta de colores (basada en el formulario original):
- **Primario:** #6B46C1 (Morado/Violeta)
- **Secundario:** #805AD5
- **Acento:** #9F7AEA
- **Fondo:** #F7FAFC
- **Texto:** #2D3748
- **Éxito:** #48BB78
- **Alerta:** #F6AD55
- **Error:** #FC8181

### Principios de diseño:
- Mobile-first (los clínicos usarán celular/tablet)
- Formulario en pasos o secciones claras
- Feedback visual inmediato
- Confirmación clara al enviar
- Carga rápida

---

## 🚀 Instrucciones para Claude Code

1. **Crear el proyecto** con la estructura de archivos indicada
2. **Formulario (index.html):**
   - Diseño moderno con los campos especificados
   - Validación de campos obligatorios
   - Cálculo automático de días de estancia (fecha actual - fecha ingreso)
   - Envío a Supabase
   - Mensaje de confirmación al enviar
   
3. **Dashboard (dashboard.html):**
   - Proteger con contraseña simple o usar Supabase Auth
   - Tabla con todos los casos
   - Filtros por estado y fecha
   - Gráficos simples (puede usar Chart.js)
   - Función para actualizar estado de casos
   
4. **Conexión Supabase:**
   - Crear archivo de configuración
   - CRUD completo para reportes
   - Suscripción realtime para actualizar dashboard

---

## 📞 Contacto

**Proyecto:** Control de Infecciones - Clínica Infantil Colsubsidio  
**Responsable:** Dr. Iván Felipe Gutiérrez Tobar  
**Email:** proacisml@gmail.com

---

## 📝 Notas Adicionales

- El sistema reemplaza un Google Form existente
- Debe ser extremadamente simple de usar para el personal clínico
- Priorizar la velocidad de carga y facilidad de uso
- Los datos son sensibles (información de pacientes) - considerar seguridad
