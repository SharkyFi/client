import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Command } from 'commander'
import { createProvider } from './lib/createProvider'
import { PublicKey } from '@solana/web3.js'
import { createSharkyClient, OfferedLoan } from '@sharkyfi/client'
import { exit } from 'process'

// Usage
// npx ts-node examples/revoke-offer.ts --wallet-path ~/.config/solana/id.json --loan <pubkey>
// You can get the list of loans from list-offers.ts

async function main() {
  const cli = new Command()
  const options = cli
    .requiredOption('--wallet-path <path>', 'path to private key file')
    .requiredOption('--loan <pubkey>', 'pubkey of the loan to revoke')
    .parse()
    .opts()

  const provider = createProvider(options.walletPath)
  const sharkyClient = createSharkyClient(provider)
  const { program } = sharkyClient

  const result = (await sharkyClient.fetchLoan({
    program,
    loanPubKey: new PublicKey(options.loan),
  })) as { offered: OfferedLoan }
  if (!result) {
    console.error(`No loan at pubkey: ${options.loan}`)
    exit(1)
  }
  if (!('offered' in result)) {
    console.error(
      `Loan at ${options.loan} is already taken, and cannot be revoked`
    )
    exit(1)
  }
  const loan = result.offered

  // rescind, AKA revoke in our UI
  await loan.rescind({ program, onTransactionUpdate: console.dir })

  console.log(
    `Successfully revoked offer at ${options.loan} for ${(
      loan.data.principalLamports / LAMPORTS_PER_SOL
    ).toFixed(2)} SOL`
  )
}

main()
