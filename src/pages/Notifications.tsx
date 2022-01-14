import {
  IonAvatar,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  alertCircle,
  basket,
  cart,
  chatbubbleOutline,
  thumbsDown,
  thumbsUp,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { firestore } from "../firebase";
import "./Home.css";
dayjs.extend(relativeTime);

const Notifications: React.FC = () => {
  const { userId } = useAuth();
  const [userNotifications, setUserNotifications] = useState([]);

  useEffect(() => {
    const queryNotifications = firestore.collection("notifications");
    queryNotifications
      .where("recipient", "==", userId)
      .where("read", "==", "false")
      .orderBy("createdAt", "desc")
      .limit(15)
      .get()
      .then((snapshots) => {
        if (snapshots.size > 0) {
          snapshots.forEach((notification) => {
            queryNotifications.doc(notification.id).update({ read: "true" });
          });
        }
      });
  }, []);
  useEffect(() => {
    firestore
      .collection("notifications")
      .where("recipient", "==", userId)
      .orderBy("createdAt", "desc")
      .onSnapshot((data) => {
        const notifications = data.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("refresh");
        setUserNotifications(notifications);
      });
  }, []);
  var colors = ["primary", ""];
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Notifications</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        className="animate__animated animate__fadeIn animate__faster"
      >
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Notifications</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink={`/my/marketplace`}>
            <IonIcon icon={basket} />
          </IonFabButton>
        </IonFab>
        <IonList>
          <IonListHeader>Recents</IonListHeader>
          {userNotifications.map((notification, i) => (
            <IonItem
              routerLink={
                notification.type == "hire"
                  ? `/my/mynotifications/view/${notification.id}`
                  : notification.type == "comment"
                  ? `/my/posts/view/${notification.postID}`
                  : notification.type == "hireAccept" ||
                    notification.type == "hireReject"
                  ? `/my/mynotifications/finalview/${notification.id}`
                  : `/my/mymessages/view/${notification.chatID}`
              }
              lines="none"
              detail
            >
              <IonAvatar slot="start">
                <IonIcon
                  color={colors[i % colors.length]}
                  icon={
                    notification.type == "comment"
                      ? chatbubbleOutline
                      : notification.type == "hire"
                      ? alertCircle
                      : notification.type == "hireAccept"
                      ? thumbsUp
                      : notification.type == "hireReject"
                      ? thumbsDown
                      : cart
                  }
                ></IonIcon>
              </IonAvatar>
              <IonLabel className="user">
                <strong>{notification.message}</strong>
                <br />
                <small>
                  <strong>{dayjs(notification.createdAt).fromNow()}</strong>
                </small>
                <br />
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Notifications;
