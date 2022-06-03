import { createSharkyClient, OfferedLoan, TakenLoan } from '@sharkyfi/client'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Command } from 'commander'
import { createProvider } from './lib/createProvider'

// Usage
// npx ts-node examples/list-offers.ts --wallet-path ~/.config/solana/id.json
// You can get the list of orderbook pubkeys from get-order-books.ts

async function main() {
  const cli = new Command()
  const options = cli
    .requiredOption('--wallet-path <path>', 'path to private key file')
    .parse()
    .opts()

  const provider = createProvider(options.walletPath)
  const sharkyClient = createSharkyClient(provider)
  const { program } = sharkyClient

  const loans = await sharkyClient.fetchAllLoans({
    program,
  })

  const myOpenOffers = loans.filter(
    (loan) =>
      loan.data.loanState.offer?.offer.lenderWallet.toString() ===
      program.provider.wallet.publicKey.toString()
  )
  // Note: lenderNoteMint is currently just the lender's wallet address.
  const myActiveLoans = loans.filter(
    (loan) =>
      loan.data.loanState.taken?.taken.lenderNoteMint.toString() ===
      program.provider.wallet.publicKey.toString()
  )

  console.log('Open offers:')
  console.dir(
    myOpenOffers.map((loan: OfferedLoan) => ({
      loan: loan.pubKey.toString(),
      orderBook: loan.data.orderBook.toString(),
      amountSol: (loan.data.principalLamports / LAMPORTS_PER_SOL).toFixed(2),
    }))
  )
  console.log('Active loans:')
  console.dir(
    myActiveLoans.map((loan: TakenLoan) => ({
      loan: loan.pubKey.toString(),
      orderBook: loan.data.orderBook.toString(),
      amountSol: (loan.data.principalLamports / LAMPORTS_PER_SOL).toFixed(2),
      borrower: loan.data.loanState.taken.taken.borrowerNoteMint.toString(),
      nftCollateralMint:
        loan.data.loanState.taken.taken.nftCollateralMint.toString(),
      isForeclosable: loan.isForeclosable(),
    }))
  )
}

main()
