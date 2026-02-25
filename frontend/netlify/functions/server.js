import serverHandler from '../../dist/server/server.js'

export const handler = async (event, context) => {
  try {
    // Create a Request object from the Netlify event
    const url = `https://${event.headers.host}${event.path}${event.rawQuery ? `?${event.rawQuery}` : ''}`
    
    const request = new Request(url, {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body && event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' ? event.body : undefined,
    })

    // Call the TanStack Start server handler
    const response = await serverHandler.default(request)
    
    // Convert Response to Netlify format
    const body = await response.text()
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: body,
    }
  } catch (error) {
    console.error('Server function error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: `
        <!DOCTYPE html>
        <html>
        <head><title>Error</title></head>
        <body>
          <h1>Server Error</h1>
          <p>${error.message}</p>
        </body>
        </html>
      `,
    }
  }
}