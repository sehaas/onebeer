import Dexie from 'dexie';

class ImportExportDexie extends Dexie {

	export() {
		return this.transaction('r', this.tables, () => {
			return Promise.all(
				this.tables.map(table => table.toArray()
					.then(rows => ({table: table.name, rows: rows}))));
		});
	}
}

const db = new ImportExportDexie('onebeer');
db.version(1).stores({
	drinks: '++id, ml, timestamp, lat, lng, af'
});

db.version(2).stores({
	settings: '++id, key, value',
	drinks: '++id, ml, timestamp, lat, lng, af, text',
	template: '++id, text, ml, af, order, active'
}).upgrade(function(t){
	t.drinks.toCollection().modify(function (drink) {
		drink.af = (drink.af === true); // fix undefines values
		drink.text = (drink.ml === 500) ? "Halbe" : "Seidl";
		if (drink.af) {
			drink.text += " AF";
		}
	});
});

db.version(3).upgrade(() => {});
db.version(4).upgrade(() => {});
db.version(5).upgrade(() => {});
db.version(6).upgrade((trans) => {
	return trans.drinks.toCollection().modify(d => {
		d.timestamp = new Date(d.timestamp);
	});
});

db.on('ready', function() {
	return db.template.count(function(count){
		if (count === 7) {
			// already initialized
			return;
		}

		if (count === 6) {
			console.log('init pints');
			return db.template.add(
				{ text: "Pint", 	ml: 568.26125, af: false, order: 6, active: false }
			);
		}

		if (count === 0) {
			console.log('init templates');
			return db.template.bulkAdd([
				{ text: "Halbe",		ml: 500, af: false,	order: 0, active: true	},
				{ text: "Radler Halbe",	ml: 500, af: false,	order: 1, active: false	},
				{ text: "Seidl",		ml: 330, af: false,	order: 2, active: true	},
				{ text: "Radler Seidl",	ml: 330, af: false,	order: 3, active: false	},
				{ text: "Sparkling",	ml: 250, af: false,	order: 4, active: false	},
				{ text: "Halbe AF",		ml: 500, af: true,	order: 5, active: true	},
				{ text: "Pint",			ml: 568.26125, af: false, order: 6, active: false }
			]);
		}
	});
});

export default db;
