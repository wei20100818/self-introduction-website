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
  if (!isDonationCallback(payment, config.merchantId) || !checkMacValueIsValid(payment, config.hashKey, config.hashIv)) {
    response.statusCode = 400
    response.end('Invalid payment notification')
    return
  }

  console.info('Verified ECPay donation notification', {
    amount: payment.TradeAmt,
    merchantTradeNo: payment.MerchantTradeNo,
    paymentType: payment.PaymentType,
    rtnCode: payment.RtnCode,
    tradeNo: payment.TradeNo,
  })

  response.statusCode = 200
  response.setHeader('Content-Type', 'text/plain; charset=utf-8')
  response.end('1|OK')
}
