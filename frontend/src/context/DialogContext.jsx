import { createContext, useContext, useState, useCallback } from "react";

const DialogContext = createContext();

export const useDialog = () => {
    return useContext(DialogContext);
};

export const DialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "alert", // 'alert' | 'confirm' | 'prompt'
        resolve: null,
        defaultValue: ""
    });

    const showAlert = useCallback((title, message) => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                title,
                message,
                type: "alert",
                resolve,
                defaultValue: ""
            });
        });
    }, []);

    const showConfirm = useCallback((title, message) => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                title,
                message,
                type: "confirm",
                resolve,
                defaultValue: ""
            });
        });
    }, []);

    const showPrompt = useCallback((title, message, defaultValue = "") => {
        return new Promise((resolve) => {
            setDialog({
                isOpen: true,
                title,
                message,
                type: "prompt",
                resolve,
                defaultValue
            });
        });
    }, []);

    const closeDialog = (value) => {
        if (dialog.resolve) {
            dialog.resolve(value);
        }
        setDialog((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm, showPrompt, dialog, closeDialog }}>
            {children}
        </DialogContext.Provider>
    );
};
