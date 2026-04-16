import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOtpVerified, setOtpVerified] = useState(() => {
        return sessionStorage.getItem("otpVerified") === "true";
    });

    const updateOtpVerified = (val) => {
        setOtpVerified(val);
        sessionStorage.setItem("otpVerified", val);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(`[Firebase Session] State Changed. User: ${currentUser ? currentUser.email : "NULL"}`);
            setUser(currentUser);
            setLoading(false);
            
            // Clean up OTP state if user logs out - ensures security integrity
            if (!currentUser) {
                console.log("[Firebase Session] User null detected. Clearing OTP status.");
                sessionStorage.removeItem("otpVerified");
                setOtpVerified(false);
            }
        });
        return () => unsubscribe();
    }, [auth]);

    const loginWithGoogle = async () => {
        try {
            return await signInWithPopup(auth, googleProvider);
        } catch (error) {
            throw error;
        }
    };

    const loginWithEmail = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signupWithEmail = async (email, password, name) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: name
        });
        return userCredential;
    };

    const logout = () => {
        updateOtpVerified(false);
        return signOut(auth);
    };

    const updateUserProfile = async (profileData) => {
        if (!auth.currentUser) throw new Error("No user logged in");
        await updateProfile(auth.currentUser, profileData);
        // Update local state to reflect changes immediately
        setUser({ ...auth.currentUser, ...profileData });
    };

    const value = {
        user,
        loading,
        isOtpVerified,
        setOtpVerified: updateOtpVerified,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

