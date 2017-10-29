import React, { Component } from 'react';
import State from './State';
import db from './db';
import { getCurrentPosition } from './Helper';
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
		State.tab = '2';
		this.state = State;
	}

	_renderHeatmapData(drinks) {
		var data = [];
		drinks.forEach(function(itm, idx) {
			data.push([itm.lat, itm.lng]);
		});
		this._mounted && L.heatLayer(data, {radius: 25, minOpacity: 0.3}).addTo(this.refs.map.leafletElement);
	}

	_updatePosition(pos) {
		State.coords = {};
		State.coords.lat = pos.latitude;
		State.coords.lng = pos.longitude;
		this._mounted && this.setState(State);
	}

	async componentDidMount() {
		this._mounted = true;
		State.drinks = (await db.drinks.toArray()).reverse();
		this._renderHeatmapData(State.drinks);
		var pos = await getCurrentPosition();
		this._updatePosition(pos);
		this._mounted && this.setState(State);
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		console.log('render', this.state.coords);
		return (
			<Map ref="map" center={this.state.coords} zoom={this.state.zoom} zoomControl={false}>
				<TileLayer
				attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={this.state.coords} />
				<ZoomControl position="bottomright" />
			</Map>
		)
	}
}

export default Heatmap;