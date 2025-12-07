// ============================================
// ARCHIVO: app.js
// DESCRIPCIÓN: Archivo JavaScript consolidado para el sistema de gestión de estudiantes y cursos
// ============================================

// ============================================
// CONFIGURACIÓN DE LA API
// ============================================
const API_BASE_URL = '/api';
const API_ENDPOINTS = {
    alumnos: `${API_BASE_URL}/alumnos`,
    cursos: `${API_BASE_URL}/cursos`
};

// ============================================
// VARIABLES GLOBALES
// ============================================
let students = [];
let courses = [];
let editingStudentId = null;
let editingCourseId = null;
let currentUser = null;

// ============================================
// FUNCIONES DE SESIÓN Y AUTENTICACIÓN
// ============================================

/**
 * Verificar sesión de usuario
 */
function checkUserSession() {
    const session = localStorage.getItem('userSession');
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(session);
}

/**
 * Verificar rol antes de mostrar sección
 */
function checkRoleAndShowSection(section) {
    const currentUser = checkUserSession();
    if (!currentUser) return;
    
    if (section === 'courses' && currentUser.rol === 'SECRETARIA') {
        showToast('No tienes permisos para gestionar cursos', 'warning');
        return;
    }
    
    showSection(section);
}

/**
 * Aplicar permisos según el rol
 */
function applyRolePermissions(userRole) {
    if (userRole === 'SECRETARIA') {
        // Ocultar sección de cursos para secretaria
        const cursosNav = document.querySelector('a[onclick="showSection(\'courses\')"]');
        if (cursosNav) {
            cursosNav.parentElement.style.display = 'none';
        }
        
        // Hacer que la card de cursos muestre mensaje en lugar de acceder
        const cursosCard = document.getElementById('cursosCard');
        if (cursosCard) {
            const cardElement = cursosCard.querySelector('.card');
            if (cardElement) {
                cardElement.style.opacity = '0.6';
                cardElement.style.cursor = 'not-allowed';
                const textElement = cursosCard.querySelector('.card-text');
                if (textElement) {
                    textElement.textContent = 'Solo consulta';
                }
            }
        }
        
        // Actualizar el mensaje de bienvenida
        const userWelcome = document.getElementById('userWelcome');
        if (userWelcome) {
            userWelcome.textContent = 'Bienvenida, Secretaria';
        }
        
        // Actualizar el texto del sidebar
        const adminTitle = document.querySelector('.sidebar h5');
        if (adminTitle) {
            adminTitle.textContent = 'Secretaria';
        }
        
        const adminSubtitle = document.querySelector('.sidebar small');
        if (adminSubtitle) {
            adminSubtitle.textContent = 'Panel de Estudiantes';
        }
    }
}

/**
 * Cerrar sesión
 */
function logout() {
    // Limpiar sesión y datos locales
    localStorage.removeItem('userSession');
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirigir al login
    window.location.replace('login.html');
}

// ============================================
// FUNCIONES DE CARGA DE DATOS
// ============================================

/**
 * Cargar datos iniciales
 */
async function loadData() {
    try {
        await Promise.all([loadStudents(), loadCourses()]);
        renderStudentsTable();
        renderCoursesTable();
        populateCourseSelect();
    } catch (error) {
        showToast('Error al cargar los datos', 'danger');
    }
}

/**
 * Cargar estudiantes desde la API
 */
async function loadStudents() {
    try {
        const response = await fetch(API_ENDPOINTS.alumnos);
        if (response.ok) {
            students = await response.json();
        } else {
            console.error('Error en respuesta de estudiantes:', response.status, response.statusText);
            students = [];
        }
    } catch (error) {
        console.error('Error loading students:', error);
        students = [];
    }
}

/**
 * Cargar cursos desde la API
 */
