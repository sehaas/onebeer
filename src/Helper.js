const makeCancelable = (promise) => {
	let hasCanceled_ = false;

	const wrappedPromise = new Promise((resolve, reject) => {
		promise.then((val) =>
			hasCanceled_ ? reject({ isCanceled: true }) : resolve(val)
		);
		promise.catch((error) =>
			hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
		);
	});

	return {
		promise: wrappedPromise,
		cancel() {
			hasCanceled_ = true;
		},
	};
};

const getCurrentPosition = () => {
	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition((position) => {
			let latitude = position.coords.latitude;
			let longitude = position.coords.longitude;

			resolve({ latitude, longitude });

		}, () => { reject('We could not get your location.'); },
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
			});
	});
};

const getFilter = async (db) => {
	var setting = await db.settings.where({ key: 'yearFilter' }).last();
	if (setting !== undefined && setting.value !== null) {
		return {
			year: setting.value,
			start: new Date(setting.value, 0, 1),
			end: new Date(setting.value, 11, 31, 23, 59, 59)
		};
	} else {
		return null;
	}
};

const updateState = (that, data) => {
	return Object.assign({}, that.state, data);
};

export { getCurrentPosition, makeCancelable, updateState, getFilter };
