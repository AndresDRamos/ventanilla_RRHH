import express from 'express';
import bodyParser from 'body-parser';
import sql from 'mssql';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'src', 'public')));

const dbConfig = {
  user: 'andres',
  password: 'fhr390##1xv',
  server: '192.168.4.5',
  database: 'WaPP',
  options: {
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Simple health check
app.get('/api/ping', (req, res) => {
  res.json({ ok: true });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'src', 'public', 'index.html'));
});

// TODO: Implement login and form endpoints
// Asignación automática según matriz
const asignacionMatriz = {
  'Nómina':     { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 },
  'Vacaciones': { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 },
  'Prestaciones': { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 },
  'Préstamos': { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 },
  'Pensiones': { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 },
  'Categorías': { 'Planta 1': 27, 'Planta 2': 27, 'Planta 4': 27, 'Planta 6': 27 },
  'Apoyo con aplicaciones SORA/ADECAT': { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 },
  'Uniforme/EPP': { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 },
  'Transporte': { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 },
  'Otro': { 'Planta 1': 39, 'Planta 2': 40, 'Planta 4': 39, 'Planta 6': 39 }
};

// Función helper para conectar a la base de datos
async function getDbConnection() {
  try {
    let pool = await sql.connect(dbConfig);
    return pool;
  } catch (err) {
    console.error('Error de conexión a la base de datos:', err);
    throw err;
  }
}

// Endpoint para login empleado
app.post('/api/empleado-login', async (req, res) => {
  const { numero_empleado, nombre } = req.body;
  
  // Validación simple de campos requeridos
  if (!numero_empleado || !nombre) {
    return res.json({ ok: false, error: 'Número de empleado y nombre son requeridos' });
  }
  
  // Sin validación de base de datos, simplemente acepta los datos
  res.json({ ok: true, numero_empleado, nombre });
});

// Endpoint para login administrador
app.post('/api/admin-login', async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const pool = await getDbConnection();
    const result = await pool.request()
      .input('correo', sql.NVarChar, correo)
      .input('contrasena', sql.NVarChar, contrasena)
      .query('SELECT idUsuario, Nombre, idDepartamento FROM Admin.Usuarios WHERE Correo = @correo AND Contraseña = @contrasena AND idDepartamento = 8');
    if (result.recordset.length) {
      const admin = result.recordset[0];
      res.json({ ok: true, idUsuario: admin.idUsuario, nombre: admin.Nombre, director: admin.idUsuario == 11 });
    } else {
      res.json({ ok: false, error: 'Credenciales incorrectas' });
    }
  } catch (err) {
    console.error('Error en admin-login:', err);
    res.json({ ok: false, error: 'Error de conexión' });
  }
});

// Endpoint para guardar respuesta y asignar responsable
app.post('/api/enviar-respuesta', async (req, res) => {
  const { numero_empleado, nombre, planta, esquema_pago, tipo_solicitud, descripcion, prioridad } = req.body;
  try {
    const pool = await getDbConnection();
    // Insertar respuesta
    const fecha = new Date();
    const insert = await pool.request()
      .input('fecha', sql.DateTime, fecha)
      .input('nombre', sql.NVarChar, nombre)
      .input('numero_empleado', sql.Int, numero_empleado)
      .input('planta', sql.NVarChar, planta)
      .input('esquema_pago', sql.NVarChar, esquema_pago)
      .input('tipo_solicitud', sql.NVarChar, tipo_solicitud)
      .input('descripcion', sql.NVarChar, descripcion)
      .input('prioridad', sql.NVarChar, prioridad)
      .query('INSERT INTO CapitalHumano.Ventanilla_respuestas (Fecha_hora, Email, Nombre, Numero_empleado, Planta, Esquema_pago, Tipo_solicitud, Descripcion, Prioridad) VALUES (@fecha, \'\', @nombre, @numero_empleado, @planta, @esquema_pago, @tipo_solicitud, @descripcion, @prioridad); SELECT SCOPE_IDENTITY() AS idRespuesta;');
    const idRespuesta = insert.recordset[0].idRespuesta;
    // Asignación automática
    const idUsuario = asignacionMatriz[tipo_solicitud]?.[planta] || 39;
    await pool.request()
      .input('idRespuesta', sql.Int, idRespuesta)
      .input('idUsuario', sql.Int, idUsuario)
      .query('INSERT INTO CapitalHumano.Responsable_Folio (idRespuesta, idUsuario) VALUES (@idRespuesta, @idUsuario)');
    res.json({ ok: true, folio: idRespuesta });
  } catch (err) {
    console.error('Error al guardar respuesta:', err);
    res.json({ ok: false, error: 'Error al guardar respuesta' });
  }
});

