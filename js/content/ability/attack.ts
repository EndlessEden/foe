/*
 *
 * Basic attack
 *
 */

import { Ability } from "../../engine/combat/ability";
import { Encounter } from "../../engine/combat/combat";
import { Entity } from "../../engine/entity/entity";
import { Text } from "../../engine/parser/text";
import { AbilityNode } from "./node";

const AttackAb = new Ability("Attack");
AttackAb.Short = () => "Perform a physical attack.";
AttackAb.castTree.push(AbilityNode.Template.Physical({
	onAbsorb: [(ability: Ability, encounter: Encounter, caster: Entity, target: Entity, dmg: number) => {
		const parse = AbilityNode.DefaultParser(caster, target);
		Text.Add("[Name] attack[notS] [tname], but [theshe] absorb[tnotS] the blow for " + Text.Heal(dmg) + " damage!");
		Text.NL();
	}],
	onDamage: [(ability: Ability, encounter: Encounter, caster: Entity, target: Entity, dmg: number) => {
		const parse = AbilityNode.DefaultParser(caster, target);
		Text.Add("[Name] attack[notS] [tname] for " + Text.Damage(-dmg) + " damage! Waagh!", parse);
		Text.NL();
	}],
	onMiss: [(ability: Ability, encounter: Encounter, caster: Entity, target: Entity) => {
		const parse = AbilityNode.DefaultParser(caster, target);
		Text.Add("[Name] attack[notS] [tname], but the blow misses!", parse);
		Text.NL();
	}],
}));

export { AttackAb };