async function loadCourses() {
    try {
        const response = await fetch(API_ENDPOINTS.cursos);
        if (response.ok) {
            courses = await response.json();
        } else {
            console.error('Error en respuesta de cursos:', response.status, response.statusText);
            courses = [];
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        courses = [];
    }
}

// ============================================
// FUNCIONES DE NAVEGACIÓN
// ============================================

/**
 * Mostrar sección del sidebar
 */
function showSection(section) {
    try {
        // Ocultar todas las secciones
        document.querySelectorAll('[id$="-section"]').forEach(s => s.style.display = 'none');
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(section + '-section');
        if (targetSection) {
            targetSection.style.display = 'block';
        } else {
            console.error('Sección no encontrada:', section + '-section');
            return;
        }
        
        // Actualizar navegación activa
        document.querySelectorAll('.sidebar .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Encontrar y activar el enlace correcto
        const activeLink = document.querySelector(`a[onclick="showSection('${section}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    } catch (error) {
        console.error('Error al cambiar sección:', error);
    }
    
    // Cargar datos según la sección
    if (section === 'students') {
        loadCourses().then(() => {
            return loadStudents();
        }).then(() => {
            renderStudentsTable();
            populateCourseSelect();
        }).catch(error => {
            console.error('Error al cargar datos de estudiantes:', error);
        });
    } else if (section === 'courses') {
        loadCourses().then(() => {
            renderCoursesTable();
        }).catch(error => {
            console.error('Error al cargar datos de cursos:', error);
        });
    } else if (section === 'queries') {
        loadCourses().then(() => {
            populateQueryCourseSelect();
            const resultsDiv = document.getElementById('queryResults');
            if (resultsDiv) {
                resultsDiv.innerHTML = '<div class="alert alert-info text-center"><i class="bi bi-info-circle me-2"></i>Seleccione una consulta para ver los resultados.</div>';
            }
        }).catch(error => {
            console.error('Error al cargar datos de consultas:', error);
            showToast('Error al cargar consultas', 'danger');
        });
    } else if (section === 'assignment') {
        Promise.all([loadStudents(), loadCourses()]).then(() => {
            populateAssignmentSelects();
            const resultsDiv = document.getElementById('assignmentResults');
            if (resultsDiv) {
                resultsDiv.innerHTML = '<div class="alert alert-info text-center"><i class="bi bi-info-circle me-2"></i>Seleccione un estudiante y un curso para realizar la asignación.</div>';
            }
        }).catch(error => {
            console.error('Error al cargar datos de asignación:', error);
            showToast('Error al cargar datos', 'danger');
        });
    }
}

// ============================================
// FUNCIONES DE RENDERIZADO DE TABLAS
// ============================================

/**
 * Renderizar tabla de estudiantes
 */
function renderStudentsTable(studentsData = null) {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) {
        console.error('Elemento studentsTableBody no encontrado');
        return;
    }
    
    tbody.innerHTML = '';

    const dataToRender = studentsData !== null ? studentsData : students;

    if (!dataToRender || !Array.isArray(dataToRender)) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay estudiantes disponibles</td></tr>';
        return;
    }

    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No se encontraron estudiantes</td></tr>';
        return;
    }

    dataToRender.forEach(student => {
        if (!student) return;
        const courseName = student.cursoNombre || 'Sin curso';

        const row = `
            <tr>
                <td><strong>${student.estCed}</strong></td>
                <td>${student.estNom}</td>
                <td>${student.estApe}</td>
                <td>${student.estDir}</td>
                <td>${student.estTel}</td>
                <td><span class="badge bg-secondary">${courseName}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editStudent('${student.estCed}')" title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${student.estCed}')" title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

/**
 * Renderizar tabla de cursos
 */
function renderCoursesTable(coursesData = null) {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) {
        console.error('Elemento coursesTableBody no encontrado');
        return;
    }
    
    tbody.innerHTML = '';

    const dataToRender = coursesData !== null ? coursesData : courses;

    if (!dataToRender || !Array.isArray(dataToRender)) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay cursos disponibles</td></tr>';
        return;
    }

    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No se encontraron cursos</td></tr>';
        return;
    }

    dataToRender.forEach(course => {
        if (!course) return;
        const studentCount = course.estudiantes ? course.estudiantes.length : 0;

        const row = `
            <tr>
                <td>${course.curId}</td>
                <td><strong>${course.curNom}</strong></td>
                <td>${course.curDesc || 'Sin descripción'}</td>
                <td><span class="badge bg-primary">${course.curCreditos} créditos</span></td>
                <td><span class="badge bg-info">${studentCount} estudiantes</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editCourse(${course.curId})" title="Editar">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCourse(${course.curId})" title="Eliminar">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ============================================
// FUNCIONES DE POBLAR SELECTS
// ============================================

/**
 * Poblar select de cursos
 */
function populateCourseSelect() {
    const select = document.getElementById('studentCurso');
    const consultaSelect = document.getElementById('courseSelectForStudents');
    
    if (select) {
        select.innerHTML = '<option value="">Sin curso asignado</option>';
        
        if (courses && Array.isArray(courses)) {
            courses.forEach(course => {
                if (course && course.curId && course.curNom) {
                    select.innerHTML += `<option value="${course.curId}">${course.curNom}</option>`;
                }
            });
        }
    }
    
    if (consultaSelect) {
        consultaSelect.innerHTML = '<option value="">Seleccionar curso...</option>';
        
        if (courses && Array.isArray(courses)) {
            courses.forEach(course => {
                if (course && course.curId && course.curNom) {
                    consultaSelect.innerHTML += `<option value="${course.curId}">${course.curNom}</option>`;
                }
            });
        }
    }
}

/**
 * Poblar select de cursos para consultas
 */
function populateQueryCourseSelect() {
    const select = document.getElementById('courseIdForStudents');
    
    if (select && courses && Array.isArray(courses)) {
        select.innerHTML = '<option value="">Seleccione un curso</option>';
        
        courses.forEach(course => {
            if (course && course.curId && course.curNom) {
                select.innerHTML += `<option value="${course.curId}">${course.curNom} - ${course.curCreditos} créditos</option>`;
            }
        });
    }
}

/**
 * Poblar selects para asignación
 */
function populateAssignmentSelects() {
    const studentSelect = document.getElementById('assignStudentSelect');
    const courseSelect = document.getElementById('assignCourseSelect');
    
    if (studentSelect && students && Array.isArray(students)) {
        studentSelect.innerHTML = '<option value="">Seleccione un estudiante</option>';
        students.forEach(student => {
            if (student && student.estCed && student.estNom) {
                studentSelect.innerHTML += `<option value="${student.estCed}">${student.estNom} ${student.estApe} - ${student.estCed}</option>`;
            }
        });
    }
    
    if (courseSelect && courses && Array.isArray(courses)) {
        courseSelect.innerHTML = '<option value="">Seleccione un curso</option>';
        courses.forEach(course => {
            if (course && course.curId && course.curNom) {
                courseSelect.innerHTML += `<option value="${course.curId}">${course.curNom} - ${course.curCreditos} créditos</option>`;
            }
        });
    }
}

// ============================================
// FUNCIONES PARA MODALES
// ============================================

/**
 * Abrir modal de estudiante
 */
function openStudentModal(isEdit = false) {
    const modal = document.getElementById('studentModal');
    const title = document.getElementById('studentModalLabel');
    
    if (isEdit) {
        title.innerHTML = '<i class="bi bi-person-gear me-2"></i>Editar Estudiante';
    } else {
        title.innerHTML = '<i class="bi bi-person-plus-fill me-2"></i>Nuevo Estudiante';
        const form = document.getElementById('studentForm');
        if (form) form.reset();
        const studentId = document.getElementById('studentId');
        if (studentId) studentId.value = '';
        editingStudentId = null;
    }
}

/**
 * Abrir modal de curso
 */
function openCourseModal(isEdit = false) {
    const modal = document.getElementById('courseModal');
    const title = document.getElementById('courseModalLabel');
    
    if (isEdit) {
        title.innerHTML = '<i class="bi bi-book-gear me-2"></i>Editar Curso';
    } else {
        title.innerHTML = '<i class="bi bi-book-plus me-2"></i>Nuevo Curso';
        const form = document.getElementById('courseForm');
        if (form) form.reset();
        const courseId = document.getElementById('courseId');
        if (courseId) courseId.value = '';
        editingCourseId = null;
    }
}

// ============================================
// FUNCIONES CRUD DE ESTUDIANTES
// ============================================

/**
 * Editar estudiante
 */
function editStudent(cedula) {
    const student = students.find(s => s.estCed === cedula);
    if (student) {
        editingStudentId = cedula;
        document.getElementById('studentId').value = student.estCed;
        document.getElementById('studentCedula').value = student.estCed;
        document.getElementById('studentNombre').value = student.estNom;
        document.getElementById('studentApellido').value = student.estApe;
        document.getElementById('studentDireccion').value = student.estDir;
        document.getElementById('studentTelefono').value = student.estTel;
        
        const cursoSelect = document.getElementById('studentCurso');
        if (cursoSelect) {
            cursoSelect.value = student.cursoId || '';
        }
        
        openStudentModal(true);
        const modal = new bootstrap.Modal(document.getElementById('studentModal'));
        modal.show();
    }
}

/**
 * Guardar estudiante (crear o actualizar)
 */
async function saveStudent() {
    const form = document.getElementById('studentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const cursoSelect = document.getElementById('studentCurso');
    const cursoValue = cursoSelect ? cursoSelect.value : '';
    
    const cedula = document.getElementById('studentCedula').value.trim();
    const nombre = document.getElementById('studentNombre').value.trim();
    const apellido = document.getElementById('studentApellido').value.trim();
    const telefono = document.getElementById('studentTelefono').value.trim();
    
    // Validar cédula (debe tener exactamente 10 dígitos)
    if (cedula.length !== 10 || !/^\d{10}$/.test(cedula)) {
        showToast('⚠️ La cédula debe tener exactamente 10 dígitos numéricos', 'warning');
        document.getElementById('studentCedula').focus();
        return;
    }
    
    // Validar nombre (solo letras y espacios)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
        showToast('⚠️ El nombre solo debe contener letras', 'warning');
        document.getElementById('studentNombre').focus();
        return;
    }
    
    // Validar apellido (solo letras y espacios)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(apellido)) {
        showToast('⚠️ El apellido solo debe contener letras', 'warning');
        document.getElementById('studentApellido').focus();
        return;
    }
    
    // Validar teléfono (debe tener exactamente 10 dígitos)
    if (telefono.length !== 10 || !/^\d{10}$/.test(telefono)) {
        showToast('⚠️ El teléfono debe tener exactamente 10 dígitos numéricos', 'warning');
        document.getElementById('studentTelefono').focus();
        return;
    }
    
    const studentData = {
        estCed: cedula,
        estNom: nombre,
        estApe: apellido,
        estDir: document.getElementById('studentDireccion').value.trim(),
        estTel: telefono,
        curId: cursoValue !== '' ? parseInt(cursoValue) : null
    };

    try {
        let response;
        if (editingStudentId) {
            // Actualizar estudiante existente
            response = await fetch(`${API_ENDPOINTS.alumnos}/${editingStudentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });
            
            if (response.ok) {
                showToast('Estudiante actualizado correctamente', 'success');
            } else {
                throw new Error('Error al actualizar estudiante');
            }
        } else {
            // Crear nuevo estudiante
            response = await fetch(API_ENDPOINTS.alumnos, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(studentData)
            });
            
            if (response.ok) {
                showToast('Estudiante creado correctamente', 'success');
            } else {
                throw new Error('Error al crear estudiante');
            }
        }

        await loadStudents();
        renderStudentsTable();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('studentModal'));
        modal.hide();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al guardar estudiante', 'danger');
    }
}

