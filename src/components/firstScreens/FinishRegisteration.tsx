import { IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonLoading, IonPage, IonSlide, IonSlides, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { Redirect } from 'react-router';
import './FinishRegisteration.css';
import React, { useEffect, useState } from 'react';
import {auth, firestore} from '../../firebase'
import {useAuth} from '../../auth'



const FinishRegisteration: React.FC = () => {
  const {userId} = useAuth()
const [registeredUser, setRegisteredUser] = useState("")
  useEffect(() =>{
    const recentsRef = firestore.collection('users').doc(userId);
      recentsRef.get().then(doc =>{
      const userName = doc.data().name 
      setRegisteredUser(userName)
    })
       
  }, [])
  return (
    <IonContent fullscreen className="ion-padding">
     <div className="container">
         {/* <IonTitle> */}
         <h2>Congrats! You have created an account</h2>
            <p>Hello <strong>{registeredUser}</strong> you created an account, now click <b>continue</b> if
              you want to be freelancer, click <b>skip</b> if you just want to be a client.</p>
         {/* </IonTitle> */}
        <IonButton className="ion-margin" routerLink="./freelancerDetails" expand="block">Continue</IonButton>
        <IonButton className="ion-margin" routerLink="./enterClientLocation" fill="outline" expand="block">Skip</IonButton>
        <hr/>
        </div>
  </IonContent>
  );
};

export default FinishRegisteration;
