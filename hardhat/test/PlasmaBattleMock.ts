import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("PlasmaBattleMock", function () {
  const name = "PlasmaBattle";
  const version = "1";

  async function deployMockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const mock = await hre.viem.deployContract("PlasmaBattleMock", [
      owner.account.address,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    return {
      mock,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Verify", function () {
    it("Shouldn't fail if the unmockTime has arrived and the owner calls it", async function () {
      const { mock, owner } = await loadFixture(deployMockFixture);

      // EIP712 Domain
      const domain = {
        name: name,
        version: version,
        chainId: await owner.getChainId(),
        verifyingContract: mock.address,
      };

      // EIP712 Types
      const types = {
        BattleResult: [
          { name: "battleId", type: "uint" },
          { name: "result", type: "uint8" },
        ],
      };

      // Data to sign
      const value = {
        battleId: 2n,
        result: 1,
      };

      const signature = await owner.signTypedData({
        account: owner.account.address,
        domain,
        types,
        primaryType: "BattleResult",
        message: value,
      });

      expect(await mock.read.verify([signature, 2n, 1])).to.be.true;
    });
  });
});