/**
 * Eliminar estudiante
 */
async function deleteStudent(id) {
    if (confirm('¿Está seguro de que desea eliminar este estudiante?')) {
        try {
            const response = await fetch(`${API_ENDPOINTS.alumnos}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showToast('Estudiante eliminado correctamente', 'success');
                await loadStudents();
                renderStudentsTable();
            } else {
                throw new Error('Error al eliminar estudiante');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al eliminar estudiante', 'danger');
        }
    }
}

// ============================================
// FUNCIONES CRUD DE CURSOS
// ============================================

/**
 * Editar curso
 */
function editCourse(id) {
    const course = courses.find(c => c.curId === id);
    if (course) {
        editingCourseId = id;
        document.getElementById('courseId').value = course.curId;
        document.getElementById('courseNombre').value = course.curNom;
        document.getElementById('courseDescripcion').value = course.curDesc || '';
        document.getElementById('courseCreditos').value = course.curCreditos;
        
        openCourseModal(true);
        const modal = new bootstrap.Modal(document.getElementById('courseModal'));
        modal.show();
    }
}

/**
 * Guardar curso (crear o actualizar)
 */
async function saveCourse() {
    const form = document.getElementById('courseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const courseData = {
        curNom: document.getElementById('courseNombre').value,
        curDesc: document.getElementById('courseDescripcion').value,
        curCreditos: parseInt(document.getElementById('courseCreditos').value)
    };

    try {
        let response;
        if (editingCourseId) {
            // Actualizar curso existente
            response = await fetch(`${API_ENDPOINTS.cursos}/${editingCourseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });
            
            if (response.ok) {
                showToast('Curso actualizado correctamente', 'success');
            } else {
                throw new Error('Error al actualizar curso');
            }
        } else {
            // Crear nuevo curso
            response = await fetch(API_ENDPOINTS.cursos, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(courseData)
            });
            
            if (response.ok) {
                showToast('Curso creado correctamente', 'success');
            } else {
                throw new Error('Error al crear curso');
            }
        }

        await loadCourses();
        renderCoursesTable();
        populateCourseSelect();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('courseModal'));
        modal.hide();
    } catch (error) {
        console.error('Error:', error);
        showToast('Error al guardar curso', 'danger');
    }
}

