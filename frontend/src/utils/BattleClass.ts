import {
  type UnitVariable,
  Skill,
  SKILL_EFFECT,
  SKILL_TARGET,
} from "src/constants/interface";
import { abiEncodePacked } from "src/utils/Utils";

export type RandomSeed = {
  prevBlockNumber: BigInt;
  timestamp: BigInt;
  txOrigin: `0x${string}`;
};

export default class BattleClass {
  /**============================
   * Variables
   ============================*/
  readonly battleId: number;
  readonly randomSeed: RandomSeed;
  private _randomIndex = 0;

  /**============================
   * Constructor
   ============================*/
  constructor(battleId: number, randomSeed: RandomSeed) {
    this.battleId = battleId;
    this.randomSeed = randomSeed;
  }

  /**============================
   * Public functions
   ============================*/
  getRandomNumber(_maxIdx: number): number {
    // return uint256(keccak256(abi.encodePacked(_battleId, randomSeed.prevBlockNumber, randomSeed.timestamp, randomSeed.txOrigin, _index)));
    const prevBlockNumber = this.randomSeed[0];
    const timestamp = this.randomSeed[1];
    const txOrigin = this.randomSeed[2];
    const _encoded = abiEncodePacked(
      ["uint256", "uint256", "uint256", "address", "uint8"],
      [this.battleId, prevBlockNumber, timestamp, txOrigin, this._randomIndex]
    );
    const _randomNum = _encoded % BigInt(_maxIdx);
    this._randomIndex++;
    return Number(_randomNum);
  }

  getRandomNumbers(_maxIdx: number, _num: number): number[] {
    const uniqueNumbers = new Set<number>();
    const limit = Math.min(_maxIdx, _num);

    while (uniqueNumbers.size < limit) {
      const _rand = this.getRandomNumber(_maxIdx);
      uniqueNumbers.add(_rand);
    }

    return Array.from(uniqueNumbers);
  }

  async executeSkill(
    _playerVals: UnitVariable[],
    _enemyVals: UnitVariable[],
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _skill: Skill
  ): Promise<void> {
    console.log("executeSkill", _isFromPlayer, _fromUnitIdx, _skill.name);

    const [_isToPlayer, _toIndexes] = this._getSkillTarget(
      _playerVals,
      _enemyVals,
      _isFromPlayer,
      _fromUnitIdx,
      _skill.target
    );
    //_values length is same as _unitIndexes length
    const _values = _toIndexes.map(() => _skill.value);

    await this._emitSkill(
      _playerVals,
      _enemyVals,
      _isFromPlayer,
      _fromUnitIdx,
      _isToPlayer,
      _toIndexes,
      _values,
      _skill.effect
    );
  }

  async attacking(
    _playerVal: UnitVariable,
    _enemyVal: UnitVariable
  ): Promise<void> {
    console.log("attacking");
    this._debuffLife(_playerVal, _enemyVal.attack);
    this._debuffLife(_enemyVal, _playerVal.attack);
  }

  /**============================
   * Private and Protected functions
   ============================*/
  private _getSkillTarget(
    _playerVals: UnitVariable[],
    _enemyVals: UnitVariable[],
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _skillTarget: SKILL_TARGET
  ): [boolean, number[]] {
    let _isToPlayer: boolean = false;
    let _toIndexes: number[] = [];

    switch (_skillTarget) {
      case SKILL_TARGET.RandomPlayer:
        if (_isFromPlayer) {
          _isToPlayer = true;
          _toIndexes = [this.getRandomNumber(_playerVals.length)];
        } else {
          _isToPlayer = false;
          _toIndexes = [this.getRandomNumber(_enemyVals.length)];
        }
        break;

      case SKILL_TARGET.Random2Players:
        if (_isFromPlayer) {
          _isToPlayer = true;
          _toIndexes = this.getRandomNumbers(_playerVals.length, 2);
        } else {
          _isToPlayer = false;
          _toIndexes = this.getRandomNumbers(_enemyVals.length, 2);
        }
        break;

      case SKILL_TARGET.RandomEnemy:
        if (_isFromPlayer) {
          _isToPlayer = false;
          _toIndexes = [this.getRandomNumber(_enemyVals.length)];
        } else {
          _isToPlayer = true;
          _toIndexes = [this.getRandomNumber(_playerVals.length)];
        }
        break;

      case SKILL_TARGET.Random2Enemies:
        if (_isFromPlayer) {
          _isToPlayer = false;
          _toIndexes = this.getRandomNumbers(_enemyVals.length, 2);
        } else {
          _isToPlayer = true;
          _toIndexes = this.getRandomNumbers(_playerVals.length, 2);
        }
        break;

      case SKILL_TARGET.InFrontOf:
        if (_isFromPlayer) {
          _isToPlayer = true;
          if (_fromUnitIdx > 0) {
            _toIndexes = [_fromUnitIdx - 1];
          } else {
            _toIndexes = [];
          }
        } else {
          _isToPlayer = false;
          if (_fromUnitIdx > 0) {
            _toIndexes = [_fromUnitIdx - 1];
          } else {
            _toIndexes = [];
          }
        }
        break;

      case SKILL_TARGET.Behind:
        if (_isFromPlayer) {
          _isToPlayer = true;
          _toIndexes =
            _fromUnitIdx < _playerVals.length - 1 ? [_fromUnitIdx + 1] : [];
        } else {
          _isToPlayer = false;
          _toIndexes =
            _fromUnitIdx < _enemyVals.length - 1 ? [_fromUnitIdx + 1] : [];
        }
        break;

      default:
        //TODO error handling
        console.error("Invalid skill target");
    }
    return [_isToPlayer, _toIndexes];
  }

