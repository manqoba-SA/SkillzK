import {
  IonAvatar,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ellipseSharp } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useAuth } from "../auth";
import { firestore } from "../firebase";
import "./Message.css";
dayjs.extend(relativeTime);

const Tab3: React.FC = () => {
  const { userId } = useAuth();
  const [Chatusers, setChatUsers] = useState([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const q = firestore.collection("lastMessage");
      async function getIfUserHasChats() {
        const isFrom = q
          .where("from", "==", userId)
          .orderBy("createdAt", "desc")
          .get();
        const isTo = q
          .where("to", "==", userId)
          .orderBy("createdAt", "desc")
          .get();

        const [fromQuerySnapshot, toQuerySnapshot] = await Promise.all([
          isFrom,
          isTo,
        ]);
        const fromArray = fromQuerySnapshot.docs;
        const toArray = toQuerySnapshot.docs;
        const bothArray = fromArray.concat(toArray);
        return bothArray;
      }

      getIfUserHasChats().then((result) => {
        const results = result.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        setChatUsers(results);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const [searchItem, setSearchItem] = useState("");
  var colors = ["chat-list-items", "1"];
  return (
    <IonPage>
      <IonToolbar>
        <IonTitle>Messages</IonTitle>
      </IonToolbar>
      <IonContent
        className="animate__animated animate__fadeIn animate__faste"
        fullscreen
      >
        <IonHeader mode="ios" collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My Messages</IonTitle>
          </IonToolbar>
          <IonSearchbar
            onIonChange={(e) => setSearchItem(e.detail.value)}
          ></IonSearchbar>
        </IonHeader>
        <IonContent>
          <IonList>
            {Chatusers.filter((users) => {
              if (searchItem == "") {
                return users;
              } else if (
                users.name
                  .toLowerCase()
                  .includes(searchItem.toLocaleLowerCase()) ||
                users.jobDescription
                  .toLowerCase()
                  .includes(searchItem.toLocaleLowerCase())
              ) {
                return users;
              }
            }).map((users, i) => (
              <IonItem
                detail
                routerLink={`/my/mymessages/view/${
                  users.to == userId ? users.from : users.to
                }`}
                className={colors[i % colors.length]}
              >
                <IonAvatar>
                  <img
                    src={users.to == userId ? users.fromImage : users.toImage}
                    alt={users.toImage}
                  />
                </IonAvatar>
                <IonLabel className="ion-padding">
                  <h2>
                    <b>{users.to == userId ? users.fromName : users.toName}</b>
                    {users.to == userId ? (
                      users.unread == true ? (
                        <IonIcon color="primary" icon={ellipseSharp}></IonIcon>
                      ) : (
                        ""
                      )
                    ) : (
                      ""
                    )}
                  </h2>
                  <small>
                    {users.to == userId ? users.text : `you: ${users.text}`}
                  </small>
                  <small className="from-day-messages">
                    {dayjs(users.createdAt).fromNow()}
                  </small>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </IonContent>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
