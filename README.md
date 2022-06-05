
<p align="center">
  <img width="auto" height="150" src="https://user-images.githubusercontent.com/377261/172073343-4b84d462-1f04-465d-9c93-cdba5b5dcdf3.png">
</p>


<h1 align="center">@sharkyfi/client</h1>


This repo gives examples for how to use the [@sharkyfi/client](https://www.npmjs.com/package/@sharkyfi/client) library to interact with the [Sharky](https://sharky.fi) solana program. It doesn't yet contain the client's code, because we use monorepo and publish package from there. But eventually the client's code will be migrated.

The `examples` directory contains scripts that provide a reference for performing automated lending actions. You can copy-paste code from there into your own code, or run the scripts directly.

Keep in mind that this repo and the Sharky library are licensed under [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html).

# How to use the package

The recommended way is to fork this repo and use examples as a starting point for your scripting.

The more custom alternative is to run:
```
npm install @sharkyfi/client
```
And write your own scripts from scratch.


## Examples
To run the scripts, run `yarn` or `npm install`.

Get the current list of orderbooks (name and pubkey):

```bash
npx ts-node examples/get-orderbooks.ts --wallet-path ~/.config/solana/id.json
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
