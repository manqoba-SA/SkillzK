import { Redirect, Route, withRouter } from 'react-router-dom';
import {
  IonBadge,
  IonIcon,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { chatbox, chatbubble, home, homeOutline, notifications, notificationsCircleOutline, notificationsOutline, person, personOutline, search, searchOutline, square, triangle } from 'ionicons/icons';
import Home from './pages/Home';
import Tab2 from './pages/Search';
import Tab3 from './pages/Message';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import EditUser from './components/profile/EditUser'
import UserReviews from './components/profile/UserReviews'
import AddPost from './components/home/AddPost'
import SinglePost from './components/home/SinglePost'
import OtherUserProfile from './components/profile/OtherUserProfile'
import NotificationsView from './components/notifications/NotificationView'
import NotificationsFinalView from './components/notifications/NotificationFinalView'
import MessageView from './components/messages/Message View'
import MarketPlace from './pages/MarketPlace'
import AddProductToSell from './components/makertPlace/AddProductToSell'
// import FinishRegisteration from './components/firstScreens/FinishRegisteration'
import { useAuth } from './auth';
import { useEffect, useState } from 'react';
import { firestore } from './firebase';


const AppTabs: React.FC = () => {
    const {loggedIn, userId} = useAuth();
    const [userNotifications, setUserNotifications] = useState([])
    useEffect(() => {
      firestore.collection("notifications").where("recipient", "==", userId).where("read", "==", "false").onSnapshot((data) =>{
        const notifications = []
        data.forEach((doc) => {
          notifications.push(doc.data());
        });
        console.log("refresh")
        setUserNotifications(notifications)
    })
  }, [])
    if(!loggedIn){
      return <Redirect to='/slides'/>
    }

    
   
  return(
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/my/home">
            <Home />
          </Route>
          <Route exact path="/my/home/AddPost">
            <AddPost />
          </Route>
          
          
          <Route exact path="/my/posts/view/:id">
            <SinglePost />
          </Route>
          <Route exact path="/my/search">
            <Tab2 />
          </Route>
          <Route path="/my/messages">
            <Tab3 />
          </Route>
          <Route path="/my/mymessages/view/:id">
            <MessageView />
          </Route>
          <Route exact path="/my/notifications">
            <Notifications />
          </Route>
          <Route exact path="/my/mynotifications/view/:id">
            <NotificationsView/>
          </Route>
          <Route exact path="/my/mynotifications/finalview/:id">
            <NotificationsFinalView/>
          </Route>
          <Route exact path="/my/marketplace">
          <MarketPlace />
          </Route>
          <Route exact path="/my/makertplace/addProductToSell">
          <AddProductToSell />
          </Route>
          <Route exact path="/my/profile">
          <Profile />
          </Route>
          <Route exact path="/my/editprofile">
          <EditUser name={''} description={''} />
          </Route>
          <Route exact path="/my/userreviews/:id">
          <UserReviews />
          </Route> 
          <Route exact path="/my/user/:id">
            <OtherUserProfile/>
          </Route>
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton  tab="home" href="/my/home">
            <IonIcon icon={home} />
          </IonTabButton>
          <IonTabButton  tab="search" href="/my/search">
            <IonIcon icon={search} />
          </IonTabButton>
          <IonTabButton tab="messages" href="/my/messages">
            <IonIcon icon={chatbox} />
          </IonTabButton>
          <IonTabButton tab="notifications" href="/my/notifications">
            <IonIcon icon={notifications} />
            {userNotifications.length ?
            <IonBadge>{userNotifications.length}</IonBadge> : ""
            }
          </IonTabButton>
          <IonTabButton tab="profile" href="/my/profile">
            <IonIcon icon={person} />
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
);
  }

export default AppTabs;
