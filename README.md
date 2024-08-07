# DUEL3

![DUEL3_x_cover](https://duel3.vercel.app/public/duel3-ogp.png)

DUEL3 is an onchain card game where you battle using your own unique and precious cards.

## What is DUEL3?

DUEL3 is an onchain card game that leverages the unique "own" feature of blockchain, providing an experience where you can battle with your favorite cards just like in analog card games.

Additionally, we use our own **hybrid** offchain and onchain framework to provide a great UX while maintaining self-custody.

In particular, the game has the following features:

1. An auto-battle card game with **Hybrid game engine**

2. Simple, with no need for a rulebook

3. Play with self-custody cards and get new cards

For more details, please check the article below:

Why Blockchain Game? https://paragraph.xyz/@duel3/why-blockchain-game

## Hybrid Architecture

About a Fully onchain game, there are two significant challenges to achieving this ideal: UX and contract vulnerability.

To address these challenges, we propose a hybrid game model that combines onchain and offchain. This model leverages the strengths of offchain game with maintaining self-custody.

The hybrid game we propose records only specific data onchain: the state at the beginning of the battle, the state at the end of the game, and the random number seed.

All game logic is executed offchain, with the game intermediate state during battle also maintained offchain. The game logic should remain open and transparent to ensure fairness and verifiability.

<img width="791" alt="plasma_architecture_overview2" src="https://github.com/user-attachments/assets/bf93582f-2b12-4f6a-be9c-1194423c4c6c">

For more details, please check the article below:

Deep Dive into the Hybrid Game https://paragraph.xyz/@duel3/deep-dive-into-hybrid-game

## Contract addresses

DUEL3 battle

[https://arbiscan.io/address/0x4fe3fc701504ac72bff774e42e78fb349607de56](https://arbiscan.io/address/0x4fe3fc701504ac72bff774e42e78fb349607de56)

DUEL3 NFT

[https://arbiscan.io/address/0x053cb170062bb18a0071aceea923fa377b8bc321](https://arbiscan.io/address/0x053cb170062bb18a0071aceea923fa377b8bc321)

## Contract Deployment

```
cd hardhat
```

Enviroment

.env (This is admin signer address)

```
WALLET_PRIVATE_KEY=0x...
```

Deploy

```
npx hardhat run scripts/deploy.ts network --arbitrum
```

## Frontend

```
cd frontend
```

Enviroment

.env (Same as onchain's signer address)

```
PRIVATE_KEY=0x...
```

Install

```
bun install
```

Start

```
bun run dev
```