// Endpoint para panel administrador (ver respuestas y responsable)
app.post('/api/admin-respuestas', async (req, res) => {
  const { idUsuario } = req.body;
  try {
    const pool = await getDbConnection();
    
    let query;
    if (idUsuario == 11) {
      // El director (idUsuario = 11) ve todos los folios
      query = `
        SELECT r.idRespuesta, r.Fecha_hora, r.Nombre, r.Numero_empleado, r.Tipo_solicitud, r.Planta, r.Prioridad, r.Descripcion,
          (SELECT u.Nombre FROM Admin.Usuarios u INNER JOIN CapitalHumano.Responsable_Folio rf ON rf.idUsuario = u.idUsuario WHERE rf.idRespuesta = r.idRespuesta) AS Responsable,
          CASE WHEN EXISTS(SELECT 1 FROM CapitalHumano.Respuesta_Folio WHERE idRespuesta = r.idRespuesta) THEN 1 ELSE 0 END AS Atendido,
          rf_resp.fechaRespuesta,
          rf_resp.respuesta AS RespuestaTexto,
          CASE 
            WHEN rf_resp.fechaRespuesta IS NOT NULL THEN 
              CAST(DATEDIFF(HOUR, r.Fecha_hora, rf_resp.fechaRespuesta) AS VARCHAR) + ' horas ' + 
              CAST(DATEDIFF(MINUTE, r.Fecha_hora, rf_resp.fechaRespuesta) % 60 AS VARCHAR) + ' min'
            ELSE NULL 
          END AS TiempoRespuesta
        FROM CapitalHumano.Ventanilla_respuestas r
        LEFT JOIN CapitalHumano.Respuesta_Folio rf_resp ON rf_resp.idRespuesta = r.idRespuesta
        ORDER BY r.idRespuesta DESC
      `;
    } else {
      // Los demás administradores solo ven sus folios asignados
      query = `
        SELECT r.idRespuesta, r.Fecha_hora, r.Nombre, r.Numero_empleado, r.Tipo_solicitud, r.Planta, r.Prioridad, r.Descripcion,
          (SELECT u.Nombre FROM Admin.Usuarios u INNER JOIN CapitalHumano.Responsable_Folio rf ON rf.idUsuario = u.idUsuario WHERE rf.idRespuesta = r.idRespuesta) AS Responsable,
          CASE WHEN EXISTS(SELECT 1 FROM CapitalHumano.Respuesta_Folio WHERE idRespuesta = r.idRespuesta) THEN 1 ELSE 0 END AS Atendido,
          rf_resp.fechaRespuesta,
          rf_resp.respuesta AS RespuestaTexto,
          CASE 
            WHEN rf_resp.fechaRespuesta IS NOT NULL THEN 
              CAST(DATEDIFF(HOUR, r.Fecha_hora, rf_resp.fechaRespuesta) AS VARCHAR) + ' horas ' + 
              CAST(DATEDIFF(MINUTE, r.Fecha_hora, rf_resp.fechaRespuesta) % 60 AS VARCHAR) + ' min'
            ELSE NULL 
          END AS TiempoRespuesta
        FROM CapitalHumano.Ventanilla_respuestas r
        INNER JOIN CapitalHumano.Responsable_Folio rf ON rf.idRespuesta = r.idRespuesta
        LEFT JOIN CapitalHumano.Respuesta_Folio rf_resp ON rf_resp.idRespuesta = r.idRespuesta
        WHERE rf.idUsuario = @idUsuario
        ORDER BY r.idRespuesta DESC
      `;
    }
    
    const result = await pool.request()
      .input('idUsuario', sql.Int, idUsuario)
      .query(query);
    
    res.json({ ok: true, respuestas: result.recordset });
  } catch (err) {
    console.error('Error al consultar respuestas:', err);
    res.json({ ok: false, error: 'Error al consultar respuestas' });
  }
});

// Endpoint para atender un folio
app.post('/api/atender-folio', async (req, res) => {
  const { idRespuesta, respuesta, idUsuario } = req.body;
  try {
    const pool = await getDbConnection();
    const fechaRespuesta = new Date();
    
    await pool.request()
      .input('idRespuesta', sql.Int, idRespuesta)
      .input('fechaRespuesta', sql.DateTime, fechaRespuesta)
      .input('respuesta', sql.NVarChar, respuesta)
      .query('INSERT INTO CapitalHumano.Respuesta_Folio (idRespuesta, fechaRespuesta, respuesta) VALUES (@idRespuesta, @fechaRespuesta, @respuesta)');
    
    res.json({ ok: true, mensaje: 'Folio atendido correctamente' });
  } catch (err) {
    console.error('Error al atender folio:', err);
    res.json({ ok: false, error: 'Error al atender el folio' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
