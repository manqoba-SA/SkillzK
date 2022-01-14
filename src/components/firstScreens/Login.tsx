import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Redirect } from "react-router";
import "./Login.css";
import { useAuth } from "../../auth";
import { auth } from "../../firebase";
import { eye, eyeOff } from "ionicons/icons";
import { useState } from "react";
import { Link } from "react-router-dom";

interface Props {
  onLogin: () => void;
}
const Login: React.FC<Props> = ({ onLogin }) => {
  // See no see password functionality
  const [values, setValues] = useState({
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

  // Login Functionality
  const { loggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ isError: false, isLoading: false });

  const handleLogin = async () => {
    try {
      setStatus({ isError: false, isLoading: true });
      const credentials = await auth.signInWithEmailAndPassword(
        email,
        values.password
      );
      console.log(credentials);
    } catch (error) {
      console.log(error);
      setStatus({ isError: true, isLoading: false });
    }
  };

  if (loggedIn) {
    return <Redirect to="/my/home" />;
  }
  return (
    <IonContent fullscreen className="ion-padding" scroll-y="false">
      <div>
        <IonList mode="md">
          <IonTitle>
            <h2>Hi</h2>
            <h5>Sign In your account</h5>
          </IonTitle>
          <IonItem className="ion-padding-top">
            <IonInput
              placeholder="Enter your email"
              onIonChange={(e) => setEmail(e.detail.value)}
              clearInput
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
          <br />
          <small className="ion-padding-top">
            <Link to="/forgotpassword">Forgot password?</Link>
          </small>
          {status.isError && (
            <IonTitle color="danger">
              <small>Oops you inserted wrong credential☹️</small>
            </IonTitle>
          )}
        </IonList>

        <IonButton className="ion-margin" expand="block" onClick={handleLogin}>
          Sign In
        </IonButton>

        <hr />

        <p>
          Don't have an account?{" "}
          <strong>
            <Link to="/Register">Click here</Link>
          </strong>
        </p>
      </div>
      <IonLoading isOpen={status.isLoading} />
    </IonContent>
  );
};

export default Login;
