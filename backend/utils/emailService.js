import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// --- Dynamic Environment Resolution ---
// We dynamically resolve application URLs to ensure the mailer points to the correct tactical environment.
const EMAIL_USER = process.env.EMAIL_USER;
// Google App Passwords work with or without spaces — strip only surrounding quotes/whitespace
const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/^["'\s]+|["'\s]+$/g, "") : "";
const BACKEND_URL = process.env.BACKEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5002");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// --- Connection Verification ---
// We verify the SMTP connection on service initialization to catch credential errors proactively.
console.log(`📧 Email Config: USER=${EMAIL_USER}, PASS=${EMAIL_PASS ? EMAIL_PASS.substring(0,4) + '****' : 'MISSING'}, SERVICE=${process.env.EMAIL_SERVICE || 'gmail'}`);

transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email Service Verification Failed:", error.message);
        console.log("💡 Suggestion: Check EMAIL_USER and EMAIL_PASS in your .env file.");
    } else {
        console.log("✅ Email Service is ready to deliver messages");
    }
});


/**
 * Sends an invitation email to a guest with RSVP links.
 * @param {Object} guest - The guest object.
 * @param {Object} event - The event object.
 */
export const sendInvitation = async (guest, event) => {
    if (!guest.email || !event) return;

    const eventName = event.title || event.name;
    const eventLocation = event.location;
    const rsvpConfirmUrl = `${BACKEND_URL}/api/guests/rsvp/${guest._id}/Confirmed`;
    const rsvpDeclineUrl = `${BACKEND_URL}/api/guests/rsvp/${guest._id}/Declined`;
    const passUrl = `${BACKEND_URL}/api/guests/pass/${guest._id}`;
    const mapsUrl = eventLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventLocation)}` : "";

    const eventType = (event.type || "Other").toLowerCase();
    const eventTitle = (event.title || event.name || "").toLowerCase();
    
    const professionalKeywords = ["hackathon", "hackthon", "tech fest", "tech event", "conference", "corporate", "tech summits", "college fest", "seminar", "workshop", "tech", "summit", "meetup"];
    const personalKeywords = ["wedding", "birthday", "party", "anniversary", "baby shower", "engagement", "reception", "family"];
    
    let isProfessional = false;
    if (personalKeywords.some(kw => eventType.includes(kw))) {
        isProfessional = false;
    } else if (professionalKeywords.some(kw => eventType.includes(kw))) {
        isProfessional = true;
    } else {
        isProfessional = professionalKeywords.some(kw => eventTitle.includes(kw)) && !personalKeywords.some(kw => eventTitle.includes(kw));
    }

    const categoryGlows = {
        "VIP": { color: "#ec4899", name: "VIP PASS" },
        "Tech": { color: "#2563eb", name: "TECH SPECIALIST" },
        "Business": { color: "#7c3aed", name: "BUSINESS DELEGATE" },
        "Friend": { color: "#10b981", name: "GUEST ACCESS" },
        "Family": { color: "#f43f5e", name: "GUEST ACCESS" }
    };
    const categoryConfig = categoryGlows[guest.category] || { color: "#f97316", name: `${guest.category.toUpperCase()} ACCESS` };

    // Resolve Cvent-style custom email configs
    const customEmail = event.registrationConfig?.email;
    const customSubject = customEmail?.subject;
    const customBody = customEmail?.body;

    let finalSubject = `Invitation: ${eventName}`;
    if (customSubject) {
        finalSubject = customSubject
            .replace(/{name}/gi, guest.name)
            .replace(/{event}/gi, eventName);
    }

    let finalBody = isProfessional 
        ? `You are cordially invited to attend <strong>${eventName}</strong>. A digital attendee pass and scanning badge have been initialized for you.`
        : `We would be honored by your presence at our upcoming event celebration: <strong>${eventName}</strong>.`;

    if (customBody) {
        finalBody = customBody
            .replace(/{name}/gi, guest.name)
            .replace(/{event}/gi, eventName)
            .replace(/\n/g, "<br />");
    }

    // High-Fidelity Professional & Social Template
    const greetingText = isProfessional ? "Official Event Invitation" : "Cordial Invitation";
    const bodyContent = `
        <div style="font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 30px auto; padding: 0; background-color: #f8fafc; border-radius: 28px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
            <!-- Elegant Header with pastel gradient mesh background -->
            <div style="background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'); background-size: cover; background-position: center; padding: 50px 30px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.7);"></div>
                <span style="position: relative; z-index: 5; background: #ffffff; border: 1px solid rgba(0,0,0,0.06); color: #0f172a; padding: 6px 14px; border-radius: 100px; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.04);">${greetingText}</span>
                <h1 style="position: relative; z-index: 5; color: #0f172a; font-size: 28px; font-weight: 900; margin: 15px 0 0 0; letter-spacing: -0.03em; line-height: 1.2;">${eventName}</h1>
            </div>

            <div style="padding: 40px; color: #1e293b; background: #ffffff;">
                <p style="font-size: 15px; color: #64748b; margin: 0 0 20px 0;">Hello <strong>${guest.name}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 30px 0;">${finalBody}</p>

                <!-- High-Fidelity Physical-like Ticket Badge Card (as requested by user) -->
                <div style="max-width: 340px; margin: 30px auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.04); overflow: hidden; text-align: center;">
                    <!-- Card Top Lanyard Slot -->
                    <div style="padding: 20px 20px 10px 20px;">
                        <div style="width: 45px; height: 8px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 10px; margin: 0 auto 15px auto;"></div>
                        <p style="margin: 0; font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.12em;">EVENT ACCESS BADGE</p>
                        <h3 style="margin: 6px 0 2px 0; font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; line-height: 1.25;">${eventName}</h3>
                        <p style="margin: 0; font-size: 10px; font-weight: 800; color: #ec4899; letter-spacing: 0.05em; text-transform: uppercase;">${event.date || 'UPCOMING'} &bull; ${eventLocation || 'VENUE TBD'}</p>
                    </div>
                    
                    <!-- Ticket Tear Line/Divider -->
                    <div style="position: relative; height: 1px; border-top: 2px dashed #e2e8f0; margin: 5px 0;">
                        <div style="position: absolute; left: -9px; top: -9px; width: 18px; height: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 50%;"></div>
                        <div style="position: absolute; right: -9px; top: -9px; width: 18px; height: 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 50%;"></div>
                    </div>
                    
                    <!-- Bottom Marble Section with Attendee info -->
                    <div style="background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'); background-size: cover; background-position: center; padding: 25px 20px; text-align: center; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
                        <h4 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em;">${guest.name}</h4>
                        <span style="display: inline-block; background: ${categoryConfig.color}; color: #ffffff; font-size: 9px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 20px;">${categoryConfig.name}</span>
                        
                        <!-- Mini Barcode -->
                        <div style="background: rgba(255,255,255,0.9); padding: 10px; border-radius: 10px; display: inline-block; border: 1px solid rgba(0,0,0,0.05); text-align: center;">
                            <div style="display: flex; gap: 2px; height: 28px; align-items: center; justify-content: center; margin-bottom: 4px; opacity: 0.85;">
                                ${[1,2,3,1,2,1,4,1,2,3,1,2,4,1,2,1,3,1,2,4].map(w => `<div style="height: 100%; background: #0f172a; width: ${w}px;"></div>`).join('')}
                            </div>
                            <div style="font-family: monospace; font-size: 10px; font-weight: 800; color: #475569; letter-spacing: 0.15em;">${guest.entryCode || '—'}</div>
                        </div>
                    </div>
                </div>

                ${eventLocation ? `
                <div style="background: #f8fafc; border-left: 4px solid #0f172a; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">📍 Venue Location</p>
                    <p style="margin: 6px 0; color: #1e293b; font-weight: 700; font-size: 15px; line-height: 1.4;">${eventLocation}</p>
                    <a href="${mapsUrl}" target="_blank" style="color: #2563eb; font-size: 13px; font-weight: 700; text-decoration: none;">Get Directions →</a>
                </div>
                ` : ""}

                <p style="font-size: 14px; color: #475569; text-align: center; margin-bottom: 20px;">Please confirm your attendance status to lock in your spot:</p>
                
                <div style="margin: 25px 0; text-align: center;">
                    <a href="${rsvpConfirmUrl}" style="background-color: #10b981; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 6px 16px rgba(16,185,129,0.2); margin: 5px;">Confirm Attendance</a>
                    <a href="${rsvpDeclineUrl}" style="background-color: #ef4444; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 6px 16px rgba(239,68,68,0.2); margin: 5px;">Decline Invite</a>
                </div>

                <div style="text-align: center; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <a href="${passUrl}" style="color: #2563eb; font-size: 13px; font-weight: 700; text-decoration: none; border-bottom: 1px dashed #2563eb;">Open Live Access Pass & Badge Details →</a>
                </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 11px; margin: 0;">Secured transmission from Planora Smart Event OS.</p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `"Planora" <${EMAIL_USER}>`,
        to: guest.email,
        subject: finalSubject,
        html: `
            <html>
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9;">
                    ${bodyContent}
                </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Invitation sent to ${guest.email}`);
    } catch (error) {
        console.error(`❌ Guest email delivery failed [${guest.email}]:`, error.message);
    }
};

