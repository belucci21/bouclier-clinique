import { QRCodeSVG } from 'qrcode.react';

export default function AppointmentQR({ appointmentId, qrCode, patientName, scheduledAt, doctorName }) {
  const checkInUrl = `${window.location.origin}/checkin/${qrCode}`;

  return (
    <div className="bg-white rounded-2xl p-6 text-center max-w-sm mx-auto">
      <div className="mb-4">
        <h3 className="text-bouclier-darker font-heading text-xl font-bold">Bouclier Clinique</h3>
        <p className="text-gray-500 text-sm">Check-in de Cita</p>
      </div>

      <div className="flex justify-center mb-4">
        <QRCodeSVG
          value={checkInUrl}
          size={200}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#1a1a1a"
        />
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <p className="font-semibold text-bouclier-darker">{patientName}</p>
        <p>{doctorName}</p>
        <p>{new Date(scheduledAt).toLocaleString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">Escanea para hacer check-in</p>
        <p className="text-xs text-gray-400 font-mono mt-1">{qrCode}</p>
      </div>
    </div>
  );
}
