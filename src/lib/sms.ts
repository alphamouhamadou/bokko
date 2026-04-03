// Orange SMS API client for Senegal
// Uses environment variables:
//   ORANGE_SMS_ENABLED - "true" to enable SMS sending
//   ORANGE_SMS_AUTH_HEADER - Base64 encoded "client_id:client_secret"
//   ORANGE_SMS_SENDER - Sender name (e.g. "BOKKO")
//   ORANGE_SMS_TOKEN_URL - OAuth token endpoint
//   ORANGE_SMS_API_URL - SMS sending endpoint

let cachedToken: string | null = null
let tokenExpiresAt: number = 0

function formatSenegalPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  // If already has country code, return as is
  if (digits.startsWith('221')) {
    return `+${digits}`
  }
  // Prepend +221 for 9-digit Senegal numbers
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
    throw new Error('Orange SMS: token URL or auth header not configured')
  }

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Orange SMS: token request failed with status ${response.status}`)
  }

  const data = await response.json()
  cachedToken = data.access_token
  // Set expiry 60 seconds before actual expiry for safety
  tokenExpiresAt = now + (data.expires_in - 60) * 1000

  return cachedToken!
}

export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const enabled = process.env.ORANGE_SMS_ENABLED === 'true'

  if (!enabled) {
    console.log(`[SMS DISABLED] Would send to ${phone}: ${message}`)
    return { success: true }
  }

  try {
    const token = await getAccessToken()
    const apiUrl = process.env.ORANGE_SMS_API_URL
    const sender = process.env.ORANGE_SMS_SENDER || 'BOKKO'

    if (!apiUrl) {
      throw new Error('Orange SMS: API URL not configured')
    }

    const formattedPhone = formatSenegalPhone(phone)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        outboundSMSMessageRequest: {
          address: `tel:${formattedPhone}`,
          senderAddress: `tel:${sender}`,
          senderName: sender,
          outboundSMSTextMessage: {
            message: message,
          },
        },
      }),
    })

    if (response.status === 401) {
      // Token expired, clear cache and retry once
      cachedToken = null
      tokenExpiresAt = 0
      const retryToken = await getAccessToken()
      const retryResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${retryToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          outboundSMSMessageRequest: {
            address: `tel:${formattedPhone}`,
            senderAddress: `tel:${sender}`,
            senderName: sender,
            outboundSMSTextMessage: {
              message: message,
            },
          },
        }),
      })

      if (!retryResponse.ok) {
        const errorText = await retryResponse.text()
        console.error(`Orange SMS retry failed: ${retryResponse.status} - ${errorText}`)
        return { success: false, error: `SMS retry failed: ${retryResponse.status}` }
      }

      return { success: true }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Orange SMS failed: ${response.status} - ${errorText}`)
      return { success: false, error: `SMS failed: ${response.status}` }
    }

    return { success: true }
  } catch (error: any) {
    console.error(`Orange SMS error: ${error.message}`)
    return { success: false, error: error.message }
  }
}
