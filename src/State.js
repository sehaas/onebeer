let state_instance = null;
class State {
	constructor() {
		if (!state_instance) {
			state_instance = this;
			this.tenant = undefined;
			this.coords= {
				lat: 48.305,
				lng: 14.285
			};
		}
		return state_instance;
	}
}

export default State = new State();