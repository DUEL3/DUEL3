import {
  RESULT,
  SKILL_TIMING,
  SKILL_EFFECT,
  SKILL_TARGET,
} from "src/constants/interface";
import { SKILLS } from "src/constants/skills";
import Unit, { IUnit } from "./UnitClass";

/**============================
 * Constants
 ============================*/
export default class BattleManager {
  /**============================
   * Variables
   ============================*/
  playerMembers: IUnit[] = [];
  enemyMembers: IUnit[] = [];

  /**============================
   * Constructor
   ============================*/
  //TODO type
  constructor(playerMembers: any[], enemyMembers: any[]) {
    console.log("BattleManager constructor");
    this.playerMembers = playerMembers.map((_unit) => {
      console.log("playerUnit", _unit);
      return new Unit(_unit);
    });
    this.enemyMembers = enemyMembers.map((_unit) => {
      console.log("enemyUnit", _unit);
      return new Unit(_unit);
    });
  }

  /**============================
   * Game flow functions
   ============================*/
  async startOfBattle(): Promise<any> {
    console.log("startOfBattle");

    //Execute skill from behind member
    for (let i = this.playerMembers.length - 1; i >= 0; i--) {
      await this._executeSkill(SKILL_TIMING.StartOfBattle, true, i);
    }

    for (let i = this.enemyMembers.length - 1; i >= 0; i--) {
      await this._executeSkill(SKILL_TIMING.StartOfBattle, false, i);
    }

    //For test
    return await this._returnPlayerAndEnemyMembers();
  }

  async beforeAttack(): Promise<void> {
    console.log("beforeAttack");
    //Execute skill of the timing BeforeAttack by front member
    await this._executeSkill(SKILL_TIMING.BeforeAttack, true, 0);
    await this._executeSkill(SKILL_TIMING.BeforeAttack, false, 0);

    return await this._returnPlayerAndEnemyMembers();
  }

  async attacking(): Promise<void> {
    console.log("attacking");
    //attack
    const _player = this.playerMembers[0];
    const _enemy = this.enemyMembers[0];
    await _player.damageHealth(_enemy.attack());
    await _enemy.damageHealth(_player.attack());

    //Judge if life is 0
    //Because of animation simultaneously, use Promise.all
    await Promise.all([this._judgePlayerKilled(0), this._judgeEnemyKilled(0)]);

    return await this._returnPlayerAndEnemyMembers();
  }

  async judge(): Promise<number> {
    //If no member, game over
    if (this.playerMembers.length === 0 || this.enemyMembers.length === 0) {
      if (this.playerMembers.length > 0) {
        return RESULT.WIN;
      } else if (this.enemyMembers.length > 0) {
        return RESULT.LOSE;
      } else {
        return RESULT.DRAW;
      }
    }
    return RESULT.NOT_YET;
  }

  /**============================
   * Utility functions
   ============================*/
  protected async _judgePlayerKilled(index: number): Promise<void> {
    //Judge if life is 0
    if (this.playerMembers[index].life() === 0) {
      this.playerMembers.splice(index, 1);
    }
  }

  protected async _judgeEnemyKilled(index: number): Promise<void> {
    //Judge if life is 0
    if (this.enemyMembers[index].life() === 0) {
      this.enemyMembers.splice(index, 1);
    }
  }

  private async _returnPlayerAndEnemyMembers(): Promise<any> {
    //return player and enemy members
    const _playerMembersJson = this.playerMembers.map((_unit) => {
      return _unit.toJSON();
    });
    const _enemyMembersJson = this.enemyMembers.map((_unit) => {
      return _unit.toJSON();
    });
    return {
      playerMembers: _playerMembersJson,
      enemyMembers: _enemyMembersJson,
    };
  }

  /**============================
   * Private functions (Skill functions)
   ============================*/
  private _getRandomTargets(num: number, isPlayer: boolean): number[] {
    let _randomIndexes: number[] = [];
    while (_randomIndexes.length < num) {
      const _randomIndex = Math.floor(
        Math.random() *
          //TODO Get members by functions
          (isPlayer ? this.playerMembers.length : this.enemyMembers.length)
      );
      if (!_randomIndexes.includes(_randomIndex)) {
        _randomIndexes.push(_randomIndex);
      }
    }
    return _randomIndexes;
  }

