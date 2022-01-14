import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  caretForwardCircle,
  ellipsisHorizontal,
  ellipsisHorizontalSharp,
  ellipsisVertical,
  ellipsisVerticalSharp,
  heart,
  informationCircleOutline,
  logOut,
  medkitOutline,
  share,
  starHalfOutline,
  trash,
} from "ionicons/icons";
import { useState } from "react";
import UserProfile from "../components/profile/UserProfile";
import "./Home.css";
import { auth as firebaseAuth, firestore } from "../firebase";
import { Browser } from "@capacitor/browser";

const Profile: React.FC = () => {
  const [showActionSheet, setShowActionSheet] = useState(false);
  return (
    <IonPage>
      <IonHeader color="primary">
        <IonToolbar>
          <IonTitle>User Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowActionSheet(true)}>
              <IonIcon
                slot="icon-only"
                ios={ellipsisHorizontal}
                md={ellipsisVertical}
              ></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="animate__animated animate__fadeIn animate__faster">
        <UserProfile name="User Profile" description="Software developer" />
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          cssClass="my-custom-class"
          buttons={[
            {
              text: "Rate App",
              role: "destructive",
              icon: starHalfOutline,
              handler: async () => {
                await Browser.open({
                  url: "https://play.google.com/store",
                });
              },
            },
            {
              text: "Covid19 info",
              icon: medkitOutline,
              handler: async () => {
                await Browser.open({
                  url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019",
                });
              },
            },
            {
              text: "About App",
              icon: informationCircleOutline,
              handler: async () => {
                await Browser.open({
                  url: "https://www.who.int/emergencies/diseases/novel-coronavirus-2019",
                });
              },
            },
            {
              text: "LogOut User",
              icon: logOut,
              handler: () => {
                firebaseAuth.signOut();
              },
            },
            {
              text: "Cancel",
              // icon: close,
              role: "cancel",
              handler: () => {
                console.log("Cancel clicked");
              },
            },
          ]}
        ></IonActionSheet>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
