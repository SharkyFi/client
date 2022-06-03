# @sharkyfi/client

This repo gives examples for how to use the `@sharkyfi/client` library to interact with the [Sharky](https://sharky.fi) solana program.

The examples directory contains scripts that provide a reference for performing automated lending actions. You can copy-paste code from there into your own code, or run the scripts directly.

Keep in mind that this repo and the Sharky library are licensed under [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html).

To run the scripts, run `yarn` or `npm install`, then:

Get the current list of orderbooks (name and pubkey):
```
npx ts-node examples/get-orderbooks.ts --wallet-path ~/.config/solana/id.json
```
Place a loan offer on an orderbook:
```
npx ts-node examples/place-offer.ts --wallet-path ~/.config/solana/id.json --order-book <order-book-pubkey> --amount-sol 1
```
List your current offers:
```
npx ts-node examples/list-offers.ts --wallet-path ~/.config/solana/id.json
```
Revoke an offer:
```
npx ts-node examples/revoke-offer.ts --wallet-path ~/.config/solana/id.json --loan <loan-pubkey>
```
