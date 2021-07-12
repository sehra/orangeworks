/// <reference types="knockout" />

type LogEvent = {
	casterBoardIndex: number,
	type: GarrAutoMissionEventType,
	schoolMask: number,
	targetInfo: [{
		boardIndex: number,
		points?: number,
		oldHealth: number,
		newHealth: number,
		maxHealth: number,
	}],
	auraType: number,
	effectIndex: number,
	spellID: number,
};

type MissionData = {
	missionScalar: number,
	log: [{
		events: LogEvent[],
	}],
	addonVersion?: string,
	missionID: number,
	missionName: string,
	meta: {
		dv: number,
		lc: string,
		ts: number,
		cb: string,
	},
	followers: {
		[key: string]: {
			spells: [{
				description: string,
				autoCombatSpellID: number,
				duration: number,
				name: string,
				hasThornsEffect: boolean,
				cooldown: number,
			}],
			role: number,
			name: string,
			boardIndex: number,
			health: number,
			level: number,
			maxHealth: number,
			attack: number,
		},
	},
	encounters: [{
		autoCombatAutoAttack: {
			description: string,
			autoCombatSpellID: number,
			duration: number,
			previewMask: number,
			name: string,
			hasThornsEffect: boolean,
			schoolMask: number,
			icon: number,
			cooldown: number,
			spellTutorialFlag: number,
		},
		isElite: boolean,
		autoCombatSpells: [{
			description: string,
			autoCombatSpellID: number,
			duration: number,
			name: string,
			hasThornsEffect: boolean,
			cooldown: number,
		}],
		health: number,
		role: number,
		name: string,
		boardIndex: number,
		maxHealth: number,
		attack: number,
	}],
	winner: boolean,
	// calculated
	board: Map<number, string>,
	spell: Map<number, string>,
};

function notNull<T>(value: T | null | undefined): value is T {
	if (value === null || value === undefined) {
		return false;
	}
	return true;
}

function spellSchoolName(school: number): string {
	switch (school) {
		case 1: return 'Physical';
		case 2: return 'Holy';
		case 4: return 'Fire';
		case 8: return 'Nature';
		case 16: return 'Frost';
		case 32: return 'Shadow';
		case 64: return 'Arcane';
		default: return String(school);
	}
}

enum GarrAutoMissionEventType {
	MeleeDamage = 0,
	RangeDamage = 1,
	SpellMeleeDamage = 2,
	SpellRangeDamage = 3,
	Heal = 4,
	PeriodicDamage = 5,
	PeriodicHeal = 6,
	ApplyAura = 7,
	RemoveAura = 8,
	Died = 9,
}

function formatEvent(event: LogEvent, spellName: string, caster: string, casterBoardIndex: number, target: string,
	targetBoardIndex: number, amount: number, element: number, targetNewHealth: number, targetMaxHealth: number): string {
	switch (event.type) {
		case GarrAutoMissionEventType.MeleeDamage:
			return `${caster} (${casterBoardIndex}) meleed ${target} (${targetBoardIndex}) for ${amount} damage (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.RangeDamage:
			return `${caster} (${casterBoardIndex}) shot ${target} (${targetBoardIndex}) for ${amount} damage (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.SpellMeleeDamage:
			return `${caster} (${casterBoardIndex}) cast ${spellName} at ${target} (${targetBoardIndex}) for ${amount} ${spellSchoolName(element)} damage (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.SpellRangeDamage:
			return `${caster} (${casterBoardIndex}) cast ${spellName} at ${target} (${targetBoardIndex}) for ${amount} ${spellSchoolName(element)} damage (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.PeriodicDamage:
			return `${caster}'s (${casterBoardIndex}) ${spellName} dealt ${amount} ${spellSchoolName(element)} to ${target} (${targetBoardIndex}) (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.ApplyAura:
			return `${caster} (${casterBoardIndex}) applied ${spellName} to ${target} (${targetBoardIndex}) (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.RemoveAura:
			return `${caster} (${casterBoardIndex}) removed ${spellName} from ${target} (${targetBoardIndex}) (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.Heal:
			return `${caster} (${casterBoardIndex}) cast ${spellName} on ${target} (${targetBoardIndex}) for ${amount} healing (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.PeriodicHeal:
			return `${caster}'s (${casterBoardIndex}) ${spellName} healed ${target} (${targetBoardIndex}) for ${amount} (${targetNewHealth}/${targetMaxHealth})`;
		case GarrAutoMissionEventType.Died:
			return `${caster} (${casterBoardIndex}) killed ${target}.`;
	}
}

class ViewModel {
	input = ko.observable<string>();
	views = ko.observableArray<MissionData>();

	constructor() {
		this.input.extend({ rateLimit: { timeout: 100, method: 'notifyWhenChangesStop' } });
		this.input.subscribe(this.update, this);
	}

	update(value: string | undefined) {
		if (value === undefined) {
			return;
		}

		var missions = value.split(/\r?\n/)
			.map(v => {
				try {
					var data = JSON.parse(v) as MissionData;
					data.board = new Map<number, string>();
					data.spell = new Map<number, string>();
					data.encounters.forEach(e => {
						data.board.set(e.boardIndex, e.name);
						data.spell.set(e.autoCombatAutoAttack.autoCombatSpellID, e.autoCombatAutoAttack.name);
						e.autoCombatSpells.forEach(s => {
							data.spell.set(s.autoCombatSpellID, s.name);
						});
					});
					Object.values(data.followers).forEach(f => {
						data.board.set(f.boardIndex, f.name);
						f.spells.forEach(s => {
							data.spell.set(s.autoCombatSpellID, s.name);
						});
					});
					return data;
				} catch (e) {
					console.log(e);
					return null;
				}
			})
			.filter(notNull);

		this.views.removeAll();
		this.views.push(...missions);
	}
}

ko.applyBindings(new ViewModel());