  protected async _emitSkill(
    _playerVals: UnitVariable[],
    _enemyVals: UnitVariable[],
    _isFromPlayer: boolean, //unused, for animation
    _fromUnitIdx: number, //unused, for animation
    _isToPlayer: boolean,
    _toIndexes: number[],
    _values: number[],
    _skillEffect: SKILL_EFFECT
  ): Promise<void> {
    if (_toIndexes.length !== _values.length) {
      console.error("emitSkillEffect: Index and value length are not same");
      return;
    }

    for (let i = 0; i < _toIndexes.length; i++) {
      const _unitVals = _isToPlayer ? _playerVals : _enemyVals;

      //BuffAttack
      if (_skillEffect === SKILL_EFFECT.BuffAttack) {
        _unitVals[_toIndexes[i]].attack += _values[i];

        await this.animateBuffAttack(
          _isFromPlayer,
          _fromUnitIdx,
          _isToPlayer,
          _toIndexes[i],
          _unitVals[_toIndexes[i]].attack
        );

        //BuffHealth
      } else if (_skillEffect === SKILL_EFFECT.BuffHealth) {
        _unitVals[_toIndexes[i]].life += _values[i];

        await this.animateBuffLife(
          _isFromPlayer,
          _fromUnitIdx,
          _isToPlayer,
          _toIndexes[i],
          _unitVals[_toIndexes[i]].life
        );

        //Damage
      } else if (_skillEffect === SKILL_EFFECT.Damage) {
        this._debuffLife(_unitVals[_toIndexes[i]], _values[i]);
        //TODO remove killed unit from array

        await this.animateDebuffLife(
          _isFromPlayer,
          _fromUnitIdx,
          _isToPlayer,
          _toIndexes[i],
          _unitVals[_toIndexes[i]].life
        );

        //DebuffAttack
      } else if (_skillEffect === SKILL_EFFECT.DebuffAttack) {
        this._debuffAttack(_unitVals[_toIndexes[i]], _values[i]);

        await this.animateDebuffAttack(
          _isFromPlayer,
          _fromUnitIdx,
          _isToPlayer,
          _toIndexes[i],
          _unitVals[_toIndexes[i]].attack
        );

        //Default error handling
      } else {
        console.error("Invalid skill effect");
      }
    }
  }

  private _debuffAttack(_unitVal: UnitVariable, _value: number): void {
    if (_unitVal.attack < _value) _value = _unitVal.attack;
    _unitVal.attack -= _value;
  }

  private _debuffLife(_unitVal: UnitVariable, _value: number): void {
    if (_unitVal.life < _value) _value = _unitVal.life;
    _unitVal.life -= _value;
  }

  /**============================
   * Protected functions for animation
   ============================*/
  protected async animateBuffAttack(
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _isToPlayer: boolean,
    _toUnitIdx: number,
    _changedVal: number
  ): Promise<void> {}

  protected async animateBuffLife(
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _isToPlayer: boolean,
    _toUnitIdx: number,
    _changedVal: number
  ): Promise<void> {}

  protected async animateDebuffAttack(
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _isToPlayer: boolean,
    _toUnitIdx: number,
    _changedVal: number
  ): Promise<void> {}

  protected async animateDebuffLife(
    _isFromPlayer: boolean,
    _fromUnitIdx: number,
    _isToPlayer: boolean,
    _toUnitIdx: number,
    _changedVal: number
  ): Promise<void> {}
}
