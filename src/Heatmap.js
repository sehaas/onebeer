import React, { Component } from 'react';
import State from './State';
import db from './db';
import { getCurrentPosition, updateState, getFilter } from './Helper';
import 'leaflet/dist/leaflet.css';
import { Map, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
	iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
	iconUrl: require('leaflet/dist/images/marker-icon.png'),
	shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

class Heatmap extends Component {
	constructor(props) {
		super(props);
		this.layer = null;
		this.state = {
			global: State,
			zoom: 18
		};
		this.updateState = updateState.bind(null, this);
	}

	componentWillReceiveProps(props) {
		this._renderHeatmapData();
	}

	async _renderHeatmapData() {
		var filter = await getFilter(db);
		var drinks = filter != null
			? (await db.drinks.where('timestamp').between(filter.start, filter.end, true, true).toArray()).reverse()
			: (await db.drinks.toArray()).reverse();
		var data = [];
		drinks.forEach(function (itm, idx) {
			data.push([itm.lat, itm.lng]);
		});
		if (this._mounted) {
			if (this.layer != null)
				this.refs.map.leafletElement.removeLayer(this.layer);
			this.layer = L.heatLayer(data, { radius: 25, minOpacity: 0.3 }).addTo(this.refs.map.leafletElement);
			this.setState(this.updateState({ drinks: drinks }));
		}
	}

	_updatePosition(pos) {
		State.coords = {
			lat: pos.latitude,
			lng: pos.longitude
		}
		this._mounted && this.setState(this.updateState({ global: State }));
	}

	async componentDidMount() {
		this._mounted = true;
		this._renderHeatmapData();
		var pos = await getCurrentPosition();
		this._updatePosition(pos);
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		return (
			<Map ref="map" center={this.state.global.coords}
				zoom={this.state.zoom} zoomControl={false}
				style={{ position: 'absolute' }} >
				<TileLayer
					attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={this.state.global.coords} />
				<ZoomControl position="bottomright" />
			</Map>
		)
	}
}

export default Heatmap;
