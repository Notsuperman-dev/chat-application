import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import ReactGA from 'react-ga';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import ChatRoom from './components/ChatRoom';
import MainMenu from './components/MainMenu';
import Profile from './components/Profile';

ReactGA.initialize('YOUR_GOOGLE_ANALYTICS_TRACKING_ID');

const App = () => {
    useEffect(() => {
        ReactGA.pageview(window.location.pathname + window.location.search);
    }, []);

    return (
        <Router>
            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/chat/:room" component={ChatRoom} />
                <Route path="/main-menu" component={MainMenu} />
                <Route path="/profile" component={Profile} />
                <Route path="/" exact component={LandingPage} />
            </Switch>
        </Router>
    );
};

export default App;
