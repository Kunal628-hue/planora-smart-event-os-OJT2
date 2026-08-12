import helmet from "helmet";

export const securityHeadersMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "'unsafe-eval'", 
                "https://apis.google.com", 
                "https://*.firebaseapp.com", 
                "https://*.googleapis.com"
            ],
            styleSrc: [
                "'self'", 
                "'unsafe-inline'", 
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'", 
                "data:", 
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'", 
                "data:", 
                "blob:", 
                "https:", 
                "http:"
            ],
            connectSrc: [
                "'self'", 
                "https://*.firebaseio.com", 
                "https://*.googleapis.com", 
                "https://identitytoolkit.googleapis.com", 
                "https://securetoken.googleapis.com", 
                "https://planora-os.com", 
                "https://www.planora-os.com", 
                "https://planora-smart-event-os-web.vercel.app", 
                "https://planora-smart-event-os-ojt-2-6zpq.vercel.app", 
                "http://localhost:*"
            ],
            frameSrc: [
                "'self'", 
                "https://*.firebaseapp.com"
            ],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null
        }
    },
    crossOriginEmbedderPolicy: false, // Prevent breaking cross-origin images/resources
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    xFrameOptions: { action: "deny" },
    xContentTypeOptions: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
});

export const setCustomSecurityHeaders = (req, res, next) => {
    res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    next();
};
