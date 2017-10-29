import Dexie from 'dexie';

const db = new Dexie('onebeer');
db.version(1).stores({
	drinks: '++id, ml, timestamp, lat, lng'
});

export default db;