/// <reference types="knockout" />

type MissionData = {
	missionScalar: number,
	log: [{
		events: [{
			casterBoardIndex: number,
			type: number,
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
		}],
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

function spellSchoolName(school: number) {
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
