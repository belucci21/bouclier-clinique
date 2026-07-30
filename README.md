# Bouclier Clinique - Sistema de Gestión

Sistema completo de gestión de citas y pacientes para Bouclier Clinique.

## Stack Tecnológico

- **Frontend Dashboard:** React + Vite + Tailwind CSS + FullCalendar
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
- **Apps Móviles:** React Native + Expo
- **Dominio:** bouclier-clinique.com

## Estructura del Proyecto

```
bouclier-clinic-system/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── contexts/       # Context de autenticación
│   ├── lib/            # Cliente Supabase
│   └── pages/          # Páginas del dashboard
├── supabase/
│   └── functions/      # Edge Functions
└── public/             # Assets estáticos

bouclier-patient-app/   # App para pacientes (Expo)
bouclier-clinic-app/    # App para doctores/recepción (Expo)
```

## Configuración

### 1. Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

### 4. Build para Producción

```bash
npm run build
```

## Funcionalidades

### Dashboard Web
- ✅ Login con autenticación Supabase
- ✅ Dashboard con estadísticas
- ✅ Calendario con FullCalendar
- ✅ CRUD de pacientes
- ✅ CRUD de doctores
- ✅ Diagnósticos con códigos CIE-10
- ✅ Recetas médicas
- ✅ Generación de QR por cita
- ✅ Página de check-in pública

### App Paciente
- ✅ Login/Registro
- ✅ Próxima cita destacada
- ✅ Lista de citas
- ✅ Check-in por QR
- ✅ Push notifications

### App Clínica
- ✅ Vista del día
- ✅ Gestión de estados de cita
- ✅ Lista de pacientes
- ✅ Escáner QR
- ✅ Push notifications

### Edge Functions
- ✅ Google Calendar sync
- ✅ Send notifications

## Base de Datos

12 tablas principales:
- `profiles` - Perfiles de usuario
- `patients` - Información médica de pacientes
- `doctors` - Información de doctores
- `appointment_types` - Tipos de cita
- `availability` - Disponibilidad horaria
- `blocked_times` - Tiempos bloqueados
- `appointments` - Citas médicas
- `diagnoses` - Diagnósticos
- `prescriptions` - Recetas médicas
- `reports` - Reportes
- `invoices` - Facturas
- `notifications` - Notificaciones

## Despliegue

### Vercel/Netlify (Dashboard)
```bash
npm run build
# Subir carpeta dist/
```

### Supabase (Backend)
```bash
supabase db push
supabase functions deploy
```

### Expo (Apps Móviles)
```bash
cd bouclier-patient-app
eas build --platform ios
eas build --platform android
```

## Soporte

- Email: soporte@bouclier-clinique.com
- WhatsApp: +52 229 108 7016
