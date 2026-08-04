import { useContext } from 'react'
import { PatientAuthContext } from './patientAuthContext.js'

export function usePatientAuth() {
  return useContext(PatientAuthContext)
}
