import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    deleteUser
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { LogoLoader } from "../components/ui/Loader";const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(`[Firebase Session] State Changed. User: ${currentUser ? currentUser.email : "NULL"}`);
            setUser(currentUser);
            setLoading(false);
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
        return signOut(auth);
    };

    const deleteAccount = async () => {
        if (auth.currentUser) {
            try {
                await deleteUser(auth.currentUser);
            } catch (err) {
                console.warn("[Delete Account] Firebase delete exception fallback:", err);
            }
        }
        localStorage.clear();
        setUser(null);
        await signOut(auth).catch(() => {});
    };

    const updateUserProfile = async (profileData) => {
        if (!auth.currentUser) throw new Error("No user logged in");
        await updateProfile(auth.currentUser, profileData);
        setUser({ ...auth.currentUser, ...profileData });
    };

    const value = {
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        deleteAccount,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <LogoLoader text="Verifying Session..." /> : children}
        </AuthContext.Provider>
    );
};