/**
 * Eliminar curso
 */
async function deleteCourse(id) {
    if (confirm('¿Está seguro de que desea eliminar este curso?')) {
        try {
            const response = await fetch(`${API_ENDPOINTS.cursos}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showToast('Curso eliminado correctamente', 'success');
                await loadCourses();
                renderCoursesTable();
                populateCourseSelect();
            } else {
                throw new Error('Error al eliminar curso');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al eliminar curso', 'danger');
        }
    }
}

// ============================================
// FUNCIONES DE ASIGNACIÓN
// ============================================

/**
 * Asignar estudiante a curso
 */
async function assignStudentToCourse() {
    const studentCedula = document.getElementById('assignStudentSelect').value;
    const courseId = document.getElementById('assignCourseSelect').value;
    const resultsDiv = document.getElementById('assignmentResults');
    
    if (!studentCedula || !courseId) {
        showToast('Debe seleccionar un estudiante y un curso', 'warning');
        return;
    }
    
    try {
        // Obtener datos del estudiante actual
        const studentResponse = await fetch(`${API_ENDPOINTS.alumnos}/${studentCedula}`);
        if (!studentResponse.ok) {
            throw new Error('Estudiante no encontrado');
        }
        
        const student = await studentResponse.json();
        
        // Actualizar estudiante con nuevo curso
        const updateData = {
            estNom: student.estNom,
            estApe: student.estApe,
            estDir: student.estDir,
            estTel: student.estTel,
            curId: parseInt(courseId)
        };
        
        const updateResponse = await fetch(`${API_ENDPOINTS.alumnos}/${studentCedula}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });
        
        if (updateResponse.ok) {
            const updatedStudent = await updateResponse.json();
            const course = courses.find(c => c.curId == courseId);
            
            resultsDiv.innerHTML = `
                <div class="alert alert-success">
                    <h5><i class="bi bi-check-circle-fill me-2"></i>Asignación Exitosa</h5>
                    <p class="mb-1"><strong>Estudiante:</strong> ${updatedStudent.estNom} ${updatedStudent.estApe} (${updatedStudent.estCed})</p>
                    <p class="mb-0"><strong>Curso asignado:</strong> ${course ? course.curNom : 'Curso'}</p>
                </div>
            `;
            
            showToast('Estudiante asignado correctamente', 'success');
            
            // Limpiar selecciones
            document.getElementById('assignStudentSelect').value = '';
            document.getElementById('assignCourseSelect').value = '';
            
            // Recargar datos
            loadStudents();
        } else {
            throw new Error('Error al asignar estudiante');
        }
    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                Error al realizar la asignación. Inténtelo nuevamente.
            </div>
        `;
        showToast('Error al asignar estudiante', 'danger');
    }
}

// ============================================
// FUNCIONES DE CONSULTA
// ============================================

/**
 * Obtener estudiantes por curso
 */
async function getStudentsByCourse() {
    const cursoId = document.getElementById('courseIdForStudents').value;
    const resultsDiv = document.getElementById('queryResults');
    
    if (!cursoId) {
        showToast('Por favor, seleccione un curso', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.cursos}/${cursoId}/estudiantes`);
        if (response.ok) {
            const estudiantes = await response.json();
            
            if (estudiantes.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="alert alert-info">
                        <i class="bi bi-info-circle me-2"></i>
                        No hay estudiantes asignados a este curso.
                    </div>
                `;
            } else {
                let html = `
                    <div class="alert alert-success">
                        <h6><i class="bi bi-people-fill me-2"></i>Estudiantes en el curso (${estudiantes.length})</h6>
                        <div class="table-responsive mt-2">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Cédula</th>
                                        <th>Nombre Completo</th>
                                        <th>Teléfono</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                estudiantes.forEach(est => {
                    html += `
                        <tr>
                            <td>${est.estCed}</td>
                            <td>${est.estNom} ${est.estApe}</td>
                            <td>${est.estTel}</td>
                        </tr>
                    `;
                });
                
                html += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                resultsDiv.innerHTML = html;
            }
        } else {
            showToast('Error al consultar estudiantes del curso', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'danger');
    }
}

