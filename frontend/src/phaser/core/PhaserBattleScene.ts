import "phaser";
import PhaserUnitsRender from "./PhaserUnitsRender";
import addresses from "src/constants/addresses";
import { DUEL3BattleAlphaAbi } from "src/constants/DUEL3BattleAlphaAbi";
import {
  type Unit,
  type UnitVariable,
  unitVariableDefaultValues,
  RESULT,
  SKILL_TIMING,
  SCENE,
} from "src/constants/interface";
import { readContract } from "@wagmi/core";
import { convertUnitIdsToNumber } from "src/utils/Utils";
import { units } from "src/constants/units";
import { SKILLS } from "src/constants/skills";
import { type RandomSeed } from "src/utils/BattleClass";
import BattleClassWrapper from "./BattleClassWrapper";

/**============================
 * Constants
 ============================*/
const WINDOW_SIZE = {
  x: 2720,
  y: 1560,
};

enum PHASE {
  BEFORE_BATTLE,
  START_OF_BATTLE,
  BEFORE_ATTACK,
  ATTACKING,
}

export default class PhaserBattleScene extends Phaser.Scene {
  /**============================
   * Variables
   ============================*/
  private setScene: any;
  private setResult: any;
  private battleId: any;
  private config: any;
  private address: `0x${string}`;
  private phase: PHASE = PHASE.BEFORE_BATTLE;

  private startBtn: Phaser.GameObjects.Text;
  // private nextActionBtn: Phaser.GameObjects.Image;
  private overlay: Phaser.GameObjects.Rectangle;
  private tutorialImage: Phaser.GameObjects.Image;
  private tutorialText: Phaser.GameObjects.Text;
  private stage: number;
  private tooltip: Phaser.GameObjects.Image;
  private tooltipText: Phaser.GameObjects.Text[];
  // private playersText: Phaser.GameObjects.Text;
  // private enemiesText: Phaser.GameObjects.Text;

  private playerUnits: Unit[];
  private playerUnitsVariable: UnitVariable[];
  private enemyUnits: Unit[];
  private enemyUnitsVariable: UnitVariable[];

  private battleClass: BattleClassWrapper;
  private phaserUnitsRender: PhaserUnitsRender;

  /**============================
   * Constructor
   ============================*/
  constructor(setScene, setResult, battleId, config, address) {
    super({ key: "PhaserBattleScene" });
    this.setScene = setScene;
    this.setResult = setResult;
    this.battleId = battleId;
    this.config = config;
    this.address = address;
  }

  /**============================
   * Preload functions
   ============================*/
  preload(): void {
    this.load.image("1001", `images/cards/1001.png`);
    this.load.image("1002", `images/cards/1002.png`);
    this.load.image("1003", `images/cards/1003.png`);
    this.load.image("1004", `images/cards/1004.png`);
    this.load.image("1005", `images/cards/1005.png`);
    this.load.image("1006", `images/cards/1006.png`);
    this.load.image("1007", `images/cards/1007.png`);
    this.load.image("1008", `images/cards/1008.png`);
    // this.load.image("8001", `images/cards/8001.png`);
    // this.load.image("8002", `images/cards/8002.png`);
    // this.load.image("8003", `images/cards/8003.png`);
    // this.load.image("8004", `images/cards/8004.png`);
    // this.load.image("8005", `images/cards/8005.png`);
    // this.load.image("8006", `images/cards/8006.png`);
    this.load.image("empty", `images/cards/empty.png`);
    this.load.image("life", `images/edit/life.png`);
    this.load.image("attack", `images/edit/attack.png`);
    this.load.image("buff_life", `images/battle/buff_life.png`);
    this.load.image("buff_attack", `images/battle/buff_attack.png`);
    this.load.image("debuff_life", `images/battle/debuff_life.png`);
    this.load.image("debuff_attack", `images/battle/debuff_attack.png`);

    // this.load.image("start", `images/battle/START_overlap_text.png`);
    this.load.image("next", `images/battle/next_action.png`);
    this.load.image("tooltip", `images/battle/tooltip.png`);
    this.load.image("tutorial_window", `images/battle/tutorial_window.png`);

    this.load.atlas(
      "numbers",
      "images/common/numbers.png",
      "images/common/numbers.json"
    );
  }

