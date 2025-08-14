const app = document.getElementById('app');
let isAdminMode = false;
let currentAdmin = null;
let allFolios = [];
let currentFilter = 'todas';
let currentSort = 'fecha';
let plantaFilter = 'todas';
let tipoFilter = 'todos';

function renderLogin() {
  app.innerHTML = `
    <h1>Ventanilla Capital Humano</h1>
    
    <div class="admin-toggle">
      <button onclick="toggleAdminMode()" id="adminToggle">Acceder como administrador</button>
    </div>
    
    <div class="login-container">
      <div id="loginForm">
        ${renderEmpleadoForm()}
      </div>
    </div>
  `;
}

function renderEmpleadoForm() {
  return `
    <h2>Acceso de Empleado</h2>
    <form id="empleadoForm" onsubmit="handleEmpleadoLogin(event)">
      <label>Número de empleado</label>
      <input type="number" name="numero_empleado" required placeholder="Ingresa tu número de empleado" />
      <label>Nombre completo</label>
      <input type="text" name="nombre" required placeholder="Ingresa tu nombre completo" />
      <button type="submit">Continuar al formulario</button>
    </form>
  `;
}

function renderAdminForm() {
  return `
    <h2>Acceso Administrativo</h2>
    <form id="adminForm" onsubmit="handleAdminLogin(event)">
      <label>Correo electrónico</label>
      <input type="email" name="correo" required placeholder="correo@empresa.com" autocomplete="email" />
      <label>Contraseña</label>
      <input type="password" name="contrasena" required placeholder="Tu contraseña" autocomplete="current-password" />
      <button type="submit">Acceder al panel</button>
    </form>
  `;
}

window.toggleAdminMode = function() {
  isAdminMode = !isAdminMode;
  const loginForm = document.getElementById('loginForm');
  const toggleButton = document.getElementById('adminToggle');
  
  if (isAdminMode) {
    loginForm.innerHTML = renderAdminForm();
    toggleButton.textContent = 'Acceder como empleado';
  } else {
    loginForm.innerHTML = renderEmpleadoForm();
    toggleButton.textContent = 'Acceder como administrador';
  }
};

function handleEmpleadoLogin(e) {
  e.preventDefault();
  const numero_empleado = e.target.numero_empleado.value;
  const nombre = e.target.nombre.value;
  fetch('/api/empleado-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numero_empleado, nombre })
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) renderForm(data);
      else alert(data.error || 'Error en el acceso');
    });
}

function handleAdminLogin(e) {
  e.preventDefault();
  const correo = e.target.correo.value;
  const contrasena = e.target.contrasena.value;
  fetch('/api/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena })
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) renderAdmin(data);
      else alert(data.error || 'Credenciales incorrectas');
    });
}

function renderForm(user) {
  app.innerHTML = `
    <h1>Formulario Capital Humano</h1>
    <form id="formulario" onsubmit="handleFormSubmit(event, ${JSON.stringify(user).replace(/"/g, '&quot;')})">
      <label>Planta</label>
      <select name="planta" required>
        <option value="">Selecciona una planta</option>
        <option value="Planta 1">Planta 1</option>
        <option value="Planta 2">Planta 2</option>
        <option value="Planta 4">Planta 4</option>
        <option value="Planta 6">Planta 6</option>
      </select>
      
      <label>Esquema de Pago</label>
      <select name="esquema_pago" required>
        <option value="">Selecciona esquema de pago</option>
        <option value="Semanal">Semanal</option>
        <option value="Quincenal">Quincenal</option>
      </select>
      
      <label>Tipo de solicitud</label>
      <select name="tipo_solicitud" required>
        <option value="">Selecciona tipo de solicitud</option>
        <option value="Nómina">Nómina</option>
        <option value="Vacaciones">Vacaciones</option>
        <option value="Prestaciones">Prestaciones</option>
        <option value="Préstamos">Préstamos</option>
        <option value="Pensiones">Pensiones</option>
        <option value="Categorías">Categorías</option>
        <option value="Apoyo con aplicaciones SORA/ADECAT">Apoyo con aplicaciones SORA/ADECAT</option>
        <option value="Uniforme/EPP">Uniforme/EPP</option>
        <option value="Transporte">Transporte</option>
        <option value="Otro">Otro</option>
      </select>
      
      <label>Describe tu problema / duda / inquietud de manera detallada</label>
      <textarea name="descripcion" required placeholder="Explica tu situación con el mayor detalle posible..."></textarea>
      
      <label>Prioridad</label>
      <select name="prioridad" required>
        <option value="">Selecciona prioridad</option>
        <option value="Alta">Alta</option>
        <option value="Media">Media</option>
        <option value="Baja">Baja</option>
      </select>
      
      <button type="submit">Enviar Solicitud</button>
    </form>
  `;
}

