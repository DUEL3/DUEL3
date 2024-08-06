// import { kv } from "@vercel/kv";
// import { kv } from "../../stores/kv";
import { NextApiRequest, NextApiResponse } from "next";
import { readContract } from "@wagmi/core";
import { DUEL3BattleAlphaAbi } from "src/constants/DUEL3BattleAlphaAbi";
import addresses from "src/constants/addresses";
import BattleClass, { type RandomSeed } from "src/utils/BattleClass";
import {
  type Unit,
  type UnitVariable,
  unitVariableDefaultValues,
  SKILL_TIMING,
  RESULT,
} from "src/constants/interface";
import { SKILLS } from "src/constants/skills";
import { units } from "src/constants/units";
import { convertUnitIdsToNumber } from "src/utils/Utils";
import { createConfig, http } from "wagmi";
import {
  scrollSepolia,
  zkSyncSepoliaTestnet,
  base,
  baseSepolia,
  arbitrum,
} from "wagmi/chains";
import { privateKeyToAccount } from "viem/accounts";

export const getWagmiConfig = (chainId: number) => {
  switch (chainId) {
    case zkSyncSepoliaTestnet.id:
      return createConfig({
        chains: [zkSyncSepoliaTestnet],
        transports: {
          [zkSyncSepoliaTestnet.id]: http(
            zkSyncSepoliaTestnet.rpcUrls.default.http[0]
          ),
        },
      });
    case scrollSepolia.id:
      return createConfig({
        chains: [scrollSepolia],
        transports: {
          [scrollSepolia.id]: http(scrollSepolia.rpcUrls.default.http[0]),
        },
      });
    case base.id:
      return createConfig({
        chains: [base],
        transports: {
          [base.id]: http(base.rpcUrls.default.http[0]),
        },
      });
    case baseSepolia.id:
      return createConfig({
        chains: [baseSepolia],
        transports: {
          [baseSepolia.id]: http(baseSepolia.rpcUrls.default.http[0]),
        },
      });
    case arbitrum.id:
      return createConfig({
        chains: [arbitrum],
        transports: {
          [arbitrum.id]: http(arbitrum.rpcUrls.default.http[0]),
        },
      });

    default:
      throw new Error("chainId is not found");
  }
};

const _sign = async (chainId, contractAddress, battleId, _result) => {
  // Assuming you have the private key and the battleId and result
  const privateKey = process.env.PRIVATE_KEY!;
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // EIP712 Domain
  const domain = {
    name: "PlasmaBattle",
    version: "1",
    chainId: Number(chainId),
    verifyingContract: contractAddress,
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
    battleId: battleId,
    result: _result,
  };

  const signature = await account.signTypedData({
    domain,
    types,
    primaryType: "BattleResult",
    message: value,
  });
  console.log("signature", signature);
  return signature;
};

const removeKilledUnitAll = (units, unitVariables) => {
  //Judge if life is 0
  for (let i = unitVariables.length - 1; i >= 0; i--) {
    if (unitVariables[i].life === 0) {
      units.splice(i, 1);
      unitVariables.splice(i, 1);
    }
  }
};

