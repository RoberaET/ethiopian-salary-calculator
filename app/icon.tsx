import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 50%, #6366f1 100%)',
          color: 'white',
          fontSize: 260,
          fontWeight: 800,
          letterSpacing: -8,
        }}
      >
        ET
      </div>
    ),
    {
      ...size,
    }
  )
}


