// Configuración de Supabase
const SUPABASE_URL = 'https://sxuptwddtlfhorrloluu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4dXB0d2RkdGxmaG9ycmxvbHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDczMDQsImV4cCI6MjA4NTIyMzMwNH0.0vwd1pfFc15xspuJKNA4Lgaj4b8dh8kRGjvMlbg7zwE';

// Inicializar cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Contraseña simple para el dashboard (para MVP)
const DASHBOARD_PASSWORD = '2026';

// Opciones de características
const CARACTERISTICAS_OPTIONS = [
    { value: 'mas_48h', label: 'Más de 48 horas de hospitalización' },
    { value: 'cirugia_reciente', label: 'Cirugía reciente' }
];

// Opciones de sospecha de deterioro
const SOSPECHA_OPTIONS = [
    { value: 'fiebre_reaparicion', label: 'Reaparición de la fiebre' },
    { value: 'fiebre_aumento', label: 'Aumento de la fiebre con respecto a días previos' },
    { value: 'sepsis', label: 'Presenta datos clínicos de sepsis (que antes no tenía)' },
    { value: 'secrecion_purulenta', label: 'Secreción purulenta por herida' },
    { value: 'signos_inflamatorios_cirugia', label: 'Calor, dolor y eritema en sitio de cirugía previa' },
    { value: 'flebitis', label: 'Datos de flebitis' },
    { value: 'panel_viral_positivo', label: 'Panel viral positivo (inicial negativo)' },
    { value: 'otro', label: 'Otro dato que sugiera infección asociada a la salud' }
];

// Estados de caso
const ESTADOS = [
    { value: 'pendiente', label: 'Pendiente', color: '#F6AD55' },
    { value: 'en_revision', label: 'En revisión', color: '#4299E1' },
    { value: 'confirmado', label: 'Confirmado IAAS', color: '#FC8181' },
    { value: 'descartado', label: 'Descartado', color: '#48BB78' }
];

// Clasificaciones de IAAS
const CLASIFICACIONES_IAAS = [
    { value: 'ISQ', label: 'Infección del sitio quirúrgico (ISQ)' },
    { value: 'ITS-AC', label: 'Infección del torrente sanguíneo asociada a catéter (ITS-AC)' },
    { value: 'NAV', label: 'Neumonía asociada a ventilador (NAV)' },
    { value: 'ITU-AC', label: 'Infección urinaria asociada a catéter (ITU-AC)' },
    { value: 'otra', label: 'Otra IAAS' }
];

// Función helper para obtener label de una opción
function getLabel(options, value) {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
}

// Función para obtener color de estado
function getEstadoColor(estado) {
    const estadoObj = ESTADOS.find(e => e.value === estado);
    return estadoObj ? estadoObj.color : '#718096';
}
