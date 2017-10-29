import React, { Component } from 'react';
import {
	HashRouter as Router,
	Route, Switch
} from 'react-router-dom';
import { withRouter } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import MaterialIcon from 'react-google-material-icons'
import {BottomNavigation, BottomNavigationItem} from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';

import './App.css';
import Home from './Home';
import Charts from './Charts';
import Heatmap from './Heatmap';

const recentsIcon = <MaterialIcon icon="home" className="material-icons" />;
const favoritesIcon = <MaterialIcon icon="place" className="material-icons"/>;

class MainTabs extends Component {
	render() {
		const { location, history } = this.props
		var selectedIndex;
		switch(location.pathname) {
			case '/': selectedIndex = 0; break;
			case '/charts': selectedIndex = 1; break;
			case '/heatmap': selectedIndex = 2; break;
			default: selectedIndex = 0; break;
		}
		return (
				<Paper zDepth={1}>
					<BottomNavigation selectedIndex={selectedIndex}>
						<BottomNavigationItem
							label="Tracking"
							icon={recentsIcon}
							onClick={() => history.push('/')}
						/>
						<BottomNavigationItem
							label="Charts"
							icon={favoritesIcon}
							onClick={() => history.push('/charts')}
						/>
						<BottomNavigationItem
							label="Heatmap"
							icon={favoritesIcon}
							onClick={() => history.push('/heatmap')}
						/>
					</BottomNavigation>
				</Paper>
			)
	}
}

const MainTabsWithRouter = withRouter(MainTabs);

class App extends Component {
	render() {
		return (
			<MuiThemeProvider>
				<Router>
					<div>
						<Switch>
							<Route exact path="/" component={Home}/>
							<Route path="/charts" component={Charts}/>
							<Route path="/heatmap" component={Heatmap}/>
						</Switch>
						<MainTabsWithRouter />
					</div>
				</Router>
			</MuiThemeProvider>
		);
	}
}

export default App;
