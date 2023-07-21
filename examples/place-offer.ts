import { createSharkyClient, SHARKY_PROGRAM_ID } from '@sharkyfi/client'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { createProvider } from './lib/createProvider'

// Usage
// npx ts-node examples/place-offer.ts --wallet-path ~/.config/solana/id.json --order-book <order-book-pubkey> --amount-sol 1
// You can get the list of orderbook pubkeys from get-order-books.ts

async function main() {
  const cli = new Command()
  const options = cli
    .requiredOption('--wallet-path <path>', 'path to private key file')
    .requiredOption(
      '--order-book <pubkey>',
      'pubkey of orderbook to submit offer on'
    )
    .requiredOption(
      '--amount-sol <number>',
      'amount of the loan offer (in SOL)'
    )
    .parse()
    .opts()

  const provider = createProvider(options.walletPath)
  const sharkyClient = createSharkyClient(
    provider,
    new PublicKey(SHARKY_PROGRAM_ID),
    'mainnet'
  )
  const { program } = sharkyClient

  const { orderBook } = await sharkyClient.fetchOrderBook({
    program,
    orderBookPubKey: options.orderBook,
  })
  if (!orderBook) {
    console.error(`No orderbook found with pubkey ${options.orderBook}`)
  }
  const { offeredLoans, sig } = await orderBook.offerLoan({
    program: sharkyClient.program,
    principalLamports: options.amountSol * LAMPORTS_PER_SOL,
    onTransactionUpdate: console.dir,
  })

  console.log(
    `Loan offered! Its pubkey is: ${offeredLoans[0].pubKey.toString()}`
  )
}

main()
