import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { CloudUpload, Pause, X, File as FileIcon, Clock, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';

const UploadContext = createContext();

export function useUpload() {
    return useContext(UploadContext);
}

export function UploadProvider({ children }) {
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileSize, setFileSize] = useState(0); // in bytes
    const [progress, setProgress] = useState(0); // 0 to 100
    const [isPaused, setIsPaused] = useState(false);
    
    // Derived states for simulation
    const [speedBytes, setSpeedBytes] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
    
    const progressRef = useRef(0);
    const intervalRef = useRef(null);

    const formatBytes = (bytes, decimals = 1) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const formatTime = (totalSeconds) => {
        if (totalSeconds === Infinity || isNaN(totalSeconds)) return "Calculating...";
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        
        let timeStr = "";
        if (hours > 0) timeStr += `${hours.toString().padStart(2, '0')}h `;
        if (minutes > 0 || hours > 0) timeStr += `${minutes.toString().padStart(2, '0')}m `;
        timeStr += `${seconds.toString().padStart(2, '0')}s`;
        
        return timeStr.trim();
    };

    const startUpload = (file) => {
        if (!file) return;
        setFileName(file.name || "Unknown File");
        setFileSize(file.size || 0);
        setProgress(0);
        setIsPaused(false);
        setIsUploading(true);
        progressRef.current = 0;
        
        // Initial speed estimate
        const targetSpeed = Math.max(1024 * 50, (file.size || 1024 * 1024) / 5); // Default to completing in ~5 seconds
        setSpeedBytes(targetSpeed);
        
        clearInterval(intervalRef.current);
        
        intervalRef.current = setInterval(() => {
            if (isPaused) return;
            
            // Advance progress, slowing down as it reaches 90% if not complete
            // Real completion is triggered by completeUpload()
            setProgress(prev => {
                const step = (95 - prev) * 0.1; 
                const next = Math.min(prev + step, 98);
                progressRef.current = next;
                
                // Recalculate remaining time
                const remainingPercent = 100 - next;
                if (remainingPercent > 0) {
                    const remainingSeconds = (remainingPercent / (step * 2)); // rough estimate
                    setTimeRemaining(remainingSeconds);
                }
                
                // Fluctuating speed for realism
                setSpeedBytes(targetSpeed * (0.8 + Math.random() * 0.4));
                
                return next;
            });
        }, 500);
    };

    const completeUpload = () => {
        setProgress(100);
        progressRef.current = 100;
        setTimeRemaining(0);
        clearInterval(intervalRef.current);
        setTimeout(() => {
            setIsUploading(false);
        }, 1500);
    };

    const cancelUpload = () => {
        setIsUploading(false);
        clearInterval(intervalRef.current);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    return (
        <UploadContext.Provider value={{ startUpload, completeUpload, cancelUpload }}>
            {children}
            {isUploading && (
                <div style={{
                    position: "fixed",
                    bottom: "30px",
                    right: "30px",
                    width: "420px",
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                    padding: "24px",
                    zIndex: 9999,
                    fontFamily: "'Inter', sans-serif",
                    animation: "fade-up 0.3s ease-out"
                }}>
                    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                        {/* File Icon */}
                        <div style={{ 
                            width: "56px", 
                            height: "64px", 
                            border: "2px solid rgba(255,255,255,0.1)", 
                            borderRadius: "10px", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.02)",
                            color: "rgba(255,255,255,0.4)"
                        }}>
                            <FileIcon size={28} strokeWidth={1.5} />
                        </div>
                        
                        {/* Title & Size */}
                        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <div style={{ fontSize: "16px", color: "#f4f4f5", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {fileName}
                            </div>
                            <div style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>
                                {formatBytes(fileSize)}
                            </div>
                        </div>
                    </div>

                    {/* Progress Info Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                        <div style={{ color: "rgba(255,255,255,0.4)" }}>
                            <CloudUpload size={24} strokeWidth={1.5} />
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "20px", color: "#f4f4f5", fontWeight: 400 }}>
                                {Math.floor(progress)}%
                            </div>
                            <div style={{ fontSize: "12px", color: "#f97316", marginTop: "2px", letterSpacing: "0.02em" }}>
                                {progress >= 100 ? "completed" : isPaused ? "paused" : "uploading"}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ 
                        width: "100%", 
                        height: "12px", 
                        background: "rgba(255,255,255,0.05)", 
                        borderRadius: "10px", 
                        overflow: "hidden",
                        marginBottom: "20px"
                    }}>
                        <div style={{ 
                            width: `${progress}%`, 
                            height: "100%", 
                            background: progress >= 100 ? "#10b981" : "#f4f4f5", 
                            borderRadius: "10px",
                            transition: "width 0.3s ease, background 0.3s ease" 
                        }}></div>
                    </div>

                    {/* Footer Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", color: "#a1a1aa" }}>
                        <button 
                            onClick={togglePause}
                            style={{ 
                                background: "rgba(255,255,255,0.1)", 
                                border: "none", 
                                borderRadius: "50%", 
                                width: "32px", 
                                height: "32px", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                color: "#f4f4f5",
                                cursor: "pointer",
                                flexShrink: 0
                            }}
                        >
                            <Pause size={14} fill="currentColor" />
                        </button>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                            <ArrowUpToLine size={16} />
                            <span style={{ color: "#f4f4f5", fontWeight: 500 }}>{formatBytes(speedBytes)}</span>/s
                        </div>
                        
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px" }}>
                            <Clock size={16} />
                            <span style={{ color: "#f4f4f5" }}>{formatTime(timeRemaining)}</span>
                        </div>
                        
                        <button 
                            onClick={cancelUpload}
                            style={{ 
                                marginLeft: "auto",
                                background: "none", 
                                border: "none", 
                                color: "#a1a1aa",
                                cursor: "pointer",
                                padding: "4px"
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}
        </UploadContext.Provider>
    );
}
