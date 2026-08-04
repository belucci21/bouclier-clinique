# Bouclier Dermatología — enlaces del sistema

## Plataformas

| Plataforma | URL | Audiencia |
|---|---|---|
| Sitio público | https://bouclier-clinique.com | Pacientes y público general |
| Dashboard | https://bouclier-clinic-system.vercel.app | Personal autorizado |
| Reserva | https://bouclier-clinique.com/citas | Pacientes |

## Aplicaciones

- Paciente: paquete `com.bouclier.patient`; distribución pública pendiente.
- Clínica: paquete `com.bouclier.clinic`; distribución pública pendiente.
- Desarrollo: ejecutar `npx expo start` dentro del repositorio correspondiente.

Las credenciales de prueba, acceso de personal y recuperación de cuentas se gestionan fuera del repositorio mediante el gestor de secretos autorizado. No documentar contraseñas, tokens ni cuentas maestras en archivos versionados.

## Repositorios

| Repositorio | Rama | Contenido |
|---|---|---|
| [bouclier-clinique](https://github.com/belucci21/bouclier-clinique) | `master` | Sitio público |
| [bouclier-clinique](https://github.com/belucci21/bouclier-clinique) | `main` | Dashboard y funciones |
| [bouclier-patient-app](https://github.com/belucci21/bouclier-patient-app) | `main` | App paciente |
| [bouclier-clinic-app](https://github.com/belucci21/bouclier-clinic-app) | `main` | App clínica |

## Infraestructura

- Supabase: proyecto `rmcsgelrzrupwjbqbdsr`.
- Clínica: Torre EXERTIA, oficinas 704 y 706, Boca del Río, Veracruz.
- Contacto de citas: +52 229 108 7016.

Antes de producción deben rotarse todas las credenciales que hayan sido compartidas por canales no seguros, incluida la clave secreta live de Stripe expuesta durante el desarrollo.
