import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonRow,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { star } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../../auth";
import { firestore } from "../../firebase";
import "./UserReviews.css";
dayjs.extend(relativeTime);

const UserReviews: React.FC = () => {
  const { userId } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [showWarningContent, setShowWarningContent] = useState(false);
  const [showAddModalContent, setShowAddModalContent] = useState(false);

  const { id } = useParams<{ id: string }>();
  const [ratings, setRatings] = useState([]);
  useEffect(() => {
    firestore
      .collection("ratings")
      .where("ratedUID", "==", id)
      .orderBy("createdAt", "desc")
      .onSnapshot((data) => {
        const reviews = [];
        data.forEach((doc) => {
          reviews.push(doc.data());
        });
        console.log("refresh");
        setRatings(reviews);
      });
  }, []);

  const [getName, setGetname] = useState("");
  useEffect(() => {
    firestore
      .collection("users")
      .doc(id)
      .onSnapshot((doc) => {
        setGetname(doc.data().name);
      });
  }, []);

  // Modal
  const showWarningModal = () => {
    setShowModal(true);
    setShowWarningContent(true);
  };
  const closeWarningModal = () => {
    setShowModal(false);
    setShowWarningContent(false);
  };
  const showAddModal = () => {
    setShowWarningContent(false);
    setShowAddModalContent(true);
  };
  const closeAddModal = () => {
    setShowAddModalContent(false);
    setShowModal(false);
  };

  // Star Ratings
  const [currentValue, setCurrentValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(undefined);
  const stars = Array(5).fill(0);

  const handleClick = (value) => {
    setCurrentValue(value);
  };

  const handleMouseOver = (newHoverValue) => {
    setHoverValue(newHoverValue);
  };

  const handleMouseLeave = () => {
    setHoverValue(undefined);
  };

  console.log(currentValue);

  const [displayName, setDisplayName] = useState("");
  useEffect(() => {
    firestore
      .collection("users")
      .doc(userId)
      .onSnapshot((doc) => {
        setDisplayName(doc.data().name);
      });
  }, []);

  const [message, setMessage] = useState("");
  const handleSubmitRate = () => {
    firestore
      .collection("ratings")
      .add({
        fromName: displayName,
        fromUID: userId,
        ratedUID: id,
        stars: currentValue,
        message: message,
        createdAt: new Date().toISOString(),
      })
      .then(() => {
        firestore
          .collection("users")
          .doc(id)
          .update({ averageRating: currentValue });
        closeAddModal();
      });
  };
  return (
    <IonPage>
      <IonHeader color="primary">
        <IonToolbar>
          {id == userId ? (
            <IonTitle>My Reviews</IonTitle>
          ) : (
            <IonTitle>{getName}'s Reviews</IonTitle>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* <IonContent> */}
        <IonModal isOpen={showModal} cssClass="my-custom-class">
          {showWarningContent && (
            <IonContent fullscreen className="ion-padding">
              <div className="container">
                <h3>Before you review</h3>
                <p>
                  When you reviewing an account the person should have worked
                  for you and reviewing one account repeatedly will results your
                  account to be <b>banned</b>.
                </p>
                <IonButton onClick={showAddModal}>Continue</IonButton>
                <IonButton fill="outline" onClick={closeWarningModal}>
                  Close
                </IonButton>
              </div>
            </IonContent>
          )}
          {showAddModalContent && (
            <IonContent fullscreen className="ion-padding">
              <div className="container">
                <h3>Rate {getName}</h3>

                {stars.map((_, index) => {
                  return (
                    <IonIcon
                      key={index}
                      icon={star}
                      onClick={() => handleClick(index + 1)}
                      onMouseOver={() => handleMouseOver(index + 1)}
                      onMouseLeave={handleMouseLeave}
                      color={
                        (hoverValue || currentValue) > index
                          ? "primary"
                          : "medium"
                      }
                      style={{
                        marginRight: 10,
                        cursor: "pointer",
                      }}
                    />
                  );
                })}

                <IonItem className="ion-padding-start ion-padding-end">
                  <IonTextarea
                    onIonChange={(e) => setMessage(e.detail.value)}
                    placeholder="Describe your experience"
                  ></IonTextarea>
                </IonItem>
                <IonButton onClick={handleSubmitRate}>Post</IonButton>
                <IonButton onClick={closeAddModal}>close</IonButton>
              </div>
            </IonContent>
          )}
        </IonModal>
        <IonGrid>
          <IonRow className="d-flex">
            <IonCol>
              <div>
                <IonButtons slot="start">
                  <IonBackButton defaultHref="home" />
                </IonButtons>
              </div>
              {id != userId ? (
                <IonButton onClick={showWarningModal}>Add my review</IonButton>
              ) : (
                ""
              )}
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Reviews List */}
        <div>
          <IonList>
            {ratings.map((rating) => (
              <IonItem>
                <IonLabel>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="9">
                        {id != userId ? (
                          <h1 className="name">Me</h1>
                        ) : (
                          <h1 className="name">{rating.fromName}</h1>
                        )}
                      </IonCol>
                      <IonCol className="ion-padding-bottom">
                        <small>{dayjs(rating.createdAt).fromNow()}</small>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                  <h5>{rating.message}</h5>
                  <small>Rating</small>
                  <br />
                  <span className="stars">
                    {stars.map((_, index) => {
                      return (
                        <IonIcon
                          key={index}
                          icon={star}
                          color={rating.stars > index ? "primary" : "medium"}
                          style={{
                            marginRight: 10,
                            cursor: "pointer",
                          }}
                        />
                      );
                    })}
                  </span>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default UserReviews;
