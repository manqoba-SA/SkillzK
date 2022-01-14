import {
  IonBackButton,
  IonButton,
  IonButtons,
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
import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { firestore, storage } from "../../firebase";
import { Camera, CameraResultType } from "@capacitor/camera";
import "./AddPost.css";
import { image, location } from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { useAuth, useAuthInit } from "../../auth";

const AddPost: React.FC = () => {
  const { userId } = useAuth();
  const [body, setBody] = useState("");
  const history = useHistory();

  const [imageUrl, setImageurl] = useState("");

  // Camera api
  const takePhoto = async () => {
    const image = await Camera.getPhoto({
      quality: 40,
      allowEditing: true,
      resultType: CameraResultType.Uri,
    });
    let imageUrl: any = image.webPath;
    setImageurl(imageUrl);
  };

  // Geolocation api
  const printCurrentPosition = async () => {
    const coordinates = await Geolocation.getCurrentPosition();

    console.log("Current position:", coordinates);
  };

  // Save image taken
  async function savePicture(blobUrl: string) {
    const pictureRef = storage.ref(`/postimages/${Date.now()}`);
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const snapshot = await pictureRef.put(blob);
    const url = await snapshot.ref.getDownloadURL();
    console.log("Saved pic", url);
    return url;
  }

  const [displayName, setDisplaynNme] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [userImage, setUserImage] = useState("");

  useEffect(() => {
    const usersRef = firestore.collection("users").doc(userId);
    usersRef.get().then((doc) => {
      const displayName = doc.data().name;
      const jobDescription = doc.data().jobDescription ?? "Client";
      const userImage = doc.data().userImage;
      setDisplaynNme(displayName);
      setJobDescription(jobDescription);
      setUserImage(userImage);
    });
  }, []);

  // Functionality to add post button
  const [pagestatus, setPageStatus] = useState({
    isError: false,
    isLoading: false,
  });
  const handleAdd = async () => {
    setPageStatus({ isError: false, isLoading: true });
    const postsRef = firestore.collection("posts");
    const timeCreated = new Date().toISOString();
    const userID = userId;
    const postData = {
      displayName,
      jobDescription,
      body,
      timeCreated,
      imageUrl,
      likesCount: 0,
      commentsCount: 0,
      userId: userID,
      userImage,
    };
    if (imageUrl.startsWith("blob:")) {
      postData.imageUrl = await savePicture(imageUrl);
    }
    const postRef = await postsRef.add(postData);
    console.log("Added", postsRef);
    history.goBack();
  };
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="home" />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonList className="ion-padding">
          <IonListHeader>Add a new post</IonListHeader>
          <IonItem>
            <IonTextarea
              value={body}
              placeholder="Whats on your mind?"
              onIonChange={(e) => setBody(e.detail.value)}
            ></IonTextarea>
          </IonItem>
          <br />
          {imageUrl && (
            <IonItem>
              <IonImg className="Ion-margin-top" src={imageUrl}></IonImg>
            </IonItem>
          )}
          <IonItem className="ion-padding">
            <IonFabButton
              onClick={() => takePhoto()}
              size="small"
              className="ion-margin --background:#fff"
            >
              <IonIcon icon={image} />
            </IonFabButton>
            <IonFabButton
              onClick={printCurrentPosition}
              size="small"
              className="ion-margin"
            >
              <IonIcon icon={location} />
            </IonFabButton>
          </IonItem>
          <IonButton className="ion-margin" onClick={handleAdd} expand="block">
            Post
          </IonButton>
        </IonList>
      </IonContent>
      <IonLoading message="Uploading" isOpen={pagestatus.isLoading} />
    </IonPage>
  );
};
export default AddPost;