  private _getSkillTarget(
    _skillTarget: SKILL_TARGET,
    _skillValue: number,
    _isFromPlayer: boolean,
    _fromMemberIdx: number
  ): [boolean, number[], number[]] {
    let _isToPlayer: boolean;
    let _unitIndexes: number[] = [];
    let _values: number[] = [];

    switch (_skillTarget) {
      case SKILL_TARGET.RandomPlayer:
        console.log("RandomPlayer");
        if (_isFromPlayer) {
          _isToPlayer = true;
          _unitIndexes = this._getRandomTargets(1, _isToPlayer);
        } else {
          _isToPlayer = false;
          _unitIndexes = this._getRandomTargets(1, _isToPlayer);
        }
        _values = [_skillValue];
        break;

      case SKILL_TARGET.Random2Players:
        console.log("Random2Players");
        if (_isFromPlayer) {
          _isToPlayer = true;
          _unitIndexes = this._getRandomTargets(2, _isToPlayer);
        } else {
          _isToPlayer = false;
          _unitIndexes = this._getRandomTargets(2, _isToPlayer);
        }
        _values = [_skillValue, _skillValue];
        break;

      case SKILL_TARGET.RandomEnemy:
        console.log("RandomEnemy");
        if (_isFromPlayer) {
          _isToPlayer = false;
          _unitIndexes = this._getRandomTargets(1, _isToPlayer);
        } else {
          _isToPlayer = true;
          _unitIndexes = this._getRandomTargets(1, _isToPlayer);
        }
        _values = [_skillValue];
        break;

      case SKILL_TARGET.Random2Enemies:
        console.log("Random2Enemies");
        if (_isFromPlayer) {
          _isToPlayer = false;
          _unitIndexes = this._getRandomTargets(2, _isToPlayer);
        } else {
          _isToPlayer = true;
          _unitIndexes = this._getRandomTargets(2, _isToPlayer);
        }
        _values = [_skillValue, _skillValue];
        break;

      case SKILL_TARGET.InFrontOf:
        console.log("InFrontOf");
        if (_isFromPlayer) {
          _isToPlayer = true;
          _unitIndexes = _fromMemberIdx > 0 ? [_fromMemberIdx - 1] : [];
        } else {
          _isToPlayer = false;
          _unitIndexes = _fromMemberIdx > 0 ? [_fromMemberIdx - 1] : [];
        }
        _values = [_skillValue];
        break;

      case SKILL_TARGET.Behind:
        console.log("Behind");
        if (_isFromPlayer) {
          _isToPlayer = true;
          _unitIndexes =
            _fromMemberIdx < this.playerMembers.length - 1
              ? [_fromMemberIdx + 1]
              : [];
        } else {
          _isToPlayer = false;
          _unitIndexes =
            _fromMemberIdx < this.enemyMembers.length - 1
              ? [_fromMemberIdx + 1]
              : [];
        }
        _values = [_skillValue];
        break;

      default:
        _isToPlayer = false; //TODO error handling
        console.error("Invalid skill target");
    }
    return [_isToPlayer, _unitIndexes, _values];
  }

  private async _emitSkillEffect(
    skillEffect: SKILL_EFFECT,
    isToPlayer: boolean,
    unitIndexes: number[],
    values: number[]
  ): Promise<void> {
    if (unitIndexes.length !== values.length) {
      console.error("emitSkillEffect: Index and value length are not same");
      return;
    }

    for (let i = 0; i < unitIndexes.length; i++) {
      const _unit = isToPlayer
        ? this.playerMembers[unitIndexes[i]]
        : this.enemyMembers[unitIndexes[i]];
      switch (skillEffect) {
        case SKILL_EFFECT.BuffAttack:
          await _unit.buffAttack(values[i]);
          break;
        case SKILL_EFFECT.BuffHealth:
          await _unit.buffHealth(values[i]);
          break;
        case SKILL_EFFECT.Damage:
          await _unit.damageHealth(values[i]);
          if (isToPlayer) {
            await this._judgePlayerKilled(unitIndexes[i]);
          } else {
            await this._judgeEnemyKilled(unitIndexes[i]);
          }
          break;
        case SKILL_EFFECT.DebuffAttack:
          await _unit.debuffAttack(values[i]);
          break;
        default:
          console.error("Invalid skill effect");
      }
    }
  }

  protected async _useSkill(
    _isFromPlayer: boolean,
    _fromMemberIdx: number
  ): Promise<void> {
    console.log("useSkill");
  }

  private async _executeSkill(
    _timing: SKILL_TIMING,
    _isFromPlayer: boolean,
    _fromMemberIdx: number
  ): Promise<void> {
    console.log("executeSkill");

    const _unit: IUnit = _isFromPlayer
      ? this.playerMembers[_fromMemberIdx]
      : this.enemyMembers[_fromMemberIdx];

    for (let i = 0; i < _unit.skillIds.length; i++) {
      const _skill = SKILLS[_unit.skillIds[i]];
      if (_skill.timing !== _timing) continue;

      //TODO If possible, remove this function
      await this._useSkill(_isFromPlayer, _fromMemberIdx);

      const [_isToPlayer, _unitIndexes, _values] = this._getSkillTarget(
        _skill.target,
        _skill.value,
        _isFromPlayer,
        _fromMemberIdx
      );

      await this._emitSkillEffect(
        _skill.effect,
        _isToPlayer,
        _unitIndexes,
        _values
      );
    }
  }
}
