import { createSharkyClient } from '@sharkyfi/client'
import { PublicKey } from '@solana/web3.js'
import { Command } from 'commander'
import { createProvider } from './lib/createProvider'

// Usage
// npx ts-node examples/take-loan.ts --wallet-path ~/.config/solana/id.json --loan <loan-pubkey> --collateral-mint <nft-mint> --rpc-endpoint <url>
// You can get the list of orderbook pubkeys from get-order-books.ts

async function main() {
  const cli = new Command()
  const options = cli
    .option('--rpc-endpoint <url>', 'url of rpc endpoint')
    .requiredOption('--wallet-path <path>', 'path to private key file')
    .requiredOption('--loan <pubkey>', 'pubkey of loan you want to take')
    .requiredOption(
      '--collateral-mint <pubkey>',
      'mint address of NFT you want to use as collateral'
    )
    .parse()
    .opts()

  const provider = createProvider(options.walletPath, options.rpcEndpoint)
  const sharkyClient = createSharkyClient(provider)
  const { program } = sharkyClient

  console.log('Fetching loan')
  const offeredOrTaken = await sharkyClient.fetchLoan({
    program,
    loanPubKey: new PublicKey(options.loan),
  })
  if (!offeredOrTaken) {
    throw Error(`No loan found with pubkey ${options.loan}`)
  }
  if (!('offered' in offeredOrTaken!)) {
    throw Error('Loan is already taken.')
  }
  const loan = offeredOrTaken.offered

  console.log('Fetching orderbook')
  // Get the orderbook, so we can get the nftList, so we can get the index of the mint for the take instruction
  const { orderBook } = await sharkyClient.fetchOrderBook({
    program,
    orderBookPubKey: loan.data.orderBook,
  })
  console.dir({ orderBook }, { depth: 10 })
  console.log('Fetching nftlist')
  const nftList = await sharkyClient.fetchNftList({
    program,
    nftListPubKey: orderBook.orderBookType.nftList.listAccount,
  })
  console.log(program.provider.connection.rpcEndpoint)
  if (!nftList) {
    throw Error(
      `NFTList ${orderBook.orderBookType.nftList.listAccount.toString()} doesn't exist, or you're using the default solana public RPC which doesn't support some calls.`
    )
  }
  const nftListIndex = nftList.mints
    .map((pk) => pk.toString())
    .indexOf(options.collateralMint)
  if (nftListIndex === -1) {
    throw Error("NFT mint not found in the NFTList's mints")
  }

  console.log('Fetching mint metadata')
  // Check if the loan can be frozen (escrow-less loan) or not (escrow loan)
  const metadata =
    (await sharkyClient.program.provider.connection.getParsedAccountInfo(
      new PublicKey(options.collateralMint),
      'confirmed'
    )) as any
  const { freezeAuthority } = metadata?.value?.data?.parsed?.info
  const isFreezable = Boolean(freezeAuthority)

  // Execute the instruction
  try {
    const { takenLoan, sig } = await loan.take({
      program,
      nftMintPubKey: new PublicKey(options.collateralMint),
      nftListIndex,
      skipFreezingCollateral: !isFreezable,
    })

    console.log(
      `Loan taken! Its pubkey is: ${takenLoan.pubKey.toString()}; tx sig: ${sig}`
    )
  } catch (e) {
    console.error(`Error taking loan (sig: ${e.sig})`, e)
  }
}

main()
