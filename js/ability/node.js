
AbilityNode = {};
AbilityNode.Template = {};

AbilityNode.Template.Blank = function(node) {
	node = node || {};
	
	node.damageType = node.damageType ? new DamageType(node.damageType) : null;
	
	node.cost      = node.cost || { hp: null, sp: null, lp: null};
	
	node.onCast    = node.onCast   || [];
	node.onHit     = node.onHit    || [];
	node.onMiss    = node.onMiss   || [];
	node.onDamage  = node.onDamage || [];
	node.onAbsorb  = node.onAbsorb || [];
	
	node.hitFallen = node.hitFallen || false;
	
	node.hitMod    = node.hitMod;
	node.atkMod    = node.atkMod;
	node.defMod    = node.defMod;
	
	node.toHit     = node.toHit     || AbilityNode.ToHit.Regular;
	node.toDamage  = node.toDamage  || AbilityNode.ToDamage.Regular;
	
	node.hitFunc   = node.hitFunc   || AbilityNode.HitFunc.Physical;
	node.evadeFunc = node.evadeFunc || AbilityNode.EvadeFunc.Physical;
	node.atkFunc   = node.atkFunc   || AbilityNode.AtkFunc.Physical;
	node.defFunc   = node.defFunc   || AbilityNode.DefFunc.Physical;
	node.damageFunc = node.damageFunc || AbilityNode.DamageFunc.Physical;
	
	return _.bind(AbilityNode.Run, node);
}
AbilityNode.Template.Physical = function(node) {
	var node = node || {};
	
	node.hitFallen = false;
	
	node.damageType = node.damageType ? new DamageType(node.damageType) : null;
	
	node.toHit     = node.toHit     || AbilityNode.ToHit.Regular;
	node.toDamage  = node.toDamage  || AbilityNode.ToDamage.Regular;
	
	node.hitFunc   = node.hitFunc   || AbilityNode.HitFunc.Physical;
	node.evadeFunc = node.evadeFunc || AbilityNode.EvadeFunc.Physical;
	node.atkFunc   = node.atkFunc   || AbilityNode.AtkFunc.Physical;
	node.defFunc   = node.defFunc   || AbilityNode.DefFunc.Physical;
	node.damageFunc = node.damageFunc || AbilityNode.DamageFunc.Physical;
	
	return _.bind(AbilityNode.Run, node);
}
AbilityNode.Template.Magical = function(node) {
	var node = node || {};
	
	node.hitFallen = false;
	
	node.damageType = node.damageType ? new DamageType(node.damageType) : null;
	
	node.toHit     = node.toHit     || AbilityNode.ToHit.Regular;
	node.toDamage  = node.toDamage  || AbilityNode.ToDamage.Regular;
	
	node.hitFunc   = node.hitFunc   || AbilityNode.HitFunc.Magical;
	node.evadeFunc = node.evadeFunc || AbilityNode.EvadeFunc.Magical;
	node.atkFunc   = node.atkFunc   || AbilityNode.AtkFunc.Magical;
	node.defFunc   = node.defFunc   || AbilityNode.DefFunc.Magical;
	node.damageFunc = node.damageFunc || AbilityNode.DamageFunc.Physical;
	
	return _.bind(AbilityNode.Run, node);
}
AbilityNode.Template.Lust = function(node) {
	var node = node || {};
	
	node.hitFallen = false;
	
	node.damageType = node.damageType ? new DamageType(node.damageType) : null;
	
	node.toHit     = node.toHit     || AbilityNode.ToHit.Regular;
	node.toDamage  = node.toDamage  || AbilityNode.ToDamage.Regular;
	
	node.hitFunc   = node.hitFunc   || AbilityNode.HitFunc.Lust;
	node.evadeFunc = node.evadeFunc || AbilityNode.EvadeFunc.Lust;
	node.atkFunc   = node.atkFunc   || AbilityNode.AtkFunc.Lust;
	node.defFunc   = node.defFunc   || AbilityNode.DefFunc.Lust;
	node.damageFunc = node.damageFunc || AbilityNode.DamageFunc.Physical;
	
	return _.bind(AbilityNode.Run, node);
}
AbilityNode.Template.Fallthrough = function(node) {
	var node = node || {};
	
	node.fraction = node.fraction || 1;
	node.damageFunc = node.damageFunc || AbilityNode.DamageFunc.Physical;
	
	return _.bind(AbilityNode.RunFallthrough, node);
}

AbilityNode.ToHit = {};
AbilityNode.ToHit.StrikeThrough = function(caster, target) {
	return true;
}
AbilityNode.ToHit.Regular = function(caster, target) {
	var hitMod = this.hitMod || 1;
	var hit    = hitMod * this.hitFunc(caster, target);
	var evade  = this.evadeFunc(caster, target);
	
	return Ability.ToHit(hit, evade);
}

