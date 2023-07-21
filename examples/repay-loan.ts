import { createSharkyClient, SHARKY_PROGRAM_ID } from '@sharkyfi/client'
import { PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { createProvider } from './lib/createProvider'

// Usage
// npx ts-node examples/repay-loan.ts --wallet-path ~/.config/solana/id.json --loan <loan-pubkey> --rpc-endpoint <url>
// You can get the list of orderbook pubkeys from get-order-books.ts

async function main() {
  const cli = new Command()
  const options = cli
    .option('--rpc-endpoint <url>', 'url of rpc endpoint')
    .requiredOption('--wallet-path <path>', 'path to private key file')
    .requiredOption('--loan <pubkey>', 'pubkey of loan you want to repay')
    .parse()
    .opts()

  const provider = createProvider(options.walletPath, options.rpcEndpoint)
  const sharkyClient = createSharkyClient(
    provider,
    new PublicKey(SHARKY_PROGRAM_ID),
    'mainnet'
  )
  const { program } = sharkyClient

  console.log('Fetching loan')
  const offeredOrTaken = await sharkyClient.fetchLoan({
    program,
    loanPubKey: new PublicKey(options.loan),
  })
  if (!offeredOrTaken) {
    throw Error(`No loan found with pubkey ${options.loan}`)
  }
  if (!('taken' in offeredOrTaken!)) {
    throw Error('Loan is not in taken state, so cannot be repaid.')
  }
  const loan = offeredOrTaken.taken

  console.log('Fetching orderbook')
  const { orderBook } = await sharkyClient.fetchOrderBook({
    program,
    orderBookPubKey: loan.data.orderBook,
  })

  const { sig } = await loan.repay({
    program,
    orderBook,
  })

  console.log(`Loan repaid! tx sig: ${sig}`)
}

main()
