const { readFile, writeFile } = require('fs').promises
const { parse } = require('./parser.js')
const { stringify } = require('./stringifier.js')
// const { stringify } = JSON

main()

async function main() {
  const log = await readFile('logs.txt', 'utf8')
  const transactions = parse(log)
  
  const totalIncome = transactions.reduce((acc, t) => t.buyerId ? acc + t.price : acc, 0)
  const totalOutcome = transactions.reduce((acc, t) => t.sellerId ? acc + t.price : acc, 0)
  
  const newLog = stringify(transactions, null, 2) + `\n\nTotal income: ${totalIncome}\nTotal outcome: ${totalOutcome}`

  await writeFile('new-logs.txt', newLog)
}
