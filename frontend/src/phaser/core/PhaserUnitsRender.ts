import "phaser";
import { type Unit } from "src/constants/interface";

/**============================
 * Constants
 ============================*/
const POS_PLAYER_UNITS = [
  { x: 1080, y: 700 },
  { x: 840, y: 1120 },
  { x: 1180, y: 1120 },
  { x: 1540, y: 1120 },
  { x: 1880, y: 1120 },
];
const POS_ENEMY_UNITS = [
  { x: 1640, y: 700 },
  { x: 1880, y: 280 },
  { x: 1540, y: 280 },
  { x: 1180, y: 280 },
  { x: 840, y: 280 },
];
const POS_ATTACK_NUM = {
  x: -98,
  y: 155,
};
const POS_LIFE_NUM = {
  x: 100,
  y: 155,
};

export default class PhaserUnitsRender {
  /**============================
 * Variables
 ============================*/
  private scene: Phaser.Scene;
  private playerEmptyImages: Phaser.GameObjects.Image[] = [];
  private enemyEmptyImages: Phaser.GameObjects.Image[] = [];
  private playerUnitsImages: Phaser.GameObjects.Image[] = [];
  private playerLifeNumImages: Phaser.GameObjects.Image[] = [];
  private playerAttackNumImages: Phaser.GameObjects.Image[] = [];
  private enemyUnitsImages: Phaser.GameObjects.Image[] = [];
  private enemyLifeNumImages: Phaser.GameObjects.Image[] = [];
  private enemyAttackNumImages: Phaser.GameObjects.Image[] = [];

  /**============================
   * Constructor
   ============================*/
  //Override
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  /**============================
   * Functions(Rendering)
   ============================*/
  renderEmpties(): void {
    POS_PLAYER_UNITS.forEach((pos) => {
      this.playerEmptyImages.push(
        this.scene.add
          .image(pos.x, pos.y, "empty")
          .setScale(0.33)
          .setOrigin(0.5, 0.5)
      );
    });
    POS_ENEMY_UNITS.forEach((pos) => {
      this.enemyEmptyImages.push(
        this.scene.add
          .image(pos.x, pos.y, "empty")
          .setScale(0.33)
          .setOrigin(0.5, 0.5)
      );
    });
  }

  renderUnits(isPlayer: boolean, units: Unit[]): void {
    const unitImages = isPlayer
      ? this.playerUnitsImages
      : this.enemyUnitsImages;
    const lifeNumImages = isPlayer
      ? this.playerLifeNumImages
      : this.enemyLifeNumImages;
    const attackNumImages = isPlayer
      ? this.playerAttackNumImages
      : this.enemyAttackNumImages;
    const positions = isPlayer ? POS_PLAYER_UNITS : POS_ENEMY_UNITS;

    units.forEach((unit, i) => {
      const unitImage = this.scene.add
        .image(positions[i].x, positions[i].y, "" + unit.imagePath)
        .setScale(0.33)
        .setOrigin(0.5, 0.5);

      //Tooltip interaction
      unitImage.setInteractive();
      unitImage.on("pointerover", () =>
        this._onUnitHover(
          unit.name,
          unit.life,
          unit.attack,
          unit.description,
          true
        )
      );
      unitImage.on("pointerout", () => this._onUnitHover("", 0, 0, "", false));

      unitImages.push(unitImage);

      // Attack
      attackNumImages.push(
        this.scene.add
          .image(
            positions[i].x + POS_ATTACK_NUM.x,
            positions[i].y + POS_ATTACK_NUM.y,
            "numbers",
            unit.attack
          )
          .setScale(0.6)
          .setOrigin(0.5, 0.5)
      );

      // Life
      lifeNumImages.push(
        this.scene.add
          .image(
            positions[i].x + POS_LIFE_NUM.x,
            positions[i].y + POS_LIFE_NUM.y,
            "numbers",
            unit.life
          )
          .setScale(0.6)
          .setOrigin(0.5, 0.5)
      );
    });
  }

