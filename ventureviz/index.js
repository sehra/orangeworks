"use strict";
/// <reference types="knockout" />
function notNull(value) {
    if (value === null || value === undefined) {
        return false;
    }
    return true;
}
function spellSchoolName(school) {
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
var GarrAutoMissionEventType;
(function (GarrAutoMissionEventType) {
    GarrAutoMissionEventType[GarrAutoMissionEventType["MeleeDamage"] = 0] = "MeleeDamage";
    GarrAutoMissionEventType[GarrAutoMissionEventType["RangeDamage"] = 1] = "RangeDamage";
    GarrAutoMissionEventType[GarrAutoMissionEventType["SpellMeleeDamage"] = 2] = "SpellMeleeDamage";
    GarrAutoMissionEventType[GarrAutoMissionEventType["SpellRangeDamage"] = 3] = "SpellRangeDamage";
    GarrAutoMissionEventType[GarrAutoMissionEventType["Heal"] = 4] = "Heal";
    GarrAutoMissionEventType[GarrAutoMissionEventType["PeriodicDamage"] = 5] = "PeriodicDamage";
    GarrAutoMissionEventType[GarrAutoMissionEventType["PeriodicHeal"] = 6] = "PeriodicHeal";
    GarrAutoMissionEventType[GarrAutoMissionEventType["ApplyAura"] = 7] = "ApplyAura";
    GarrAutoMissionEventType[GarrAutoMissionEventType["RemoveAura"] = 8] = "RemoveAura";
    GarrAutoMissionEventType[GarrAutoMissionEventType["Died"] = 9] = "Died";
})(GarrAutoMissionEventType || (GarrAutoMissionEventType = {}));
function formatEvent(event, spellName, spellID, caster, casterBoardIndex, target, targetBoardIndex, amount, element, targetNewHealth, targetMaxHealth) {
    switch (event.type) {
        case GarrAutoMissionEventType.MeleeDamage:
            return caster + " (" + casterBoardIndex + ") meleed (" + spellID + ") " + target + " (" + targetBoardIndex + ") for " + amount + " damage (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.RangeDamage:
            return caster + " (" + casterBoardIndex + ") shot (" + spellID + ") " + target + " (" + targetBoardIndex + ") for " + amount + " damage (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.SpellMeleeDamage:
            return caster + " (" + casterBoardIndex + ") cast " + spellName + " (" + spellID + ") at " + target + " (" + targetBoardIndex + ") for " + amount + " " + spellSchoolName(element) + " damage (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.SpellRangeDamage:
            return caster + " (" + casterBoardIndex + ") cast " + spellName + " (" + spellID + ") at " + target + " (" + targetBoardIndex + ") for " + amount + " " + spellSchoolName(element) + " damage (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.PeriodicDamage:
            return caster + "'s (" + casterBoardIndex + ") " + spellName + " (" + spellID + ") dealt " + amount + " " + spellSchoolName(element) + " to " + target + " (" + targetBoardIndex + ") (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.ApplyAura:
            return caster + " (" + casterBoardIndex + ") applied " + spellName + " (" + spellID + ") to " + target + " (" + targetBoardIndex + ") (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.RemoveAura:
            return caster + " (" + casterBoardIndex + ") removed " + spellName + " (" + spellID + ") from " + target + " (" + targetBoardIndex + ") (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.Heal:
            return caster + " (" + casterBoardIndex + ") cast " + spellName + " (" + spellID + ") on " + target + " (" + targetBoardIndex + ") for " + amount + " healing (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.PeriodicHeal:
            return caster + "'s (" + casterBoardIndex + ") " + spellName + " (" + spellID + ") healed " + target + " (" + targetBoardIndex + ") for " + amount + " (" + targetNewHealth + "/" + targetMaxHealth + ")";
        case GarrAutoMissionEventType.Died:
            return caster + " (" + casterBoardIndex + ") killed " + target + " (" + targetBoardIndex + ").";
    }
}
var ViewModel = /** @class */ (function () {
    function ViewModel() {
        this.input = ko.observable();
        this.views = ko.observableArray();
        this.input.extend({ rateLimit: { timeout: 100, method: 'notifyWhenChangesStop' } });
        this.input.subscribe(this.update, this);
    }
    ViewModel.prototype.update = function (value) {
        var _a;
        if (value === undefined) {
            return;
        }
        var missions = value.split(/\r?\n/)
            .map(function (v) {
            try {
                var data = JSON.parse(v);
                data.board = new Map();
                data.spell = new Map();
                data.encounters.forEach(function (e) {
                    data.board.set(e.boardIndex, e.name);
                    data.spell.set(e.autoCombatAutoAttack.autoCombatSpellID, e.autoCombatAutoAttack.name);
                    e.autoCombatSpells.forEach(function (s) {
                        data.spell.set(s.autoCombatSpellID, s.name);
                    });
                });
                Object.values(data.followers).forEach(function (f) {
                    data.board.set(f.boardIndex, f.name);
                    f.spells.forEach(function (s) {
                        data.spell.set(s.autoCombatSpellID, s.name);
                    });
                });
                return data;
            }
            catch (e) {
                console.log(e);
                return null;
            }
        })
            .filter(notNull);
        this.views.removeAll();
        (_a = this.views).push.apply(_a, missions);
    };
    return ViewModel;
}());
ko.applyBindings(new ViewModel());
