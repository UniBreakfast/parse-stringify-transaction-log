module.exports = { stringify }

function stringify(transactions) {
  const lines = transactions.map(buildLine)

  return lines.join('\n')
}

function buildLine(t, i, transactions) {
  return `${t.buyerId ? 'B' : 'S'}${t.itemId ? ` [ID: ${t.itemId}]` : ` ${t.itemName}`}${t.itemProps ? ` (${t.itemProps.split(' ')[0]})` : ''} for ${t.price} Credits${t.fee ? ` (${t.fee})` : ''} to ${t.buyerId == transactions[i-1]?.buyerId || t.sellerId == transactions[i-1]?.sellerId ? '(-/-)' : `${t.buyerName || t.sellerName} ID: ${t.buyerId || t.sellerId}`} [${t.creditsBefore} -> ${t.creditsAfter}]${t.isSameIp ? transactions[i-1]?.isSameIp ? ' (S..)' : ' (SAME IP ADDRESS)' : ''}`
  return `S [ID: 16051663] (+7.3) for 25 Credits (1) to Алекс48 ID: 20397. | B: 276 | A: 300 (S..)`
  return `S [ID: 16051663] (+7.3) for 25 Credits (1) to (-/-). | B: 276 | A: 300 (S..)`
}
