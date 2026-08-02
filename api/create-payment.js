import {
  createCheckMacValue,
  createMerchantTradeNo,
  escapeHtml,
  getEcpayConfiguration,
  parseBody,
  taipeiTradeDate,
} from './_ecpay.js'

const MINIMUM_AMOUNT = 10
const MAXIMUM_AMOUNT = 1_000_000

function invalidRequest(response, message) {
  response.statusCode = 400
  response.setHeader('Content-Type', 'text/plain; charset=utf-8')
  response.end(message)
}

function renderPaymentForm(response, action, parameters) {
  const inputs = Object.entries(parameters)
    .map(([name, value]) => `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}">`)
    .join('')

  response.statusCode = 200
  response.setHeader('Content-Type', 'text/html; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>前往付款頁面</title></head><body><p>正在前往安全付款頁面…</p><form id="ecpay-payment" method="post" action="${escapeHtml(action)}">${inputs}</form><script>document.getElementById('ecpay-payment').submit()</script></body></html>`)
}

export default function handler(request, response) {
  if (request.method !== 'POST') {
    response.statusCode = 405
    response.setHeader('Allow', 'POST')
    response.end('Method Not Allowed')
    return
  }

  const amount = Number(parseBody(request.body).amount)
  if (!Number.isSafeInteger(amount) || amount < MINIMUM_AMOUNT || amount > MAXIMUM_AMOUNT) {
    invalidRequest(response, `贊助金額須為 ${MINIMUM_AMOUNT} 至 ${MAXIMUM_AMOUNT.toLocaleString('zh-TW')} 元的整數。`)
    return
  }

  let config
  try {
    config = getEcpayConfiguration()
  } catch (error) {
    console.error(error)
    response.statusCode = 500
    response.end('Payment service is not configured.')
    return
  }

  const parameters = {
    MerchantID: config.merchantId,
    MerchantTradeNo: createMerchantTradeNo(),
    MerchantTradeDate: taipeiTradeDate(),
    PaymentType: 'aio',
    TotalAmount: String(amount),
    TradeDesc: 'Portfolio donation',
    ItemName: `Support creation NT$${amount}`,
    ReturnURL: `${config.apiOrigin}/api/ecpay-callback`,
    OrderResultURL: `${config.apiOrigin}/api/ecpay-result`,
    ChoosePayment: 'Credit',
    EncryptType: '1',
  }
  parameters.CheckMacValue = createCheckMacValue(parameters, config.hashKey, config.hashIv)

  renderPaymentForm(response, config.paymentUrl, parameters)
}
