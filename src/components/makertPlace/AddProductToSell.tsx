import {
  IonActionSheet,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonRow,
  IonSearchbar,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import {
  caretForwardCircle,
  ellipsisHorizontal,
  ellipsisHorizontalSharp,
  ellipsisVertical,
  ellipsisVerticalSharp,
  heart,
  image,
  locationOutline,
  logOut,
  share,
  trash,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import "./AddProductToSell.css";
import { auth as firebaseAuth, firestore, storage } from "../../firebase";
import { useAuth } from "../../auth";
import { useHistory } from "react-router";
import { Camera, CameraResultType } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";

const AddProductToSell: React.FC = () => {
  const { userId } = useAuth();
  const [productName, setPruductName] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const history = useHistory();

  const [imageUrl, setImageurl] = useState("");

  // Save image taken
  async function savePicture(blobUrl: string) {
    const pictureRef = storage.ref(`/products/${Date.now()}`);
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    const snapshot = await pictureRef.put(blob);
    const url = await snapshot.ref.getDownloadURL();
    console.log("Saved pic", url);
    setImageItem(url);
    return url;
  }

  let [imagesData, setImagesData] = useState([]);
  const [imageItem, setImageItem] = useState("");
  const AddImage = async () => {
    setPageStatus({ isError: false, isLoading: true });
    let image = "";
    if (imageUrl.startsWith("blob:")) {
      image = await savePicture(imageUrl);
    }
    setImagesData((oldArray) => [...oldArray, image]);
    setImageurl("");
    setPageStatus({ isError: false, isLoading: false });
  };

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

  const [currentPositions, setCurrentPosition] = useState({ lat: 0, long: 0 });
  const [gotCurrentPosition, setGotCurrentPosition] = useState(false);
  useState(() => {
    const getCurrentPosition = async () => {
      const coordinates = await Geolocation.getCurrentPosition();
      const coords = coordinates.coords;
      setCurrentPosition({ lat: coords.latitude, long: coords.longitude });
    };
    getCurrentPosition().then(() => {
      setGotCurrentPosition(true);
    });
  });

  // Geolocation api
  const [currentPlace, setCurrentPlace] = useState("");
  const printCurrentPosition = async () => {
    const myApiKey = "AIzaSyDRfANbUm7QwiBHzUOlgvJ7hhLnzgZSgXE";
    await fetch(
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
        currentPositions.lat +
        "," +
        currentPositions.long +
        "&key=" +
        myApiKey
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setLocation(responseJson.results[0].formatted_address);
      });
  };

  // get logged in user name
  const [displayName, setDisplaynNme] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [userImage, setUserImage] = useState("");

  useEffect(() => {
    const usersRef = firestore.collection("users").doc(userId);
    usersRef.get().then((doc) => {
      const displayName = doc.data().name;
      const jobDescription = doc.data().jobDescription;
      const userImage = doc.data().userImage;
      setDisplaynNme(displayName);
      setJobDescription(jobDescription);
      setUserImage(userImage);
    });
  }, []);

  // Functionality to add post button
  const [message, setMessage] = useState("");
  const [pagestatus, setPageStatus] = useState({
    isError: false,
    isLoading: false,
  });
  const handleAdd = async () => {
    setPageStatus({ isError: false, isLoading: true });
    try {
      const productsRef = firestore.collection("products");
      const timeCreated = new Date().toISOString();
      const userID = userId;
      const postData = {
        displayName,
        location,
        jobDescription,
        productName,
        description,
        price,
        timeCreated,
        imagesData,
        userId: userID,
        userImage,
      };
      await productsRef.add(postData).then(() => {
        setMessage("Successfuly uploaded your product✔️");
        setPageStatus({ isError: false, isLoading: false });
        setTimeout(function () {
          history.goBack();
        }, 3000); //wait 2 seconds
      });
    } catch (error) {
      setMessage("Erro in uploading your product");
      setPageStatus({ isError: false, isLoading: false });
    }
  };
  const [loadingThing, setLoadingthing] = useState(false);
  const style = loadingThing
    ? {}
    : ({ "visibility:": "hidden" } as React.CSSProperties);
  return (
    <IonPage>
      <IonHeader color="primary">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="home" />
          </IonButtons>
          <IonTitle>Market Place</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={`/my/makertplace/addProductToSell`}>
              <small onClick={handleAdd}>
                <b>Publish</b>
              </small>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <h3 className="ion-text-center">
          <strong>New Product</strong>
        </h3>
        {message && <IonToast isOpen={true} message={message} />}
        <IonList className="ion-padding-top">
          <IonItem>
            <IonLabel position="stacked">What are you selling</IonLabel>
            <IonInput
              onIonChange={(e) => setPruductName(e.detail.value)}
              value={productName}
              placeholder="Enter product or service"
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Price (R)</IonLabel>
            <IonInput
              onIonChange={(e) => setPrice(e.detail.value)}
              value={price}
              placeholder="Enter the price"
            ></IonInput>
            <small>Please enter number don't include R</small>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Location</IonLabel>
            <IonInput
              onIonChange={(e) => setLocation(e.detail.value)}
              value={location}
              placeholder="Enter the location"
            ></IonInput>
            {gotCurrentPosition ? (
              <IonButton
                onClick={printCurrentPosition}
                size="small"
                className="ion-margin"
              >
                Detect Location
                <IonIcon icon={locationOutline} />
              </IonButton>
            ) : (
              ""
            )}
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Description</IonLabel>
            <IonTextarea
              onIonChange={(e) => setDescription(e.detail.value)}
              value={description}
              placeholder="About the product"
            ></IonTextarea>
          </IonItem>

          <br />

          <IonItem>
            <IonRow>
              <h3>Product/service images</h3>
              {imagesData &&
                imagesData.map((data) => (
                  <IonCol
                    className="animate__animated animate__bounceIn"
                    size="5"
                  >
                    {!loadingThing && (
                      <div className="container">
                        <IonSpinner name="crescent" />
                      </div>
                    )}
                    <img
                      src={data}
                      loading="lazy"
                      className=" Ion-margin-topanimate__animated animate__fadeIn animate__delay-0.1s ion-padding-top"
                      onLoad={() => setLoadingthing(true)}
                      style={style}
                      height="100"
                    />
                  </IonCol>
                ))}
            </IonRow>
          </IonItem>

          <br />
          {imageUrl && (
            <IonItem className="animate__animated animate__bounceIn">
              <small>Do want to add this photo</small>
              <img src={imageUrl} height="50" width="50" />
              <IonButton onClick={AddImage}>Yes add image</IonButton>
            </IonItem>
          )}

          <IonItem className="ion-padding">
            <IonButton
              onClick={() => takePhoto()}
              size="small"
              className="ion-margin --background:#fff"
            >
              <IonIcon icon={image} />
              Choose a picture
            </IonButton>
          </IonItem>
          <IonButton className="ion-margin" expand="block" onClick={handleAdd}>
            Publish
          </IonButton>
        </IonList>
      </IonContent>
      <IonLoading isOpen={pagestatus.isLoading} />
    </IonPage>
  );
};

export default AddProductToSell;
