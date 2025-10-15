import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'AI Prompt Hub'
    const description = searchParams.get('description') || 'Discover and share AI prompts'
    const category = searchParams.get('category') || ''
    const author = searchParams.get('author') || ''

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
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'white',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#10b981',
              }}
            >
              AI
            </div>
            <div
              style={{
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              Prompt Hub
            </div>
          </div>

          {/* Category Badge */}
          {category && (
            <div
              style={{
                position: 'absolute',
                top: '60px',
                right: '80px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '18px',
                fontWeight: '600',
              }}
            >
              {category}
            </div>
          )}

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            <h1
              style={{
                color: 'white',
                fontSize: title.length > 50 ? '48px' : '64px',
                fontWeight: 'bold',
                lineHeight: '1.1',
                margin: '0 0 32px 0',
                textAlign: 'center',
              }}
            >
              {title}
            </h1>
            
            {description && (
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '24px',
                  lineHeight: '1.4',
                  margin: '0 0 40px 0',
                  textAlign: 'center',
                  maxWidth: '800px',
                }}
              >
                {description.length > 120 ? description.substring(0, 120) + '...' : description}
              </p>
            )}

            {/* Author */}
            {author && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '20px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {author.charAt(0).toUpperCase()}
                </div>
                <span>by {author}</span>
              </div>
            )}
          </div>

          {/* Decorative Elements */}
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
    console.error('Error generating OG image:', e.message)
    return new Response('Failed to generate image', { status: 500 })
  }
}
