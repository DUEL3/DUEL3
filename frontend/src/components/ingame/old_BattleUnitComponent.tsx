import { useEffect, useState } from "react";
import Image from "next/image";
import { useAnimate } from "framer-motion";
import { type Unit, type UnitVariable } from "src/constants/interface";

interface UnitComponentProps {
  index: number;
  unit?: Unit;
  unitVariable?: UnitVariable;
}
const cellWidth = 32;

const doAnimationNum = async (animateFunc, scope) => {
  await animateFunc(
    scope.current,
    { width: cellWidth * 3, x: -cellWidth, y: -cellWidth },
    { duration: 0.15 }
  );
  await animateFunc(
    scope.current,
    { width: cellWidth, x: 0, y: 0 },
    { duration: 0.15 }
  );
};

const doAnimationAction = async (animateFunc, scope) => {
  await animateFunc(scope.current, { y: -20 }, { duration: 0.1 });
  await animateFunc(scope.current, { y: 0 }, { duration: 0.1 });
  await animateFunc(scope.current, { y: -20 }, { duration: 0.1 });
  await animateFunc(scope.current, { y: 0 }, { duration: 0.1 });
};

const doAnimationFalling = async (animateFunc, scope) => {
  await animateFunc(scope.current, { opacity: 1 }, { duration: 1 });
  await animateFunc(scope.current, { opacity: 0 }, { duration: 1.5 });
};

const BattleUnitComponent = ({ unit, unitVariable }: UnitComponentProps) => {
  const [scopeAction, animateAction] = useAnimate();
  const [scopeAttackNum, animateAttackNum] = useAnimate();
  const [scopeLifeNum, animateLifeNum] = useAnimate();
  const [scopeFalling, animateFalling] = useAnimate();

  //Animation for Attacking
  useEffect(() => {
    const doAnimateAttacking = async (animateFunc, scope) => {
      unitVariable!.isAnimateAttacking = false;
      await doAnimationAction(animateAction, scopeAction);
      // await doAnimationNum(animateFunc, scope);
    };
    if (unitVariable!.isAnimateAttacking) {
      doAnimateAttacking(animateLifeNum, scopeLifeNum);
    }
  }, [unitVariable, animateAction, scopeAction, animateLifeNum, scopeLifeNum]);

  //Animation for Action
  useEffect(() => {
    const doAnimateAction = async () => {
      unitVariable!.isAnimateAction = false;
      await doAnimationAction(animateAction, scopeAction);
    };
    if (unitVariable!.isAnimateAction) {
      doAnimateAction();
    }
  }, [unitVariable, animateAction, scopeAction]);

  //Animation for Number component
  useEffect(() => {
    const doAnimateNum = async (animateFunc, scope) => {
      await doAnimationFalling(animateFalling, scopeFalling);
      // await doAnimationNum(animateFunc, scope);
    };

    if (unitVariable!.isAnimateBuffLife) {
      unitVariable!.isAnimateBuffLife = 0;
      doAnimateNum(animateLifeNum, scopeLifeNum);
    }
    if (unitVariable!.isAnimateBuffAttack) {
      //TODO change images
      unitVariable!.isAnimateBuffAttack = 0;
      doAnimateNum(animateAttackNum, scopeAttackNum);
    }
    if (unitVariable!.isAnimateDebuffLife) {
      unitVariable!.isAnimateDebuffLife = 0;
      doAnimateNum(animateLifeNum, scopeLifeNum);
    }
    if (unitVariable!.isAnimateDebuffAttack) {
      unitVariable!.isAnimateDebuffAttack = 0;
      doAnimateNum(animateAttackNum, scopeAttackNum);
    }
  }, [
    unitVariable,
    animateAttackNum,
    scopeAttackNum,
    animateLifeNum,
    scopeLifeNum,
    animateFalling,
    scopeFalling,
  ]);

  if (!unit || !unitVariable) return;
  let effectImg = <></>;
  if (
    unitVariable.isAnimateBuffLife > 0 ||
    unitVariable.isAnimateDebuffLife > 0
  ) {
    effectImg = (
      <Image src="/images/common/life.png" alt="" width={28} height={28} />
    );
  } else if (
    unitVariable.isAnimateBuffAttack > 0 ||
    unitVariable.isAnimateDebuffAttack > 0
  ) {
    effectImg = (
      <Image src="/images/common/attack.png" alt="" width={28} height={28} />
    );
  }
  let effectValue = "";
  if (unitVariable.isAnimateBuffLife > 0) {
    effectValue = "+" + unitVariable.isAnimateBuffLife;
  } else if (unitVariable.isAnimateDebuffLife > 0) {
    effectValue = "-" + unitVariable.isAnimateDebuffLife;
  } else if (unitVariable.isAnimateBuffAttack > 0) {
    effectValue = "+" + unitVariable.isAnimateBuffAttack;
  } else if (unitVariable.isAnimateDebuffAttack > 0) {
    effectValue = "-" + unitVariable.isAnimateDebuffAttack;
  }

  return (
    <>
      <div
        ref={scopeFalling}
        className="flex justify-center items-center mb-2 h-8"
      >
        {effectImg}
        <div className="text-xl font-bold ml-1">{effectValue}</div>
      </div>
      <div ref={scopeAction}>
        <Image
          src={`/images/cards/${unit.imagePath}.png`}
          alt=""
          width={96}
          height={96}
        />
      </div>
      <div className="flex justify-between mt-1">
        <div className={"relative left-1"}>
          <Image
            src="/images/common/attack.png"
            alt=""
            width={36}
            height={36}
          />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
            {unitVariable.attack}
          </div>
        </div>
        <div className={"relative right-1"}>
          <Image src="/images/common/life.png" alt="" width={36} height={36} />

          <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
            {unitVariable.life}
          </div>
        </div>
      </div>
    </>
  );
};

// const NumberComponent = ({ value, scope }) => {
//   return (
//     <div
//       ref={scope}
//       style={{
//         position: "absolute",
//         left: 2,
//         top: 3,
//         width: cellWidth,
//       }}
//     >
//       <Image
//         src={`/images/common/numbers/${value}.png`}
//         alt=""
//         width={120}
//         height={120}
//       />
//     </div>
//   );
// };

export default BattleUnitComponent;
