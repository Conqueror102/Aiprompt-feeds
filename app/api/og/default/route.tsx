import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'AI Prompt Hub'
    const description = searchParams.get('description') || 'Discover and share AI prompts for ChatGPT, Gemini, and more'

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px',
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            }}
          />

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              zIndex: 1,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  background: 'white',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                }}
              >
                AI
              </div>
              <div
                style={{
                  color: 'white',
                  fontSize: '48px',
                  fontWeight: 'bold',
                }}
              >
                Prompt Hub
              </div>
            </div>

            <h1
              style={{
                color: 'white',
                fontSize: title.length > 30 ? '48px' : '64px',
                fontWeight: 'bold',
                lineHeight: '1.1',
                margin: '0 0 32px 0',
                textAlign: 'center',
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>
            
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '28px',
                lineHeight: '1.4',
                margin: '0',
                textAlign: 'center',
                maxWidth: '800px',
              }}
            >
              {description}
            </p>
          </div>

          {/* Bottom Accent */}
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '8px',
              background: 'linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #f59e0b)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.error('Error generating default OG image:', e.message)
    return new Response('Failed to generate image', { status: 500 })
  }
}
