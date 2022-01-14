import {
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
import "./SinglePost.css";
import {
  chatboxOutline,
  ellipsisHorizontal,
  ellipsisVertical,
  heart,
  heartOutline,
  image,
  location,
} from "ionicons/icons";
import { Geolocation } from "@capacitor/geolocation";
import { useAuth, useAuthInit } from "../../auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Link } from "react-router-dom";
dayjs.extend(relativeTime);

const SinglePost: React.FC = () => {
  const { userId } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>();
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [authUsername, setAuthUsername] = useState("");
  const [userImage, setUserImage] = useState("");
  useEffect(() => {
    const recentRef = firestore.collection("posts").doc(id);
    recentRef.onSnapshot((doc) => {
      const post = { id: doc.id, ...doc.data() };
      setPost(post);
    });
  }, [id]);

  useEffect(() => {
    const usersRef = firestore.collection("users").doc(userId);
    usersRef.get().then((doc) => {
      const displayName = doc.data().name;
      const userImage = doc.data().userImage ?? "noimage";
      setUserImage(userImage);
      setAuthUsername(displayName);
    });
  }, []);

  const addComment = (postID, recipientUserId) => {
    if (commentInput == "") {
      console.log("Error");
    } else {
      const newComment = {
        body: commentInput,
        createdAt: new Date().toISOString(),
        postId: postID,
        userId: userId,
        userHandle: authUsername,
        userImage: userImage,
      };

      const newNotification = {
        createdAt: new Date().toISOString(),
        message: `${authUsername} commented on your post`,
        postID: postID,
        read: "false",
        recipient: recipientUserId,
        sender: userId,
        type: "comment",
      };
      console.log(newComment);

      firestore
        .collection("posts")
        .doc(postID)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            console.log("post not found");
          }
          return doc.ref.update({
            commentCount: doc.data().commentCount
              ? doc.data().commentCount + 1
              : (doc.data().commentCount = 1),
          });
        })
        .then(() => {
          return firestore.collection("comments").add(newComment);
        })
        .then(() => {
          return firestore.collection("notifications").add(newNotification);
        })
        .then(() => {
          return newComment;
        })
        .catch((err) => {
          console.log(err);
          console.log("Something went wrong");
        });
    }
  };

  useEffect(() => {
    firestore
      .collection("comments")
      // .orderBy('createdAt')
      .where("postId", "==", id)
      .onSnapshot((data) => {
        const comment = [];
        data.forEach((doc) => {
          comment.push(doc.data());
        });
        console.log("refresh", comment);
        setComments(comment);
      });
  }, []);

  const [authUser, setAuthUser] = useState([]);
  useEffect(() => {
    const usersRef = firestore
      .collection("likes")
      .where("userId", "==", userId)
      .onSnapshot((data) => {
        const likes = [];
        data.forEach((doc) => {
          likes.push(doc.data());
        });
        console.log("refresh");
        setAuthUser(likes);
      });

    // usersRef
  }, []);

  // code that is not working
  const postLiked = (postID) => {
    if (authUser && authUser.find((like) => like.postId === postID))
      return true;
    else return false;
  };

  // Code to like a post
  const likePost = (postID) => {
    const likeDocument = firestore
      .collection("likes")
      .where("userId", "==", userId)
      .where("postId", "==", postID)
      .limit(1);
    let postData;
    const postDocument = firestore.collection("posts").doc(postID);
    postDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          postData = doc.data();
          postData.screamId = doc.id;
          return likeDocument.get();
        } else {
          console.log("Scream not found");
        }
      })
      .then((data) => {
        if (data.empty) {
          firestore
            .collection("likes")
            .add({
              postId: postID,
              userId: userId,
            })
            .then(() => {
              postData.likeCount
                ? postData.likeCount++
                : (postData.likeCount = 1);
              return postDocument.update({ likeCount: postData.likeCount });
            })
            .then(() => {
              return postData;
            });
        } else {
          console.log("Already liked");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const unlikePost = (postID) => {
    const likeDocument = firestore
      .collection("likes")
      .where("userId", "==", userId)
      .where("postId", "==", postID)
      .limit(1);
    const screamDocument = firestore.collection("posts").doc(postID);

    let screamData;

    screamDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          screamData = doc.data();
          screamData.screamId = doc.id;
          return likeDocument.get();
        } else {
          console.log("Scream not found");
        }
      })
      .then((data) => {
        if (data.empty) {
          console.log("Scream not liked");
        } else {
          return firestore
            .doc(`/likes/${data.docs[0].id}`)
            .delete()
            .then(() => {
              screamData.likeCount--;
              return screamDocument.update({ likeCount: screamData.likeCount });
            })
            .then(() => {
              return screamData;
            });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const [loadingThing, setLoadingthing] = useState(false);
  const style = loadingThing
    ? {}
    : ({ "visibility:": "hidden" } as React.CSSProperties);

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="home" />
            </IonButtons>
            <IonTitle>{post?.displayName}'post</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonCard>
          <Link
            className="link-tag"
            to={`/my/user/${post?.userId}`}
            style={{ textDecoration: "none" }}
          >
            <IonItem>
              <IonAvatar slot="start">
                <img src={post?.userImage} />
              </IonAvatar>
              <IonLabel>
                <strong>{post?.displayName}</strong>
                <small> {dayjs(post?.timeCreated).fromNow()}</small>
                <br />
                <small>{post?.jobDescription}</small>
              </IonLabel>
            </IonItem>
          </Link>
          <IonCardContent>
            {post?.body}
            {post?.imageUrl ? (
              <div>
                {!loadingThing && (
                  <div className="container">
                    <IonSpinner name="crescent" />
                  </div>
                )}
                <img
                  className="animate__animated animate__fadeIn ion-padding-top post-image"
                  src={post?.imageUrl}
                  onLoad={() => setLoadingthing(true)}
                  style={style}
                />
                <br />
              </div>
            ) : (
              ""
            )}

            {/* <IonIcon icon={heartOutline}></IonIcon> */}
          </IonCardContent>
          <IonItem>
            {postLiked(id) ? (
              <IonIcon
                color="primary"
                className="ion-padding-end"
                onClick={() => unlikePost(post.id)}
                icon={heart}
              />
            ) : (
              <IonIcon
                color="primary"
                className="ion-padding-end"
                onClick={() => likePost(post.id)}
                icon={heartOutline}
              />
            )}
            <IonLabel color="primary">{post?.likeCount}</IonLabel>
            <IonIcon className="ion-padding-end" icon={chatboxOutline} />
            <IonLabel>{post?.commentCount}</IonLabel>
          </IonItem>
          {/* comment section */}
          {comments.map((comment) => (
            <div>
              <IonCard className="commentCard">
                <IonLabel className="ion-padding">
                  <small>comment in {dayjs(comment.createdAt).fromNow()}</small>
                </IonLabel>

                <IonItem>
                  <Link
                    className="link-tag"
                    to={`/my/user/${post?.userId}`}
                    style={{ textDecoration: "none" }}
                  >
                    <IonAvatar slot="start">
                      <img src={comment.userImage} />
                    </IonAvatar>
                  </Link>
                  <div>
                    <IonLabel>
                      <b>{comment.userHandle}</b>
                    </IonLabel>

                    <p>
                      {comment.body
                        ? comment.body
                        : "The post is no longer yet.."}
                    </p>
                  </div>
                </IonItem>
              </IonCard>
            </div>
          ))}
        </IonCard>
      </IonContent>
      <div className="bar bar-footer bar-balanced">
        <IonItem className="p-fixed ion-padding-start ion-padding-end">
          <IonAvatar slot="start">
            <img
              className="animate__animated animate__fadeIn animate__delay-0.1s"
              src={userImage}
            />
          </IonAvatar>
          <IonInput
            onIonChange={(e) => setCommentInput(e.detail.value)}
            placeholder="comment here"
          ></IonInput>
          <IonButton onClick={() => addComment(post?.id, post?.userId)}>
            Post
          </IonButton>
        </IonItem>
      </div>
      {/* <IonLoading message="Uploading" isOpen={pagestatus.isLoading}/> */}
    </IonPage>
  );
};

export default SinglePost;
