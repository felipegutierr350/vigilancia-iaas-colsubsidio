// ===== VARIABLES GLOBALES =====
let allCasos = [];
let filteredCasos = [];
let currentCasoId = null;
let chartEstados = null;
let chartSospechas = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

// ===== AUTENTICACIÓN =====
function checkAuth() {
    const isAuthenticated = localStorage.getItem('iaas_authenticated');
    if (isAuthenticated === 'true') {
        showDashboard();
    }
}

function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Mostrar/ocultar clasificación según estado
    document.getElementById('modalEstado').addEventListener('change', function() {
        const clasificacionGroup = document.getElementById('clasificacionGroup');
        clasificacionGroup.classList.toggle('show', this.value === 'confirmado');
    });

    // Filtros en tiempo real
    document.getElementById('filterBuscar').addEventListener('input', debounce(applyFilters, 300));
}

function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('passwordInput').value;
    const errorMsg = document.getElementById('loginError');

    if (password === DASHBOARD_PASSWORD) {
        localStorage.setItem('iaas_authenticated', 'true');
        showDashboard();
    } else {
        errorMsg.classList.add('show');
        document.getElementById('passwordInput').value = '';
    }
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').classList.add('show');
    loadData();
    setupRealtime();
}

function logout() {
    localStorage.removeItem('iaas_authenticated');
    location.reload();
}

// ===== CARGAR DATOS =====
async function loadData() {
    showLoading(true);
    try {
        const { data, error } = await supabaseClient
            .from('reportes_iaas')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allCasos = data || [];
        filteredCasos = [...allCasos];
        updateUI();
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error al cargar los datos. Por favor recargue la página.');
    } finally {
        showLoading(false);
    }
}

// ===== REALTIME =====
function setupRealtime() {
    supabaseClient
        .channel('reportes_changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'reportes_iaas' },
            (payload) => {
                console.log('Cambio detectado:', payload);
                loadData(); // Recargar todos los datos
            }
        )
        .subscribe();
}

// ===== ACTUALIZAR UI =====
function updateUI() {
    updateStats();
    updateCharts();
    updateTable();
}

// ===== ESTADÍSTICAS =====
function updateStats() {
    const total = allCasos.length;
    const pendientes = allCasos.filter(c => c.estado === 'pendiente').length;
    const confirmados = allCasos.filter(c => c.estado === 'confirmado').length;
    const descartados = allCasos.filter(c => c.estado === 'descartado').length;

    document.getElementById('totalReportes').textContent = total;
    document.getElementById('pendientes').textContent = pendientes;
    document.getElementById('confirmados').textContent = confirmados;
    document.getElementById('descartados').textContent = descartados;
}

// ===== GRÁFICOS =====
function updateCharts() {
    updateEstadosChart();
    updateSospechasChart();
}

