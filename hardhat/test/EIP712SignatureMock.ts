import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("EIP712SignatureMock", function () {
  const mailContents = "Hello, blockchain!";

  async function deployMockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const mock = await hre.viem.deployContract("EIP712SignatureMock", [
      "EIP712SignatureMock",
      "1",
    ]);

    const publicClient = await hre.viem.getPublicClient();

    const mailTo = owner.account.address;
    console.log("mailTo: ", mailTo);

    return {
      mock,
      owner,
      otherAccount,
      publicClient,
      mailTo,
    };
  }

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Shouldn't fail if the unmockTime has arrived and the owner calls it", async function () {
        const { mock, owner, mailTo } = await loadFixture(deployMockFixture);

        // EIP712 Domain
        const domain = {
          name: "EIP712SignatureMock",
          version: "1",
          chainId: await owner.getChainId(),
          verifyingContract: mock.address,
        };

        // EIP712 Types
        const types = {
          Mail: [
            { name: "to", type: "address" },
            { name: "contents", type: "string" },
          ],
        };

        // Data to sign
        const value = {
          to: mailTo,
          contents: mailContents,
        };
        console.log("value: ", value);

        const signature = await owner.signTypedData({
          account: owner.account.address,
          domain,
          types,
          primaryType: "Mail",
          message: value,
        });

        expect(
          await mock.read.verify([
            signature,
            owner.account.address,
            mailTo,
            mailContents,
          ])
        ).to.be.true;
      });
    });
  });
});
