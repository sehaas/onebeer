import React, { Component } from 'react';
import {
	HashRouter as Router,
	Route, Switch
} from 'react-router-dom';
import { withRouter } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import AppBar from 'material-ui/AppBar';
import HomeIcon from 'material-ui/svg-icons/action/home';
import PlaceIcon from 'material-ui/svg-icons/maps/place';
import ChartIcon from 'material-ui/svg-icons/editor/insert-chart';

import './App.css';
import Home from './Home';
import Charts from './Charts';
import Heatmap from './Heatmap';
import Settings from './Settings';
import ThreeDots from './ThreeDots';

const keepDown = {
	position: 'fixed',
	bottom: '0px',
	left: '0px',
	right: '0px'
}

class MainTabs extends Component {
	render() {
		const { location, history } = this.props
		var selectedIndex;
		switch (location.pathname) {
			case '/': selectedIndex = 0; break;
			case '/charts': selectedIndex = 1; break;
			case '/heatmap': selectedIndex = 2; break;
			case '/settings': selectedIndex = 3; break;
			default: selectedIndex = 0; break;
		}
		return (
			<Paper zDepth={1} style={keepDown}>
				<BottomNavigation selectedIndex={selectedIndex}>
					<BottomNavigationItem
						label="Tracking"
						icon={<HomeIcon />}
						onClick={() => history.replace('/')}
					/>
					<BottomNavigationItem
						label="Charts"
						icon={<ChartIcon />}
						onClick={() => history.replace('/charts')}
					/>
					<BottomNavigationItem
						label="Heatmap"
						icon={<PlaceIcon />}
						onClick={() => history.replace('/heatmap')}
					/>
				</BottomNavigation>
			</Paper>
		)
	}
}

const MainTabsWithRouter = withRouter(MainTabs);
const ThreeDotsRouter = withRouter(ThreeDots);



const muiTheme = getMuiTheme({
	palette: {
		primary1Color: '#ffa000',
		primary2Color: '#ffd149',
		primary3Color: '#c67100',
		accent1Color: '#455a64',
		accent2Color: '#718792',
		accent3Color: '#1c313a',
		textColor: '#1c313a',
		alternateTextColor: '#ffffff',
	},
	appBar: {
		height: 50,
	},
});

class App extends Component {
	constructor() {
		super();
		this._applyFilter = this._applyFilter.bind(this);
	}

	_applyFilter() {
		this.forceUpdate();
	}

	render() {
		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<Router>
					<div style={{ marginTop: '50px' }}>
						<AppBar
							title="onebeer"
							showMenuIconButton={false}
							iconElementRight={<ThreeDotsRouter applyFilter={this._applyFilter} />}
							style={{
								position: 'fixed',
								top: '0px'
							}}
						/>
						<Switch>
							<Route exact path="/" component={Home} />
							<Route path="/charts" component={Charts} />
							<Route path="/heatmap" component={Heatmap} />
							<Route path="/settings" component={Settings} />
						</Switch>
						<MainTabsWithRouter />
					</div>
				</Router>
			</MuiThemeProvider>
		);
	}
}

export default App;
