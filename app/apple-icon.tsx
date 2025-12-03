import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
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
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -4,
          borderRadius: 24,
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