window.handleFormSubmit = function(e, user) {
  e.preventDefault();
  const form = e.target;
  const data = {
    numero_empleado: user.numero_empleado,
    nombre: user.nombre,
    planta: form.planta.value,
    esquema_pago: form.esquema_pago.value,
    tipo_solicitud: form.tipo_solicitud.value,
    descripcion: form.descripcion.value,
    prioridad: form.prioridad.value
  };
  fetch('/api/enviar-respuesta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        app.innerHTML = `
          <h1>¡Solicitud Enviada!</h1>
          <div class="login-container" style="text-align: center;">
            <h2>Folio: ${data.folio}</h2>
            <p>Tu solicitud ha sido registrada exitosamente. Recibirás una respuesta pronto.</p>
            <button onclick="location.reload()">Nueva Solicitud</button>
          </div>
        `;
      } else {
        alert(data.error || 'Error al enviar');
      }
    });
};

function renderAdmin(admin) {
  currentAdmin = admin;
  app.className = 'admin-panel';
  app.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h1>Panel de Ventanilla</h1>
      <button onclick="cerrarSesion()" class="logout-btn">Cerrar Sesión</button>
    </div>
    
    <div id="statsContainer">Cargando estadísticas...</div>
    
    <div class="filtros-container">
      <div class="filtro-grupo">
        <label><strong>Ordenar por:</strong></label>
        <select id="sortSelect" onchange="cambiarOrden(this.value)">
          <option value="fecha">Fecha</option>
          <option value="prioridad">Prioridad</option>
        </select>
      </div>
      
      <div class="filtro-grupo">
        <label><strong>Planta:</strong></label>
        <select id="plantaSelect" onchange="filtrarPorPlanta(this.value)">
          <option value="todas">Todas</option>
          <option value="Planta 1">Planta 1</option>
          <option value="Planta 2">Planta 2</option>
          <option value="Planta 4">Planta 4</option>
          <option value="Planta 6">Planta 6</option>
        </select>
      </div>
      
      <div class="filtro-grupo">
        <label><strong>Tipo:</strong></label>
        <select id="tipoSelect" onchange="filtrarPorTipo(this.value)">
          <option value="todos">Todos</option>
          <option value="Nómina">Nómina</option>
          <option value="Vacaciones">Vacaciones</option>
          <option value="Prestaciones">Prestaciones</option>
          <option value="Préstamos">Préstamos</option>
          <option value="Pensiones">Pensiones</option>
          <option value="Categorías">Categorías</option>
          <option value="Apoyo con aplicaciones SORA/ADECAT">Apoyo con aplicaciones SORA/ADECAT</option>
          <option value="Uniforme/EPP">Uniforme/EPP</option>
          <option value="Transporte">Transporte</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
    </div>
    
    <div id="adminPanel">Cargando folios...</div>
  `;
  
  cargarFolios();
}

function renderStats(respuestas) {
  const total = respuestas.length;
  const sinAtender = respuestas.filter(r => !r.Atendido).length;
  const respondidos = respuestas.filter(r => r.Atendido).length;
  
  document.getElementById('statsContainer').innerHTML = `
    <div class="stats-container">
      <div class="stat-card ${currentFilter === 'sin-atender' ? 'active' : ''}" onclick="filtrarFolios('sin-atender')" style="cursor: pointer;">
        <div class="stat-number">${sinAtender}</div>
        <div class="stat-label">Sin atender</div>
      </div>
      <div class="stat-card ${currentFilter === 'respondidos' ? 'active' : ''}" onclick="filtrarFolios('respondidos')" style="cursor: pointer;">
        <div class="stat-number">${respondidos}</div>
        <div class="stat-label">Respondidos</div>
      </div>
      <div class="stat-card ${currentFilter === 'todas' ? 'active' : ''}" onclick="filtrarFolios('todas')" style="cursor: pointer;">
        <div class="stat-number">${total}</div>
        <div class="stat-label">Totales</div>
      </div>
    </div>
  `;
}

function cargarFolios() {
  fetch('/api/admin-respuestas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUsuario: currentAdmin.idUsuario })
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        allFolios = data.respuestas;
        renderStats(allFolios);
        renderFolios(getFoliosFiltrados());
      } else {
        document.getElementById('adminPanel').innerHTML = `<p>Error al cargar folios</p>`;
      }
    });
}

