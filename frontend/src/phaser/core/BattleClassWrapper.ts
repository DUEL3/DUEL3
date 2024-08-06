import {
  type UnitVariable,
  Skill,
  SKILL_EFFECT,
} from "src/constants/interface";
import BattleClass, { RandomSeed } from "src/utils/BattleClass";
import PhaserUnitsRender from "./PhaserUnitsRender";

export default class BattleClassWrapper extends BattleClass {
  private render: PhaserUnitsRender;

  constructor(
    battleId: number,
    randomSeed: RandomSeed,
    render: PhaserUnitsRender
  ) {
    super(battleId, randomSeed);
    this.render = render;
  }

  async executeSkill(
    _playerVals: UnitVariable[],
    _enemyVals: UnitVariable[],
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _skill: Skill
  ): Promise<void> {
    return super.executeSkill(
      _playerVals,
      _enemyVals,
      _isFromPlayer,
      _fromUnitIdx,
      _skill
    );
  }

  protected async _emitSkill(
    _playerVals: UnitVariable[],
    _enemyVals: UnitVariable[],
    _isFromPlayer: boolean, //unused, for animation
    _fromUnitIdx: number, //unused, for animation
    _isToPlayer: boolean,
    _unitIndexes: number[],
    _values: number[],
    _skillEffect: SKILL_EFFECT
  ): Promise<void> {
    await this.render.animateUseSkill(_isFromPlayer, _fromUnitIdx);

    await super._emitSkill(
      _playerVals,
      _enemyVals,
      _isFromPlayer,
      _fromUnitIdx,
      _isToPlayer,
      _unitIndexes,
      _values,
      _skillEffect
    );
  }

  protected async animateBuffAttack(
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _isToPlayer: boolean,
    _toUnitIdx: number,
    _changedVal: number
  ): Promise<void> {
    await this.render.animateEffectBuffAttack(
      _isFromPlayer,
      _fromUnitIdx,
      _isToPlayer,
      _toUnitIdx
    );
    await this.render.animateChangeAttack(_isToPlayer, _toUnitIdx, _changedVal);
  }

  protected async animateBuffLife(
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _isToPlayer: boolean,
    _toUnitIdx: number,
    _changedVal: number
  ): Promise<void> {
    await this.render.animateEffectBuffLife(
      _isFromPlayer,
      _fromUnitIdx,
      _isToPlayer,
      _toUnitIdx
    );
    await this.render.animateChangeLife(_isToPlayer, _toUnitIdx, _changedVal);
  }

  protected async animateDebuffAttack(
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _isToPlayer: boolean,
    _toUnitIdx: number,
    _changedVal: number
  ): Promise<void> {
    await this.render.animateEffectDebuffAttack(
      _isFromPlayer,
      _fromUnitIdx,
      _isToPlayer,
      _toUnitIdx
    );
    await this.render.animateChangeAttack(_isToPlayer, _toUnitIdx, _changedVal);
  }

  protected async animateDebuffLife(
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _isToPlayer: boolean,
    _toUnitIdx: number,
    _changedVal: number
  ): Promise<void> {
    await this.render.animateEffectDebuffLife(
      _isFromPlayer,
      _fromUnitIdx,
      _isToPlayer,
      _toUnitIdx
    );
    await this.render.animateChangeLife(_isToPlayer, _toUnitIdx, _changedVal);
  }
}
