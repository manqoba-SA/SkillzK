import {
  IonActionSheet,
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
  IonSlide,
  IonSlides,
  IonSpinner,
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
  heart,
  heartOutline,
  image,
  location,
  trash,
} from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { useAuth, useAuthInit } from "../../auth";
import "./ProductView.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const ProductView: React.FC = () => {
  const history = useHistory();
  const { userId } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>();
  useEffect(() => {
    const recentRef = firestore.collection("products").doc(id);
    recentRef.onSnapshot((doc) => {
      const product = { id: doc.id, ...doc.data() };
      setProduct(product);
    });
  }, [id]);

  const [displayName, setDisplayName] = useState("");
  const [authUserimage, setAuthUserImage] = useState("");
  useEffect(() => {
    firestore
      .collection("users")
      .doc(userId)
      .onSnapshot((doc) => {
        setDisplayName(doc.data().name);
        setAuthUserImage(doc.data().userImage);
      });
  }, []);

  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [pagestatus, setPageStatus] = useState({
    isError: false,
    isLoading: false,
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPageStatus({ isError: false, isLoading: true });
    const theId =
      userId > product?.userId
        ? `${userId + product?.userId}`
        : `${product?.userId + userId}`;
    const newMessage = {
      text: text + "\nProduct:" + product?.productName,
      from: userId,
      to: product?.userId,
      createdAt: new Date().toISOString(),
    };
    const newNotification = {
      createdAt: new Date().toISOString(),
      message: `${displayName} want to buy your ${product?.productName}`,
      chatID: userId,
      read: "false",
      recipient: product?.userId,
      sender: userId,
      type: "buying",
    };

    try {
      await firestore
        .collection("messages")
        .doc(theId)
        .collection("chat")
        .add(newMessage)
        .then(() => {
          firestore
            .collection("lastMessage")
            .doc(theId)
            .set({
              text: text + "\nProduct:" + product?.productName,
              from: userId,
              to: product?.userId,
              createdAt: new Date().toISOString(),
              unread: true,
              fromName: displayName,
              toName: product?.displayName,
              toImage: product?.userImage,
              fromImage: authUserimage,
            });
          setText("");
          setMessage(`message sent to ${product?.displayName}`);
          setPageStatus({ isError: false, isLoading: false });
        })
        .then(() => {
          return firestore.collection("notifications").add(newNotification);
        });
    } catch (error) {
      console.log(error);
    }
  };
  const slideOpts = {
    slidesPerView: 1,
    speed: 400,
    spaceBetween: 5,
  };
  const [loadingThing, setLoadingthing] = useState(false);
  const style = loadingThing
    ? {}
    : ({ "visibility:": "hidden" } as React.CSSProperties);
  const [showActionSheet, setShowActionSheet] = useState(false);
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="home" />
            </IonButtons>
            <IonTitle>{product?.productName}</IonTitle>
            {product?.userId == userId ? (
              <IonButtons slot="end">
                <IonButton onClick={() => setShowActionSheet(true)}>
                  <IonIcon
                    slot="icon-only"
                    ios={ellipsisHorizontal}
                    md={ellipsisVertical}
                  ></IonIcon>
                </IonButton>
              </IonButtons>
            ) : (
              ""
            )}
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonSlides
            className="slides-for-products"
            pager={true}
            options={slideOpts}
          >
            {product?.imagesData.map((single) => (
              <IonSlide key={single.id}>
                {!loadingThing && (
                  <div className="container">
                    <IonSpinner name="crescent" />
                  </div>
                )}
                <img
                  src={single}
                  height="100"
                  loading="lazy"
                  className="animate__animated animate__fadeIn animate__delay-0.1s ion-padding-top"
                  onLoad={() => setLoadingthing(true)}
                  style={style}
                />
              </IonSlide>
            ))}
          </IonSlides>
          <div className="ion-padding">
            <h3>
              <b>{product?.productName}</b>
            </h3>
            <h3>R{product?.price}</h3>
            <small>Listed {dayjs(product?.timeCreated).fromNow()}</small>
            <IonCard className="ion-padding">
              <IonItem>
                <IonLabel position="stacked">
                  <IonIcon icon={chatbubbles}></IonIcon> Send seller a message
                </IonLabel>
                <IonTextarea
                  onIonChange={(e) => setText(e.detail.value)}
                  placeholder="type a message"
                ></IonTextarea>
              </IonItem>
              {message && <IonTitle color="success">{message}</IonTitle>}
              <IonButton expand="block" onClick={handleSubmit}>
                Send
              </IonButton>
            </IonCard>

            <IonItem></IonItem>
            <br />
            <div className="ion-padding">
              <span>
                <h5>Seller information</h5>
                <h5>
                  {product?.displayName} a {product?.jobDescription}
                </h5>
              </span>
              <span>
                <h5>Product description</h5>
                <IonItem>
                  <p>{product?.description}</p>
                </IonItem>
              </span>
            </div>
            <IonItem></IonItem>
          </div>
          <IonLoading isOpen={pagestatus.isLoading} />

          <IonActionSheet
            isOpen={showActionSheet}
            onDidDismiss={() => setShowActionSheet(false)}
            cssClass="my-custom-class"
            buttons={[
              {
                text: "Delete item",
                role: "destructive",
                icon: trash,
                handler: () => {
                  history.goBack();
                  firestore.collection("products").doc(id).delete();
                },
              },
              {
                text: "Cancel",
                // icon: close,
                role: "cancel",
                handler: () => {
                  console.log("cancel clicked");
                },
              },
            ]}
          ></IonActionSheet>
        </IonContent>
      </IonContent>
    </IonPage>
  );
};

export default ProductView;
