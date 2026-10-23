// Clinical identification only. A building credential must come from Hik-Connect.
export async function loadClinicalQrIdentity({ accessToken, userId, fetchImpl = fetch, signal }) {
  if (!accessToken || !userId) throw new Error('Vuelve a iniciar sesión para consultar tu identificación.')
  const response = await fetchImpl('https://api.bouclier-clinique.com/api/clinical/me', {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }, cache: 'no-store', signal,
  })
  if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('No se pudo verificar tu identificación clínica. Inténtalo de nuevo.')
  const { profile } = await response.json()
  if (!response.ok || profile?.authUserId !== userId || profile.role !== 'patient' || !profile.linked || !/^[1-9]\d*$/.test(profile.clinicalId || '')) {
    throw new Error('La clínica debe verificar el vínculo de tu cuenta con tu expediente. Contacta con recepción.')
  }
  return { fullName: profile.fullName, payload: JSON.stringify({ type: 'bouclier_patient_checkin', patientId: profile.clinicalId,
    appointmentId: null, qrCode: `MYSQL-PAT-${profile.clinicalId}`, issuedAt: new Date().toISOString() }) }
}
