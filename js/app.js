// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    initForm();
    setupEventListeners();
});

// ===== INICIALIZAR FORMULARIO =====
function initForm() {
    // Generar checkboxes de características
    const caracteristicasGroup = document.getElementById('caracteristicasGroup');
    CARACTERISTICAS_OPTIONS.forEach(option => {
        caracteristicasGroup.appendChild(createCheckboxItem(option, 'caracteristicas'));
    });

    // Generar checkboxes de sospecha
    const sospechaGroup = document.getElementById('sospechaGroup');
    SOSPECHA_OPTIONS.forEach(option => {
        sospechaGroup.appendChild(createCheckboxItem(option, 'sospecha'));
    });

    // Establecer fecha máxima como hoy
    const fechaIngreso = document.getElementById('fecha_ingreso');
    fechaIngreso.max = new Date().toISOString().split('T')[0];

    // Cargar nombre guardado (si existe)
    const savedName = localStorage.getItem('quien_registra');
    if (savedName) {
        document.getElementById('quien_registra').value = savedName;
    }
}

// ===== CREAR ITEM DE CHECKBOX =====
function createCheckboxItem(option, groupName) {
    const label = document.createElement('label');
    label.className = 'checkbox-item';
    label.innerHTML = `
        <input type="checkbox" name="${groupName}" value="${option.value}">
        <span>${option.label}</span>
    `;

    // Toggle selección visual
    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', function() {
        label.classList.toggle('selected', this.checked);
    });

    return label;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Calcular días de estancia cuando cambia la fecha
    document.getElementById('fecha_ingreso').addEventListener('change', calcularDiasEstancia);

    // Envío del formulario
    document.getElementById('reporteForm').addEventListener('submit', handleSubmit);

    // Validación en tiempo real
    const requiredInputs = document.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

// ===== CALCULAR DÍAS DE ESTANCIA =====
function calcularDiasEstancia() {
    const fechaIngreso = document.getElementById('fecha_ingreso').value;
    const diasEstanciaBox = document.getElementById('diasEstanciaBox');
    const diasEstanciaSpan = document.getElementById('diasEstancia');

    if (fechaIngreso) {
        const ingreso = new Date(fechaIngreso);
        const hoy = new Date();
        ingreso.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);

        const diffTime = hoy - ingreso;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        diasEstanciaSpan.textContent = diffDays;
        diasEstanciaBox.style.display = 'block';

        // Advertencia si es menos de 48 horas
        if (diffDays < 2) {
            diasEstanciaBox.style.borderLeftColor = 'var(--warning)';
            diasEstanciaBox.querySelector('p').innerHTML = `
                Días de estancia: <span class="dias-estancia">${diffDays}</span>
                <br><small style="color: var(--warning);">⚠️ Menos de 48 horas de hospitalización</small>
            `;
        } else {
            diasEstanciaBox.style.borderLeftColor = 'var(--primary)';
            diasEstanciaBox.querySelector('p').innerHTML = `
                Días de estancia hospitalaria: <span class="dias-estancia">${diffDays}</span>
            `;
        }
    } else {
        diasEstanciaBox.style.display = 'none';
    }
}

// ===== VALIDAR CAMPO =====
function validateField(field) {
    const errorMsg = field.parentElement.querySelector('.error-message');

    if (!field.value.trim()) {
        field.classList.add('error');
        if (errorMsg) errorMsg.classList.add('show');
        return false;
    } else {
        field.classList.remove('error');
        if (errorMsg) errorMsg.classList.remove('show');
        return true;
    }
}

// ===== VALIDAR CHECKBOXES =====
function validateCheckboxGroup(groupName, errorId) {
    const checkboxes = document.querySelectorAll(`input[name="${groupName}"]:checked`);
    const errorMsg = document.getElementById(errorId);

    if (checkboxes.length === 0) {
        errorMsg.classList.add('show');
        return false;
    } else {
        errorMsg.classList.remove('show');
        return true;
    }
}

// ===== VALIDAR FORMULARIO COMPLETO =====
function validateForm() {
    let isValid = true;

    // Validar campos de texto
    const requiredInputs = document.querySelectorAll('input[required], textarea[required]');
    requiredInputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Validar checkboxes
    if (!validateCheckboxGroup('caracteristicas', 'caracteristicasError')) {
        isValid = false;
    }
    if (!validateCheckboxGroup('sospecha', 'sospechaError')) {
        isValid = false;
    }

    return isValid;
}

// ===== OBTENER VALORES SELECCIONADOS =====
function getSelectedValues(groupName) {
    const checkboxes = document.querySelectorAll(`input[name="${groupName}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// ===== MANEJAR ENVÍO =====
async function handleSubmit(e) {
    e.preventDefault();

    // Validar
    if (!validateForm()) {
        showAlert('Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    // Mostrar loading
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loading = submitBtn.querySelector('.loading');

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    loading.classList.add('show');

    // Recopilar datos
    const formData = {
        cama: document.getElementById('servicio').value,
        nombre_paciente: document.getElementById('nombre_paciente').value.trim(),
        identificacion: document.getElementById('identificacion').value.trim(),
        fecha_ingreso: document.getElementById('fecha_ingreso').value,
        caracteristicas: getSelectedValues('caracteristicas'),
        sospecha_deterioro: getSelectedValues('sospecha'),
        descripcion_evento: document.getElementById('descripcion_evento').value.trim(),
        quien_registra: document.getElementById('quien_registra').value.trim(),
        estado: 'pendiente'
    };

    // Guardar nombre para futuros usos
    localStorage.setItem('quien_registra', formData.quien_registra);

    try {
        // Enviar a Supabase
        const { data, error } = await supabaseClient
            .from('reportes_iaas')
            .insert([formData])
            .select();

        if (error) throw error;

        // Mostrar modal de éxito
        document.getElementById('successModal').classList.add('show');

    } catch (error) {
        console.error('Error al enviar:', error);
        showAlert('Error al enviar el reporte. Por favor intente nuevamente.', 'error');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        btnText.style.display = 'inline';
        loading.classList.remove('show');
    }
}

// ===== MOSTRAR ALERTA =====
function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type} show`;

    // Scroll al inicio para ver el mensaje
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        alertDiv.classList.remove('show');
    }, 5000);
}

// ===== CERRAR MODAL Y RESETEAR =====
function closeModalAndReset() {
    document.getElementById('successModal').classList.remove('show');

    // Resetear formulario pero mantener quien_registra
    const quienRegistra = document.getElementById('quien_registra').value;
    document.getElementById('reporteForm').reset();
    document.getElementById('quien_registra').value = quienRegistra;

    // Resetear checkboxes visuales
    document.querySelectorAll('.checkbox-item').forEach(item => {
        item.classList.remove('selected');
    });

    // Ocultar días de estancia
    document.getElementById('diasEstanciaBox').style.display = 'none';

    // Scroll al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
