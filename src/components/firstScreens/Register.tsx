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

const Register: React.FC = () => {
  const [values, setValues] = React.useState({
    password: "",
    showPassword: false,
  });
  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword });
  };

  const handleMouseDownPassword = (event: { preventDefault: () => void }) => {
    event.preventDefault();
  };

  const handlePasswordChange =
    (prop: string) => (event: { detail: { value: any } }) => {
      setValues({ ...values, [prop]: event.detail.value });
    };

  //   Register Functionality
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [cellNumber, setCellNumber] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState({ isError: false, isLoading: false });
  const handleRegister = async () => {
    setStatus({ isError: false, isLoading: true });
    if (
      email == "" ||
      name == "" ||
      cellNumber == "" ||
      repeatPassword == "" ||
      values.password == ""
    ) {
      setStatus({ isError: true, isLoading: false });
      setMessage("🚩🚩Please fill all the forms");
    } else if (!/^\d+$/.test(cellNumber)) {
      setStatus({ isError: true, isLoading: false });
      setMessage("🚩🚩Cell number should contain numbers");
    } else if (values.password != repeatPassword) {
      setStatus({ isError: true, isLoading: false });
      setMessage("🚩🚩Passwords do not match");
    } else {
      try {
        await auth
          .createUserWithEmailAndPassword(email, values.password)
          .then((credential) => {
            return firestore.collection("users").doc(credential.user.uid).set({
              name: name,
              cellNumber: cellNumber,
              userEmail: email,
              userImage:
                "https://firebasestorage.googleapis.com/v0/b/skillzk-29506.appspot.com/o/profiles%2Fuser.png?alt=media&token=834e2f46-3a55-4fa2-b6d7-f4342e2cf465",
            });
          });
        history.push("/RegistarationFinished");
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
            <h2>Hi</h2>
            <h5>Create a new account</h5>
          </IonTitle>
          <IonItem className="ion-padding-top">
            <IonInput
              onIonChange={(e) => setName(e.detail.value)}
              placeholder="Your name"
            ></IonInput>
          </IonItem>
          <IonItem className="ion-padding-top">
            <IonInput
              onIonChange={(e) => setEmail(e.detail.value)}
              placeholder="Enter your email"
              inputMode="email"
              clearInput
            ></IonInput>
          </IonItem>
          <IonItem className="ion-padding-top">
            <IonInput
              onIonChange={(e) => setCellNumber(e.detail.value)}
              inputMode="tel"
              placeholder="Enter your cell number"
            ></IonInput>
          </IonItem>
          <IonItem className="ion-padding-top">
            <IonInput
              type={values.showPassword ? "text" : "password"}
              onIonChange={(e) => {
                setValues({ password: e.detail.value, showPassword: false });
                handlePasswordChange("password");
              }}
              value={values.password}
              placeholder="Enter password"
            ></IonInput>
            <div
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}
            >
              {values.showPassword ? (
                <IonIcon icon={eye}></IonIcon>
              ) : (
                <IonIcon icon={eyeOff}></IonIcon>
              )}
            </div>
          </IonItem>
          <IonItem className="ion-padding-top">
            <IonInput
              onIonChange={(e) => setRepeatPassword(e.detail.value)}
              type="password"
              placeholder="Repeat password"
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
          onClick={handleRegister}
        >
          Sign Up
        </IonButton>

        <hr />
        <p>
          Already have an account?{" "}
          <strong>
            <Link to="/login">Click here</Link>
          </strong>
        </p>
      </div>
      <IonLoading isOpen={status.isLoading} />
    </IonContent>
  );
};

export default Register;
