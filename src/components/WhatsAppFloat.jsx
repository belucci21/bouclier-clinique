import { useEffect, useState } from 'react'

const WHATSAPP_NUMBER = '522291087016'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20gustaría%20información%20sobre%20sus%20tratamientos.`

export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Contactar por WhatsApp"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" width="28" height="28">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.132 6.744 3.054 9.378L1.054 31.25l6.118-1.974A15.907 15.907 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.34 22.608c-.39 1.1-1.932 2.014-3.146 2.27-.826.176-1.904.316-5.574-1.196-4.696-1.92-7.708-6.68-7.94-7.004-.226-.324-1.856-2.472-1.856-4.714 0-2.242 1.176-3.342 1.594-3.814.39-.436.942-.56 1.254-.56.312 0 .624.002.894.016.29.012.68-.11 1.064.812.39.946 1.324 3.222 1.438 3.458.114.236.19.51.038.814-.152.314-.228.51-.456.786-.228.276-.454.486-.684.786-.206.254-.434.524-.182.962.252.436 1.12 1.85 2.402 3 1.648 1.476 3.038 1.932 3.488 2.146.35.168.746.126 1.006-.19.332-.41.74-1.094 1.156-1.77.294-.478.666-.538 1.124-.362.39.148 2.472 1.166 2.896 1.378.424.212.706.318.812.494.104.176.104 1.02-.286 2.12z"/>
      </svg>
    </a>
  )
}
