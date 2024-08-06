import hre from "hardhat";

async function main() {
  const [owner] = await hre.viem.getWalletClients();

  const DUEL3Alpha = await hre.viem.deployContract("DUEL3Alpha", [
    owner.account.address,
  ]);
  console.log("DUEL3Alpha: ", DUEL3Alpha.address);

  const DUEL3NFTAlpha = await hre.viem.deployContract("DUEL3NFTAlpha", [
    DUEL3Alpha.address,
  ]);
  console.log("DUEL3NFTAlpha: ", DUEL3NFTAlpha.address);

  const tx = await DUEL3Alpha.write.setNftAddress([DUEL3NFTAlpha.address]);
  console.log("DUEL3Alpha.setNftAddress tx: ", tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
