<p align="center">
  <img width="auto" height="150" src="https://user-images.githubusercontent.com/377261/172073343-4b84d462-1f04-465d-9c93-cdba5b5dcdf3.png">
</p>

<h1 align="center">@sharkyfi/client</h1>

This repo gives examples for how to use the [@sharkyfi/client](https://www.npmjs.com/package/@sharkyfi/client) library to interact with the [Sharky](https://sharky.fi) solana program. It doesn't yet contain the client's code, because we use monorepo and publish package from there. But eventually the client's code will be migrated.

The `examples` directory contains scripts that provide a reference for performing automated lending actions. You can copy-paste code from there into your own code, or run the scripts directly.

Keep in mind that this repo and the Sharky library are licensed under [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html).

## How to use the package

The recommended way is to fork this repo and use examples as a starting point for your scripting.

The more custom alternative is to run:

```
npm install @sharkyfi/client
```

And write your own scripts from scratch.

## Examples

To run the scripts, run `yarn` or `npm install`, then:

Get the current list of orderbooks (name and pubkey):

```bash
npx ts-node examples/list-order-books.ts --wallet-path ~/.config/solana/id.json
```

Place a loan offer on an orderbook:

```bash
npx ts-node examples/place-offer.ts --wallet-path ~/.config/solana/id.json --order-book <order-book-pubkey> --amount-sol 1
```

List your current offers:

```bash
npx ts-node examples/list-offers.ts --wallet-path ~/.config/solana/id.json
```

Revoke an offer:

```bash
npx ts-node examples/revoke-offer.ts --wallet-path ~/.config/solana/id.json --loan <loan-pubkey>
```

## Gotchas / things to know about how our data is structured

### APR and APY

We originally named a property on loans and orderbooks "APY" when actually using it mathematically as APR. We've corrected this on the frontend, but in the data structure that is returned from the chain data, `orderBook.apy.fixed?.apy` is actually APR, as is `loan.data.loanState.taken?.taken.apy.fixed!.apy`.

Additionally, those are stored as millpercents — thousandths of a percent, to allow for higher precision while being stored as integers.

To get regular APR and APY as percents from the values we store on chain:

```
// for orderbooks:
const apr = orderBook.apy.fixed!.apy / 1000
// or for taken loans:
const apr = loan.data.loanState.taken?.taken.apy.fixed!.apy / 1000

const apy = 100 * (Math.exp(apr / 100) - 1)
```