/**
 * Sends a welcome email to a new team collaborator.
 * @param {Object} collaborator - The collaborator object.
 * @param {string} inviterName - The name of the person who invited them.
 * @param {string} eventName - The name of the event they are invited to.
 */
export const sendCollaboratorInvite = async (collaborator, inviterName, eventName, eventLocation) => {
    if (!collaborator.email) return;

    const mapsUrl = eventLocation ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventLocation)}` : "";

    const mailOptions = {
        from: `"Planora Hive" <${EMAIL_USER}>`,
        to: collaborator.email,
        subject: `Team Invitation: Join ${inviterName} for ${eventName || 'Event Planning'} on Planora`,
        html: `
            <html>
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Outfit', sans-serif;">
                    <div style="max-width: 600px; margin: 30px auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 28px; background: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.04em;">Planora <span style="color: #2563eb;">Hive</span></h1>
                        </div>
                        
                        <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 15px;">Collaborator Access Synced</h2>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${collaborator.name}</strong>,</p>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6;"><strong>${inviterName}</strong> has synchronized your profile into their operational collective for <strong>${eventName || 'Event Workspace'}</strong> as a <strong>${collaborator.role}</strong>.</p>
                        
                        ${eventLocation ? `
                        <div style="background: #eff6ff; border-radius: 16px; padding: 20px; margin: 20px 0; border: 1px solid #dbeafe;">
                            <p style="margin: 0; color: #2563eb; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">📍 Venue location</p>
                            <p style="margin: 6px 0 10px 0; color: #1e3a8a; font-weight: 700; font-size: 15px;">${eventLocation}</p>
                            <a href="${mapsUrl}" target="_blank" style="color: #2563eb; font-size: 13px; font-weight: 700; text-decoration: none;">Navigate on Google Maps →</a>
                        </div>
                        ` : ""}

                        <div style="background: #f8fafc; border-radius: 16px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
                            <h3 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; font-weight: 800;">Your Access Logic</h3>
                            <p style="margin: 0; color: #1e293b; font-weight: 700; font-size: 14px;">${collaborator.permissions || "Standard project access"}</p>
                        </div>
                        
                        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">Access the dashboard to view shared resources, coordinate guests, and align operations with the team.</p>
                        
                        <div style="text-align: center;">
                            <a href="${FRONTEND_URL}/login" style="background-color: #2563eb; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: 800; display: inline-block; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.15);">Log In to Workspace</a>
                        </div>
                        
                        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 40px 0;" />
                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">This is an automated operational alert from Planora Smart Event OS.</p>
                    </div>
                </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Collaborator invite sent to ${collaborator.email}`);
    } catch (error) {
        console.error(`❌ Collaborator email delivery failed [${collaborator.email}]:`, error.message);
    }
};

/**
 * Sends a polite rejection email for tech/college event applications.
 */
export const sendRejectionMail = async (guest, eventName) => {
    if (!guest.email) return;

    const mailOptions = {
        from: `"Planora Selection Committee" <${EMAIL_USER}>`,
        to: guest.email,
        subject: `Update regarding your application for ${eventName}`,
        html: `
            <html>
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Outfit', sans-serif;">
                    <div style="max-width: 600px; margin: 30px auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 28px; background: #ffffff; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.04em;">Planora <span style="color: #64748b;">Events</span></h1>
                        </div>
                        <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin-bottom: 15px;">Application Status Update</h2>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${guest.name}</strong>,</p>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Thank you for your interest in joining us at <strong>${eventName}</strong>. After reviewing all profiles, we regret to inform you that we are unable to allocate an entry pass for this edition of the event.</p>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6;">Due to high demand and venue capacity constraints, we must enforce strict limits. We will retain your application credentials to fast-track access for future operations.</p>
                        
                        <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0 0 4px 0;">Warm regards,</p>
                            <p style="color: #0f172a; font-weight: 800; font-size: 14px; margin: 0;">The Selection Team</p>
                        </div>
                    </div>
                </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`❌ Rejection notice delivered to ${guest.email}`);
    } catch (error) {
        console.error(`❌ Failed to deliver rejection mail to ${guest.email}:`, error.message);
    }
};

