import hre from "hardhat";

async function main() {
  const signer = "0x6C4502B639ab01Cb499cEcCA7D84EB21Fde928F8";
  const DUEL3Alpha = "0x4fe3fc701504ac72bff774e42e78fb349607de56";
  const DUEL3NFTAlpha = "0x053cb170062bb18a0071aceea923fa377b8bc321";

  await hre.run("verify:verify", {
    address: DUEL3Alpha,
    constructorArguments: [signer],
  });

  await hre.run("verify:verify", {
    address: DUEL3NFTAlpha,
    constructorArguments: [DUEL3Alpha],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
