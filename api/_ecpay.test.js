import { describe, expect, it } from 'vitest'

import {
  checkMacValueIsValid,
  createCheckMacValue,
  createMerchantTradeNo,
  taipeiTradeDate,
} from './_ecpay.js'

describe('ECPay helpers', () => {
  it('matches ECPay’s published CheckMacValue example', () => {
    const parameters = {
      ChoosePayment: 'ALL',
      EncryptType: '1',
      ItemName: 'Apple iphone 15',
      MerchantID: '3002607',
      MerchantTradeDate: '2023/03/12 15:30:23',
      MerchantTradeNo: 'ecpay20230312153023',
      PaymentType: 'aio',
      ReturnURL: 'https://www.ecpay.com.tw/receive.php',
      TotalAmount: '30000',
      TradeDesc: '促銷方案',
    }

    const hashKey = 'pwfhcqoqzgmho4w6'
    const hashIv = 'ekrm7ift261dpevs'
    const actual = createCheckMacValue(parameters, hashKey, hashIv)

    expect(actual).toBe('6C51C9E6888DE861FD62FB1DD17029FC742634498FD813DC43D4243B5685B840')
    expect(checkMacValueIsValid({ ...parameters, CheckMacValue: actual }, hashKey, hashIv)).toBe(true)
    expect(checkMacValueIsValid({ ...parameters, CheckMacValue: `0${actual.slice(1)}` }, hashKey, hashIv)).toBe(false)
  })

  it('uses Taiwan time and creates a short alphanumeric merchant order number', () => {
    expect(taipeiTradeDate(new Date('2026-08-02T00:00:00.000Z'))).toBe('2026/08/02 08:00:00')
    const merchantTradeNo = createMerchantTradeNo()
    expect(merchantTradeNo).toMatch(/^DON[a-z0-9]+$/)
    expect(merchantTradeNo.length).toBeLessThanOrEqual(20)
  })
})
