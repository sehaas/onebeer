const makeCancelable = (promise) => {
	let hasCanceled_ = false;

	const wrappedPromise = new Promise((resolve, reject) => {
		promise.then((val) =>
			hasCanceled_ ? reject({isCanceled: true}) : resolve(val)
		);
		promise.catch((error) =>
			hasCanceled_ ? reject({isCanceled: true}) : reject(error)
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
	return new Promise( ( resolve, reject ) => {
		navigator.geolocation.getCurrentPosition( ( position ) => {
			let latitude  = position.coords.latitude;
			let longitude = position.coords.longitude;

			resolve( { latitude, longitude } );

		}, () => { reject( 'We could not get your location.' ); },
		{
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 0
		});
	});
};

const updateState = (that, data) => {
	return Object.assign({}, that.state, data);
};

export {getCurrentPosition, makeCancelable, updateState};