/**
 * Sends a high-fidelity 1-day alert to guests or team members.
 */
export const sendOneDayAlert = async (recipient, event, aiContent, recipientType = "guest") => {
    if (!recipient.email) return;

    const mapsUrl = event.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` : "";
    const passUrl = `${BACKEND_URL}/api/guests/pass/${recipient._id}`;
    
    const isTeam = recipientType === "team";
    const subject = isTeam 
        ? `🔥 Operational Alert: ${event.title} starts in 24h`
        : `✨ Final Countdown: ${event.title} is tomorrow!`;

    const accentColor = isTeam ? "#7c3aed" : "#ec4899";

    const mailOptions = {
        from: `"Planora Intelligence" <${EMAIL_USER}>`,
        to: recipient.email,
        subject: subject,
        html: `
            <html>
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Outfit', sans-serif;">
                    <div style="max-width: 600px; margin: 30px auto; padding: 0; border-radius: 28px; background: #ffffff; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
                        <!-- Fluid Marble Top header -->
                        <div style="background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'); background-size: cover; background-position: center; padding: 50px 30px; text-align: center; position: relative;">
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.7);"></div>
                            <p style="position: relative; z-index: 5; margin: 0; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b;">${isTeam ? 'Tactical Ops Briefing' : 'Attendee Final Alert'}</p>
                            <h1 style="position: relative; z-index: 5; margin: 10px 0 0 0; font-size: 36px; font-weight: 900; letter-spacing: -0.04em; color: #0f172a;">24 HOURS</h1>
                        </div>
                        
                        <div style="padding: 40px;">
                            <p style="color: #64748b; font-size: 15px; margin-bottom: 6px;">Greetings, <strong>${recipient.name}</strong></p>
                            <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 0 0 25px 0; letter-spacing: -0.02em;">${event.title}</h2>
                            
                            <!-- AI Insight Card -->
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 25px; margin-bottom: 30px; position: relative;">
                                <div style="position: absolute; top: -10px; left: 20px; background: ${accentColor}; color: #ffffff; padding: 3px 10px; border-radius: 6px; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em;">
                                    AI Event Copilot
                                </div>
                                <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155; font-style: italic;">"${aiContent}"</p>
                            </div>

                            <!-- Details Grid -->
                            <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td width="50%" style="padding-right: 10px;">
                                        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
                                            <p style="margin: 0; font-size: 10px; color: ${accentColor}; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Launch Date</p>
                                            <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #0f172a;">${event.date}</p>
                                        </div>
                                    </td>
                                    <td width="50%" style="padding-left: 10px;">
                                        <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
                                            <p style="margin: 0; font-size: 10px; color: ${accentColor}; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Destination</p>
                                            <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 700; color: #0f172a;">${event.city || 'TBD'}</p>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            ${event.location ? `
                            <div style="margin-bottom: 30px; background: #f8fafc; border-radius: 16px; padding: 20px; border: 1px solid #e2e8f0;">
                                <p style="margin: 0 0 6px 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase;">Venue Address</p>
                                <p style="margin: 0 0 15px 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 1.4;">${event.location}</p>
                                <a href="${mapsUrl}" style="color: #2563eb; font-size: 13px; font-weight: 700; text-decoration: none;">Get Directions →</a>
                            </div>
                            ` : ""}

                            <div style="text-align: center; margin-top: 10px;">
                                <a href="${isTeam ? FRONTEND_URL + '/dashboard' : passUrl}" style="display: inline-block; background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'); background-size: cover; background-position: center; color: #0f172a; padding: 15px 35px; border-radius: 14px; font-weight: 900; text-decoration: none; font-size: 15px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); text-transform: uppercase; border: 1px solid #cbd5e1;">
                                    ${isTeam ? 'Open Command Center' : 'Access My Digital Pass'}
                                </a>
                            </div>
                        </div>

                        <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">Secure transmission from Planora Smart Event OS.</p>
                        </div>
                    </div>
                </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Beautiful Alert sent to ${recipient.email} (${recipientType})`);
    } catch (error) {
        console.error(`❌ Failed to deliver beautiful alert to ${recipient.email}:`, error.message);
    }
};

