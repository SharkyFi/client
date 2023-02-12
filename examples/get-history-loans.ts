import { createSharkyClient, fetchAllHistoryLoans } from '@sharkyfi/client'
import { Command } from 'commander'
import { createProvider } from './lib/createProvider'

// Usage
// npx ts-node examples/get-history-loans.ts --wallet-path ~/.config/solana/id.json

// If you don't want to use the client library, you can also just request the page directly and combine the paginated results yourself (each page may overlap in the case of duplicate dateOffered fields)
// https://sharky-git-phoenix-shark-971-expose-history-dat-aeb0a2-sharkyfi.vercel.app/api/loan-history/all?network=mainnet&deployEnvironment=production&before=<nothing or last date from the previous page>

async function main() {
  // Either use the function directly if you don't need a solana client
  const historyLoans = await fetchAllHistoryLoans(
    'mainnet',
    'production',
    'https://sharky.fi',
    process.env.AUTH_KEY
  )
  console.log(`Got ${historyLoans.length} historical loans`)

  // Or use it on the client if you already have one, for consistency
  const cli = new Command()
  const options = cli
    .requiredOption('--wallet-path <path>', 'path to private key file')
    .requiredOption(
      '--api-key <string>',
      'Sharky API key for fetching history loans'
    )
    .parse()
    .opts()

  if (options.walletPath) {
    const provider = createProvider(options.walletPath)
    const sharkyClient = createSharkyClient(provider)

    const historyLoans2 = await sharkyClient.fetchAllHistoryLoans(
      'mainnet',
      'production',
      'https://sharky.fi',
      options.apiKey
    )
    console.log(`Got ${historyLoans2.length} historical loans`)
  }
}

main()
