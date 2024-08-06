import hre from "hardhat";

async function main() {
  const comsumer = await hre.viem.getContractAt(
    "DirectFundingConsumer",
    "0x5cA58FCAb915F032688f388Dafe45E19a8f7CFF3"
  );

  const requestId = await comsumer.read.lastRequestId();
  console.log("requestId: ", requestId);

  const requestStatus = await comsumer.read.getRequestStatus([requestId]);
  console.log("requestStatus: ", requestStatus);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
