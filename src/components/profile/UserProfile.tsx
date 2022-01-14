import {
  IonAvatar,
  IonButton,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonRow,
  IonText,
} from "@ionic/react";
import { star, starOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { firestore } from "../../firebase";
import { useAuth } from "../../auth";
import "./UserProfile.css";
import { Link } from "react-router-dom";

interface ContainerProps {
  name: string;
  description: string;
}

const UserProfile: React.FC<ContainerProps> = (props) => {
  //loggedIn user ID
  const { userId } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  let [servicers, setServicers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageurl] = useState("");

  useEffect(() => {
    firestore
      .collection("users")
      .doc(userId)
      .onSnapshot((doc) => {
        servicers = doc.data().servicers;
        setServicers(servicers);
        setDisplayName(doc.data().name);
        setJobDescription(doc.data().jobDescription ?? "Client");
        setDescription(doc.data().description);
        setImageurl(doc.data().userImage);
        setLocation(doc.data().location);
      });
  }, []);

  const [userPosts, setUserPosts] = useState([]);
  useEffect(() => {
    firestore
      .collection("posts")
      .where("userId", "==", userId)
      .onSnapshot(({ docs }) => {
        // const posts = []
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
      .where("ratedUID", "==", userId)
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

  return (
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
            <IonButton
              color="primary"
              routerLink="/my/editprofile"
              className="ion-margin"
            >
              Edit Profile
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
      {/* Description */}
      <div className="ion-padding-start ion-padding-end">
        <h2>Description</h2>
        <IonText color="secondary">
          <h5>{description}</h5>
        </IonText>
        <IonButton color="primary" onClick={() => setShowModal(true)}>
          View services
        </IonButton>
      </div>

      {/* Location */}
      <div className="ion-padding-start ion-padding-end">
        <h2>Location</h2>
        <IonText color="secondary">{location}</IonText>
      </div>

      {/* User Servicers modal */}
      <IonModal isOpen={showModal} cssClass="my-custom-class">
        <IonContent className="ion-padding">
          <h3>My Servicers</h3>
          {servicers ? (
            servicers.map((service) => (
              <IonList>
                <IonItem>-{service}</IonItem>
              </IonList>
            ))
          ) : (
            <IonItem>No Sevicers yet.</IonItem>
          )}

          <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
        </IonContent>
      </IonModal>

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
            <IonButton routerLink={`/my/userreviews/${userId}`} color="primary">
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
                  <IonCol>
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
    </IonContent>
  );
};

export default UserProfile;
function posts(posts: any) {
  throw new Error("Function not implemented.");
}
