import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonPage,
  IonRow,
  IonSearchbar,
  IonSlide,
  IonSlides,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { basket, closeOutline, star } from "ionicons/icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { firestore } from "../firebase";
import "./Search.css";

const Tab2: React.FC = () => {
  const slideOpts = {
    slidesPerView: 1.5,
    speed: 400,
    spaceBetween: 5,
  };
  const { userId } = useAuth();

  const [ratedUsers, setRatedUsers] = useState([]);
  useEffect(() => {
    const recentsRef = firestore
      .collection("users")
      .orderBy("averageRating", "desc")
      .limit(5);
    recentsRef.onSnapshot(({ docs }) => {
      const users = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Data:", users);
      setRatedUsers(users);
    });
  }, []);

  // Query most same location users
  const [myLocation, setLocation] = useState("");
  useEffect(() => {
    const usersRef = firestore.collection("users").doc(userId);
    usersRef.get().then((doc) => {
      const location = doc.data().location;
      setLocation(location);
    });
  }, []);
  const [locationUsers, setLocationUsers] = useState([]);
  useEffect(() => {
    const recentsRef = firestore
      .collection("users")
      .where("location", "==", myLocation)
      .limit(5);
    recentsRef.onSnapshot(({ docs }) => {
      const users = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Data:", users);
      setLocationUsers(users);
    });
  }, []);

  // Get categories
  const [category, setCategories] = useState([]);
  useEffect(() => {
    const recentsRef = firestore.collection("category");
    recentsRef.onSnapshot(({ docs }) => {
      const categories = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Data:", categories);
      setCategories(categories);
    });
  }, []);

  // Show users by category
  const [showFirstInfo, setShowFirstInfo] = useState(true);
  const [showbyCategory, setShowByCategory] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("");
  const [categoryUsers, setCategoryUsers] = useState([]);
  const showCategory = async (categoryName) => {
    setShowFirstInfo(false);
    setShowByCategory(true);
    setCurrentCategory(categoryName);
  };
  useEffect(() => {
    const recentsRef = firestore
      .collection("users")
      .where("category", "==", currentCategory);
    recentsRef.onSnapshot(({ docs }) => {
      const users = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Data:", users);
      setCategoryUsers(users);
    });
  }, [currentCategory]);

  // search input and modal
  const [showModal, setShowModal] = useState(false);
  const ShowModalPage = () => {
    setShowModal(true);
  };
  // Get all users
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const usersRef = firestore
      .collection("users")
      .where("jobDescription", "!=", "client");
    usersRef.onSnapshot(({ docs }) => {
      const users = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Data:", users);
      setUsers(users);
    });
  }, []);

  const [searchItem, setSearchItem] = useState("");
  const closeModalPage = () => {
    setShowModal(false);
  };
  const starsArray = Array(5).fill(0);
  var colors = ["box1", "box2", "box3", "box4"];
  // Improve Ui
  const [loadingThing, setLoadingthing] = useState(false);
  const style = loadingThing
    ? {}
    : ({ "visibility:": "hidden" } as React.CSSProperties);
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Search</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent
        className="animate__animated animate__fadeIn animate__faster"
        fullscreen
      >
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Search</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonSearchbar onClick={ShowModalPage}></IonSearchbar>
        <div className="ion-padding-top">
          <p className="ion-margin">Categories</p>
          <IonSlides options={slideOpts}>
            {category.map((single) => (
              <IonSlide className="search-ion-slide" key={single.id}>
                <IonCard onClick={() => showCategory(single.name)}>
                  {!loadingThing && (
                    <div className="container">
                      <IonSpinner name="crescent" />
                    </div>
                  )}
                  <img
                    src={single.image}
                    className="animate__animated animate__fadeIn animate__delay-0.1s"
                    height="90"
                    width="90"
                    loading="lazy"
                    onLoad={() => setLoadingthing(true)}
                    style={style}
                  />
                  <p>{single.name}</p>
                </IonCard>
              </IonSlide>
            ))}
          </IonSlides>
        </div>

        {/* Most Rated */}

        {showFirstInfo && (
          <div>
            <h3 className="ion-margin">See most rated freelancers</h3>
            <IonGrid>
              <IonRow>
                {ratedUsers.map((user, i) => (
                  <IonCol key={user.id}>
                    <Link
                      to={`/my/user/${user.id}`}
                      style={{ textDecoration: "none", color: "#000" }}
                    >
                      <IonCard className={colors[i % colors.length]}>
                        <h6 className="ion-padding">Average rating</h6>
                        <div className="ion-padding-start ion-padding-end">
                          {starsArray.map((_, index) => {
                            return (
                              <IonIcon
                                key={index}
                                icon={star}
                                color={
                                  user.averageRating > index
                                    ? "light"
                                    : "medium"
                                }
                                style={{
                                  marginRight: 10,
                                  cursor: "pointer",
                                }}
                              />
                            );
                          })}
                        </div>
                        <h5 className="ion-padding">
                          {user.name} a {user.jobDescription}
                        </h5>
                      </IonCard>
                    </Link>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        )}
        {/* Location */}
        {showFirstInfo && (
          <div>
            <h3 className="ion-margin">
              See most freelancers from your location
            </h3>
            <IonGrid>
              <IonRow>
                {locationUsers.map((user, i) => (
                  <IonCol>
                    <Link
                      to={`/my/user/${user.id}`}
                      style={{ textDecoration: "none", color: "#000" }}
                    >
                      <IonCard className={colors[i]}>
                        <h6 className="ion-padding">Average rating</h6>
                        <div className="ion-padding-start ion-padding-end">
                          {starsArray.map((_, index) => {
                            return (
                              <IonIcon
                                key={index}
                                icon={star}
                                color={
                                  user.averageRating > index
                                    ? "light"
                                    : "medium"
                                }
                                style={{
                                  marginRight: 10,
                                  cursor: "pointer",
                                }}
                              />
                            );
                          })}
                        </div>
                        <h5 className="ion-padding">
                          {user.name} a {user.jobDescription}
                        </h5>
                      </IonCard>
                    </Link>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

        {showbyCategory && (
          <div className="ion-padding-top">
            <IonList>
              <IonListHeader>{currentCategory}</IonListHeader>
              {categoryUsers.map((user) => (
                <IonItem
                  routerLink={`/my/user/${user.id}`}
                  lines="none"
                  key={user.id}
                  detail
                >
                  <IonAvatar slot="start">
                    <img className="avatar-img" src={user.userImage} />
                  </IonAvatar>
                  <IonLabel className="user">
                    <strong>{user.name}</strong>
                    <span className="user-stars">
                      {starsArray.map((_, index) => {
                        return (
                          <IonIcon
                            size="extra-small"
                            key={index}
                            icon={star}
                            color={
                              user.averageRating > index ? "primary" : "medium"
                            }
                            style={{
                              marginRight: 10,
                              cursor: "pointer",
                            }}
                          />
                        );
                      })}
                    </span>
                    <br />
                    <small>
                      <strong>{user.jobDescription}</strong>
                    </small>
                    <br />
                    <small>{user.location}</small>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>
          </div>
        )}

        {/* Modal */}
        <IonModal isOpen={showModal} cssClass="my-custom-class">
          <IonContent>
            <div>
              <IonButtons>
                <IonButton onClick={closeModalPage}>
                  <IonIcon icon={closeOutline}></IonIcon>Cancel
                </IonButton>
              </IonButtons>
              <IonSearchbar
                animated
                placeholder="search for people, location or job decr"
                onIonChange={(e) => setSearchItem(e.detail.value)}
              ></IonSearchbar>
            </div>
            <IonList>
              {users
                .filter((single) => {
                  if (searchItem == "") {
                    return single;
                  } else if (
                    single.name
                      .toLowerCase()
                      .includes(searchItem.toLocaleLowerCase()) ||
                    single.jobDescription
                      .toLowerCase()
                      .includes(searchItem.toLocaleLowerCase()) ||
                    single.location
                      .toLowerCase()
                      .includes(searchItem.toLocaleLowerCase()) ||
                    single.description
                      .toLowerCase()
                      .includes(searchItem.toLocaleLowerCase())
                  ) {
                    return single;
                  }
                })
                .map((single) => (
                  <IonItem
                    lines="none"
                    routerLink={`/my/user/${single.id}`}
                    onClick={closeModalPage}
                    key={single.id}
                    detail
                  >
                    <IonAvatar slot="start">
                      <img className="avatar-img" src={single.userImage} />
                    </IonAvatar>
                    <IonLabel className="user">
                      <strong>{single.name}</strong>
                      <span className="user-stars">
                        {starsArray.map((_, index) => {
                          return (
                            <IonIcon
                              size="extra-small"
                              key={index}
                              icon={star}
                              color={
                                single.averageRating > index
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
                      </span>
                      <br />
                      <small>
                        <strong>{single.jobDescription}</strong>
                      </small>
                      <br />
                      <small>{single.location}</small>
                    </IonLabel>
                  </IonItem>
                ))}
            </IonList>
          </IonContent>
        </IonModal>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink={`/my/marketplace`}>
            <IonIcon icon={basket} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
