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
  IonLabel,
  IonList,
  IonLoading,
  IonModal,
  IonPage,
  IonPopover,
  IonRow,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import {
  call,
  callOutline,
  chatbox,
  chatboxOutline,
  ellipsisHorizontal,
  ellipsisVertical,
  personOutline,
  star,
  starOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { firestore } from "../../firebase";
import { useAuth } from "../../auth";
import "./OtherUserProfile.css";
import { Link, useParams } from "react-router-dom";

const OtherUserProfile: React.FC = () => {
  //loggedIn user ID
  const { userId } = useAuth();

  const { id } = useParams<{ id: string }>();
  const [displayName, setDisplayName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  let [servicers, setServicers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageurl] = useState("");
  const [cellNumber, setCellNumber] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Get requested user
  useEffect(() => {
    firestore
      .collection("users")
      .doc(id)
      .onSnapshot((doc) => {
        servicers = doc.data().servicers;
        setServicers(servicers);
        setDisplayName(doc.data().name);
        setJobDescription(doc.data().jobDescription ?? "Client");
        setDescription(doc.data().description);
        setImageurl(doc.data().userImage);
        setLocation(doc.data().location);
        setCellNumber(doc.data().cellNumber);
        setUserEmail(doc.data().userEmail);
      });
  }, []);

  // Get rauth user username
  const [authUsername, setAuthUsername] = useState("");
  useEffect(() => {
    const usersRef = firestore.collection("users").doc(userId);
    usersRef.get().then((doc) => {
      const displayName = doc.data().name;
      setAuthUsername(displayName);
    });
  }, []);

  // Get user posts
  const [userPosts, setUserPosts] = useState([]);
  useEffect(() => {
    firestore
      .collection("posts")
      .where("userId", "==", id)
      .onSnapshot(({ docs }) => {
        const posts = docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("refresh", posts);
        setUserPosts(posts);
      });
  }, []);

  // Ratings functionality
  const [ratings, setRatings] = useState([]);
  useEffect(() => {
    firestore
      .collection("ratings")
      .where("ratedUID", "==", id)
      .onSnapshot((data) => {
        const likes = [];
        data.forEach((doc) => {
          likes.push(doc.data());
        });
        console.log("refresh");
        setRatings(likes);
      });
  }, []);

  const ratingLength = ratings.length;
  function getArraySum(a) {
    var total = 0;
    for (var i in a) {
      total += a[i];
    }
    return total;
  }

  const stars = [];
  ratings.forEach((rating) => {
    stars.push(rating.stars);
  });
  console.log(stars);

  const starsSum = getArraySum(stars);
  const averageStars = starsSum / ratingLength;
  const starsArray = Array(5).fill(0);

  // Show servicers modal
  const [serviceModal, setServicemodal] = useState(false);
  const showServices = () => {
    setShowModal(true);
    setServicemodal(true);
  };
  // Hide service modal
  const hideServices = () => {
    setShowModal(false);
    setServicemodal(false);
  };

  // Show hire modal
  const [hireModal, setHireModal] = useState(false);
  const showHireModal = () => {
    setShowModal(true);
    setHireModal(true);
  };

  // close hire modal
  const hideHireModal = () => {
    setShowModal(false);
    setHireModal(false);
  };

  // show contact details modal
  const [contactDetailsModal, setContactDetailsModal] = useState(false);
  const showContactDetails = () => {
    setShowModal(true);
    setContactDetailsModal(true);
  };

  const hideContactDetails = () => {
    setShowModal(false);
    setContactDetailsModal(false);
  };

  // show when a user is sure to hire the person
  const [question, setQuestion] = useState(true);
  const [hirePerson, setHirePerson] = useState(false);
  const showHirePerson = () => {
    setQuestion(false);
    setHirePerson(true);
  };

  // Functionality to submit that you wanna hire the user
  const [Hiremessage, setHiremessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [status, setStatus] = useState({ isError: false, isLoading: false });

  const handleHirePerson = async () => {
    setStatus({ isError: false, isLoading: true });
    const newNotification = {
      createdAt: new Date().toISOString(),
      message: `${authUsername} wants to hire you`,
      userMessage: Hiremessage,
      read: "false",
      recipient: id,
      sender: userId,
      type: "hire",
      senderName: authUsername,
    };
    try {
      await firestore
        .collection("notifications")
        .add(newNotification)
        .then(() => {
          setShowPopover({ showPopover: false, event: "" });
          hideHireModal();
          setStatus({ isError: false, isLoading: false });
          setShowToast(true);
        });
    } catch (error) {
      setStatus({ isError: true, isLoading: false });
      console.log(error);
    }
  };

  const [popoverState, setShowPopover] = useState({
    showPopover: false,
    event: undefined,
  });

  return (
    <IonPage>
      <IonHeader color="primary">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="my/home" />
          </IonButtons>
          <IonTitle>{displayName}'s profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow className="d-flex">
            <IonCol>
              <IonItem>
                <IonAvatar slot="start">
                  <img src={imageUrl} />
                </IonAvatar>
                <IonLabel>
                  <strong className="user-name">{displayName}</strong>
                  <br />
                  <strong className="secondary-color">{jobDescription}</strong>
                </IonLabel>
              </IonItem>
            </IonCol>
            <IonCol>
              <div className="right-icons">
                <Link to={`/my/mymessages/view/${id}`}>
                  <IonIcon color="primary" icon={chatbox}></IonIcon>
                  <small>Chat</small>
                  <br />
                </Link>
                <IonIcon
                  className="ion-margin-top"
                  icon={call}
                  onClick={(e: any) => {
                    e.persist();
                    setShowPopover({ showPopover: true, event: e });
                  }}
                ></IonIcon>
                <small>Hire</small>
                <IonPopover
                  cssClass="my-custom-class"
                  event={popoverState.event}
                  isOpen={popoverState.showPopover}
                  onDidDismiss={() =>
                    setShowPopover({ showPopover: false, event: undefined })
                  }
                >
                  <IonList>
                    <IonItem onClick={showHireModal}>Hire person</IonItem>
                    <IonItem onClick={showContactDetails}>
                      Get contact details
                    </IonItem>
                  </IonList>
                </IonPopover>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
        {/* Description */}
        <div className="ion-padding-start ion-padding-end">
          <h2>Description</h2>
          <IonText color="secondary">
            <h5>{description}</h5>
          </IonText>
          <IonButton color="primary" onClick={showServices}>
            View services
          </IonButton>
        </div>

        {/* Location */}
        <div className="ion-padding-start ion-padding-end">
          <h2>Location</h2>
          <IonText color="secondary">{location}</IonText>
        </div>

        {/* Reviews */}
        <div className="ion-padding-start ion-padding-end">
          <h2>Reviews</h2>
          <div className="ratings">
            <div className="rating-left">
              <p> {ratingLength} Reviews</p>
              <small className="secondary-color">Last review</small>
              <p className="rate">
                {ratings[0]
                  ? ratings[0].message.substring(0, 25)
                  : "No review yet"}
                .. <br />
                <small className="secondary-color">
                  -{ratings[0] ? ratings[0].fromName : "no reviews yet"}
                </small>
              </p>
            </div>

            <div className="rating-right">
              <p>Average Rating:</p>
              <span className="stars">
                {starsArray.map((_, index) => {
                  return (
                    <IonIcon
                      key={index}
                      icon={star}
                      color={averageStars > index ? "primary" : "medium"}
                      style={{
                        marginRight: 10,
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </span>
              <br />
              <IonButton routerLink={`/my/userreviews/${id}`} color="primary">
                View All
              </IonButton>
            </div>
          </div>

          <div className="ion-padding-start ion-padding-end">
            <h2>My Portfolio/ Previous works</h2>
            <div className="posts-container">
              <IonGrid fixed>
                <IonRow className="ion-padding-start ion-padding-end">
                  {userPosts.map((post) => (
                    <IonCol key={post.id}>
                      <Link
                        to={`/my/posts/view/${post.id}`}
                        key={post.id}
                        style={{ textDecoration: "none", color: "#000" }}
                      >
                        <div>
                          <img
                            className="postImage"
                            src={
                              post.imageUrl == ""
                                ? "https://firebasestorage.googleapis.com/v0/b/skillzk-29506.appspot.com/o/postimages%2Fimages.png?alt=media&token=71209a19-91f3-411a-9046-fb4fc0c27e45"
                                : post.imageUrl
                            }
                            alt={post.timeCreated}
                          />
                        </div>
                      </Link>
                    </IonCol>
                  ))}
                </IonRow>
              </IonGrid>
            </div>
          </div>
        </div>

        {/* User Servicers modal */}
        <IonModal isOpen={showModal} cssClass="my-custom-class">
          {serviceModal && (
            <IonContent className="ion-padding">
              <h3>My Servicers</h3>

              <IonList>
                {servicers ? (
                  servicers.map((service) => (
                    <IonItem key={service}>-{service}</IonItem>
                  ))
                ) : (
                  <IonItem>No Sevicers yet.</IonItem>
                )}
              </IonList>
              <IonButton onClick={hideServices}>Close</IonButton>
            </IonContent>
          )}
          {hireModal && (
            <IonContent className="ion-padding">
              {question && (
                <div className="container">
                  <h6>Would you like to hire this person for the work</h6>
                  <IonButton onClick={showHirePerson}>Yes Hire user</IonButton>
                  <br />
                  <IonButton color="light" onClick={hideHireModal}>
                    check Others
                  </IonButton>
                </div>
              )}
              {hirePerson && (
                <div className="container">
                  <h3>Before your continue..</h3>
                  <h6 className="ion-padding">
                    In the below input enter a message on what you really want
                    from this person, this will help to fast track the process
                    as the user will know what is expected
                  </h6>
                  <IonItem className="ion-padding-end ion-padding-start">
                    <IonTextarea
                      onIonChange={(e) => setHiremessage(e.detail.value)}
                      placeholder="Enter a message"
                    ></IonTextarea>
                    <small>This input is optional</small>
                  </IonItem>
                  {status.isError && (
                    <IonLabel className="ion-padding-top" color="danger">
                      <h5>
                        There are some errors in the server please try again
                      </h5>
                    </IonLabel>
                  )}
                  <IonButton onClick={handleHirePerson}>Submit</IonButton>
                  <IonButton onClick={hideHireModal}>Close</IonButton>
                </div>
              )}
            </IonContent>
          )}

          {contactDetailsModal && (
            <IonContent>
              <div className="container">
                <h1>
                  <IonIcon icon={personOutline}></IonIcon>
                </h1>
                <h2>Contact {displayName}</h2>
                <h4>Email Address</h4>
                <h4>
                  <strong>{userEmail}</strong>
                </h4>
                <h4>Call number</h4>
                <h4>
                  <strong>{cellNumber}</strong>
                </h4>
                <IonButton onClick={hideContactDetails}>Close</IonButton>
              </div>
            </IonContent>
          )}
        </IonModal>
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          position="top"
          message={`A notification was sent to ${displayName} that you want to hire them. You will see their response on your notifications..`}
          duration={15000}
        />
        <IonLoading isOpen={status.isLoading} />
      </IonContent>
    </IonPage>
  );
};

export default OtherUserProfile;
