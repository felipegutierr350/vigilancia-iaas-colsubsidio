-- =====================================================
-- SCHEMA PARA SUPABASE - VIGILANCIA ACTIVA IAAS
-- Clínica Infantil Colsubsidio
-- =====================================================

-- Crear tabla principal de reportes
CREATE TABLE IF NOT EXISTS reportes_iaas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Datos del paciente
    cama VARCHAR(20) NOT NULL,
    nombre_paciente VARCHAR(200) NOT NULL,
    identificacion VARCHAR(50) NOT NULL,
    fecha_ingreso DATE NOT NULL,

    -- Características del paciente (almacenado como array JSON)
    -- Valores posibles: ["mas_48h", "cirugia_reciente"]
    caracteristicas JSONB NOT NULL DEFAULT '[]',

    -- Sospecha de deterioro infeccioso (array JSON)
    -- Valores: fiebre_reaparicion, fiebre_aumento, sepsis, secrecion_purulenta,
    --          signos_inflamatorios_cirugia, flebitis, panel_viral_positivo, otro
    sospecha_deterioro JSONB NOT NULL DEFAULT '[]',

    -- Descripción del evento
    descripcion_evento TEXT NOT NULL,

    -- Quien registra el reporte
    quien_registra VARCHAR(200) NOT NULL,

    -- Estado del caso y seguimiento
    estado VARCHAR(50) DEFAULT 'pendiente',
    -- Estados: pendiente, en_revision, confirmado, descartado

    -- Clasificación si se confirma IAAS
    clasificacion_iaas VARCHAR(100),
    -- Valores: ISQ, ITS-AC, NAV, ITU-AC, otra

    -- Notas de seguimiento
    notas_seguimiento TEXT,

    -- Fechas de cierre
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    cerrado_por VARCHAR(200)
);

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes_iaas(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_created_at ON reportes_iaas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha_ingreso ON reportes_iaas(fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_reportes_identificacion ON reportes_iaas(identificacion);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE reportes_iaas ENABLE ROW LEVEL SECURITY;

-- Política para permitir INSERT desde el frontend (usando anon key)
CREATE POLICY "Permitir insertar reportes" ON reportes_iaas
    FOR INSERT
    WITH CHECK (true);

-- Política para permitir SELECT (leer todos los registros)
CREATE POLICY "Permitir leer reportes" ON reportes_iaas
    FOR SELECT
    USING (true);

-- Política para permitir UPDATE (actualizar registros)
CREATE POLICY "Permitir actualizar reportes" ON reportes_iaas
    FOR UPDATE
    USING (true);

-- =====================================================
-- HABILITAR REALTIME
-- =====================================================

-- Asegurarse de que la tabla tenga realtime habilitado
-- Esto se hace desde el dashboard de Supabase:
-- Database > Replication > Agregar tabla reportes_iaas

-- O ejecutar:
ALTER PUBLICATION supabase_realtime ADD TABLE reportes_iaas;

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================

-- Descomentar para insertar datos de prueba:

/*
INSERT INTO reportes_iaas (
    cama, nombre_paciente, identificacion, fecha_ingreso,
    caracteristicas, sospecha_deterioro, descripcion_evento, quien_registra
) VALUES
(
    'UCI-P-01',
    'Juan Pablo Martínez García',
    '1234567890',
    CURRENT_DATE - INTERVAL '5 days',
    '["mas_48h"]',
    '["fiebre_reaparicion", "sepsis"]',
    'Paciente con fiebre persistente >38.5°C desde hace 24 horas. Se solicita valoración.',
    'Dr. Carlos Rodríguez'
),
(
    'HOSP-102',
    'María Valentina López',
    '0987654321',
    CURRENT_DATE - INTERVAL '3 days',
    '["mas_48h", "cirugia_reciente"]',
    '["secrecion_purulenta", "signos_inflamatorios_cirugia"]',
    'Herida quirúrgica con signos de infección. Eritema y secreción purulenta.',
    'Enf. Ana María Torres'
),
(
    'UCI-N-03',
    'Santiago Pérez Díaz',
    '1122334455',
    CURRENT_DATE - INTERVAL '7 days',
    '["mas_48h"]',
    '["flebitis"]',
    'Signos de flebitis en sitio de catéter venoso central.',
    'Dr. Luis Eduardo Gómez'
);
*/

-- =====================================================
-- NOTAS DE CONFIGURACIÓN
-- =====================================================

-- 1. Después de ejecutar este script, ir al Dashboard de Supabase:
--    - Settings > API: Copiar URL y anon key
--    - Pegarlos en js/config.js
--
-- 2. Para habilitar Realtime:
--    - Database > Replication > Seleccionar tabla reportes_iaas
--
-- 3. Las políticas RLS permiten acceso público para MVP.
--    Para producción, considerar implementar Supabase Auth.