  async spliceUnit(isPlayer: boolean, idx: number): Promise<void> {
    const images = isPlayer ? this.playerUnitsImages : this.enemyUnitsImages;
    const lifeImages = isPlayer
      ? this.playerLifeNumImages
      : this.enemyLifeNumImages;
    const attackImages = isPlayer
      ? this.playerAttackNumImages
      : this.enemyAttackNumImages;
    const positions = isPlayer ? POS_PLAYER_UNITS : POS_ENEMY_UNITS;

    images[idx].destroy();
    lifeImages[idx].destroy();
    attackImages[idx].destroy();

    const tweens: Promise<void>[] = [];

    for (let i = idx + 1; i < images.length; i++) {
      const _diffPos = {
        x: positions[i - 1].x - positions[i].x,
        y: positions[i - 1].y - positions[i].y,
      };

      tweens.push(
        new Promise<void>((resolve) => {
          this.scene.tweens.add({
            targets: [images[i], lifeImages[i], attackImages[i]],
            x: `+=${_diffPos.x}`,
            y: `+=${_diffPos.y}`,
            duration: 500,
            ease: "Power2",
            onComplete: () => {
              resolve();
            },
          });
        })
      );
    }

    await Promise.all(tweens);

    images.splice(idx, 1);
    lifeImages.splice(idx, 1);
    attackImages.splice(idx, 1);
  }

  //For tooltip
  private _onUnitHover(
    name: string,
    life: number,
    attack: number,
    description: string,
    isHovering: boolean
  ): void {
    if (isHovering) {
      this.scene.events.emit("show-tooltip", name, life, attack, description);
    } else {
      this.scene.events.emit("hide-tooltip");
    }
  }

