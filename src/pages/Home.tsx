import { IonActionSheet, IonAvatar, IonButton, IonCard, IonCardContent, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonPage, IonRow, IonSpinner, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { basket, caretForwardCircle, chatbox, chatboxOutline, ellipsisHorizontal, ellipsisVertical, heart, heartOutline, pin, share, trash } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import ExploreContainer from '../components/ExploreContainer';
import { firestore } from '../firebase';
import './Home.css';
import myimage from "./myimage.jpg"
dayjs.extend(relativeTime)




const Home: React.FC = () => {
  const toggleDarkModeHandler = () => document.body.classList.toggle('dark');

  //loggedIn user ID
  const {userId} = useAuth()

  // Code to load posts from database
  const [posts, setPosts] = useState([])
  useEffect(() =>{
    const postsRef = firestore.collection('posts').orderBy("timeCreated", "desc");
    postsRef.onSnapshot(({docs}) =>{
      const posts = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Data:", posts);
      setPosts(posts)
    })
  }, [])

  const [authUser, setAuthUser] = useState([])
  useEffect(() =>{
    const usersRef = firestore
    .collection("likes")
    .where("userId", "==", userId)
    .onSnapshot((data)=>{
      const likes = []
      data.forEach((doc) => {
        likes.push(doc.data());
      });
      console.log("refresh")
      setAuthUser(likes)
    })
    
    // usersRef
  }, [])


  
  // code that is not working
  const postLiked = (postID) => {
  
    if (
      authUser &&
      authUser.find(
        (like) => like.postId === postID
      )
    )
      return true;
    else return false;
}


  // Code to like a post
  const likePost = (postID) =>{
    const likeDocument = firestore
    .collection('likes')
    .where('userId', '==', userId)
    .where('postId', '==', postID)
    .limit(1);
    let postData;
    const postDocument = firestore.collection("posts").doc(postID)
    postDocument.get().then(doc =>{
      if (doc.exists){
        postData = doc.data();
        postData.screamId = doc.id;
        return likeDocument.get();
      }else {
        console.log('Scream not found');
      }
    }).then((data) => {
      if (data.empty) {
        firestore.collection('likes')
        .add({
          postId: postID,
          userId: userId
        })
        .then(() => {
          postData.likeCount? postData.likeCount++ : postData.likeCount = 1;
          return postDocument.update({ likeCount: postData.likeCount });
        })
        .then(() => {
          return postData;
        })
      }
      else{
        console.log("Already liked")
      }
    }).catch((err) => {
      console.error(err);
    });
  }





  const unlikePost = (postID) =>{
    const likeDocument = firestore
    .collection('likes')
    .where('userId', '==', userId)
    .where('postId', '==', postID)
    .limit(1);
  const screamDocument = firestore.collection("posts").doc(postID)

  let screamData;

  screamDocument.get()
  .then((doc) => {
    if (doc.exists) {
      screamData = doc.data();
      screamData.screamId = doc.id;
      return likeDocument.get();
    } else {
      console.log('Scream not found');
    }
  }).then((data) => {
    if (data.empty) {
      console.log('Scream not liked');
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


  
const [showActionSheet, setShowActionSheet] = useState(false);

 
const [loadingThing, setLoadingthing] = useState(false)
const style = loadingThing ?  {} : { "visibility:": "hidden" } as React.CSSProperties

// {visibility: 'show'} : {visibility: 'hidden'}
  return (
    <IonPage>
      <IonContent className="animate__animated animate__fadeIn ">
      <IonGrid className="ion-padding-top">
      <IonRow >
        <IonCol size="9">
        <IonButton color="primary" routerLink="/my/home/AddPost" >Post my work</IonButton>
        </IonCol>
        <IonCol >
        <IonToggle color="primary" name="darkMode" onIonChange={toggleDarkModeHandler} className="ion-padding-top ion-margin-start"/>
        </IonCol>
      </IonRow>
      </IonGrid>
      <h3 className="ion-text-center"><strong>See other people previous work</strong></h3>
      {posts.map((post) => 
      <IonCard>
        
          <IonItem>
          <Link className="link-tag" to={`/my/user/${post.userId}`} style={{textDecoration:"none", color:"#000"}}>
          
          <IonAvatar slot="start">
            <img className="avatar-img" src={post.userImage} />
          </IonAvatar>
            <IonLabel><strong>{post.displayName}</strong><small> {dayjs(post.timeCreated).fromNow()}</small><br/><small>{post.jobDescription}</small></IonLabel>
            {/* <IonButton> */}
            </Link>
          {/* </span>   */}
            <IonIcon slot="end" onClick={() => setShowActionSheet(true)} ios={ellipsisHorizontal} md={ellipsisVertical}></IonIcon>
          {/* </IonButton> */}
            
          </IonItem>
          
          <Link to={`/my/posts/view/${post.id}`} key={post.id} style={{textDecoration:"none", color:"#000"}}>
          <IonCardContent>
            {post.body}
            
            {post.imageUrl?
            <div>
            {!loadingThing && <div className="container"><IonSpinner name="crescent" /></div>}
            <img src= {post.imageUrl} loading="lazy" className="animate__animated animate__fadeIn animate__delay-0.1s ion-padding-top post-image" onLoad={() => setLoadingthing(true)} style={style}/><br/>
            </div>
            :
            ""
            }
          {/* <IonIcon icon={heartOutline}></IonIcon> */}
          </IonCardContent>
          </Link>
          <IonItem>
          {postLiked(post.id) ?  
              <IonIcon color="primary" className="ion-padding-end" onClick={() => unlikePost(post.id)} icon={heart} />
              :
              <IonIcon color="primary" className="ion-padding-end" onClick={() => likePost(post.id)} icon={heartOutline} />
          }
              
            
            <IonLabel color="primary">{post.likeCount}</IonLabel>
            <Link className="link-tag" to={`/my/posts/view/${post.id}`} key={post.id} style={{textDecoration:"none", color:"#000"}}>
            <IonIcon className="ion-padding-end" icon={chatboxOutline} />
            </Link>
            <IonLabel>{post.commentCount}</IonLabel>
            
          </IonItem>
        </IonCard>
      )}
         <IonActionSheet
        isOpen={showActionSheet}
        onDidDismiss={() => setShowActionSheet(false)}
        cssClass='my-custom-class'
        buttons={[{
          text: 'Delete',
          role: 'destructive',
          icon: trash,
          handler: () => {
            console.log('Delete clicked');
          }
        }, {
          text: 'Share',
          icon: share,
          handler: () => {
            console.log('Share clicked');
          }
        }, {
          text: 'Play (open modal)',
          icon: caretForwardCircle,
          handler: () => {
            console.log('Play clicked');
          }
        }, 
         {
          text: 'Cancel',
          // icon: close,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]}
      >
      </IonActionSheet>

      <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink= {`/my/marketplace`}>
            <IonIcon icon={basket} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;
