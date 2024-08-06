import { useState, useEffect } from "react";
import Image from "next/image";
import BattleUnitComponent from "src/components/ingame/old_BattleUnitComponent";
import CoverComponent from "src/components/ingame/CoverComponent";
import {
  type Unit,
  type UnitVariable,
  unitVariableDefaultValues,
  RESULT,
  SKILL_TIMING,
  SCENE,
} from "src/constants/interface";
import { SKILLS } from "src/constants/skills";
import { units } from "src/constants/units";
import {
  useReadPlayerUnits,
  useReadRandomSeeds,
  useReadGetEnemyUnits,
} from "src/hooks/useContractManager";
import BattleClass from "src/utils/BattleClass";

enum PHASE {
  BEFORE_BATTLE,
  BEFORE_ATTACK,
  ATTACKING,
}

const BattleScenesOld = ({ setScene, setResult, battleId, stage }) => {
  /**============================
 * useState
 ============================*/
  const [phase, setPhase] = useState(PHASE.BEFORE_BATTLE);
  const [isCoverVisible, setCoverVisible] = useState(true);
  const [playerUnits, setPlayerUnits] = useState<Unit[]>([]);
  const [playerUnitsVariable, setPlayerUnitsVariable] = useState<
    UnitVariable[]
  >([]);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);
  const [enemyUnitsVariable, setEnemyUnitsVariable] = useState<UnitVariable[]>(
    []
  );
  const [battleClass, setBattleClass] = useState<BattleClass | null>(null);

  /**============================
 * useReadContract
 ============================*/
  const dataPlayerUnits = useReadPlayerUnits();
  console.log("stage", stage);
  const dataReadEnemyUnitsByStage = useReadGetEnemyUnits(stage);
  const randomSeed = useReadRandomSeeds(battleId);
  console.log("dataReadEnemyUnitsByStage", dataReadEnemyUnitsByStage);

  /**============================
 * useEffect
 ============================*/
  //New BattleClass instance
  useEffect(() => {
    if (randomSeed) {
      setBattleClass(new BattleClass(battleId, randomSeed));
    }
  }, [randomSeed, battleId]);

  //Set player units by contract data
  useEffect(() => {
    if (dataPlayerUnits) {
      const _playerUnits: Unit[] = [];
      //0-4
      [0, 1, 2, 3, 4].forEach((i) => {
        if (
          dataPlayerUnits[i] === undefined ||
          Number(dataPlayerUnits[i]) === 0
        )
          return;
        _playerUnits.push(units[Number(dataPlayerUnits[i])]);
      });
      setPlayerUnits(_playerUnits);

      const _playerUnitsVariable: UnitVariable[] = _playerUnits.map(
        (unit: Unit) => {
          return {
            life: unit.life,
            attack: unit.attack,
            ...unitVariableDefaultValues,
          };
        }
      );
      setPlayerUnitsVariable(_playerUnitsVariable);
    }
  }, [dataPlayerUnits]);

  //Set enemy units by stage
  useEffect(() => {
    if (stage >= 0 && dataReadEnemyUnitsByStage) {
      const _enemyUnits: Unit[] = [];
      for (const id of dataReadEnemyUnitsByStage as []) {
        if (Number(id) === 0) continue;
        _enemyUnits.push(units[Number(id)]);
      }
      setEnemyUnits(_enemyUnits);

      const _enemyUnitsVariable: UnitVariable[] = _enemyUnits.map(
        (unit: Unit) => {
          return {
            life: unit.life,
            attack: unit.attack,
            ...unitVariableDefaultValues,
          };
        }
      );
      setEnemyUnitsVariable(_enemyUnitsVariable);
    }
  }, [stage, dataReadEnemyUnitsByStage]);

  //Judge if player or enemy is dead
  useEffect(() => {
    const judge = async (): Promise<void> => {
      if (phase === PHASE.BEFORE_BATTLE) return;
      if (playerUnitsVariable.length === 0 || enemyUnitsVariable.length === 0) {
        if (
          playerUnitsVariable.length === 0 &&
          enemyUnitsVariable.length === 0
        ) {
          setResult(RESULT.DRAW);
        } else if (playerUnitsVariable.length === 0) {
          setResult(RESULT.LOSE);
        } else if (enemyUnitsVariable.length === 0) {
          setResult(RESULT.WIN);
        }
        setScene(SCENE.Over);
      }
    };
    judge();
  }, [playerUnitsVariable, enemyUnitsVariable, setResult, setScene, phase]);

  /**============================
 * Logic
 ============================*/
  const removeKilledUnit = (isPlayer: boolean, index: number) => {
    const unitsVariable = isPlayer ? playerUnitsVariable : enemyUnitsVariable;
    //Judge if life is 0
    if (unitsVariable[index].life === 0) {
      //Remove dead unit from playerUnits and playerUnitsVariable or enemyUnits and enemyUnitsVariable and set again
      if (isPlayer) {
        setPlayerUnits(playerUnits.filter((_, i) => i !== index));
        setPlayerUnitsVariable(
          playerUnitsVariable.filter((_, i) => i !== index)
        );
      } else {
        setEnemyUnits(enemyUnits.filter((_, i) => i !== index));
        setEnemyUnitsVariable(enemyUnitsVariable.filter((_, i) => i !== index));
      }
    }
  };

  /**============================
 * Functions(Flow)
 ============================*/
  /**
   * Start of battle
   * Execute skill order: PlayerUnit[0] -> EnemyUnit[0] -> PlayerUnit[1] -> EnemyUnit[1] -> ...
   */
  const startOfBattle = async () => {
    setCoverVisible(false);
    await new Promise((resolve) => setTimeout(resolve, 300));

    for (let i = 0; i < 5; i++) {
      if (playerUnits[i]) {
        for (let j = 0; j < playerUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[playerUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            console.log("executeSkill", true, i);
            playerUnitsVariable[i].isAnimateAction = true;
            setPlayerUnitsVariable([...playerUnitsVariable]);
            await new Promise((resolve) => setTimeout(resolve, 500));

            await battleClass!.executeSkill(
              playerUnitsVariable,
              enemyUnitsVariable,
              true,
              i,
              _skill
            );
            setPlayerUnitsVariable([...playerUnitsVariable]); //reflesh
            setEnemyUnitsVariable([...enemyUnitsVariable]);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
      if (enemyUnits[i]) {
        for (let j = 0; j < enemyUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[enemyUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            console.log("executeSkill", false, i);
            enemyUnitsVariable[i].isAnimateAction = true;
            setEnemyUnitsVariable([...enemyUnitsVariable]);
            await new Promise((resolve) => setTimeout(resolve, 500));

            await battleClass!.executeSkill(
              playerUnitsVariable,
              enemyUnitsVariable,
              false,
              i,
              _skill
            );
            setPlayerUnitsVariable([...playerUnitsVariable]); //reflesh
            setEnemyUnitsVariable([...enemyUnitsVariable]);
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }
    }
    setPhase(PHASE.BEFORE_ATTACK);
  };

  const goNextAction = async () => {
    if (phase === PHASE.BEFORE_ATTACK) {
      //beforeAttack
      setPhase(PHASE.ATTACKING);
      //TODO revive
      // await _executeSkill(SKILL_TIMING.BeforeAttack, true, 0);
      // await _executeSkill(SKILL_TIMING.BeforeAttack, false, 0);

      //attacking
      console.log("attacking");
      playerUnitsVariable[0].isAnimateAttacking = true;
      enemyUnitsVariable[0].isAnimateAttacking = true;
      setPlayerUnitsVariable([...playerUnitsVariable]);
      setEnemyUnitsVariable([...enemyUnitsVariable]);
      // sleep;
      await new Promise((resolve) => setTimeout(resolve, 600));

      //damage
      console.log("damage");
      // battleClass!.damageLife(
      //   playerUnitsVariable,
      //   0,
      //   enemyUnitsVariable[0].attack
      // );
      // battleClass!.damageLife(
      //   enemyUnitsVariable,
      //   0,
      //   playerUnitsVariable[0].attack
      // );
      setPlayerUnitsVariable([...playerUnitsVariable]); //refresh
      setEnemyUnitsVariable([...enemyUnitsVariable]); //refresh

      // sleep;
      await new Promise((resolve) => setTimeout(resolve, 400));

      //Judge if life is 0
      removeKilledUnit(true, 0);
      removeKilledUnit(false, 0);

      //Back to beforeAttack
      setPhase(PHASE.BEFORE_ATTACK);
    }
  };

  /**============================
 * Rendering
 ============================*/
  //TODO
  if (battleClass === null) return <div>Loading...</div>;

  const UnitSection = ({ units, unitsVariable, isPlayer }) => (
    <section className="" style={{ width: "600px" }}>
      <div
        className="p-2 flex"
        style={{ flexDirection: isPlayer ? "row-reverse" : "row" }}
      >
        {units.map((unit, index) => (
          <div className="mx-1" key={index}>
            <BattleUnitComponent
              index={index}
              unit={unit}
              unitVariable={unitsVariable[index]}
            />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <>
      <div className="flex flex-col items-center m-auto">
        <CoverComponent
          isCoverVisible={isCoverVisible}
          onClick={startOfBattle}
          text={"START"}
        />
        <main style={{ width: "1280px" }}>
          <div className="flex flex-col">
            <section className="mt-48 mx-auto flex justify-center">
              <UnitSection
                units={playerUnits}
                unitsVariable={playerUnitsVariable}
                isPlayer={true}
              />
              <UnitSection
                units={enemyUnits}
                unitsVariable={enemyUnitsVariable}
                isPlayer={false}
              />
            </section>
            <section className="mt-16 mb-8">
              <div className="text-center">
                <button
                  className="bg-btn font-bold pl-14 pr-12 py-1 rounded-md text-decoration-none hover:opacity-90"
                  onClick={() => {
                    goNextAction();
                  }}
                >
                  <Image
                    src="/images/common/resume.png"
                    alt=""
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default BattleScenesOld;
