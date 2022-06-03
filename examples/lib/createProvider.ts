import { Provider } from '@project-serum/anchor'
import { createSharkyClient } from '@sharkyfi/client'

// This assembles an Anchor Provider using NodeWallet.
// In the frontend, you can use @sharkyfi/client's createProvider, using a wallet from a WalletProvider
export function createProvider(walletPath) {
  // Set up the sharky client
  process.env.ANCHOR_WALLET = walletPath
  process.env.ANCHOR_PROVIDER_URL = 'https://ssc-dao.genesysgo.net/'
  const provider = Provider.env()
  // @ts-ignore // This is the only way to set this parameter when using .env()
  provider.connection._confirmTransactionInitialTimeout = 180_000
  return provider
}
