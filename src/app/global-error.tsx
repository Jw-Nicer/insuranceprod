
'use client'
 
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])
 
  return (
    <html>
      <body>
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'sans-serif'
        }}>
          <h2>Something went wrong!</h2>
          <p style={{color: '#666', margin: '8px 0 24px'}}>
            A client-side exception has occurred. Check the browser console for the stack trace.
          </p>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  )
}

    