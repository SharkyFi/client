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
import { aprToApy, apyToApr, aprToInterestRatio, interestRatioToApr } from '@sharkyfi/client'

// Get values from the loan and orderbook
// for orderbooks:
const apr = orderBook.apy.fixed!.apy / 1000
// or for taken loans:
const apr = loan.data.loanState.taken?.taken.apy.fixed!.apy / 1000

const principalLamports = loan.data.principalLamports.toNumber()
const feePermillicentage = orderBook.feePermillicentage
const durationSeconds =
    loan.data.loanState.taken?.taken.terms.time?.duration.toNumber() ||
    loan.data.loanState.offer?.offer.termsSpec.time?.duration.toNumber()

// Calculations
const interestRatio = aprToInterestRatio(apr, durationSeconds)
const interestWithFeeLamports = interestRatio * principalLamports
const feeLamports = Math.floor((interestWithFeeLamports * feePermillicentage) / 100_000)
const interestWithoutFeeLamports = interestWithFeeLamports - feeLamports
const interestRatioAfterFee = interestWithoutFeeLamports / principalLamports
const aprAfterFee = interestRatioToApr(interestRatioAfterFee, durationSeconds)
const apyAfterFee = aprToApy(aprAfterFee)

console.log({
  interestRatio, // Shown to borrowers
  interestWithFeeLamports, // Shown to borrowers
  apyAfterFee, // Shown to lenders
})
```

For example, given these inputs, you will get these values:

```
const principalLamports = 1e9
const apr = 145365 / 1000
const feePermillicentage = 16000
const durationSeconds = 7 * 24 * 60 * 60

// ...calculations

console.log({
  interestRatio, // 0.028270453175256227 (shown as 2.82%)
  interestWithFeeLamports, // 28270453 (shown as 0.028 SOL)
  apyAfterFee, // 239.9988789793601 (shown as 240%)
})
```

# How to get historical events

It depends for what purpose. If you want to get parsed transactions programmatically from the beginning of time, please refer to our official partner - Hello Moon, if you want to just do explorative analysis via SQL, we have pre-parsed table on Dune, if you want some super custom integration, we can give you acess to our own database for some unique use-cases.

## Hello Moon API

For example: https://docs.hellomoon.io/reference/post_v0-sharky-loan-events

Example response

```json
{
  "data": [
    {
      "blockTime": "1677959719",
      "blockId": "180767604",
      "transactionPosition": 977,
      "instructionOrdinal": 1,
      "transactionId": "4QovotWNSLvByYZCBpg83oLtW8rXdeAyFWfuEDeDh455QUgW43pBWCDYYjdPBAy5kb3vSVVHi338MeaWcjEdtCEp",
      "orderBook": "7yJpf4UzKkeWveDvW6KmHunbuXRAEZdcwgcv4zMyNU5y",
      "loan": "GY6kuy6rYwdRDR3tjz8idcH7vatKnhYkz8UQ1GzCCEtv",
      "actionType": "repay",
      "lender": "9sP8D7wcqHHNSdUqvXLeYFetvAk2G7rnLbnEfH29HHwM",
      "borrower": "FAWGVTAEyfBX2TcMLCQnUusW4CPh6REtTmCkDAURPETn",
      "collateralMint": "FiX2tBUWjWvjF1JhL15VzshFeyVc4P755gbh5apByZSA",
      "tokenMint": "So11111111111111111111111111111111111111112",
      "loanDurationSeconds": null,
      "amountOffered": null,
      "amountCancelled": null,
      "amountTaken": null,
      "amountRepayed": 0.122393078,
      "isRepayEscrow": true,
      "isDefaultEscrow": null
    }
  ],
  "paginationToken": "eyJibG9ja1RpbWUiOiIxNjc3OTU5NzE5IiwidHJhbnNhY3Rpb25JZCI6IjIxTlpta3FLZ0M0bzlyQllBSmZXZ2N4YzNKUXlKcjJxNlhEM3RyODR2QWQ1ZTV1SEFjd3FoOU1Nd3NSQ3lqamFNeGl3eURRbkVLcmM4cWpCeUs2ODc0ODUifQ=="
}
```

By using the pagination token you can fetch events since the beginning of time.

## Dune

Refer to this example query: https://dune.com/queries/2015361

## Custom Database Access

Please open a support ticket in our [discord](http://discord.gg/sharkyfi) clearly describing the use-case.
