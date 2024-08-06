import hre from "hardhat";

async function main() {
  const signer = "0x6C4502B639ab01Cb499cEcCA7D84EB21Fde928F8";
  const DUEL3Alpha = "0x3e213fbacd7f6369f63603cac81ed9704b5a74d3";
  const DUEL3NFTAlpha = "0x198051a895fcd3678b8605508c1c51ec75cf5755";

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
