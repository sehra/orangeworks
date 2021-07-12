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
