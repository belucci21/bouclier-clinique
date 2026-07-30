import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRModal({ appointment, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!appointment) return null;

  const checkInUrl = `${window.location.origin}/checkin/${appointment.qr_code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      toast.success('Link copiado');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('appointment-qr');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 400, 400);
      ctx.drawImage(img, 50, 50, 300, 300);

      const link = document.createElement('a');
      link.download = `cita-${appointment.qr_code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR descargado');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-bouclier-gray border border-[#333] rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-heading text-white">Código QR - Check-in</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-xl p-4 flex justify-center mb-4">
            <QRCodeSVG
              id="appointment-qr"
              value={checkInUrl}
              size={220}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
            />
          </div>

          <div className="text-center mb-4">
            <p className="text-white font-medium">{appointment.profiles?.full_name || 'Paciente'}</p>
            <p className="text-gray-400 text-sm">
              {new Date(appointment.scheduled_at).toLocaleString('es-MX', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="bg-bouclier-darker rounded-lg p-3 mb-4">
            <p className="text-gray-500 text-xs text-center mb-2">Link de check-in:</p>
            <p className="text-bouclier-gold text-xs text-center font-mono break-all">{checkInUrl}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 btn-outline text-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar Link'}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 btn-gold text-sm"
            >
              <Download className="w-4 h-4" />
              Descargar QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
