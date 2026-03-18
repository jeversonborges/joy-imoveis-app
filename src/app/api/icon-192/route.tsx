import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pin shape */}
        <svg width="100" height="124" viewBox="0 0 56 70" fill="none">
          <ellipse cx="28" cy="66" rx="10" ry="3.5" fill="rgba(255,255,255,0.2)" />
          <path
            d="M28 2C18.06 2 10 10.06 10 20c0 13.5 18 44 18 44s18-30.5 18-44C46 10.06 37.94 2 28 2z"
            fill="white"
          />
          <circle cx="28" cy="20" r="11" fill="#2563eb" />
          <path d="M28 12l-7 6h2v7h10v-7h2l-7-6z" fill="white" />
          <rect x="25.5" y="20" width="5" height="5" rx="0.75" fill="#2563eb" />
        </svg>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