  /**============================
   * Functions(Animation)
   ============================*/
  async animateAttack(isPlayer: boolean): Promise<void> {
    const _targetImgs = isPlayer
      ? [
          this.playerUnitsImages[0],
          this.playerLifeNumImages[0],
          this.playerAttackNumImages[0],
        ]
      : [
          this.enemyUnitsImages[0],
          this.enemyLifeNumImages[0],
          this.enemyAttackNumImages[0],
        ];
    const direction = isPlayer ? -1 : 1; // Determine direction based on isPlayer

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: _targetImgs,
        x: `+=${10 * direction}`,
        duration: 200,
        ease: "Power1",
        yoyo: true,
        onYoyo: () => {
          this.scene.tweens.add({
            targets: _targetImgs,
            x: `-=${160 * direction}`,
            duration: 100,
            ease: "Power2",
            yoyo: true,
            onYoyo: () => {
              this.scene.tweens.add({
                targets: _targetImgs,
                x: `+=${150 * direction}`,
                duration: 200,
                ease: "Power1",
                onComplete: () => {
                  resolve();
                },
              });
            },
          });
        },
      });
    });
  }

  async animateUseSkill(isPlayer: boolean, idx: number): Promise<void> {
    const _targetImg = isPlayer
      ? this.playerUnitsImages[idx]
      : this.enemyUnitsImages[idx];
    const _flashOverlay = this.scene.add
      .rectangle(
        _targetImg.x,
        _targetImg.y,
        _targetImg.width,
        _targetImg.height,
        0x000000,
        1 // alpha
      )
      .setScale(0.33)
      .setOrigin(0.5, 0.5);

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: _flashOverlay,
        alpha: { from: 1, to: 0 },
        duration: 140,
        ease: "Power2",
        yoyo: true,
        onComplete: () => {
          _flashOverlay.destroy();
          resolve();
        },
      });
    });
  }

  async animateEffectBuffLife(
    isFromPlayer: boolean,
    fromIdx: number,
    isToPlayer: boolean,
    toIdx: number
  ): Promise<void> {
    await this._animateEffectBuffOrDebuff(
      isFromPlayer,
      fromIdx,
      isToPlayer,
      toIdx,
      "buff_life"
    );
  }

  async animateEffectBuffAttack(
    isFromPlayer: boolean,
    fromIdx: number,
    isToPlayer: boolean,
    toIdx: number
  ): Promise<void> {
    await this._animateEffectBuffOrDebuff(
      isFromPlayer,
      fromIdx,
      isToPlayer,
      toIdx,
      "buff_attack"
    );
  }

  async animateEffectDebuffLife(
    isFromPlayer: boolean,
    fromIdx: number,
    isToPlayer: boolean,
    toIdx: number
  ): Promise<void> {
    await this._animateEffectBuffOrDebuff(
      isFromPlayer,
      fromIdx,
      isToPlayer,
      toIdx,
      "debuff_life"
    );
  }

  async animateEffectDebuffAttack(
    isFromPlayer: boolean,
    fromIdx: number,
    isToPlayer: boolean,
    toIdx: number
  ): Promise<void> {
    await this._animateEffectBuffOrDebuff(
      isFromPlayer,
      fromIdx,
      isToPlayer,
      toIdx,
      "debuff_attack"
    );
  }

  private async _animateEffectBuffOrDebuff(
    isFromPlayer: boolean,
    fromIdx: number,
    isToPlayer: boolean,
    toIdx: number,
    effectImgStr: string
  ): Promise<void> {
    console.log("animateEffectBuffLife", isToPlayer);
    const _fromImg = isFromPlayer
      ? this.playerUnitsImages[fromIdx]
      : this.enemyUnitsImages[fromIdx];
    const _toImg = isToPlayer
      ? this.playerUnitsImages[toIdx]
      : this.enemyUnitsImages[toIdx];

    const lifeImage = this.scene.add
      .image(_fromImg.x, _fromImg.y, effectImgStr)
      .setScale(0.2)
      .setOrigin(0.5, 0.5)
      .setAlpha(0); // Start with alpha 0

    return new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: lifeImage,
        alpha: { from: 0, to: 1 }, // Fade in
        duration: 100,
        ease: "Power2",
        onComplete: () => {
          this.scene.tweens.add({
            targets: lifeImage,
            x: _toImg.x,
            y: _toImg.y,
            duration: 400,
            ease: "Power2",
            onComplete: () => {
              this.scene.tweens.add({
                targets: lifeImage,
                alpha: { from: 1, to: 0 },
                duration: 100,
                ease: "Power2",
                onComplete: () => {
                  lifeImage.destroy();
                  resolve();
                },
              });
            },
          });
        },
      });
    });
  }

  async animateChangeLife(
    isPlayer: boolean,
    idx: number,
    life: number
  ): Promise<void> {
    const _targetImg = isPlayer
      ? this.playerLifeNumImages[idx]
      : this.enemyLifeNumImages[idx];
    await this._animateChangeNum(_targetImg, life);
  }

  async animateChangeAttack(
    isPlayer: boolean,
    idx: number,
    attack: number
  ): Promise<void> {
    const _targetImg = isPlayer
      ? this.playerAttackNumImages[idx]
      : this.enemyAttackNumImages[idx];
    await this._animateChangeNum(_targetImg, attack);
  }

  private async _animateChangeNum(
    attackOrLifeImg: Phaser.GameObjects.Image,
    newValue: number
  ): Promise<void> {
    attackOrLifeImg.setFrame(`${newValue}`);
    const _scale = attackOrLifeImg.scale;

    return new Promise((resolve) => {
      this.scene.tweens.add({
        targets: attackOrLifeImg,
        scaleX: 1.75,
        scaleY: 1.75,
        yoyo: true,
        duration: 160,
        ease: "Power1",
        onComplete: () => {
          attackOrLifeImg.setScale(_scale);
          resolve();
        },
      });
    });
  }

  /**============================
   * Destroy functions
   ============================*/
  destroy(): void {
    this.playerEmptyImages.forEach((img) => img.destroy());
    this.enemyEmptyImages.forEach((img) => img.destroy());
    this.playerUnitsImages.forEach((img) => img.destroy());
    this.playerLifeNumImages.forEach((img) => img.destroy());
    this.playerAttackNumImages.forEach((img) => img.destroy());
    this.enemyUnitsImages.forEach((img) => img.destroy());
    this.enemyLifeNumImages.forEach((img) => img.destroy());
    this.enemyAttackNumImages.forEach((img) => img.destroy());
  }
}
