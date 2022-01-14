import { IonButton, IonContent, IonSlide, IonSlides } from "@ionic/react";
import "./Slides.css";
import React from "react";
import imageOne from "./slideImages/first.jpg";
import imageTwo from "./slideImages/second.jpg";
import imageThree from "./slideImages/third.jpg";
import imageFour from "./slideImages/four.jpg";

const Slides: React.FC = () => {
  const handleAddStorage = () => {
    localStorage.setItem("first-timer", "not first time");
  };
  const slideOpts = {
    initialSlide: 1,
    speed: 400,
  };
  return (
    <IonContent>
      {localStorage.getItem("first-timer") != "not first time" ? (
        <IonSlides pager={true} options={slideOpts}>
          <IonSlide>
            <div className="slide">
              <img src={imageOne} />
              <h2>Welcome to SkillzK</h2>
              <p>
                Best platform to present your skills and talents and also make
                an earning out of it
              </p>
            </div>
          </IonSlide>

          <IonSlide>
            <div className="slide">
              <img src={imageTwo} />
              <h2>One solution tool for all</h2>
              <p>
                This platform gives everyone an opportunity to advertise their
                skills, talents and be able to earn some income.
              </p>
            </div>
          </IonSlide>
          <IonSlide>
            <div className="slide">
              <img src={imageThree} />
              <h2>Vorsprung Durch! Everyone benefits</h2>
              <p>
                You get to advertise your skills and be able to buy or hire
                services provided by freelancers
              </p>
            </div>
          </IonSlide>
          <IonSlide>
            <div className="slide">
              <img src={imageFour} />
              <h2>Ready to start?</h2>
              <IonButton
                className="ion-margin"
                expand="block"
                onClick={handleAddStorage}
                routerLink="/Register"
              >
                Sign Up
              </IonButton>
              <IonButton
                className="ion-margin"
                expand="block"
                onClick={handleAddStorage}
                fill="outline"
                routerLink="/login"
              >
                Sign In
              </IonButton>
            </div>
          </IonSlide>
        </IonSlides>
      ) : (
        <IonSlides pager={true} options={slideOpts}>
          <IonSlide>
            <div className="slide">
              <img src={imageFour} />
              <h2>Ready to start?</h2>
              <IonButton
                className="ion-margin"
                expand="block"
                routerLink="/Register"
              >
                SignUp
              </IonButton>
              <IonButton
                className="ion-margin"
                expand="block"
                fill="outline"
                routerLink="/login"
              >
                SignIn
              </IonButton>
            </div>
          </IonSlide>
        </IonSlides>
      )}
    </IonContent>
  );
};

export default Slides;
