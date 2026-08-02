import {
  checkMacValueIsValid,
  getEcpayConfiguration,
  isDonationCallback,
  parseBody,
} from './_ecpay.js'

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.statusCode = 405
    response.setHeader('Allow', 'POST')
    response.end('Method Not Allowed')
    return
  }

  let config
  try {
    config = getEcpayConfiguration()
  } catch (error) {
    console.error(error)
    response.statusCode = 500
    response.end('Configuration error')
    return
  }

  const payment = parseBody(request.body)
  const isSuccessful = isDonationCallback(payment, config.merchantId)
    && checkMacValueIsValid(payment, config.hashKey, config.hashIv)
    && String(payment.RtnCode) === '1'
  const destination = `${config.siteOrigin}/?donation=${isSuccessful ? 'success' : 'failed'}`

  response.statusCode = 303
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('Location', destination)
  response.end()
}
