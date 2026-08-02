import crypto from 'node:crypto'

export const ECPAY_STAGE_URL = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
export const ECPAY_PRODUCTION_URL = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'

function urlEncodeForEcpay(value) {
  return encodeURIComponent(value).replace(/%20/g, '+')
}

export function createCheckMacValue(parameters, hashKey, hashIv) {
  const query = Object.keys(parameters)
    .filter((key) => key !== 'CheckMacValue')
    .sort()
    .map((key) => `${key}=${parameters[key]}`)
    .join('&')

  const source = `HashKey=${hashKey}&${query}&HashIV=${hashIv}`
  const encoded = urlEncodeForEcpay(source).toLowerCase()
  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase()
}

export function checkMacValueIsValid(parameters, hashKey, hashIv) {
  const received = parameters.CheckMacValue
  if (typeof received !== 'string' || received.length === 0) return false

  const expected = createCheckMacValue(parameters, hashKey, hashIv)
  const receivedBuffer = Buffer.from(received.toUpperCase())
  const expectedBuffer = Buffer.from(expected)

  return receivedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
}

export function taipeiTradeDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {})

  return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`
}

export function createMerchantTradeNo() {
  return `DON${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character])
}

export function getEcpayConfiguration(environment = process.env) {
  const required = ['ECPAY_MERCHANT_ID', 'ECPAY_HASH_KEY', 'ECPAY_HASH_IV', 'API_ORIGIN', 'SITE_ORIGIN']
  const missing = required.filter((name) => !environment[name])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  const mode = environment.ECPAY_ENV === 'production' ? 'production' : 'stage'
  const apiOrigin = environment.API_ORIGIN.replace(/\/$/, '')
  const siteOrigin = environment.SITE_ORIGIN.replace(/\/$/, '')

  return {
    apiOrigin,
    hashIv: environment.ECPAY_HASH_IV,
    hashKey: environment.ECPAY_HASH_KEY,
    merchantId: environment.ECPAY_MERCHANT_ID,
    paymentUrl: mode === 'production' ? ECPAY_PRODUCTION_URL : ECPAY_STAGE_URL,
    siteOrigin,
  }
}

export function parseBody(body) {
  if (!body) return {}
  if (Buffer.isBuffer(body)) return Object.fromEntries(new URLSearchParams(body.toString()))
  if (typeof body === 'string') return Object.fromEntries(new URLSearchParams(body))
  if (typeof body === 'object') return body
  return {}
}

export function isDonationCallback(parameters, merchantId) {
  return parameters.MerchantID === merchantId
    && typeof parameters.MerchantTradeNo === 'string'
    && parameters.MerchantTradeNo.startsWith('DON')
}
