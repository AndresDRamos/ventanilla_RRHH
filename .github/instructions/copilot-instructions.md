# Copilot Instructions - Sistema de Cuestionarios RRHH

## Architecture Overview
This is a full-stack HR ticket system with dual-role access (employees and administrators) built with Express.js backend and vanilla JavaScript frontend.

**Core Components:**
- `src/server.js` - Express server with ES modules, MSSQL integration, and REST API
- `src/public/main.js` - Single-page application with role-based rendering
- `src/public/style.css` - CSS-only styling with tabbed interface and priority badges
- Database: MSSQL Server on private network (192.168.4.5)

## Key Patterns & Conventions

### Frontend Architecture
- **Single-page app with state management:** All views rendered dynamically via `renderLogin()`, `renderForm()`, `renderAdmin()`
- **Global window functions:** UI handlers exposed as `window.functionName` for HTML onclick events
- **State variables:** `isAdminMode`, `currentAdmin`, `allFolios`, filter states managed globally
- **Dual-theme system:** CSS classes `.employee-theme` and `.admin-theme` for visual distinction

### Backend Patterns
- **ES modules with top-level await:** Uses `import` syntax, no CommonJS
- **Hardcoded assignment matrix:** `asignacionMatriz` object maps request types to responsible user IDs by plant
- **Director special privileges:** User ID 11 has access to all tickets, others see only assigned ones
- **Database connection pattern:** `getDbConnection()` helper with connection pooling

### Database Schema
```sql
-- Core tables used:
CapitalHumano.Ventanilla_respuestas  -- Main tickets
CapitalHumano.Responsable_Folio      -- Ticket assignments  
CapitalHumano.Respuesta_Folio        -- Admin responses
Admin.Usuarios                       -- Administrator accounts
```

## Development Workflow

### Local Development
```bash
npm run dev          # Nodemon with src/ watching
npm start           # Production mode
iniciar-servidor.bat # Windows script launcher
```

### Database Configuration
- Connection in `src/server.js` (hardcoded credentials - use .env in production)
- Private network dependency: 192.168.4.5 MSSQL server
- Department filter: Only idDepartamento = 8 users can access admin panel

### Priority System
Three-tier priority with visual indicators:
- `.priority-alta` (red) - High priority
- `.priority-media` (yellow) - Medium priority  
- `.priority-baja` (green) - Low priority

## API Endpoints
- `POST /api/empleado-login` - No DB validation, accepts any employee data
- `POST /api/admin-login` - MSSQL authentication with department check
- `POST /api/enviar-respuesta` - Creates ticket and auto-assigns based on request type + plant
- `POST /api/admin-respuestas` - Returns tickets (all for director, assigned for others)
- `POST /api/atender-folio` - Marks ticket as resolved with response

## File-Specific Guidelines

### When editing `src/server.js`:
- Use parameterized queries for all database operations
- Follow the existing auto-assignment pattern in `asignacionMatriz`
- Maintain ES module imports

### When editing `src/public/main.js`:
- Keep global state variables at top level
- Use `window.functionName` for event handlers
- Maintain the render function pattern (renderLogin, renderForm, renderAdmin)
- Filter operations should update `getFoliosFiltrados()` and re-render

### When editing `src/public/style.css`:
- Priority badges use absolute positioning in `.folio-card`
- Maintain `.employee-theme` and `.admin-theme` distinction
- Grid layouts: `.folios-grid` with responsive breakpoints
- Tab system uses flexbox with `.tab.active` states

### Database Changes:
- New request types must be added to `asignacionMatriz` in server.js
- Plant additions require updating both frontend selects and assignment matrix
- User management happens in Admin.Usuarios table

## Testing Strategy
- No automated tests - manual testing workflow
- Test both employee and admin flows
- Verify auto-assignment logic works correctly
- Check responsive design on different screen sizes

## Deployment Notes
- Local server deployment only (Windows environment)
- MSSQL dependency requires VPN/local network access
- Use `actualizar-desde-github.bat` for production updates
- Environment variables should move to .env for production
