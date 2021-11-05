import React, { useContext, useEffect, useState } from "react";
import { auth as firebaseAuth} from "./firebase";


interface Auth{
    loggedIn: Boolean;
    userId?: string;
}

interface AuthInit{
    loading: boolean;
    auth?: Auth
}

export const AuthContext = React.createContext<Auth>({loggedIn: false})

export function useAuth(){
    return useContext(AuthContext)
}

export function useAuthInit(){
    const [authState, setAuthState] = useState<AuthInit>({loading:true})
    useEffect(() => {
      firebaseAuth.onAuthStateChanged((firebaseUser) =>{
      const auth = firebaseUser? {loggedIn: true, userId: firebaseUser.uid} : {loggedIn: false}
      setAuthState({loading: false, auth})
    })
    }, [])
    return authState
}