import Dexie from 'dexie';

const db = new Dexie('onebeer');

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

db.on('ready', function() {
	return db.template.count(function(count){
		if (count > 0) {
			// already initialized
			return;
		}

		console.log('init templates');
		return db.template.bulkAdd([
			{ text: "Halbe",		ml: 500, af: false,	order: 0, active: true	},
			{ text: "Radler Halbe",	ml: 500, af: false,	order: 1, active: false	},
			{ text: "Seidl",		ml: 330, af: false,	order: 2, active: true	},
			{ text: "Radler Seidl",	ml: 330, af: false,	order: 3, active: false	},
			{ text: "Sparkling",	ml: 250, af: false,	order: 4, active: false	},
			{ text: "Halbe AF",		ml: 500, af: true,	order: 5, active: true	},
		]);
	})
});

export default db;