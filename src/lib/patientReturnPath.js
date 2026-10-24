// An email can restore this one known destination, never an arbitrary URL.
export const patientReturnPath = value => value === '/paciente/acceso' ? '/paciente/acceso' : '/paciente/dashboard'
