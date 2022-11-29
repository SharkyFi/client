import {
  createSharkyClient,
  enabledOrderBooks,
  OrderBook,
} from '@sharkyfi/client'
import { Command } from 'commander'
import fetch from 'node-fetch'
import { createProvider } from './lib/createProvider'

// Usage
// npx ts-node examples/list-order-books.ts --wallet-path ~/.config/solana/id.json
// You can get the list of orderbook pubkeys from get-orderbooks.ts

async function main() {
  const cli = new Command()
  const options = cli
    .requiredOption('--wallet-path <path>', 'path to private key file')
    .parse()
    .opts()

  const provider = createProvider(options.walletPath)
  const sharkyClient = createSharkyClient(provider)
  const { program } = sharkyClient

  // Fetch and log the current orderbooks
  const orderBooks = await sharkyClient.fetchAllOrderBooks({ program })
  const collectionNames = await sharkyClient.fetchAllNftLists({ program })

  const nftListPubKeyToNameMap = Object.fromEntries(
    collectionNames.map(({ pubKey, collectionName }) => [
      pubKey,
      collectionName,
    ])
  )

  const orderBooksByName = Object.fromEntries(
    orderBooks
      .map((ob: OrderBook) => [
        nftListPubKeyToNameMap[
          ob.orderBookType.nftList!.listAccount.toString()
        ],
        {
          pubkey: ob.pubKey.toString(),
          enabled: enabledOrderBooks.includes(ob.pubKey.toString()),
        },
      ])
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
  )
  console.dir({ orderBooksByName })
}

main()
