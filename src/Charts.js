import React, { Component } from 'react';
import State from './State';
import db from './db';
import { ScatterplotChart } from 'react-easy-chart';

class Charts extends Component {

	constructor(props) {
		super(props);
		State.tab = '1';
		State.data = [];
		this.state = State;

	}

	async componentDidMount() { 
		this._mounted = true;

		var drinks = await db.drinks.toArray();
		var data = [];
		const week = [
			'Sun','Mon','Tue',
			'Wed','Thu','Fri','Sat'];
		week.forEach((elem) => {
			for (var i=0; i<24; i++){
				data.push({
					type: 1,
					y: i,
					x: elem,
					z: 0
				});
			}
		});
		drinks.reduce((d, e) => {
			var day = e.timestamp.getDay();
			var hours = e.timestamp.getHours();
			var idx = day * 24 + hours;
			d[idx].z = (d[idx].z || 0) + e.ml;
			return d;
		}, data);
		data = data.filter( e => e.z > 0);
		State.data = data;

		State.width = this.refs.component.offsetWidth;
		State.height = 580;
		this._mounted && this.setState(State);
	}

	componentWillUnmount() {
		this._mounted = false;
	}


	render() {
		const scrollStyle = {
			overflow: 'auto',
			height: '604px',
		}
		return (
			<div ref="component" style={scrollStyle}>
			<ScatterplotChart ref="eins"
				data={this.state.data}
				axes
				width={this.state.width}
				height={this.state.height}
				xType="text"
				yDomainRange={[0,23]}
				grid
			/>
			</div>
		)
	}
}

export default Charts;