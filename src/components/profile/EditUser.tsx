import { Camera, CameraResultType } from "@capacitor/camera";
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonList,
  IonLoading,
  IonModal,
  IonPage,
  IonRow,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  ellipsisHorizontal,
  ellipsisVertical,
  star,
  starOutline,
  trash,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { firestore, storage } from "../../firebase";
import "./EditUser.css";

interface ContainerProps {
  name: string;
  description: string;
}

const EditUser: React.FC<ContainerProps> = (props) => {
  const { userId } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  let [servicesData, setServicesData] = useState([]);
  const [cellNumber, setCellNumber] = useState("");
  const [imageUrl, setImageurl] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    firestore
      .collection("users")
      .doc(userId)
      .onSnapshot((doc) => {
        servicesData = doc.data().servicers;
        setServicesData(servicesData);
        setDisplayName(doc.data().name);
        setJobDescription(doc.data().jobDescription ?? "Client");
        setDescription(doc.data().description);
        setLocation(doc.data().location);
        setCellNumber(doc.data().cellNumber);
        setImageurl(doc.data().userImage);
      });
  }, []);

  // servicers functionality
  const [serviceitem, setServiceItem] = useState("");
  const handleAddService = () => {
    setServicesData((oldArray) =>
      oldArray ? [...oldArray, serviceitem] : [serviceitem]
    );
    setServiceItem("");
  };
  const handleRemoveItem = (name) => {
    setServicesData(servicesData.filter((item) => item !== name));
    console.log("Clicked!");
  };

  // to edit image

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

  // Save image taken
  async function savePicture(blobUrl: string) {
    const pictureRef = storage.ref(`/profile/${Date.now()}`);
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const snapshot = await pictureRef.put(blob);
    const url = await snapshot.ref.getDownloadURL();
    console.log("Saved pic", url);
    return url;
  }
  const [pagestatus, setPageStatus] = useState({
    isError: false,
    isLoading: false,
  });
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    setPageStatus({ isError: false, isLoading: true });
    if (
      displayName == "" ||
      jobDescription == "" ||
      description == "" ||
      location == ""
    ) {
      setPageStatus({ isError: true, isLoading: false });
      setMessage("🚩🚩Please make sure all the required input are inserted");
    } else {
      const postsRef = firestore.collection("users").doc(userId);
      const postData = {
        name: displayName,
        jobDescription,
        description,
        cellNumber,
        userImage: imageUrl,
        servicers: servicesData,
      };
      if (imageUrl.startsWith("blob:")) {
        postData.userImage = await savePicture(imageUrl);
      }
      const postRef = await postsRef
        .update(postData)
        .then(() => {
          firestore
            .collection("posts")
            .where("userId", "==", userId)
            .firestore.collection("posts")
            .where("userId", "==", userId)
            .get()
            .then((snapshots) => {
              if (snapshots.size > 0) {
                snapshots.forEach((post) => {
                  firestore.collection("posts").doc(post.id).update({
                    displayName: displayName,
                    jobDescription: jobDescription,
                  });
                });
              } else {
                console.log(Error);
              }
            });
        })
        .then(() => {
          firestore
            .collection("comments")
            .where("userId", "==", userId)
            .firestore.collection("comments")
            .where("userId", "==", userId)
            .get()
            .then((snapshots) => {
              if (snapshots.size > 0) {
                snapshots.forEach((comment) => {
                  firestore.collection("comments").doc(comment.id).update({
                    userHandle: displayName,
                  });
                });
                setPageStatus({ isError: false, isLoading: false });
                setMessage("Profile updated");
              } else {
                console.log(Error);
              }
            });
        });
      console.log("Added", postsRef);
    }
  };

  return (
    <IonPage>
      <IonHeader color="primary">
        <IonToolbar>
          <IonTitle>Edit Profile</IonTitle>

          <IonButtons slot="end">
            <IonButton>
              <IonIcon
                slot="icon-only"
                ios={ellipsisHorizontal}
                md={ellipsisVertical}
              ></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* <IonContent> */}

        {/* modal */}
        <IonModal isOpen={showModal} cssClass="my-custom-class">
          <IonContent fullscreen className="ion-padding">
            <div className="container">
              <h3>Enter your services</h3>
              <p>
                enter all the services and products that you provide and click{" "}
                <strong>add</strong>.
              </p>
              <IonList className="ion-padding">
                <IonItem>
                  <IonInput
                    placeholder="Enter a service"
                    value={serviceitem}
                    onIonChange={(e) => setServiceItem(e.detail.value)}
                  ></IonInput>
                  <IonButton expand="block" onClick={handleAddService}>
                    Add
                  </IonButton>
                </IonItem>
              </IonList>
              <IonList>
                {servicesData
                  ? servicesData.map((data) => (
                      <IonItem>
                        {data}
                        <IonIcon
                          color="danger"
                          onClick={() => handleRemoveItem(data)}
                          slot="end"
                          icon={trash}
                        ></IonIcon>
                      </IonItem>
                    ))
                  : ""}
              </IonList>
              <IonButton onClick={() => setShowModal(false)}>Done</IonButton>
              <IonButton fill="outline" onClick={() => setShowModal(false)}>
                Close
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
        {/* page content */}
        <IonGrid>
          <IonRow className="d-flex">
            <IonCol>
              <div>
                <IonButtons slot="start">
                  <IonBackButton defaultHref="home" />
                </IonButtons>
              </div>
            </IonCol>
            <IonCol>
              <div className="done-button">
                <IonButton slot="end" onClick={handleUpdate} color="primary">
                  Done
                </IonButton>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* profile picture */}
        <div>
          <IonAvatar className="center">
            <img src={imageUrl} />
          </IonAvatar>
          <p className="ion-text-center" onClick={() => takePhoto()}>
            Change profile picture
          </p>
        </div>

        {/* input */}
        <div>
          {pagestatus.isError ? (
            <IonLabel className="ion-padding" color="danger">
              <small>
                <b>{message}</b>
              </small>
            </IonLabel>
          ) : (
            <IonLabel className="ion-padding" color="success">
              <small>
                <b>{message}</b>
              </small>
            </IonLabel>
          )}

          <IonList>
            <IonItem className="ion-padding-top">
              <IonLabel position="stacked">Name</IonLabel>
              <IonInput
                value={displayName}
                onIonChange={(e) => setDisplayName(e.detail.value)}
                placeholder="Enter your name"
              ></IonInput>
            </IonItem>
            <IonItem className="ion-padding-top">
              <IonLabel position="stacked">Job title</IonLabel>
              <IonInput
                value={jobDescription}
                onIonChange={(e) => setJobDescription(e.detail.value)}
                placeholder="Enter your job title"
              ></IonInput>
            </IonItem>
            <IonItem className="ion-padding-top">
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={description}
                onIonChange={(e) => setDescription(e.detail.value)}
                placeholder="Tell about your self"
                auto-grow
                spellcheck
              ></IonTextarea>
            </IonItem>
            <IonItem className="ion-padding-top">
              <IonLabel position="stacked">Cell number</IonLabel>
              <IonInput
                value={cellNumber}
                onIonChange={(e) => setCellNumber(e.detail.value)}
                type="number"
                placeholder="Enter your cell Number"
                inputMode="tel"
              ></IonInput>
            </IonItem>
            <IonItem className="ion-padding-top">
              <IonLabel position="stacked">Location</IonLabel>
              <IonInput
                value={location}
                onIonChange={(e) => setLocation(e.detail.value)}
                type="text"
                placeholder="Enter your location"
              ></IonInput>
            </IonItem>
            <IonItem className="ion-padding-top">
              <IonLabel position="stacked">Services</IonLabel>
              <IonButton
                size="default"
                color="primary"
                onClick={() => setShowModal(true)}
              >
                Edit Services
              </IonButton>
            </IonItem>
          </IonList>
        </div>

        {/* </IonContent> */}
        <IonLoading isOpen={pagestatus.isLoading} />
      </IonContent>
    </IonPage>
  );
};

export default EditUser;