/**
 * Obtener curso de un estudiante
 */
async function getCourseByStudent() {
    const cedula = document.getElementById('studentCedulaForCourse').value.trim();
    const resultsDiv = document.getElementById('queryResults');
    
    if (!cedula) {
        showToast('Por favor, ingrese una cédula', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.alumnos}/${cedula}/curso`);
        if (response.ok) {
            const alumno = await response.json();
            
            if (!alumno.cursoId) {
                resultsDiv.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        El estudiante <strong>${alumno.estNom} ${alumno.estApe}</strong> no está asignado a ningún curso.
                    </div>
                `;
            } else {
                resultsDiv.innerHTML = `
                    <div class="alert alert-success">
                        <h6><i class="bi bi-book-fill me-2"></i>Información del Curso</h6>
                        <p class="mb-1"><strong>Estudiante:</strong> ${alumno.estNom} ${alumno.estApe} (${alumno.estCed})</p>
                        <p class="mb-1"><strong>Curso:</strong> ${alumno.cursoNombre}</p>
                        <p class="mb-0"><strong>Créditos:</strong> ${alumno.cursoCreditos}</p>
                    </div>
                `;
            }
        } else if (response.status === 404) {
            showToast('Estudiante no encontrado', 'danger');
            resultsDiv.innerHTML = '';
        } else {
            showToast('Error al consultar el curso del estudiante', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Error de conexión', 'danger');
    }
}

