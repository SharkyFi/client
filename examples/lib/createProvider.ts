import { AnchorProvider } from '@coral-xyz/anchor'

// This assembles an Anchor Provider using NodeWallet.
// In the frontend, you can use @sharkyfi/client's createProvider, using a wallet from a WalletProvider
export function createProvider(
  walletPath: string,
  rpcEndpoint: string = process.env.RPC_ENDPOINT
) {
  if (!rpcEndpoint) {
    throw Error('You must provide an RPC endpoint')
  }
  // Set up the sharky client
  process.env.ANCHOR_WALLET = walletPath
  process.env.ANCHOR_PROVIDER_URL = rpcEndpoint // You will need to provide your own RPC here
  const provider = AnchorProvider.env()
  // @ts-ignore // This is the only way to set this parameter when using .env()
  provider.connection._confirmTransactionInitialTimeout = 180_000
  return provider
}
