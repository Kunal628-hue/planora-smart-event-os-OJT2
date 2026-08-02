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
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
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
 * Optimized for 100% Gmail / Outlook Inbox placement (SPF/DKIM friendly).
 * Uses bulletproof table layout without flexbox or absolute positioning to prevent rendering bugs.
 * 
 * @param {Object} guest - The guest object.
 * @param {Object} event - The event object.
 */
export const sendInvitation = async (guest, event) => {
    if (!guest.email || !event) return;

    const eventName = event.title || event.name || "Special Event";
    const eventLocation = event.location || "";
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
        "VIP": { bg: "#f43f5e", text: "#ffffff", name: "VIP PASS" },
        "Tech": { bg: "#2563eb", text: "#ffffff", name: "TECH DELEGATE" },
        "Business": { bg: "#7c3aed", text: "#ffffff", name: "EXECUTIVE PASS" },
        "Friend": { bg: "#10b981", text: "#ffffff", name: "GUEST ACCESS" },
        "Family": { bg: "#ea580c", text: "#ffffff", name: "FAMILY PASS" }
    };
    const categoryConfig = categoryGlows[guest.category] || { bg: "#f97316", text: "#ffffff", name: `${(guest.category || 'GUEST').toUpperCase()} ACCESS` };

    // Resolve Cvent-style custom email configs
    const customEmail = event.registrationConfig?.email;
    const customSubject = customEmail?.subject;
    const customBody = customEmail?.body;

    let finalSubject = `${eventName} — Event Invitation`;
    if (customSubject) {
        finalSubject = customSubject
            .replace(/{name}/gi, guest.name)
            .replace(/{event}/gi, eventName);
    }

    let finalBody = isProfessional 
        ? `You are invited to attend <strong>${eventName}</strong>. Your attendee access badge is ready below.`
        : `We would be happy to have you join us for <strong>${eventName}</strong>. Your access details are below.`;

    if (customBody) {
        finalBody = customBody
            .replace(/{name}/gi, guest.name)
            .replace(/{event}/gi, eventName)
            .replace(/\n/g, "<br />");
    }

    const greetingText = "Event Invitation";
    const entryCodeText = guest.entryCode || (guest._id ? guest._id.substring(guest._id.length - 8).toUpperCase() : "PL-PASS");

    // Plain-text Fallback for Inbox deliverability
    const plainTextContent = `Hello ${guest.name},

You are invited to ${eventName}!

${finalBody.replace(/<[^>]+>/g, '')}

Event Details:
- Date: ${event.date || 'Upcoming'}
- Location: ${eventLocation || 'To Be Announced'}

Confirm Attendance: ${rsvpConfirmUrl}
Decline Invitation: ${rsvpDeclineUrl}
Digital Pass: ${passUrl}

Planora Smart Event OS`;

    // Bulletproof Table HTML for 100% rendering fidelity across Gmail, Apple Mail, Outlook
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${finalSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 20px 40px rgba(0,0,0,0.06);">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 40px 30px; border-bottom: 3px solid #f97316;">
                            <span style="background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.4); color: #f97316; padding: 5px 14px; border-radius: 100px; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase;">
                                ${greetingText}
                            </span>
                            <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 16px 0 0 0; letter-spacing: -0.02em; line-height: 1.25;">
                                ${eventName}
                            </h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 35px 35px 25px 35px; color: #1e293b;">
                            <p style="font-size: 15px; color: #64748b; margin: 0 0 16px 0;">Hello <strong style="color: #0f172a;">${guest.name}</strong>,</p>
                            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 30px 0;">${finalBody}</p>

                            <!-- DIGITAL PASS BADGE CARD (Table-based for bulletproof rendering) -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 380px; margin: 0 auto 30px auto; background: #09090b; border-radius: 20px; border: 1px solid #27272a; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.3);">
                                
                                <!-- Card Header -->
                                <tr>
                                    <td align="center" style="padding: 24px 20px 15px 20px; background: #121214;">
                                        <table width="40" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                                            <tr>
                                                <td style="height: 6px; background: #27272a; border-radius: 10px;"></td>
                                            </tr>
                                        </table>
                                        <p style="margin: 0; font-size: 9px; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.15em;">DIGITAL EVENT BADGE</p>
                                        <h3 style="margin: 6px 0 4px 0; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">${eventName}</h3>
                                        <p style="margin: 0; font-size: 11px; font-weight: 700; color: #f97316; letter-spacing: 0.05em; text-transform: uppercase;">
                                            ${event.date || 'UPCOMING'} ${eventLocation ? '&bull; ' + eventLocation : ''}
                                        </p>
                                    </td>
                                </tr>

                                <!-- Divider -->
                                <tr>
                                    <td align="center" style="padding: 0; border-top: 2px dashed #27272a;"></td>
                                </tr>

                                <!-- Guest Details -->
                                <tr>
                                    <td align="center" style="padding: 24px 20px; background: #09090b;">
                                        <h4 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em;">${guest.name}</h4>
                                        
                                        <!-- Category Tag -->
                                        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                                            <tr>
                                                <td style="background-color: ${categoryConfig.bg}; color: ${categoryConfig.text}; font-size: 10px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; padding: 5px 14px; border-radius: 100px;">
                                                    ${categoryConfig.name}
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Digital Entry Pass Code (Table-based Barcode rendering) -->
                                        <table width="80%" cellpadding="0" cellspacing="0" border="0" style="background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 12px;">
                                            <tr>
                                                <td align="center">
                                                    <p style="margin: 0 0 6px 0; font-size: 9px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">ENTRY PASSCODE</p>
                                                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 900; color: #f97316; letter-spacing: 0.25em;">
                                                        ${entryCodeText}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            ${eventLocation ? `
                            <!-- Venue Block -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f97316; border-radius: 14px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 18px 20px;">
                                        <p style="margin: 0; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;">📍 VENUE LOCATION</p>
                                        <p style="margin: 6px 0 8px 0; color: #0f172a; font-weight: 800; font-size: 15px; line-height: 1.4;">${eventLocation}</p>
                                        <a href="${mapsUrl}" target="_blank" style="color: #2563eb; font-size: 13px; font-weight: 800; text-decoration: none;">Get Directions on Google Maps &rarr;</a>
                                    </td>
                                </tr>
                            </table>
                            ` : ""}

                            <p style="font-size: 14px; color: #475569; text-align: center; margin: 0 0 20px 0;">Please confirm your attendance status to reserve your spot:</p>

                            <!-- Action Buttons Table -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <td style="padding: 6px;">
                                                    <a href="${rsvpConfirmUrl}" target="_blank" style="background-color: #10b981; color: #ffffff; padding: 14px 26px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 6px 16px rgba(16,185,129,0.25);">
                                                        ✓ Confirm Attendance
                                                    </a>
                                                </td>
                                                <td style="padding: 6px;">
                                                    <a href="${rsvpDeclineUrl}" target="_blank" style="background-color: #ef4444; color: #ffffff; padding: 14px 26px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 6px 16px rgba(239,68,68,0.25);">
                                                        ✕ Decline Invite
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
                                <tr>
                                    <td align="center">
                                        <a href="${passUrl}" target="_blank" style="color: #2563eb; font-size: 13px; font-weight: 800; text-decoration: none;">
                                            View Digital Access Pass & Scanner Badge &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 11px; margin: 0; font-weight: 500;">
                                Powered by Planora Smart Event Operating System
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const mailOptions = {
        from: `"Planora" <${EMAIL_USER}>`,
        replyTo: EMAIL_USER,
        to: guest.email,
        subject: finalSubject,
        text: plainTextContent,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Invitation successfully delivered to inbox [${guest.email}]`);
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
