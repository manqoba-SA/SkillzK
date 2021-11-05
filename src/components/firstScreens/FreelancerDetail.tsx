import { IonButton, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInput, IonItem, IonItemDivider, IonLabel, IonList, IonLoading, IonModal, IonPage, IonRow, IonSlide, IonSlides, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { Redirect } from 'react-router';
import './FreelancerDetail.css';
import {useAuth, useAuthInit} from '../../auth'
import {auth, firestore} from '../../firebase'
import React, { useEffect, useState } from 'react';
import { close, eye, eyeOff, trash } from 'ionicons/icons';
import { Link } from 'react-router-dom';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
  } from "use-places-autocomplete";
import useOnclickOutside from 'react-cool-onclickoutside';


const FreelancerDetail: React.FC = () => {
    const [jobDescription, setJobDescription] = useState("")
    const [description, setDescription] = useState("")
    const [showModal, setShowModal] = useState(false);
    const [showCategoryContent, setShowCategoryContent] = useState(false);
    const [showServicesContent, setShowServicesContent] = useState(false);
    const [category, setCategories] = useState([])
    useEffect(() =>{
        const recentsRef = firestore.collection('category');
        recentsRef.onSnapshot(({docs}) =>{
          const categories = docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log("Data:", categories);
          setCategories(categories)
        })
      }, [])

    const categoryModal = () =>{
        setShowModal(true)
        setShowCategoryContent(true)
        
    }

    const closeCategoryModal = () =>{
        setShowModal(false)
        setShowCategoryContent(false)
        
    }

    const servicersModal = () =>{
        setShowModal(true)
        setShowServicesContent(true)
    }

    const closeServicersModal = () =>{
        setShowModal(false)
        setShowServicesContent(false)
    }

    // Category modal functionality..
    const [searchItem, setSearchItem] = useState("")
    const [choosenCategory, setChoosenCategory] = useState("")
    const handleChooseCategory = (name:string) =>{
        setShowModal(false)
        setShowServicesContent(false)
        setChoosenCategory(name)
    }

    // Service modal functionality..
    let [servicesData, setServicesData] = useState([])
    const [serviceitem, setServiceItem] = useState("")
    const handleAddService = ()=>{
        setServicesData(oldArray => [...oldArray, serviceitem ]);
        setServiceItem("")
    }
    const handleRemoveItem = (name) => {
        // const name = e.target.getAttribute("name")
         setServicesData(servicesData.filter(item => item !== name));
         console.log("Clicked!")
       };

    //Location code to configure google places API
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
    
      const handleInputLocation = (e) => {
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
            <IonItem key={id} onClick={handleSelect(suggestion)}>
              <strong>{main_text}</strong> <small> {secondary_text}</small>
            </IonItem>
          );
        });

    // Function to save all the info and redirect to home screen
    const [pagestatus, setPageStatus] = useState({isError:false, isLoading:false})
    const {loading, auth} = useAuthInit()
    const [message, setMessage] = useState("")
    const [showSuccess, setShowSuccess] = useState(false)
    const handleOnClick = async () =>{
        setPageStatus({isError:false, isLoading:true})
        if(choosenCategory=="" || jobDescription =="" || description =="" || servicesData.toString() == "" || value == ""){
        setPageStatus({isError:true, isLoading:false})
        setMessage("Please fill all this fields..")
        }else{
            try{
                setPageStatus({isError:false, isLoading:true})
                return firestore.collection('users').doc(auth.userId).update({
                    category: choosenCategory,
                    jobDescription: jobDescription,
                    description: description,
                    servicers: servicesData,
                    location: value,
                }).then(() =>{
                    setPageStatus({isError:false, isLoading:false})
                    setShowSuccess(true)
                    setShowCategoryContent(false)
                    setShowModal(true)

                })     
            }
            catch(error){
                setPageStatus({isError:true, isLoading:false})
            }
        }

    }

  return (
    <IonContent fullscreen className="ion-padding">
     <div>

       <IonModal isOpen={showModal} cssClass='my-custom-class'>
       {showCategoryContent && 
        // Category content on the modal 
        <IonContent fullscreen className="ion-padding">  
       <div className="container">
        <h3>Choose your category</h3>
        <p>We will show you relevant gigs associated with your 
        skill set.</p>
        <IonList className="ion-padding">
        <IonItem>
            <IonInput className="ion-padding" placeholder="search.." onIonChange={(e) => setSearchItem(e.detail.value)}></IonInput>
        </IonItem>
        </IonList>
        <IonGrid>   
        <IonRow className="ion-padding-start ion-padding-end">
        {category.filter((single)=> {
            if(searchItem == ""){
                return single;
            }
            else if(single.name.toLowerCase().includes(searchItem.toLocaleLowerCase())){
                return single;
            }
        }).map((single) =>
            <IonCol onClick={() => handleChooseCategory(single.name)}>
            <div className="posts">
            <img className="ion-padding" src={single.image} height="90" width="90"/>
            <IonTitle className="ion-padding-bottom" size="small">{single.name}</IonTitle>
            </div>
            </IonCol>
       )}
        </IonRow>
        
        </IonGrid>
        <IonButton onClick={closeCategoryModal}>Close</IonButton>   
        </div>
        </IonContent>
        // Category content on the modal.../>
       }
       {showServicesContent && 
        // Sevicers content on the modal 
        <IonContent fullscreen className="ion-padding"> 
        <div className="container">
        <h3>Enter your services</h3>
        <p>enter all the services and products that you provide and click <strong>add</strong>.</p>
        <IonList className="ion-padding">
        <IonItem>
            <IonInput placeholder="Enter a service" value={serviceitem} onIonChange={(e) => setServiceItem(e.detail.value)}></IonInput>
            <IonButton expand="block" onClick={handleAddService}>Add</IonButton>
        </IonItem>
        </IonList>
        <IonList>
            {servicesData.map(data => 
            <IonItem>{data}<IonIcon color="danger" onClick={() => handleRemoveItem(data)} slot="end" icon={trash}></IonIcon></IonItem>
            )}
        </IonList>
        <IonButton onClick={closeServicersModal}>Done</IonButton>
        <IonButton fill="outline" onClick={closeServicersModal}>Close</IonButton>
        </div>  
        </IonContent> 
        // Services content on the modal.../>
        }

        {showSuccess &&
        <IonContent>
            <div className="container">
                <h3>Good to Go🏳️</h3>
                <p>Here is the information that you provided...</p>
                <IonList>
                    <IonItem>
                        <IonLabel position="stacked">Category:</IonLabel>
                        <IonTitle size="small">{choosenCategory}</IonTitle>   
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Job Description:</IonLabel>
                        <IonTitle size="small">{jobDescription}</IonTitle>   
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked" >Description/Bio:</IonLabel>
                        <IonTitle size="small">{description}</IonTitle>   
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Servicers:</IonLabel>
                        {servicesData.map(data =>
                        <IonTitle size="small">{data}</IonTitle>
                        )}
                    </IonItem>
                    <IonItem>
                        <IonLabel position="stacked">Location:</IonLabel>
                        <IonTitle size="small">{value}</IonTitle>   
                    </IonItem>
                </IonList>
                <IonButton className="ion-margin" expand="block" routerLink="./my/home">Finish</IonButton>

            </div>
        </IonContent>
        }
        
      </IonModal>

            <h3 className= "name">Sell your yourself</h3>
            <p className="name">Here tell your potential customers about yourself on what you are providing</p>
         <IonList ref={ref} className="ion-padding-bottom">
            {pagestatus.isError &&
            <IonTitle color="danger"><small>{message}</small></IonTitle>
            }
             <IonItem>
                 <IonInput value={choosenCategory} onClick={categoryModal} placeholder="Your category"></IonInput>
             </IonItem>
             <IonItem className="ion-padding-top">
                 <IonInput onIonChange={(e) => setJobDescription(e.detail.value)} placeholder="Your job description"></IonInput>
             </IonItem>
             
             <IonItem className="ion-padding-top">
                 <IonTextarea onIonChange={(e) => setDescription(e.detail.value)} placeholder="Description: Tell us about yourself" spellcheck></IonTextarea>
             </IonItem>
             <IonItem className="ion-padding-top">
                 <IonInput onClick={servicersModal} value={servicesData.toString()} placeholder="Your services: Servicers that you provide"></IonInput>
             </IonItem>
             <IonItem className="ion-padding-top">
             <IonInput
                  placeholder="Your location.."
                  value={value}
                  onIonChange={handleInputLocation}
                  disabled={!ready}>   
                  </IonInput>      
             </IonItem>
             {status === "OK" && <IonList className="ion-padding">{renderSuggestions()}</IonList>}
         </IonList>
        <IonButton className="ion-margin" onClick={handleOnClick} expand="block">Continue</IonButton>
        <hr/>
        </div>
        <IonLoading isOpen={pagestatus.isLoading}/>
  </IonContent>
  
  );
};

export default FreelancerDetail;
