import { Unit } from "src/constants/interface";

export interface IUnit {
  id: number;
  name: string;
  imagePath: string;
  life(): number;
  attack(): number;
  description: string;
  skillIds: number[];
  buffAttack(value: number): Promise<void>;
  buffHealth(value: number): Promise<void>;
  damageHealth(value: number): Promise<void>;
  debuffAttack(value: number): Promise<void>;
  toJSON(): Unit;
}

/**============================
 * Constants
 ============================*/

export default class UnitClass implements IUnit {
  /**============================
 * Variables
 ============================*/
  readonly id: number;
  readonly name: string;
  readonly imagePath: string;
  protected _life: number;
  protected _attack: number;
  readonly description: string;
  readonly skillIds: number[];

  /**============================
 * Constructor
 ============================*/
  constructor(unit: Unit) {
    this.id = unit.id;
    this.name = unit.name;
    this.imagePath = unit.imagePath;
    this._life = unit.life;
    this._attack = unit.attack;
    this.description = unit.description;
    this.skillIds = unit.skillIds;
  }

  /**============================
 * Functions(getters)
 ============================*/
  life(): number {
    return this._life;
  }

  attack(): number {
    return this._attack;
  }

  /**============================
 * Logic
 ============================*/
  async buffAttack(value: number): Promise<void> {
    this._attack += value;
  }

  async buffHealth(value: number): Promise<void> {
    this._life += value;
  }

  async damageHealth(value: number): Promise<void> {
    this._life = this._life > value ? (this._life -= value) : 0;
  }

  async debuffAttack(value: number): Promise<void> {
    this._attack = this._attack > value ? (this._attack -= value) : 0;
  }

  /**============================
 * Utility functions
 ============================*/
  toJSON(): Unit {
    return {
      id: this.id,
      name: this.name,
      imagePath: this.imagePath,
      life: this._life,
      attack: this._attack,
      description: this.description,
      skillIds: this.skillIds,
    };
  }
}
