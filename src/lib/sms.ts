import https from 'https'

function fetchDirect(url: string, options: { method: string; headers: Record<string, string>; body?: string }, timeout = 30000): Promise<{ status: number; text: () => Promise<string>; json: () => Promise<any> }> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url)
    const req = https.request({
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method,
      headers: options.headers,
      timeout: timeout,
    }, (res) => {
      let data = ''
      res.on('data', (chunk: Buffer) => data += chunk.toString())
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data)),
        })
      })
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout after ' + timeout + 'ms'))
    })
    if (options.body) req.write(options.body)
    req.end()
  })
}

let cachedToken: string | null = null
let tokenExpiresAt: number = 0

function formatSenegalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('221')) {
    return `+${digits}`
  }
  return `+221${digits}`
}

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && tokenExpiresAt > now) {
    return cachedToken
  }

  const tokenUrl = process.env.ORANGE_SMS_TOKEN_URL
  const authHeader = process.env.ORANGE_SMS_AUTH_HEADER

  if (!tokenUrl || !authHeader) {
    throw new Error('Orange SMS: not configured')
  }

  console.log(`[SMS] Requesting token from ${tokenUrl}...`)
  const response = await fetchDirect(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (response.status !== 200) {
    const errText = await response.text()
    throw new Error(`Orange SMS: token failed (${response.status}) - ${errText}`)
  }

  const data = await response.json()
  cachedToken = data.access_token
  tokenExpiresAt = now + (data.expires_in - 60) * 1000
  console.log(`[SMS] Token obtained successfully`)
  return cachedToken!
}

export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const enabled = process.env.ORANGE_SMS_ENABLED === 'true'

  if (!enabled) {
    console.log(`[SMS DISABLED] Would send to ${phone}: ${message}`)
    return { success: true }
  }

  console.log(`[SMS] Sending SMS to ${phone}...`)

  try {
    const token = await getAccessToken()
    const apiUrl = process.env.ORANGE_SMS_API_URL
    const senderPhone = process.env.ORANGE_SMS_SENDER_PHONE
    const senderName = process.env.ORANGE_SMS_SENDER_NAME || 'BOKKO'

    if (!apiUrl || !senderPhone) {
      throw new Error('Orange SMS: missing config')
    }

    const formattedPhone = formatSenegalPhone(phone)

    const response = await fetchDirect(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        outboundSMSMessageRequest: {
          address: `tel:${formattedPhone}`,
          senderAddress: `tel:${senderPhone}`,
          senderName: senderName,
          outboundSMSTextMessage: {
            message: message,
          },
        },
      }),
    })
    const responseBody = await response.text()
    console.log(`[SMS] Response: ${responseBody}`)
    if (response.status === 401) {
      cachedToken = null
      tokenExpiresAt = 0
      console.log(`[SMS] Token expired, retrying...`)
      const retryToken = await getAccessToken()
      const retryResponse = await fetchDirect(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${retryToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outboundSMSMessageRequest: {
            address: `tel:${formattedPhone}`,
            senderAddress: `tel:${senderPhone}`,
            senderName: senderName,
            outboundSMSTextMessage: {
              message: message,
            },
          },
        }),
      })

      if (retryResponse.status !== 200 && retryResponse.status !== 201) {
        const errorText = await retryResponse.text()
        console.error(`Orange SMS retry failed: ${retryResponse.status} - ${errorText}`)
        return { success: false, error: `SMS retry failed: ${retryResponse.status}` }
      }
      console.log(`[SMS] Sent successfully (retry)`)
      return { success: true }
    }

    if (response.status !== 200 && response.status !== 201) {
      const errorText = await response.text()
      console.error(`Orange SMS failed: ${response.status} - ${errorText}`)
      return { success: false, error: `SMS failed: ${response.status}` }
    }
    
    console.log(`[SMS] Sent successfully to ${phone}`)
    console.log(`[SMS] Response status: ${response.status}`)
    return { success: true }
  } catch (error: any) {
    console.error(`Orange SMS error: ${error.message}`)
    return { success: false, error: error.message }
  }
}