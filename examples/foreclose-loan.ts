import { createSharkyClient, TakenLoan } from '@sharkyfi/client'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import prettyMs from 'pretty-ms'
import { exit } from 'process'
import { createProvider } from './lib/createProvider'

// Usage
// npx ts-node examples/foreclose-loan.ts --wallet-path ~/.config/solana/id.json --loan <pubkey>
// You can get the list of loans from list-offers.ts

async function main() {
  const cli = new Command()
  const options = cli
    .requiredOption('--wallet-path <path>', 'path to private key file')
    .requiredOption('--loan <pubkey>', 'pubkey of the loan to foreclose')
    .parse()
    .opts()

  const provider = createProvider(options.walletPath)
  const sharkyClient = createSharkyClient(provider)
  const { program } = sharkyClient

  const result = (await sharkyClient.fetchLoan({
    program,
    loanPubKey: new PublicKey(options.loan),
  })) as { taken: TakenLoan }
  if (!result) {
    console.error(`No loan at pubkey: ${options.loan}`)
    exit(1)
  }
  if (!('taken' in result)) {
    console.error(
      `Loan at ${options.loan} has not yet been taken, and cannot be foreclosed`
    )
    exit(1)
  }
  const loan = result.taken

  if (!loan.isForeclosable('mainnet')) {
    const currentTimestamp = new Date().getTime() / 1000
    const startTimestamp =
      loan.data.loanState.taken.taken.terms.time?.start.toNumber()
    const duration =
      loan.data.loanState.taken.taken.terms.time?.duration.toNumber()
    const endTimestamp = startTimestamp + duration
    const secondsUntilForeclosable = endTimestamp - currentTimestamp
    console.error(
      `Loan at ${
        options.loan
      } is not yet foreclosable. Time remaining: ${prettyMs(
        secondsUntilForeclosable * 1000
      )}`
    )
    exit(1)
  }

  await loan.foreclose({ program, onTransactionUpdate: console.dir })

  console.log(
    `Successfully foreclosed loan at ${options.loan} (amount loaned was ${(
      loan.data.principalLamports.toNumber() / LAMPORTS_PER_SOL
    ).toFixed(
      2
    )} SOL). You now own NFT ${loan.data.loanState.taken.taken.nftCollateralMint.toString()}.`
  )
}

main()
