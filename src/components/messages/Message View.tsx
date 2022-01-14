import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonRow, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { sendOutline } from 'ionicons/icons';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useAuth } from '../../auth';
import { firestore } from '../../firebase';
import ExploreContainer from '../ExploreContainer';
import './MessageView.css';
dayjs.extend(relativeTime)



const MessageView: React.FC = () => {
  const {userId} = useAuth()
  const { id }  = useParams<{ id: string }>();
  const [messages, setMessages] = useState([])
  const theId = userId > id ? `${userId + id}` : `${id + userId}`;
  console.log(theId)

  const [displayName, setDisplayName] = useState("")
  const [authUserimage, setAuthUserImage] = useState("")

  useEffect(()=>{
    const lastMessage = firestore.collection("lastMessage").doc(theId)
    lastMessage.get().then((doc)=>{
      if(doc.data() && doc.data().from !== userId){
        lastMessage.update({unread:false})
      }
    })
  })

  const contentRef = useRef(null)
 

  useEffect(() => {
    firestore.collection("users").doc(userId).onSnapshot((doc) =>{
      setDisplayName(doc.data().name)
      setAuthUserImage(doc.data().userImage)
    })
  }, [])

  const [user, setUser] = useState<any>();
  useEffect(()=>{
    const usersRef = firestore.collection("users").doc(id);
    usersRef.onSnapshot(doc => {
      const users = {id: doc.id, ...doc.data()}
      setUser(users)
    }
    )}, [id])

  useEffect(() => {
    // create query object
    const q = firestore.collection("messages").doc(theId).collection("chat").orderBy("createdAt", "asc")
    // execute query
    q.onSnapshot(({docs}) =>{      
      let msgs = [];
      console.log(docs)
      docs.forEach((doc) => {
        console.log(doc.data())
        msgs.push(doc.data());
      });
      console.log("Data:", msgs);
      setMessages(msgs)
    })
  }, []);

  const [text, setText] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const theId = userId > id ? `${userId + id}` : `${id + userId}`;
    const newNotification = {
      text: text,
      from: userId,
      to: id,
      createdAt: new Date().toISOString(),
  }

  try{
    await firestore.collection("messages").doc(theId).collection("chat")
      .add(newNotification).then(()=>{
        firestore.collection("lastMessage").doc(theId).set({
          text: text,
          from: userId,
          to: id,
          createdAt: new Date().toISOString(),
          unread: true,
          fromName: displayName,
          toName: user.name,
          toImage: user.userImage,
          fromImage: authUserimage
        })
        contentRef.current.scrollIntoView(
          {
            behavior: 'smooth', block: 'nearest', inline: 'start'
          })       
        
    })
    }
    catch(error){

    }

    setText("");
  };

  



  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref="my/home" />
        </IonButtons>
          <IonTitle>{user?.name}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonRow>
              <IonCol size="2">
              <IonAvatar>
              <img src={user?.userImage}/>
            </IonAvatar>
              </IonCol>
              <IonCol size="10" >
              <h2 className="no-padding"><b>{user?.name}</b></h2>
              </IonCol>
            </IonRow>
          </IonToolbar>
        </IonHeader>
        <IonContent className="chats-content">
          <IonGrid>
            <IonRow>
            {messages.length
                ? messages.map((msg, i) => (
                  
              <IonCol ref={contentRef} size="9" className={msg.from === userId ? "messages my-messages" : "messages other-messages"}
              offset={msg.from === userId ? "3" : ""}>
                <div>
                 <span>{msg.text}</span>
                 <br/><small className="time" text-right>{dayjs(msg.createdAt).fromNow()}</small>
                 </div>
              </IonCol>
               ))
               : null}
              {/* <IonCol size="9" offset="3" className="messages my-messages">
                 <span>Hello Manqoba</span>
                 <br/><small className="time" text-left>today 3pm</small>
              </IonCol> */}
            </IonRow>
          </IonGrid>
        </IonContent>
        
        
        

        
      </IonContent>
      <div slot="fixed" className="bar bar-footer chat-input bar-balanced">
          {/* <IonItem className="p-fixed ion-padding-start ion-padding-end"> */}
          <IonToolbar slot="fixed">
            <IonRow className="row-items-center">
              <IonCol size="10">
                <IonTextarea color="dark" auto-grow rows={1} value={text} onIonChange={(e) => setText(e.detail.value)} className="message-input"></IonTextarea>
              </IonCol>
              <IonCol size="2">
              {/* </div> */}
              {/* <div className="send-button"> */}
                <IonButton onClick={handleSubmit} className="send-icon" fill="clear" color="primary" expand="block">
                  <IonIcon icon={sendOutline} slot="icon-only"></IonIcon>
                </IonButton>
              {/* </div> */}
              {/* </div> */}
              
              </IonCol>
            </IonRow>
          </IonToolbar>
          {/* </IonItem> */}
        </div>
      
    </IonPage>
  );
};

export default MessageView;
