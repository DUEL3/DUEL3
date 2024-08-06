import hre from "hardhat";

async function main() {
  const mock = await hre.viem.deployContract("EIP712SignatureMock", [
    "EIP712SignatureMock",
    "1",
  ]);

  const counter = await mock.read.counter();
  console.log("counter: ", counter);

  await mock.write.increment();

  const counter2 = await mock.read.counter();
  console.log("counter: ", counter2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
