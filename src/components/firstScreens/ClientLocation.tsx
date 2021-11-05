import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonList, IonLoading } from '@ionic/react';
import './FinishRegisteration.css';
import {useAuthInit} from '../../auth'
import {firestore} from '../../firebase'
import React, { useState } from 'react';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";
import useOnclickOutside from "react-cool-onclickoutside";

const ClientLocation: React.FC = () => {
        const [pagestatus, setPageStatus] = useState({isError:false, isLoading:false})
        const {loading, auth} = useAuthInit()
        const {
          ready,
          value,
          suggestions: { status, data },
          setValue,
          clearSuggestions,
        } = usePlacesAutocomplete({
          requestOptions: {
            /* Define search scope here */
          },
          debounce: 300,
        });

        const ref = useOnclickOutside(() => {
          // When user clicks outside of the component, we can dismiss
          // the searched suggestions by calling this method
          clearSuggestions();
        });
      
        const handleInput = (e) => {
          // Update the keyword of the input element
          setValue(e.detail.value);
        };
      
        const handleSelect = ({ description }) => () => {
          // When user selects a place, we can replace the keyword without request data from API
          // by setting the second parameter as "false"
          setValue(description, false);
          clearSuggestions();
      
          // Get latitude and longitude via utility functions
          getGeocode({ address: description })
            .then((results) => getLatLng(results[0]))
            .then(({ lat, lng }) => {
              console.log("📍 Coordinates: ", { lat, lng });
            })
            .catch((error) => {
              console.log("😱 Error: ", error);
            });
        };
      
        const renderSuggestions = () =>
          data.map((suggestion) => {
            const {
              id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;
      
            return (
              <IonList key={id} onClick={handleSelect(suggestion)}>
                <strong>{main_text}</strong><small> {secondary_text}</small>
              </IonList>
            );
          });

        const[message, setMessage] =useState("")
        // On click
        const handleOnClick = async () =>{
          if(value == ""){
            setPageStatus({isError:true, isLoading:false})
            setMessage("🚩🚩Please input your location before you continue")
          }else{
            try{
                setPageStatus({isError:false, isLoading:true})
                  return firestore.collection('users').doc(auth.userId).update({
                    location: value,
                    userImage: "https://firebasestorage.googleapis.com/v0/b/skillzk-29506.appspot.com/o/profiles%2Fuser.png?alt=media&token=834e2f46-3a55-4fa2-b6d7-f4342e2cf465",
                  })
              }
              catch(error){
                setPageStatus({isError:true, isLoading:false})
                setMessage(error)
              }
        }}
    return (
    <IonContent fullscreen className="ion-padding">
     <div className="container">
         <h2>One more Step!</h2>
            <p>Before you continue we would like to need your Location
                for you to get freelancers close to you.
            </p>
         <IonList>
             <IonItem ref={ref} className="ion-padding-top">
                 <IonLabel position="stacked">Location</IonLabel>
                 <IonInput
                  placeholder="Enter your location.."
                  value={value}
                  onIonChange={handleInput}
                  disabled={!ready}></IonInput>
                  {status === "OK" && <div className="ion-padding">{renderSuggestions()}</div>}
             </IonItem>
         </IonList>
         {pagestatus.isError &&
         <IonLabel className="ion-padding-top" color="danger"><h5>{message}</h5></IonLabel>
        }
        <IonButton className="ion-margin" onClick={handleOnClick} routerLink="./my/home" expand="block">Finish</IonButton>
        <hr/>
        </div>
        <IonLoading isOpen={pagestatus.isLoading}/>
  </IonContent>
  );
};

export default ClientLocation

