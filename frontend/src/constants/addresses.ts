import {
  scrollSepolia,
  zkSyncSepoliaTestnet,
  base,
  baseSepolia,
  arbitrum,
} from "wagmi/chains";

const _addresses: { [chainId: number]: { [key: string]: string } } = {
  [zkSyncSepoliaTestnet.id]: {
    DUEL3BattleAlpha: "0x3979d863D02Ce04fc5B8932537b9f69c402B2911",
  },
  [scrollSepolia.id]: {
    DUEL3BattleAlpha: "0x03605f52150387d6a33fc2e7f2736ce5f4111eb1",
  },
  [base.id]: {
    DUEL3BattleAlpha: "0x37f6c278888e3A826A7341727D06c062C67dea1A",
  },
  [baseSepolia.id]: {
    DUEL3BattleAlpha: "0x3e213fbacd7f6369f63603cac81ed9704b5a74d3",
    DUEL3NFTAlpha: "0x198051a895fcd3678b8605508c1c51ec75cf5755",
  },
  [arbitrum.id]: {
    DUEL3BattleAlpha: "0x473bf1b585808f1c7eef20288ed315c98a779e33",
    DUEL3NFTAlpha: "0xbf48fbb9fd7162054c281ad0283ca196e21938eb",
  },
};

const addresses = (chainId: number) => {
  const addresses_ = _addresses[chainId];
  if (!addresses_) {
    console.error(`addresses not found for chainId: ${chainId}`);
  }
  return addresses_;
};

export default addresses;