const removeKilledUnit = (units, unitVariables, index) => {
  //Judge if life is 0
  if (unitVariables[index].life === 0) {
    units.splice(index, 1);
    unitVariables.splice(index, 1);
  }
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log("battleRESULTApi start");

  if (request.method === "GET") {
    console.log("request.query", request.query);
    const chainId = request.query.chainId as string;
    const battleId = request.query.battleId as string;
    const address = request.query.address as string;

    const config = getWagmiConfig(Number(chainId));
    const contractAddress = addresses(Number(chainId))!
      .DUEL3BattleAlpha as `0x${string}`;
    console.log("contractAddress", contractAddress);

    const _resStage = await readContract(config, {
      abi: DUEL3BattleAlphaAbi,
      address: contractAddress,
      functionName: "playerStage",
      args: [address as `0x${string}`],
    });
    console.log("_resStage", _resStage);

    const _resRandomSeed = await readContract(config, {
      abi: DUEL3BattleAlphaAbi,
      address: contractAddress,
      functionName: "randomSeeds",
      args: [BigInt(battleId)],
    });
    console.log("_resRandomSeed", _resRandomSeed);

    const _resPlayerUnitIds = await readContract(config, {
      abi: DUEL3BattleAlphaAbi,
      address: contractAddress,
      functionName: "getPlayerUnits",
      args: [address as `0x${string}`],
    });
    console.log("_resData", _resPlayerUnitIds);

    const _resEnemyUnits = await readContract(config, {
      abi: DUEL3BattleAlphaAbi,
      address: contractAddress,
      functionName: "getEnemyUnits",
      args: [_resStage],
    });

    //BitInt to Number
    //0-4 is playerUnitIds
    const playerUnitIds = convertUnitIdsToNumber(
      (_resPlayerUnitIds as BigInt[]).slice(0, 5)
    );
    const enemyUnitsByStage = convertUnitIdsToNumber(
      _resEnemyUnits as BigInt[]
    );

    //Response parameter
    let _result = RESULT.NOT_YET;

    //Construct battleClass
    let playerUnits: Unit[] = playerUnitIds.map((id) => units[id]);
    let playerUnitsVariable: UnitVariable[] = playerUnits.map((unit: Unit) => {
      return {
        life: unit.life,
        attack: unit.attack,
        ...unitVariableDefaultValues,
      };
    });
    let enemyUnits: Unit[] = enemyUnitsByStage.map((id) => units[id]);
    let enemyUnitsVariable: UnitVariable[] = enemyUnits.map((unit: Unit) => {
      return {
        life: unit.life,
        attack: unit.attack,
        ...unitVariableDefaultValues,
      };
    });

    console.log("playerUnits", playerUnits);
    console.log("playerUnitsVariable", playerUnitsVariable);
    console.log("enemyUnits", enemyUnits);
    console.log("enemyUnitsVariable", enemyUnitsVariable);

    const battleClass: BattleClass = new BattleClass(
      Number(battleId),
      _resRandomSeed as RandomSeed
    );

    //Start of battle
    for (let i = 4; i >= 0; i--) {
      if (playerUnits[i]) {
        for (let j = 0; j < playerUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[playerUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            await battleClass!.executeSkill(
              playerUnitsVariable,
              enemyUnitsVariable,
              true,
              i,
              _skill
            );
            //Judge if life is 0
            removeKilledUnitAll(playerUnits, playerUnitsVariable);
            removeKilledUnitAll(enemyUnits, enemyUnitsVariable);
          }
        }
      }
      if (enemyUnits[i]) {
        for (let j = 0; j < enemyUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[enemyUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            await battleClass!.executeSkill(
              playerUnitsVariable,
              enemyUnitsVariable,
              false,
              i,
              _skill
            );
            //Judge if life is 0
            removeKilledUnitAll(playerUnits, playerUnitsVariable);
            removeKilledUnitAll(enemyUnits, enemyUnitsVariable);
          }
        }
      }
    }

    let loopCount = 0;
    while (true) {
      //TODO revive beforeAttack
      // console.log("Start beforeAttack: ", loopCount);
      // await battleClass.beforeAttack();
      // _result = await battleClass.judge();
      // if (_result !== RESULT.NOT_YET) break;

      //Go nex action
      //damage
      await battleClass!.attacking(
        playerUnitsVariable[0],
        enemyUnitsVariable[0]
      );

      //Judge if life is 0
      removeKilledUnit(playerUnits, playerUnitsVariable, 0);
      removeKilledUnit(enemyUnits, enemyUnitsVariable, 0);

      if (playerUnitsVariable.length === 0 || enemyUnitsVariable.length === 0) {
        if (
          playerUnitsVariable.length === 0 &&
          enemyUnitsVariable.length === 0
        ) {
          _result = RESULT.DRAW;
        } else if (playerUnitsVariable.length === 0) {
          _result = RESULT.LOSE;
        } else if (enemyUnitsVariable.length === 0) {
          _result = RESULT.WIN;
        }
        if (_result !== RESULT.NOT_YET) break;
      }
      loopCount++;
    }

    const signature = await _sign(chainId, contractAddress, battleId, _result);
    return response
      .status(200)
      .json({ battleId: battleId, result: _result, signature: signature });
  }
}
