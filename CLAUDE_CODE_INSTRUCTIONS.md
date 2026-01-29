# 🤖 INSTRUCCIONES PARA CLAUDE CODE

## Prompt para iniciar el proyecto:

```
Necesito que crees un sistema web completo de "Vigilancia Activa de IAAS" para la Clínica Infantil Colsubsidio. Lee el README.md en esta carpeta para entender todos los requerimientos.

El sistema tiene 2 vistas principales:

1. FORMULARIO DE REPORTE (index.html) - Para que los médicos/enfermeras reporten sospechas de infección
2. DASHBOARD (dashboard.html) - Para que epidemiología haga seguimiento de los casos

Stack: HTML + CSS + JavaScript + Supabase

Requisitos críticos:
- Diseño moderno con colores morado/violeta (#6B46C1 como primario)
- Mobile-first (los clínicos usan celular)
- Formulario muy fácil de usar
- Dashboard con tabla de casos y gráficos básicos
- Conexión a Supabase para persistencia

Empieza creando la estructura de archivos y luego desarrolla cada componente. Primero muéstrame el schema SQL para Supabase.
```

---

## Comandos útiles para Claude Code:

### Inicializar proyecto:
```bash
cd "/Users/ivanfelipegutierrez/Library/CloudStorage/Dropbox/Ivan Felipe Gutierrez Tobar/aFellow Infectologia Pediàtrica INP/Claude code/2026/Control de infecciones Colsubsidio"
mkdir -p vigilancia-iaas/{css,js,assets}
```

### Después de crear, probar localmente:
```bash
cd vigilancia-iaas
npx serve .
# o
python3 -m http.server 8000
```

---

## Configuración Supabase (crear proyecto nuevo)

1. Ir a https://supabase.com
2. Crear proyecto: "vigilancia-iaas-colsubsidio"
3. Copiar URL y anon key
4. Ejecutar el SQL del schema

### Variables de entorno necesarias:
```javascript
const SUPABASE_URL = 'tu-url-aqui';
const SUPABASE_ANON_KEY = 'tu-key-aqui';
```

---

## Checklist de desarrollo:

### Fase 1: Setup
- [ ] Crear estructura de carpetas
- [ ] Crear schema en Supabase
- [ ] Configurar conexión JS a Supabase

### Fase 2: Formulario
- [ ] HTML del formulario con todos los campos
- [ ] Estilos CSS modernos (mobile-first)
- [ ] Validación de campos
- [ ] Envío a Supabase
- [ ] Mensaje de confirmación

### Fase 3: Dashboard
- [ ] Tabla de casos con datos de Supabase
- [ ] Filtros (estado, fecha)
- [ ] Cambio de estado de casos
- [ ] Gráficos básicos (Chart.js)
- [ ] Modal para ver detalle de caso

### Fase 4: Polish
- [ ] Loading states
- [ ] Manejo de errores
- [ ] Responsive final
- [ ] Favicon
- [ ] Deploy a Vercel/Netlify

---

## Datos de prueba para testing:

```javascript
const testData = {
  cama: "UCI-P-05",
  nombre_paciente: "Paciente Prueba",
  identificacion: "1234567890",
  fecha_ingreso: "2026-01-25",
  caracteristicas: ["mas_48h"],
  sospecha_deterioro: ["fiebre_reaparicion", "sepsis"],
  descripcion_evento: "Paciente con fiebre persistente >38.5°C desde hace 24h",
  quien_registra: "Dr. Test"
};
```

---

## Notas importantes para Claude Code:

1. **NO uses frameworks pesados** - Vanilla JS o Alpine.js máximo
2. **Supabase client** - Usar CDN: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
3. **Chart.js** - Usar CDN para gráficos simples
4. **CSS** - Puede usar Tailwind CDN o CSS custom
5. **Autenticación** - Para MVP, dashboard con contraseña simple en localStorage. Después migrar a Supabase Auth.
6. **RLS en Supabase** - Configurar Row Level Security básico

---

## Links útiles:

- Supabase Docs: https://supabase.com/docs
- Chart.js: https://www.chartjs.org/
- Tailwind CDN: https://tailwindcss.com/docs/installation/play-cdn
