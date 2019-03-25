import React, { Component } from 'react';
import { BrowserRouter,HashRouter, Route, Switch} from 'react-router-dom'
import Gum from './views/getusermedia/gum'

class App extends Component {
  render() {
    return (
      <div className="App">
      <HashRouter>
        <Switch>
          <Route exact path="/getusermedia/gum" render={() => <Gum />} />
        </Switch>
      </HashRouter>
      </div>
    );
  }
}

export default App;