// ============================================
// FUNCIONES DE BÚSQUEDA
// ============================================

/**
 * Buscar estudiante por cédula
 */
async function searchStudentByCedula() {
    const cedula = document.getElementById('searchStudentCedula').value.trim();
    
    if (cedula === '') {
        renderStudentsTable();
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.alumnos}/buscar?cedula=${encodeURIComponent(cedula)}`);
        if (response.ok) {
            const searchResults = await response.json();
            renderStudentsTable(searchResults);
        } else {
            console.error('Error en la búsqueda de estudiantes');
            renderStudentsTable([]);
        }
    } catch (error) {
        console.error('Error:', error);
        renderStudentsTable([]);
    }
}

/**
 * Buscar curso por título
 */
async function searchCourseByTitle() {
    const titulo = document.getElementById('searchCourseTitulo').value.trim();
    
    if (titulo === '') {
        renderCoursesTable();
        return;
    }
    
    try {
        const response = await fetch(`${API_ENDPOINTS.cursos}/buscar?titulo=${encodeURIComponent(titulo)}`);
        if (response.ok) {
            const searchResults = await response.json();
            renderCoursesTable(searchResults);
        } else {
            console.error('Error en la búsqueda de cursos');
            renderCoursesTable([]);
        }
    } catch (error) {
        console.error('Error:', error);
        renderCoursesTable([]);
    }
}

/**
 * Limpiar búsqueda de estudiantes
 */
function clearStudentSearch() {
    const searchInput = document.getElementById('searchStudentCedula');
    if (searchInput) searchInput.value = '';
    renderStudentsTable();
}

/**
 * Limpiar búsqueda de cursos
 */
function clearCourseSearch() {
    const searchInput = document.getElementById('searchCourseTitulo');
    if (searchInput) searchInput.value = '';
    renderCoursesTable();
}

// ============================================
// FUNCIONES DE UI
// ============================================

/**
 * Mostrar toast notification
 */
function showToast(message, type = 'info') {
    let toastContainer = document.getElementById('toastContainer');
    
    // Crear contenedor si no existe
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastId = 'toast-' + Date.now();
    
    const bgClass = {
        'success': 'bg-success',
        'danger': 'bg-danger',
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';
    
    const toastHtml = `
        <div id="${toastId}" class="toast ${bgClass} text-white" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi bi-check-circle me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remover el toast después de que se oculte
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

/**
 * Alias para showToast (compatibilidad)
 */
function showAlert(message, type = 'danger') {
    showToast(message, type);
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializar cuando carga la página
 */
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de dashboard
    if (document.getElementById('dashboard-section')) {
        // Verificar sesión de usuario
        currentUser = checkUserSession();
        if (!currentUser) return;
        
        // Aplicar permisos según rol
        applyRolePermissions(currentUser.rol);
        
        // Mostrar dashboard principal
        document.getElementById('dashboard-section').style.display = 'block';
        
        // Cargar datos silenciosamente
        loadData().catch(error => {
            console.error('Error en la inicialización:', error);
        });
        
        // Inicializar datos de usuario en navbar
        const userWelcome = document.getElementById('userWelcome');
        if (userWelcome && !userWelcome.textContent.includes('Bienvenid')) {
            const urlParams = new URLSearchParams(window.location.search);
            const user = urlParams.get('user') || 'Usuario';
            userWelcome.textContent = `Bienvenido, ${user}`;
        }
    }
    
    // Si estamos en index.html, solo cargar datos básicos
    if (document.getElementById('tab-estudiantes')) {
        loadData().catch(error => {
            console.error('Error en la inicialización:', error);
        });
    }
});
