import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonSlide,
  IonSlides,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Redirect } from "react-router";
import "./Register.css";
import { useAuth } from "../../auth";
import { auth, firestore } from "../../firebase";
import React, { useState } from "react";
import { eye, eyeOff } from "ionicons/icons";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  //   Forgot password Functionality
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ isError: false, isLoading: false });
  const handleForgotPassword = async () => {
    setStatus({ isError: false, isLoading: true });
    if (email == "") {
      setStatus({ isError: true, isLoading: false });
      setMessage("🚩🚩Please fill the registered email");
    } else {
      try {
        const config = {
          url: "http://localhost:8100/login",
          handleCodeInApp: true,
        };
        await auth.sendPasswordResetEmail(email, config).then(() => {
          setEmail("");
          setStatus({ isError: true, isLoading: false });
          setMessage("Password Reset was sent to your email✔️");
        });
      } catch (error) {
        setStatus({ isError: true, isLoading: false });
        setMessage(`🚩🚩${error.message}`);
      }
    }
  };

  return (
    <IonContent fullscreen className="ion-padding">
      <div>
        <IonList mode="md">
          <IonTitle>
            <h2>Forgot Password?</h2>
            <h5>Create a new one here</h5>
          </IonTitle>
          <IonItem className="ion-padding-top">
            <IonInput
              onIonChange={(e) => setEmail(e.detail.value)}
              placeholder="Enter your email"
              inputMode="email"
              clearInput
            ></IonInput>
          </IonItem>
          {status.isError && (
            <IonLabel className="ion-padding-top" color="danger">
              <h5>{message}</h5>
            </IonLabel>
          )}
        </IonList>
        <IonButton
          className="ion-margin"
          expand="block"
          onClick={handleForgotPassword}
        >
          Send
        </IonButton>

        <hr />
        <p>
          Did not forget password?{" "}
          <strong>
            <Link to="/login">Click here</Link>
          </strong>
        </p>
      </div>
      <IonLoading isOpen={status.isLoading} />
    </IonContent>
  );
};

export default ForgotPassword;
