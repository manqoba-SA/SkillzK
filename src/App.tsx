import { Redirect, Route, Switch } from 'react-router-dom';
import {
  IonApp,
  IonLoading,
  IonRouterOutlet,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import LoginPage from './components/firstScreens/Login'
import AppTabs from './AppTabs'
import NotFoundPage from './pages/NotFoundPage'
import Slides from './components/firstScreens/Slides'
import Register from './components/firstScreens/Register'
import FreelancerDetails from "./components/firstScreens/FreelancerDetail"
import FinishRegisteration from './components/firstScreens/FinishRegisteration';
import ClientLocation from './components/firstScreens/ClientLocation'
import {AuthContext, useAuthInit} from './auth'

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { useState } from 'react';
import { auth } from './firebase';


auth.onAuthStateChanged((user) =>{
  console.log("AuthStateUser:", user)
})

const App: React.FC = () => {
  const {loading, auth} = useAuthInit()
    if(loading){
      return <IonLoading isOpen/>
    }
    console.log("User Info", auth)
  return(
  <IonApp>
    <AuthContext.Provider value={auth}>
    <IonReactRouter>
        <Switch>
          <Route exact path="/login">
             <LoginPage onLogin={() => setloggedIn(true)} />   
          </Route>
          <Route path="/my">
            <AppTabs/>
          </Route>
          <Route exact path="/">
            <Redirect to="/my/home" />
          </Route>
          <Route exact path="/slides">
            <Slides/>
          </Route>
          <Route exact path="/Register">
            <Register/>
          </Route>
          <Route exact path="/RegistarationFinished">
            <FinishRegisteration/>
          </Route>
          <Route exact path="/enterClientLocation">
            <ClientLocation/>
          </Route>
          <Route exact path="/freelancerDetails">
            <FreelancerDetails/>
          </Route>
          <Route>
            <NotFoundPage/>
          </Route>
        </Switch>
    </IonReactRouter>
    </AuthContext.Provider>
  </IonApp>
);
  }

export default App;
function setloggedIn(arg0: boolean): void {
  throw new Error('Function not implemented.');
}