function getFoliosFiltrados() {
  let folios = [...allFolios];
  
  // Filtro por estado
  if (currentFilter === 'sin-atender') {
    folios = folios.filter(f => !f.Atendido);
  } else if (currentFilter === 'respondidos') {
    folios = folios.filter(f => f.Atendido);
  }
  
  // Filtro por planta
  if (plantaFilter !== 'todas') {
    folios = folios.filter(f => f.Planta === plantaFilter);
  }
  
  // Filtro por tipo
  if (tipoFilter !== 'todos') {
    folios = folios.filter(f => f.Tipo_solicitud === tipoFilter);
  }
  
  // Ordenamiento
  if (currentSort === 'fecha') {
    folios.sort((a, b) => new Date(b.Fecha_hora) - new Date(a.Fecha_hora));
  } else if (currentSort === 'prioridad') {
    const prioridadOrden = { 'Alta': 3, 'Media': 2, 'Baja': 1 };
    folios.sort((a, b) => prioridadOrden[b.Prioridad] - prioridadOrden[a.Prioridad]);
  }
  
  return folios;
}

window.filtrarFolios = function(filtro) {
  currentFilter = filtro;
  renderStats(allFolios);
  renderFolios(getFoliosFiltrados());
};

window.cambiarOrden = function(orden) {
  currentSort = orden;
  renderFolios(getFoliosFiltrados());
};

window.filtrarPorPlanta = function(planta) {
  plantaFilter = planta;
  renderFolios(getFoliosFiltrados());
};

window.filtrarPorTipo = function(tipo) {
  tipoFilter = tipo;
  renderFolios(getFoliosFiltrados());
};

function renderFolios(respuestas) {
  if (!respuestas.length) {
    document.getElementById('adminPanel').innerHTML = '<p>No hay folios que coincidan con los filtros seleccionados.</p>';
    return;
  }
  
  const foliosHtml = respuestas.map(r => `
    <div class="folio-card">
      <div class="folio-header">
        <span class="folio-id">Folio #${r.idRespuesta}</span>
        <span class="folio-priority priority-${r.Prioridad.toLowerCase()}">${r.Prioridad}</span>
      </div>
      <div class="folio-content">
        <p><strong>Empleado:</strong> ${r.Nombre} (#${r.Numero_empleado})</p>
        <p><strong>Tipo:</strong> ${r.Tipo_solicitud}</p>
        <p><strong>Planta:</strong> ${r.Planta}</p>
        <p><strong>Fecha:</strong> ${new Date(r.Fecha_hora).toLocaleDateString()}</p>
        <p><strong>Descripción:</strong> ${r.Descripcion}</p>
        ${currentAdmin.director ? `<p><strong>Responsable:</strong> ${r.Responsable || 'Sin asignar'}</p>` : ''}
        ${r.Atendido && r.RespuestaTexto ? `<p><strong>Respuesta:</strong> ${r.RespuestaTexto}</p>` : ''}
      </div>
      <div class="folio-actions">
        ${r.Atendido 
          ? `<span class="tiempo-respuesta">Atendido en: ${r.TiempoRespuesta}</span>`
          : `<button onclick="mostrarModalAtender(${r.idRespuesta})" class="btn-atender">Atender</button>`
        }
      </div>
    </div>
  `).join('');
  
  document.getElementById('adminPanel').innerHTML = `<div class="folios-grid">${foliosHtml}</div>`;
}

window.mostrarModalAtender = function(idRespuesta) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Atender Folio #${idRespuesta}</h3>
      <form id="formAtender">
        <label>Respuesta/Solución:</label>
        <textarea name="respuesta" required placeholder="Describe la solución o respuesta proporcionada..." rows="4"></textarea>
        <div class="modal-buttons">
          <button type="button" onclick="cerrarModal()">Cancelar</button>
          <button type="submit">Guardar Respuesta</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('formAtender').onsubmit = function(e) {
    e.preventDefault();
    const respuesta = e.target.respuesta.value;
    atenderFolio(idRespuesta, respuesta);
  };
};

window.cerrarModal = function() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) modal.remove();
};

function atenderFolio(idRespuesta, respuesta) {
  fetch('/api/atender-folio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      idRespuesta, 
      respuesta, 
      idUsuario: currentAdmin.idUsuario 
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        cerrarModal();
        cargarFolios(); // Recargar folios
        alert('Folio atendido correctamente');
      } else {
        alert(data.error || 'Error al atender el folio');
      }
    });
}

// Función para cerrar sesión
window.cerrarSesion = function() {
  app.className = '';
  isAdminMode = false;
  currentAdmin = null;
  allFolios = [];
  currentFilter = 'todas';
  currentSort = 'fecha';
  plantaFilter = 'todas';
  tipoFilter = 'todos';
  renderLogin();
};

// Inicializar la aplicación
renderLogin();
