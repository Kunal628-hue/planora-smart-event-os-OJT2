import { useState, useCallback } from 'react';

const showToast = (message, type = "success") => {
    // Basic DOM-based toast to satisfy the "show a toast" requirement
    // without depending on a heavy library or missing Context Provider.
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 24px";
    toast.style.backgroundColor = type === "success" ? "#10b981" : "#ef4444";
    toast.style.color = "#fff";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "600";
    toast.style.zIndex = "9999";
    toast.style.transition = "opacity 0.3s ease-in-out, transform 0.3s ease-in-out";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    // Added data-testid so that React Testing Library can query it
    toast.setAttribute('data-testid', `clipboard-toast-${type}`);
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 10);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
};

export function useCopyToClipboard() {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = useCallback(async (text) => {
        if (!navigator?.clipboard) {
            showToast("Clipboard not supported in this environment", "error");
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            showToast("Copied to clipboard!");
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);
            return true;
        } catch (error) {
            console.error('Failed to copy text: ', error);
            setIsCopied(false);
            showToast("Failed to copy to clipboard", "error");
            return false;
        }
    }, []);

    return { isCopied, copyToClipboard };
}
