import hre from "hardhat";

async function main() {
  const comsumer = await hre.viem.getContractAt(
    "DirectFundingConsumer",
    "0x5cA58FCAb915F032688f388Dafe45E19a8f7CFF3"
  );

  const hash = await comsumer.write.requestRandomWords([true]);
  // increaseSupply sends a tx, so we need to wait for it to be mined
  const publicClient = await hre.viem.getPublicClient();
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("hash: ", hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
