/*
 *
 * Drake lvl 60-70
 *
 */

import { Images } from "../../assets";
import { Encounter } from "../../engine/combat/combat";
import { Element } from "../../engine/combat/damagetype";
import { StatusEffect } from "../../engine/combat/statuseffect";
import { AppendageType } from "../../engine/entity/body/appendage";
import { Color } from "../../engine/entity/body/color";
import { Race } from "../../engine/entity/body/race";
import { Entity, ICombatEncounter, ICombatOrder } from "../../engine/entity/entity";
import { TF } from "../../engine/entity/tf";
import { AlchemyItems } from "../../engine/inventory/items/alchemy";
import { AlchemySpecial } from "../../engine/inventory/items/alchemyspecial";
import { IngredientItems } from "../../engine/inventory/items/ingredients";
import { Party } from "../../engine/navigation/party";
import { Text } from "../../engine/parser/text";
import { Abilities } from "../ability/abilities";

export class Drake extends Entity {
	constructor() {
		super();

		this.ID = "drake";

		this.avatar.combat     = Images.drake;
		this.name              = "Drake";
		this.monsterName       = "the drake";
		this.MonsterName       = "The drake";
		this.body.DefMale();

		this.maxHp.base        = 50000;
		this.maxSp.base        = 10000;
		this.maxLust.base      = 6000;
		// Main stats
		this.strength.base     = 500;
		this.stamina.base      = 600;
		this.dexterity.base    = 380;
		this.intelligence.base = 300;
		this.spirit.base       = 320;
		this.libido.base       = 200;
		this.charisma.base     = 240;

		this.elementDef.dmg[Element.pSlash]   = 0.5;
		this.elementDef.dmg[Element.mFire]    = 0.5;
		this.elementDef.dmg[Element.mThunder] = 0.5;
		this.elementDef.dmg[Element.mIce]     = 0.5;

		this.statusDef[StatusEffect.Venom]    = 1;
		this.statusDef[StatusEffect.Burn]     = 1;

		this.level             = 60 + Math.floor(Math.random() * 10);
		this.sexlevel          = 30;

		this.combatExp         = 6000 + this.level * 60;
		this.coinDrop          = 4000 + this.level * 40;

		this.body.SetBodyColor(Color.green);

		this.body.SetEyeColor(Color.white);

		TF.SetAppendage(this.Back(), AppendageType.tail, Race.Dragon, Color.green);

		// Set hp and mana to full
		this.SetLevelBonus();
		this.RestFull();
	}

	public DropTable() {
		const drops = [];
		/*
		if(Math.random() < 0.05) drops.push({ it: IngredientItems.Stinger });
		if(Math.random() < 0.5)  drops.push({ it: IngredientItems.Stinger });
		if(Math.random() < 0.5)  drops.push({ it: IngredientItems.SVenom });
		if(Math.random() < 0.5)  drops.push({ it: IngredientItems.SClaw });
		*/
		if (Math.random() < 0.1) {  drops.push({ it: AlchemyItems.Lacertium }); }
		if (Math.random() < 0.1) {  drops.push({ it: AlchemySpecial.Taurico }); }
		if (Math.random() < 0.1) {  drops.push({ it: AlchemySpecial.Nagazm }); }
		if (Math.random() < 0.1) { drops.push({ it: AlchemyItems.Gestarium }); }

		if (Math.random() < 0.1) {  drops.push({ it: IngredientItems.BlackGem }); }
		if (Math.random() < 0.1) {  drops.push({ it: IngredientItems.DemonSeed }); }
		if (Math.random() < 0.1) {  drops.push({ it: IngredientItems.SnakeFang }); }
		if (Math.random() < 0.1) {  drops.push({ it: IngredientItems.SnakeOil }); }
		if (Math.random() < 0.3) {  drops.push({ it: IngredientItems.LizardEgg }); }
		if (Math.random() < 0.3) {  drops.push({ it: IngredientItems.LizardScale }); }

		return drops;
	}

	public Act(encounter: ICombatEncounter, activeChar: ICombatOrder) {
		// TODO: Very TEMP
		Text.Add(this.name + " acts! ROOOAR!");
		Text.NL();

		// Pick a random target
		const targets = this.GetPartyTarget(encounter, activeChar);
		const t = this.GetSingleTarget(encounter, activeChar);

		const choice = Math.random();
		if (choice < 0.2) {
			Abilities.Attack.CastInternal(encounter, this, t);
		} else if (choice < 0.3 && Abilities.Black.ThunderStorm.enabledCondition(encounter, this)) {
			Abilities.Black.ThunderStorm.Use(encounter, this, targets);
		} else if (choice < 0.4 && Abilities.Black.WindShear.enabledCondition(encounter, this)) {
			Abilities.Black.WindShear.Use(encounter, this, t);
		} else if (choice < 0.6 && Abilities.Physical.QAttack.enabledCondition(encounter, this)) {
			Abilities.Physical.QAttack.Use(encounter, this, t);
		} else if (choice < 0.7 && Abilities.Physical.Frenzy.enabledCondition(encounter, this)) {
			Abilities.Physical.Frenzy.Use(encounter, this, t);
		} else if (choice < 0.8 && Abilities.Black.Hellfire.enabledCondition(encounter, this)) {
			Abilities.Black.Hellfire.Use(encounter, this, targets);
		} else if (choice < 0.9 && Abilities.Seduction.Rut.enabledCondition(encounter, this)) {
			Abilities.Seduction.Rut.Use(encounter, this, t);
		} else {
			Abilities.Attack.Use(encounter, this, t);
		}
	}

}

export namespace DrakeScenes {

	export function DrakeEnc() {
		const enemy    = new Party();
		enemy.AddMember(new Drake());
		const enc      = new Encounter(enemy);

		/*
		enc.canRun = false;
		enc.onEncounter = ...
		enc.onLoss = ...
		enc.onVictory = ...
		enc.VictoryCondition = ...
		*/
		return enc;
	}

}