  /**============================
   * Create functions
   ============================*/
  async create(): Promise<void> {
    /** =============== Get units info by onchain =============== */
    const chainId = this.config.chains[0].id;
    const readOpts = {
      address: addresses(Number(chainId))!.DUEL3BattleAlpha as `0x${string}`,
      abi: DUEL3BattleAlphaAbi,
    };

    //TODO readContracts
    const _resStage = await readContract(this.config, {
      ...readOpts,
      functionName: "playerStage",
      args: [this.address as `0x${string}`],
    });
    // console.log("_resStage", _resStage);
    this.stage = Number(_resStage);

    const _resRandomSeed = await readContract(this.config, {
      ...readOpts,
      functionName: "randomSeeds",
      args: [BigInt(this.battleId)],
    });
    // console.log("_resRandomSeed", _resRandomSeed);

    const _resPlayerUnitIds = await readContract(this.config, {
      ...readOpts,
      functionName: "getPlayerUnits",
      args: [this.address as `0x${string}`],
    });
    // console.log("_resData", _resPlayerUnitIds);

    const _resEnemyUnits = await readContract(this.config, {
      ...readOpts,
      functionName: "getEnemyUnits",
      args: [_resStage],
    });

    /** =============== Set playerUnits and enemyUnits =============== */
    //BitInt to Number
    //0-4 is playerUnitIds

    //TODO debug mode
    const playerUnitIds = convertUnitIdsToNumber(
      (_resPlayerUnitIds as BigInt[]).slice(0, 5)
    );
    const enemyUnitsByStage = convertUnitIdsToNumber(
      _resEnemyUnits as BigInt[]
    );

    //Construct battleClass
    this.playerUnits = playerUnitIds.map((id) => units[id]);
    this.playerUnitsVariable = this.playerUnits.map((unit: Unit) => {
      return {
        life: unit.life,
        attack: unit.attack,
        ...unitVariableDefaultValues,
      };
    });
    this.enemyUnits = enemyUnitsByStage.map((id) => units[id]);
    this.enemyUnitsVariable = this.enemyUnits.map((unit: Unit) => {
      return {
        life: unit.life,
        attack: unit.attack,
        ...unitVariableDefaultValues,
      };
    });

    /** =============== Render units =============== */
    this.phaserUnitsRender = new PhaserUnitsRender(this);
    this.phaserUnitsRender.renderEmpties();
    this.phaserUnitsRender.renderUnits(true, this.playerUnits);
    this.phaserUnitsRender.renderUnits(false, this.enemyUnits);

    this.battleClass = new BattleClassWrapper(
      Number(this.battleId),
      _resRandomSeed as RandomSeed,
      this.phaserUnitsRender
    );

    /** =============== Render Text and Buttons =============== */
    this.add
      .text(WINDOW_SIZE.x / 2, 1320, "PLAYERS", {
        fontSize: "64px",
        color: "#fff",
        fontFamily: "Londrina Solid",
      })
      .setOrigin(0.5, 0);
    this.add
      .text(WINDOW_SIZE.x / 2, 0, "ENEMIES", {
        fontSize: "64px",
        color: "#fff",
        fontFamily: "Londrina Solid",
      })
      .setOrigin(0.5, 0);

    //Next action button and text
    this.add
      .image(WINDOW_SIZE.x / 2, 680, "next")
      .setScale(0.32)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        await this.goNextAction();
      });
    this.add
      .text(WINDOW_SIZE.x / 2, 800, "ACTION", {
        fontSize: "48px",
        color: "#fff",
        fontFamily: "Londrina Solid",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", async () => {
        await this.goNextAction();
      });

    const _tooltipStyle = {
      fontSize: "32px",
      color: "#fff",
      fontFamily: "Londrina Solid",
    };
    this.tooltip = this.add
      .image(40, 20, "tooltip")
      .setOrigin(0, 0)
      .setVisible(false);
    this.tooltipText = [
      this.add.text(72, 60, "", _tooltipStyle).setVisible(false),
      this.add.text(72, 100, "", _tooltipStyle).setVisible(false),
      this.add.text(72, 150, "", _tooltipStyle).setVisible(false),
      this.add.text(72, 190, "", _tooltipStyle).setVisible(false),
    ];
    this.events.on("show-tooltip", this.showTooltip, this);
    this.events.on("hide-tooltip", this.hideTooltip, this);

    //Overlay and Start button
    this.overlay = this.add
      .rectangle(
        1360,
        780,
        2720,
        1560,
        0x06330d,
        0.5 // alpha
      )
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on("pointerdown", async () => {
        if (this.phase === PHASE.BEFORE_BATTLE) {
          this.startBtn.destroy();
          this.overlay.destroy();
          await this.startOfBattle();
        }
      });

    this.startBtn = this.add
      .text(WINDOW_SIZE.x / 2, 660, "START", {
        fontSize: "208px",
        color: "#fff",
        fontFamily: "Londrina Solid",
      })
      .setOrigin(0.5, 0.5);

    //Tutorial
    this.tutorialImage = this.add
      .image(1370, 820, "tutorial_window")
      .setOrigin(0.5, 0.5)
      .setScale(0.4)
      .setVisible(false);
    this.tutorialText = this.add
      .text(1380, 838, "Press the attack icon to proceed.", {
        fontSize: "32px",
        color: "#fff",
        fontFamily: "Londrina Solid",
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    //End of create, go next phase
    this.phase = PHASE.BEFORE_BATTLE;
  }

  /**============================
   * Tooltip and Tutorial functions
   ============================*/
  private showTooltip(
    name: string,
    life: number,
    attack: number,
    description: string
  ): void {
    this.tooltip.setVisible(true);
    this.tooltipText[0].setText(name).setVisible(true);
    this.tooltipText[1]
      .setText(`Attack: ${attack} Life: ${life}`)
      .setVisible(true);
    this.tooltipText[2].setText(description).setVisible(true);

    const wrap_len = 40;
    if (description.length > wrap_len) {
      const spaceIndex = description.lastIndexOf(" ", wrap_len);
      const splitIndex = spaceIndex > -1 ? spaceIndex : wrap_len;

      const firstPart = description.slice(0, splitIndex);
      const secondPart = description.slice(splitIndex + 1); // Skip the space

      this.tooltipText[2].setText(firstPart).setVisible(true);
      this.tooltipText[3].setText(secondPart).setVisible(true);
    } else {
      this.tooltipText[2].setText(description).setVisible(true);
    }
  }

  private hideTooltip(): void {
    this.tooltip.setVisible(false);
    this.tooltipText.forEach((text) => text.setVisible(false));
  }

  private showTutorial(): void {
    if (this.stage === 0) {
      this.tutorialImage.setVisible(true);
      this.tutorialText.setVisible(true);
    }
  }

  private hideTutorial(): void {
    this.tutorialImage.setVisible(false);
    this.tutorialText.setVisible(false);
  }

  /**============================
   * Functions(Game flow)
   ============================*/
  private async _removeKilledUnitAll(isPlayer: boolean): Promise<void> {
    if (isPlayer) {
      for (let i = this.playerUnitsVariable.length - 1; i >= 0; i--) {
        if (this.playerUnitsVariable[i].life <= 0) {
          this.playerUnits.splice(i, 1);
          this.playerUnitsVariable.splice(i, 1);
          await this.phaserUnitsRender.spliceUnit(true, i);
        }
      }
    } else {
      for (let i = this.enemyUnitsVariable.length - 1; i >= 0; i--) {
        if (this.enemyUnitsVariable[i].life <= 0) {
          this.enemyUnits.splice(i, 1);
          this.enemyUnitsVariable.splice(i, 1);
          await this.phaserUnitsRender.spliceUnit(false, i);
        }
      }
    }
  }

  private async _removeKilledUnit(
    isPlayer: boolean,
    idx: number
  ): Promise<void> {
    //Judge if life is 0
    if (isPlayer) {
      if (this.playerUnitsVariable[idx].life <= 0) {
        this.playerUnits.splice(idx, 1);
        this.playerUnitsVariable.splice(idx, 1);
        await this.phaserUnitsRender.spliceUnit(true, idx);
      }
    } else {
      if (this.enemyUnitsVariable[idx].life <= 0) {
        this.enemyUnits.splice(idx, 1);
        this.enemyUnitsVariable.splice(idx, 1);
        await this.phaserUnitsRender.spliceUnit(false, idx);
      }
    }
  }

  private _judge() {
    if (
      this.playerUnitsVariable.length === 0 ||
      this.enemyUnitsVariable.length === 0
    ) {
      if (
        this.playerUnitsVariable.length === 0 &&
        this.enemyUnitsVariable.length === 0
      ) {
        return this.gameOver(RESULT.DRAW);
      } else if (this.playerUnitsVariable.length === 0) {
        return this.gameOver(RESULT.LOSE);
      } else if (this.enemyUnitsVariable.length === 0) {
        return this.gameOver(RESULT.WIN);
      }
    }
  }

  private async goNextAction(): Promise<void> {
    console.log("goNextAction");

    //Tutorial
    this.hideTutorial();

    if (this.phase === PHASE.BEFORE_ATTACK) {
      this.phase = PHASE.ATTACKING;
      //TODO beforeAttack
      // await this.battleManager.beforeAttack();
      this._judge();

      await Promise.all([
        this.phaserUnitsRender.animateAttack(true),
        this.phaserUnitsRender.animateAttack(false),
      ]);
      await this.battleClass.attacking(
        this.playerUnitsVariable[0],
        this.enemyUnitsVariable[0]
      );
      await this.phaserUnitsRender.animateChangeLife(
        true,
        0,
        this.playerUnitsVariable[0].life
      );
      await this.phaserUnitsRender.animateChangeLife(
        false,
        0,
        this.enemyUnitsVariable[0].life
      );

      await Promise.all([
        this._removeKilledUnit(true, 0),
        this._removeKilledUnit(false, 0),
      ]);

      this._judge();

      this.phase = PHASE.BEFORE_ATTACK;
    }
  }

  async startOfBattle(): Promise<void> {
    if (this.phase !== PHASE.BEFORE_BATTLE) return;
    for (let i = 4; i >= 0; i--) {
      if (this.playerUnits[i]) {
        for (let j = 0; j < this.playerUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[this.playerUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            // console.log("executeSkill", i, true);

            await this.battleClass!.executeSkill(
              this.playerUnitsVariable,
              this.enemyUnitsVariable,
              true,
              i,
              _skill
            );
            await Promise.all([
              this._removeKilledUnitAll(true),
              this._removeKilledUnitAll(false),
            ]);
          }
        }
      }
      if (this.enemyUnits[i]) {
        for (let j = 0; j < this.enemyUnits[i].skillIds.length; j++) {
          const _skill = SKILLS[this.enemyUnits[i].skillIds[j]];
          if (_skill.timing === SKILL_TIMING.StartOfBattle) {
            // console.log("executeSkill", i, false);

            await this.battleClass!.executeSkill(
              this.playerUnitsVariable,
              this.enemyUnitsVariable,
              false,
              i,
              _skill
            );
            await Promise.all([
              this._removeKilledUnitAll(true),
              this._removeKilledUnitAll(false),
            ]);
          }
        }
      }
    }
    this.phase = PHASE.BEFORE_ATTACK;
    //Tutorial
    this.showTutorial();
  }

  private async gameOver(_result): Promise<void> {
    // console.log("gameOver", _result);
    this.setResult(_result);
    this.setScene(SCENE.Over);
    this.phaserUnitsRender.destroy();
    this.scene.stop(); // Stop the current scene
    this.scene.remove("PhaserBattleScene"); // Remove the scene from the game
    this.game.destroy(true);
  }

  /**============================
   * Update functions
   ============================*/
  update(): void {
    return;
  }

  /**============================
   * Destroy functions
   ============================*/
  shutdown() {
    this.scene.stop(); // Stop the current scene
    this.scene.remove("PhaserBattleScene"); // Remove the scene from the game
    this.game.destroy(true);
  }
  destroy() {
    this.scene.stop(); // Stop the current scene
    this.scene.remove("PhaserBattleScene"); // Remove the scene from the game
    this.game.destroy(true);
  }
}
