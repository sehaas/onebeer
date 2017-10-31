import React, { Component } from 'react';
import db from './db';
import State from './State';
import { updateState } from './Helper';
import { ScatterplotChart, BarChart } from 'react-easy-chart';
import {Card, CardHeader, CardText} from 'material-ui/Card';

class Charts extends Component {

	constructor(props) {
		super(props);
		this.state = {
			global: State,
			data: [],
			width: 300,
			height: 500
		};
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

		this._mounted && this.setState(updateState({
			data: data,
			width: this.refs.widthHelper.offsetWidth - 50,
		}));
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	render() {
		return (
			<div ref="widthHelper">
				<Card initiallyExpanded={true}>
					<CardHeader
						title="Punchcard"
						actAsExpander={true}
						showExpandableButton={true}
					/>
					<CardText expandable={true}>
						<ScatterplotChart ref="eins"
							data={this.state.data}
							axes
							width={this.state.width}
							height={this.state.height}
							xType="text"
							yDomainRange={[0,23]}
							grid
							margin={{top: 10, right: 0, bottom: 30, left: 30}}
						/>
					</CardText>
				</Card>
			</div>
		)
	}
}

export default Charts;