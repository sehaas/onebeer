let state_instance = null;
class State {
	constructor() {
		if (!state_instance) {
			state_instance = this;
			this.coords = { lat: 48.305, lng: 14.285 };
			this.zoom = 13;
			this.tab = '1';
			this.tenant = undefined;
			this.drinks = [];
			this.isSpeedDialOpen = false;
		}
		return state_instance;
	}
}

export default State = new State();