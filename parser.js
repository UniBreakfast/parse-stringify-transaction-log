module.exports = { parse }

function parse(log) {
  const lines = log.trim().split(/\r?\n/)
  const lineGroups = []

  while (lines.length) {
    lineGroups.push(lines.splice(0, 5))
  }

  const transactions = lineGroups.map(buildTransaction)

  return transactions
}

/* 
  [
    "Winchester64",
    "2 weeks ago",
    "06.02.2023 07:42:12",
    "85.140.6.187 	Sold Шорты Аргентина [ID: 16051661] (+7.3 Стандартные Положения) for 30 Credits (Fee: 1 Credits) to Джеки Чан 9 ID: 204750. | Credits before: 250 | After: 279 (SAME IP ADDRESS)",
    "[RU]",
  ]
*/
function buildTransaction(lines) {
  const [username, timeAgo, dateTime, detailsStr, countryStr] = lines

  const details = parseDetails(detailsStr)
  const country = countryStr.replace(/[\[\]]/g, '')

  return JSON.parse(JSON.stringify({username, timeAgo, dateTime, ...details, country}))
  return {username, timeAgo, dateTime, ...details, country}
}

/* 
"95.84.13.6 	Sold Шорты Босния [ID: 16095837] (+1.5 Нападение) for 25 Credits (Fee: 1 Credits) to Чак Норрис 70 ID: 202814. | Credits before: 411 | After: 435 (SAME IP ADDRESS)"
"95.84.13.6   Bought 2x Выносливость (added 1 час назад) for 22 Credits from Oporino ID: 136446. | Credits before: 153 | After: 131"
"95.84.13.6 	Sold Шорты Аргентина [ID: 16051662] (+7.3 Стандартные Положения) for 25 Credits (Fee: 1 Credits) to Джеки Чан 9 ID: 204750. | Credits before: 300 | After: 324 (SAME IP ADDRESS)"
*/
function parseDetails(details) {
  const [_1, ip, direction, opDetails, fundsChange, isSameIp] = details.match(detailsRE)

  /* opDetails: 
    "Шорты Босния [ID: 16095837] (+1.5 Нападение) for 25 Credits (Fee: 1 Credits) to Чак Норрис 70 ID: 202814."
    [itemName, itemId, itemProps, price, fee, buyerName, buyerId]

    "2x Выносливость (added 1 час назад) for 22 Credits from Oporino ID: 136446."
    [itemName, lotCreatedTimeAgo, price, sellerName, sellerId]

    "Шорты Аргентина [ID: 16051662] (+7.3 Стандартные Положения) for 25 Credits (Fee: 1 Credits) to Джеки Чан 9 ID: 204750."
    [itemName, itemId, itemProps, price, fee, buyerName, buyerId]
  */

  const [_2, leftPart, price, rightPart] = opDetails.match(splitOnPriceRE)

  const [_3, itemName, itemId, itemProps, addedTimeAgo] = leftPart.match(leftPartRE)
  
  const [_4, fee, buyerName, buyerId, sellerName, sellerId] = rightPart.match(rightPartRE)

  const [_5, creditsBefore, creditsAfter] = fundsChange.match(fundsChangeRE)

  return {
    ip,
    itemName,
    itemId: itemId && +itemId,
    itemProps,
    addedTimeAgo,
    price: +price,
    fee: fee && +fee,
    buyerName,
    buyerId: buyerId && +buyerId,
    sellerName,
    sellerId: sellerId && +sellerId,
    creditsBefore: +creditsBefore,
    creditsAfter: +creditsAfter,
    isSameIp: !!isSameIp
  }
}

const detailsRE = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+(Sold|Bought)\s+(.+)\|\s+Credits\s+(before:\s+\d+\s+\|\s+After:\s+\d+)(\s+\(SAME IP ADDRESS\))?/
const splitOnPriceRE = /(.+)\s+(?:for|za)\s+(\d+)\s+Credits\s+(.+)/
const leftPartRE = /([^([]+[^( [])\s*(?:\[ID:\s*(\d+)\]\s*\(([^)]+)\))?\s*(?:\(added\s(.+)\))?/
const rightPartRE = /(?:\(Fee:\s+(\d+)\s+Credits\)\s+)?(?:to\s+(.+)\s+ID:\s*(\d+))?(?:from\s+(.+)\s+ID:\s*(\d+))?/
const fundsChangeRE = /before:\s+(\d+)\s+\|\s+After:\s+(\d+)/
