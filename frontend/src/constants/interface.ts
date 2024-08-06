export enum SKILL_TIMING {
  StartOfBattle,
  BeforeAttack,
  KnockOut,
}
export enum SKILL_EFFECT {
  BuffAttack,
  BuffHealth,
  Damage,
  DebuffAttack,
}
export enum SKILL_TARGET {
  RandomPlayer,
  Random2Players,
  RandomEnemy,
  Random2Enemies,
  InFrontOf,
  Behind,
}

export enum SCENE {
  Enter,
  Edit,
  Battle,
  Over,
}

export enum RESULT {
  NOT_YET,
  WIN,
  LOSE,
  DRAW,
}

export enum TUTORIAL {
  None,
  Start,
  MoveSubUnit,
  ReverseUnit,
}

export type Unit = {
  id: number;
  name: string;
  imagePath: string;
  attack: number;
  life: number;
  description: string;
  skillIds: number[];
};

export const unitVariableDefaultValues = {
  isAnimateAction: false,
  isAnimateBuffAttack: 0,
  isAnimateBuffLife: 0,
  isAnimateDebuffAttack: 0,
  isAnimateDebuffLife: 0,
  isAnimateAttacking: false,
};

export type UnitVariable = {
  life: number;
  attack: number;
  isAnimateAction: boolean;
  isAnimateBuffLife: number;
  isAnimateBuffAttack: number;
  isAnimateDebuffLife: number;
  isAnimateDebuffAttack: number;
  isAnimateAttacking: boolean;
};

export interface Skill {
  id: number;
  name: string;
  description: string;
  timing: SKILL_TIMING;
  effect: SKILL_EFFECT;
  target: SKILL_TARGET;
  value: number;
}
