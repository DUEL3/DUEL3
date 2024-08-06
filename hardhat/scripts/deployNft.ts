import hre from "hardhat";

async function main() {
  const [owner] = await hre.viem.getWalletClients();

  const Duel3AlphaNFT = await hre.viem.deployContract("Duel3AlphaNFT", [
    owner.account.address,
  ]);
  console.log("Duel3AlphaNFT: ", Duel3AlphaNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