AbilityNode.HitFunc = {};
AbilityNode.HitFunc.Physical = function(caster, target) {
	return caster.PHit();
}
AbilityNode.HitFunc.Magical = function(caster, target) {
	return caster.MHit();
}
AbilityNode.HitFunc.Lust = function(caster, target) {
	return caster.LHit();
}

AbilityNode.EvadeFunc = {};
AbilityNode.EvadeFunc.Physical = function(caster, target) {
	return target.PEvade();
}
AbilityNode.EvadeFunc.Magical = function(caster, target) {
	return target.MEvade();
}
AbilityNode.EvadeFunc.Lust = function(caster, target) {
	return target.LEvade();
}

AbilityNode.ToDamage = {};
AbilityNode.ToDamage.Regular = function(caster, target) {
	var damageType = this.damageType ? this.damageType : caster.elementAtk;
	var atkMod     = that.atkMod || 1;
	var defMod     = that.defMod || 1;
	
	var atkDmg     = atkMod * this.atkFunc(caster, target);
	var def        = defMod * this.defFunc(caster, target);
	
	//var dmg = atkDmg - def;
	var dmg = Ability.Damage(atkDmg, def, caster.level, e.level);
	if(dmg < 0) dmg = 0;
	
	dmg = damageType.ApplyDmgType(e.elementDef, dmg);
	dmg = Math.floor(dmg);
	
	return -dmg;
}
AbilityNode.ToDamage.Heal = function(caster, target) {
	var atkMod  = that.atkMod || 1;
	
	var healing = atkMod * this.atkFunc(caster, target);
	
	if(healing < 0) healing = 0;
	healing = Math.floor(healing);

	return healing;
}

AbilityNode.AtkFunc = {};
AbilityNode.AtkFunc.Physical = function(caster, target) {
	return caster.PAttack();
}
AbilityNode.AtkFunc.Magical = function(caster, target) {
	return caster.MAttack();
}
AbilityNode.AtkFunc.Lust = function(caster, target) {
	return caster.LAttack();
}

AbilityNode.DefFunc = {};
AbilityNode.DefFunc.Physical = function(caster, target) {
	return target.PDefense();
}
AbilityNode.DefFunc.Magical = function(caster, target) {
	return target.MDefense();
}
AbilityNode.DefFunc.Lust = function(caster, target) {
	return target.LDefense();
}

AbilityNode.DamageFunc = {};
AbilityNode.DamageFunc.Physical = function(caster, target, dmg) {
	target.AddHPAbs(dmg);
}
AbilityNode.DamageFunc.Magical = function(caster, target, dmg) {
	target.AddSPAbs(dmg);
}
AbilityNode.DamageFunc.Lust = function(caster, target, dmg) {
	target.AddLustAbs(dmg);
}

AbilityNode.Run = function(ability, encounter, caster, target, result) {
	var that = this;
	// OnCast, allways apply no matter what
	_.each(that.onCast, function(node) {
		node(ability, encounter, caster, target);
	});
	
	// Checks if it's actually possible to cast
	if(!Ability.EnabledCost(that, caster)) return;
	// Drain cost	
	Ability.ApplyCost(that, caster);
	
	var targets = _.has(target, 'members') ? target.members : [target];
	
	var nrAttacks  = that.nrAttacks || 1;
	
	// For each target
	_.each(targets, function(e) {
		// Only hit fallen if allowed
		if(!that.hitFallen && e.Incapacitated()) return;
		// For x number of strikes
		_.times(nrAttacks, function() {
			// Check if it hits
			if(Math.random() < that.toHit(caster, e)) {
				// If it can damage
				if(that.ToDamage) {
					var dmg = that.ToDamage(caster, e);
					
					that.damageFunc(caster, e, dmg);
					
					// On dealing damage (dmg is negative)
					if(dmg <= 0) {
						_.each(that.onDamage, function(node) {
							node(ability, encounter, caster, e, dmg);
						});
					}
					// On healing/absorbing (dmg is positive)
					else {
						_.each(that.onAbsorb, function(node) {
							node(ability, encounter, caster, e, dmg);
						});
					}
				}
				
				// Always apply this on hit, no matter what
				_.each(that.onHit, function(node) {
					node(ability, encounter, caster, e, result);
				});
			}
			else {
				// On miss
				_.each(that.onMiss, function(node) {
					node(ability, encounter, caster, e);
				});
			}
		});
	});
}

AbilityNode.RunFallthrough = function(ability, encounter, caster, target, result) {
	var that = this;
	var fraction = that.fraction || 1;
	
	var dmg = fraction * result;
	
	that.damageFunc(caster, e, dmg);
	
	// On dealing damage (dmg is negative)
	if(dmg <= 0) {
		_.each(that.onDamage, function(node) {
			node(ability, encounter, caster, e, dmg);
		});
	}
	// On healing/absorbing (dmg is positive)
	else {
		_.each(that.onAbsorb, function(node) {
			node(ability, encounter, caster, e, dmg);
		});
	}
}
