import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonLoading,
  IonPage,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { firestore, storage } from "../../firebase";
import { Camera, CameraResultType } from "@capacitor/camera";
import {
  chatboxOutline,
  chatbubbles,
  ellipsisHorizontal,
  ellipsisVertical,
  heartOutline,
  image,
  location,
} from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { useAuth, useAuthInit } from "../../auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const NotificationView: React.FC = () => {
  const { userId } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [notification, setNotification] = useState<any>();

  useEffect(() => {
    const recentRef = firestore.collection("notifications").doc(id);
    recentRef.onSnapshot((doc) => {
      const post = { id: doc.id, ...doc.data() };
      setNotification(post);
    });
  }, [id]);
  console.log(notification);

  // Get  Authuser username
  const [authUsername, setAuthUsername] = useState("");
  useEffect(() => {
    const usersRef = firestore.collection("users").doc(userId);
    usersRef.get().then((doc) => {
      const displayName = doc.data().name;
      setAuthUsername(displayName);
    });
  }, []);

  const [status, setStatus] = useState({ isError: false, isLoading: false });
  const [showButtons, setShowButtons] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  const handleAccept = async (recipientId, recipientIdName) => {
    setStatus({ isError: false, isLoading: true });
    const newNotification = {
      createdAt: new Date().toISOString(),
      message: `${authUsername} has accepted your proposal`,
      read: "false",
      recipient: recipientId,
      sender: userId,
      type: "hireAccept",
      senderName: authUsername,
    };
    try {
      await firestore
        .collection("notifications")
        .add(newNotification)
        .then(() => {
          setShowButtons(false);
          setMessage(
            `Hooray 💯💯 you accepted the job request.. Now you can choose to chat with ${recipientIdName}..`
          );
          setShowMessage(true);
          setStatus({ isError: false, isLoading: false });
        });
    } catch (error) {
      setStatus({ isError: true, isLoading: false });
      setMessage(error);
      setShowButtons(false);
      setShowMessage(true);
    }
  };

  const handleReject = async (recipientId, recipientIdName) => {
    setStatus({ isError: false, isLoading: true });
    const newNotification = {
      createdAt: new Date().toISOString(),
      message: `${authUsername} has rejected your proposal to work for you`,
      read: "false",
      recipient: recipientId,
      sender: userId,
      type: "hireReject",
      senderName: authUsername,
    };
    try {
      await firestore
        .collection("notifications")
        .add(newNotification)
        .then(() => {
          setShowButtons(false);
          setMessage(
            `Thank you the other user will see that you rejected their proposal`
          );
          setShowMessage(true);
          setStatus({ isError: false, isLoading: false });
        });
    } catch (error) {
      setStatus({ isError: true, isLoading: false });
      setMessage(error);
      setShowButtons(false);
      setShowMessage(true);
    }
  };

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
          {showButtons && (
            <div>
              <h3>{notification?.senderName} Wants to hire you</h3>
              <h4>Their message:</h4>
              {notification?.userMessage ? (
                <p>
                  <b>{notification?.userMessage}</b>
                </p>
              ) : (
                <p>User did not attach a message</p>
              )}
              <h6 className="ion-padding">
                Click <strong>Accept</strong> if you are available and up for
                the job. If not you can click <strong>Reject</strong> to notify
                the other user that you are not available for their requested
                services from you.
              </h6>

              <IonButton
                fill="outline"
                onClick={() =>
                  handleAccept(notification?.sender, notification?.senderName)
                }
              >
                Accept
              </IonButton>
              <IonButton
                onClick={() =>
                  handleReject(notification?.sender, notification?.senderName)
                }
              >
                Reject
              </IonButton>
            </div>
          )}
          {showMessage && (
            <div>
              <h5 className="ion-padding">{message}</h5>
              <IonButton
                routerLink={`/my/mymessages/view/${notification?.sender}`}
              >
                Chat with {notification?.senderName}
                <IonIcon slot="end" icon={chatbubbles}></IonIcon>
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
      <IonLoading isOpen={status.isLoading} />
    </IonPage>
  );
};

export default NotificationView;