/**
 * Sends a vibrant general reminder email focused on the start date.
 */
export const sendGeneralReminder = async (recipient, event) => {
    if (!recipient.email) return;

    const mapsUrl = event.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}` : "";
    const passUrl = `${BACKEND_URL}/api/guests/pass/${recipient._id}`;
    
    const mailOptions = {
        from: `"Planora Reminder" <${EMAIL_USER}>`,
        to: recipient.email,
        subject: `🔔 Quick Reminder: ${event.title} is coming up!`,
        html: `
            <html>
                <head>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Outfit', sans-serif;">
                    <div style="max-width: 600px; margin: 30px auto; padding: 0; border-radius: 28px; background: #ffffff; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
                        <div style="background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'); background-size: cover; background-position: center; padding: 50px 30px; text-align: center; position: relative;">
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.7);"></div>
                            <h1 style="position: relative; z-index: 5; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.03em; color: #0f172a;">Save the Date</h1>
                            <p style="position: relative; z-index: 5; margin: 6px 0 0 0; font-size: 13px; font-weight: 600; color: #475569;">The countdown is officially active</p>
                        </div>
                        
                        <div style="padding: 40px;">
                            <p style="color: #64748b; font-size: 15px; margin-bottom: 6px;">Hello <strong>${recipient.name}</strong>,</p>
                            <p style="color: #334155; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">This is a friendly alert that the event <strong>${event.title}</strong> is scheduled to commence on:</p>
                            
                            <div style="background: #f8fafc; border-radius: 20px; padding: 30px; text-align: center; border: 2px dashed #cbd5e1; margin-bottom: 30px;">
                                <h2 style="margin: 0; font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em;">${event.date}</h2>
                                <p style="margin: 6px 0 0 0; font-size: 10px; font-weight: 800; color: #ec4899; text-transform: uppercase; letter-spacing: 0.15em;">Save the Date</p>
                            </div>

                            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <p style="margin: 0; color: #94a3b8; font-size: 10px; font-weight: 800; text-transform: uppercase;">Destination</p>
                                    <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 700; color: #0f172a;">${event.location || event.city || "Venue TBD"}</p>
                                </div>
                                ${event.location ? `<a href="${mapsUrl}" target="_blank" style="color: #2563eb; font-size: 13px; font-weight: 700; text-decoration: none;">View Map →</a>` : ''}
                            </div>

                            <div style="text-align: center;">
                                <a href="${passUrl}" style="display: inline-block; background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'); background-size: cover; background-position: center; color: #0f172a; padding: 15px 35px; border-radius: 14px; font-weight: 900; text-decoration: none; font-size: 14px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); text-transform: uppercase; border: 1px solid #cbd5e1;">
                                    View Digital Ticket
                                </a>
                            </div>
                        </div>

                        <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">Generated by Planora Smart Event OS.</p>
                        </div>
                    </div>
                </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ General Reminder sent to ${recipient.email}`);
    } catch (error) {
        console.error(`❌ Failed to deliver general reminder to ${recipient.email}:`, error.message);
    }
};
