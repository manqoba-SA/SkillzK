import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonPage,
  IonRow,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useState } from "react";
import "./MarketPlace.css";
import { firestore } from "../firebase";
import { Link } from "react-router-dom";
const MarketPlace: React.FC = () => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const productsRef = firestore
      .collection("products")
      .orderBy("timeCreated", "desc");
    productsRef.onSnapshot(({ docs }) => {
      const products = docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Data:", products);
      setProducts(products);
    });
  }, []);
  const [searchItem, setSearchItem] = useState("");
  const [loadingThing, setLoadingthing] = useState(false);
  const style = loadingThing
    ? {}
    : ({ "visibility:": "hidden" } as React.CSSProperties);
  return (
    <IonPage>
      <IonHeader color="primary">
        <IonToolbar>
          <IonTitle>Market Place</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={`/my/makertplace/addProductToSell`}>
              <small>
                <b>Sell✔️</b>
              </small>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="animate__animated animate__fadeIn animate__faster">
        <h3 className="ion-text-center">
          <strong>The Market Place🛒</strong>
        </h3>
        <IonSearchbar
          onIonChange={(e) => setSearchItem(e.detail.value)}
          placeholder="search products, servicers"
        ></IonSearchbar>
        <IonGrid>
          <IonRow>
            {products
              .filter((product) => {
                if (searchItem == "") {
                  return product;
                } else if (
                  product.price
                    .toLowerCase()
                    .includes(searchItem.toLocaleLowerCase()) ||
                  product.productName
                    .toLowerCase()
                    .includes(searchItem.toLocaleLowerCase())
                ) {
                  return product;
                }
              })
              .map((product) => (
                <IonCol
                  className="animate__animated animate__fadeIn"
                  size="6"
                  key={product.id}
                >
                  <Link
                    to={`/my/makertplace/ProductView/${product.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div>
                      {!loadingThing && (
                        <div className="container">
                          <IonSpinner name="crescent" />
                        </div>
                      )}
                      <img
                        loading="lazy"
                        className="equally-images animate__animated animate__fadeIn animate__delay-0.1s ion-padding-top"
                        onLoad={() => setLoadingthing(true)}
                        style={style}
                        src={
                          product.imagesData
                            ? product.imagesData[0]
                            : "https://firebasestorage.googleapis.com/v0/b/skillzk-29506.appspot.com/o/products%2Fproduct%20placeholder.png?alt=media&token=a5fa8c1e-92ae-4d4a-97e3-665d6d153834"
                        }
                      ></img>
                    </div>
                    <p>
                      <b>
                        R{product.price}- {product.displayName}-{" "}
                        {product.location}
                      </b>
                    </p>
                  </Link>
                </IonCol>
              ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MarketPlace;