function updateEstadosChart() {
    const ctx = document.getElementById('chartEstados').getContext('2d');

    const estados = {
        pendiente: 0,
        en_revision: 0,
        confirmado: 0,
        descartado: 0
    };

    allCasos.forEach(caso => {
        if (estados.hasOwnProperty(caso.estado)) {
            estados[caso.estado]++;
        }
    });

    const data = {
        labels: ['Pendiente', 'En revisión', 'Confirmado', 'Descartado'],
        datasets: [{
            data: [estados.pendiente, estados.en_revision, estados.confirmado, estados.descartado],
            backgroundColor: ['#FDB913', '#17a2b8', '#dc3545', '#28a745'],
            borderWidth: 0
        }]
    };

    if (chartEstados) {
        chartEstados.data = data;
        chartEstados.update();
    } else {
        chartEstados = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 8,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
}

function updateSospechasChart() {
    const ctx = document.getElementById('chartSospechas').getContext('2d');

    const sospechasCounts = {};
    SOSPECHA_OPTIONS.forEach(opt => {
        sospechasCounts[opt.value] = 0;
    });

    allCasos.forEach(caso => {
        if (caso.sospecha_deterioro) {
            caso.sospecha_deterioro.forEach(s => {
                if (sospechasCounts.hasOwnProperty(s)) {
                    sospechasCounts[s]++;
                }
            });
        }
    });

    const labels = SOSPECHA_OPTIONS.map(opt => {
        // Acortar labels para el gráfico
        const shortLabels = {
            'fiebre_reaparicion': 'Fiebre reaparición',
            'fiebre_aumento': 'Fiebre aumento',
            'sepsis': 'Sepsis',
            'secrecion_purulenta': 'Sec. purulenta',
            'signos_inflamatorios_cirugia': 'Signos inflam.',
            'flebitis': 'Flebitis',
            'panel_viral_positivo': 'Panel viral +',
            'otro': 'Otro'
        };
        return shortLabels[opt.value] || opt.value;
    });

    const data = {
        labels: labels,
        datasets: [{
            data: Object.values(sospechasCounts),
            backgroundColor: '#003DA5',
            borderRadius: 4
        }]
    };

    if (chartSospechas) {
        chartSospechas.data = data;
        chartSospechas.update();
    } else {
        chartSospechas = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    },
                    y: {
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }
}

// ===== TABLA =====
function updateTable() {
    const tbody = document.getElementById('casosTableBody');
    const emptyState = document.getElementById('emptyState');
    const countDisplay = document.getElementById('countDisplay');

    countDisplay.textContent = `Mostrando ${filteredCasos.length} de ${allCasos.length}`;

    if (filteredCasos.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = filteredCasos.map(caso => createTableRow(caso)).join('');
}

function createTableRow(caso) {
    const fecha = new Date(caso.created_at).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const sospechaLabels = caso.sospecha_deterioro
        ? caso.sospecha_deterioro.slice(0, 2).map(s => getLabel(SOSPECHA_OPTIONS, s)).join(', ')
        : '';
    const moreSospechas = caso.sospecha_deterioro && caso.sospecha_deterioro.length > 2
        ? ` +${caso.sospecha_deterioro.length - 2}`
        : '';

    return `
        <tr>
            <td>${fecha}</td>
            <td>
                <div class="patient-name">${caso.nombre_paciente}</div>
                <div class="patient-id">${caso.identificacion}</div>
            </td>
            <td>${caso.cama}</td>
            <td>
                <span style="font-size: 0.8rem;">${sospechaLabels}${moreSospechas}</span>
            </td>
            <td>
                <span class="badge badge-${caso.estado}">${getLabel(ESTADOS, caso.estado)}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-icon btn-outline" onclick="verDetalle('${caso.id}')" title="Ver detalle">👁️</button>
                </div>
            </td>
        </tr>
    `;
}

// ===== FILTROS =====
function applyFilters() {
    const estado = document.getElementById('filterEstado').value;
    const fechaDesde = document.getElementById('filterFechaDesde').value;
    const fechaHasta = document.getElementById('filterFechaHasta').value;
    const buscar = document.getElementById('filterBuscar').value.toLowerCase();

    filteredCasos = allCasos.filter(caso => {
        // Filtro por estado
        if (estado && caso.estado !== estado) return false;

        // Filtro por fecha desde
        if (fechaDesde) {
            const casoFecha = new Date(caso.created_at).toISOString().split('T')[0];
            if (casoFecha < fechaDesde) return false;
        }

        // Filtro por fecha hasta
        if (fechaHasta) {
            const casoFecha = new Date(caso.created_at).toISOString().split('T')[0];
            if (casoFecha > fechaHasta) return false;
        }

        // Filtro por búsqueda
        if (buscar) {
            const searchFields = [
                caso.nombre_paciente,
                caso.identificacion,
                caso.cama,
                caso.quien_registra
            ].map(f => (f || '').toLowerCase());

            if (!searchFields.some(field => field.includes(buscar))) {
                return false;
            }
        }

        return true;
    });

    updateTable();
}

function clearFilters() {
    document.getElementById('filterEstado').value = '';
    document.getElementById('filterFechaDesde').value = '';
    document.getElementById('filterFechaHasta').value = '';
    document.getElementById('filterBuscar').value = '';
    filteredCasos = [...allCasos];
    updateTable();
}

// ===== MODAL DE DETALLE =====
function verDetalle(id) {
    const caso = allCasos.find(c => c.id === id);
    if (!caso) return;

    currentCasoId = id;

    // Llenar contenido del modal
    const detalleContent = document.getElementById('detalleContent');

    const fechaIngreso = new Date(caso.fecha_ingreso);
    const diasEstancia = Math.floor((new Date() - fechaIngreso) / (1000 * 60 * 60 * 24));

    const caracteristicasHtml = caso.caracteristicas
        ? caso.caracteristicas.map(c => `<li>${getLabel(CARACTERISTICAS_OPTIONS, c)}</li>`).join('')
        : '<li>No especificado</li>';

    const sospechasHtml = caso.sospecha_deterioro
        ? caso.sospecha_deterioro.map(s => `<li>${getLabel(SOSPECHA_OPTIONS, s)}</li>`).join('')
        : '<li>No especificado</li>';

    detalleContent.innerHTML = `
        <div class="detail-item">
            <label>Servicio</label>
            <p>${caso.cama}</p>
        </div>
        <div class="detail-item">
            <label>Paciente</label>
            <p>${caso.nombre_paciente}<br><small>${caso.identificacion}</small></p>
        </div>
        <div class="detail-item">
            <label>Fecha de ingreso</label>
            <p>${fechaIngreso.toLocaleDateString('es-CO')}<br><small>${diasEstancia} días de estancia</small></p>
        </div>
        <div class="detail-item">
            <label>Fecha del reporte</label>
            <p>${new Date(caso.created_at).toLocaleString('es-CO')}</p>
        </div>
        <div class="detail-item" style="grid-column: 1 / -1;">
            <label>Características</label>
            <ul>${caracteristicasHtml}</ul>
        </div>
        <div class="detail-item" style="grid-column: 1 / -1;">
            <label>Sospecha de deterioro</label>
            <ul>${sospechasHtml}</ul>
        </div>
        <div class="detail-item" style="grid-column: 1 / -1;">
            <label>Descripción del evento</label>
            <p>${caso.descripcion_evento}</p>
        </div>
        <div class="detail-item">
            <label>Registrado por</label>
            <p>${caso.quien_registra}</p>
        </div>
        ${caso.clasificacion_iaas ? `
        <div class="detail-item">
            <label>Clasificación IAAS</label>
            <p><strong>${caso.clasificacion_iaas}</strong></p>
        </div>
        ` : ''}
    `;

    // Configurar formulario de seguimiento
    document.getElementById('modalEstado').value = caso.estado || 'pendiente';
    document.getElementById('modalNotas').value = caso.notas_seguimiento || '';
    document.getElementById('modalClasificacion').value = caso.clasificacion_iaas || '';

    // Mostrar/ocultar clasificación
    const clasificacionGroup = document.getElementById('clasificacionGroup');
    clasificacionGroup.classList.toggle('show', caso.estado === 'confirmado');

    // Mostrar modal
    document.getElementById('detalleModal').classList.add('show');
}

function closeModal() {
    document.getElementById('detalleModal').classList.remove('show');
    currentCasoId = null;
}

// ===== GUARDAR CAMBIOS =====
async function guardarCambios() {
    if (!currentCasoId) return;

    const nuevoEstado = document.getElementById('modalEstado').value;
    const notas = document.getElementById('modalNotas').value;
    const clasificacion = document.getElementById('modalClasificacion').value;

    const updateData = {
        estado: nuevoEstado,
        notas_seguimiento: notas
    };

    // Si es confirmado, agregar clasificación y fecha de cierre
    if (nuevoEstado === 'confirmado') {
        updateData.clasificacion_iaas = clasificacion;
        updateData.fecha_cierre = new Date().toISOString();
    } else if (nuevoEstado === 'descartado') {
        updateData.fecha_cierre = new Date().toISOString();
        updateData.clasificacion_iaas = null;
    } else {
        updateData.clasificacion_iaas = null;
        updateData.fecha_cierre = null;
    }

    showLoading(true);
    try {
        const { error } = await supabaseClient
            .from('reportes_iaas')
            .update(updateData)
            .eq('id', currentCasoId);

        if (error) throw error;

        closeModal();
        await loadData();
    } catch (error) {
        console.error('Error actualizando caso:', error);
        alert('Error al guardar los cambios. Intente nuevamente.');
    } finally {
        showLoading(false);
    }
}

// ===== UTILIDADES =====
function showLoading(show) {
    document.getElementById('loadingOverlay').classList.toggle('show', show);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
