import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCard, IonCardContent, IonContent, IonFabButton, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonLabel, IonList, IonListHeader, IonLoading, IonPage, IonText, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { firestore, storage } from '../../firebase';
import {
    Camera,
    CameraResultType,
  } from "@capacitor/camera";
import { chatboxOutline, chatbubbles, ellipsisHorizontal, ellipsisVertical, heartOutline, image, location } from 'ionicons/icons';
import { Geolocation } from '@capacitor/geolocation';
import { useAuth, useAuthInit } from '../../auth';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)






const NotificationFinalView: React.FC = () => {
  const {userId} = useAuth()
  const { id }  = useParams<{ id: string }>();
  const [notification, setNotification] = useState<any>();;
  
  useEffect(()=>{
    const recentRef = firestore.collection("notifications").doc(id);
    recentRef.onSnapshot(doc => {
      const post = {id: doc.id, ...doc.data()}
      setNotification(post)
    }
    )}, [id])
    console.log(notification)

  // Get  Authuser username
    const [authUsername, setAuthUsername] = useState("")
    useEffect(() =>{
    const usersRef = firestore.collection('users').doc(userId);
        usersRef.get().then(doc =>{
        const displayName = doc.data().name
        setAuthUsername(displayName)
    })}, [])



   

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
                <IonBackButton defaultHref="home" />
                </IonButtons>
            <IonTitle>Notification from {notification?.senderName}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="container">
            {notification?.type == "hireAccept" ?
            <div>
            <h3>{notification?.senderName} has accepted to work for you.. You can now start chatting with {notification?.senderName}</h3>
            <IonButton routerLink={`/my/mymessages/view/${notification?.sender}`}>Chat with {notification?.senderName}<IonIcon slot="end" icon={chatbubbles}></IonIcon></IonButton>
            </div>
            :
            <div className="ion-padding">
              <h3>{notification?.senderName} has rejected to work for you.. Sorry you may consider to find other user providing
              same service as {notification?.senderName}</h3>
            </div>}
      </div>
      </IonContent>
    </IonPage>
  );
};

export default NotificationFinalView;
