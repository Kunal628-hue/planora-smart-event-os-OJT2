import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// --- Dynamic Environment Resolution ---
// We dynamically resolve application URLs to ensure the mailer points to the correct tactical environment.
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : "";
const BACKEND_URL = process.env.BACKEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5001");
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
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Email Service Verification Failed:", error.message);
        console.log("💡 Suggestion: Check EMAIL_USER and EMAIL_PASS in your .env file.");
    } else {
        console.log("✅ Email Service is ready to deliver messages");
    }
});

/**
 * Sends a 6-digit OTP code to a user for email verification.
 * @param {string} email - The user's email address.
 * @param {string} code - The 6-digit verification code.
 */
export const sendOTPMail = async (email, code) => {
    if (!email) return;

    const mailOptions = {
        from: `"Planora Security" <${EMAIL_USER}>`,
        to: email,
        subject: `${code} is your Planora verification code`,
        html: `
            <div style="font-family: 'Outfit', 'Segoe UI', sans-serif; max-width: 480px; margin: auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background: #ffffff; text-align: center;">
                <div style="margin-bottom: 30px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.04em;">Planora <span style="color: #2563eb;">Security</span></h1>
                </div>
                
                <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-bottom: 8px;">Verification Required</h2>
                <p style="color: #64748b; font-size: 15px; margin-bottom: 30px;">Use the code below to complete your authentication process. This code is valid for <strong>5 minutes</strong>.</p>
                
                <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #2563eb;">${code}</span>
                </div>
                
                <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">If you did not request this verification, please ignore this email or contact support if you have security concerns.</p>
                
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;" />
                <p style="color: #cbd5e1; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Planora Smart Event OS • Confidential</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification OTP sent to ${email}`);
    } catch (error) {
        console.error(`❌ OTP delivery failed [${email}]:`, error.message);
    }
};

/**
 * Sends an invitation email to a guest with RSVP links.
 * @param {Object} guest - The guest object.
 * @param {string} eventName - The name of the event.
 */
export const sendInvitation = async (guest, eventName) => {
    if (!guest.email) return;

    const rsvpConfirmUrl = `${BACKEND_URL}/api/guests/rsvp/${guest._id}/Confirmed`;
    const rsvpDeclineUrl = `${BACKEND_URL}/api/guests/rsvp/${guest._id}/Declined`;

    const mailOptions = {
        from: `"Planora" <${EMAIL_USER}>`,
        to: guest.email,
        subject: `Invitation: ${eventName}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb;">You're Invited!</h2>
                <p>Hello <strong>${guest.name}</strong>,</p>
                <p>You have been invited to the event: <strong>${eventName}</strong>.</p>
                <p>Please let us know if you can attend by clicking one of the buttons below:</p>
                
                <div style="margin: 30px 0; display: flex; gap: 15px;">
                    <a href="${rsvpConfirmUrl}" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirm Attendance</a>
                    &nbsp;&nbsp;
                    <a href="${rsvpDeclineUrl}" style="background-color: #ef4444; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Decline Invite</a>
                </div>
                
                <p style="color: #64748b; font-size: 0.9rem;">This invitation was sent via Planora Smart Event OS.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Invitation sent to ${guest.email}`);
    } catch (error) {
        console.error(`❌ Guest email delivery failed [${guest.email}]:`, error.message);
        if (error.code === 'EAUTH') {
            console.error("Authentication failed. Please verify your Google App Password.");
        }
    }
};

/**
 * Sends a welcome email to a new team collaborator.
 * @param {Object} collaborator - The collaborator object.
 * @param {string} inviterName - The name of the person who invited them.
 * @param {string} eventName - The name of the event they are invited to.
 */
export const sendCollaboratorInvite = async (collaborator, inviterName, eventName) => {
    if (!collaborator.email) return;

    const mailOptions = {
        from: `"Planora Hive" <${EMAIL_USER}>`,
        to: collaborator.email,
        subject: `Team Invitation: Join ${inviterName} for ${eventName || 'Event Planning'} on Planora`,
        html: `
            <div style="font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background: #ffffff;">
                <div style="text-align: center; marginBottom: 30px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.04em;">Planora <span style="color: #2563eb;">Hive</span></h1>
                </div>
                
                <h2 style="color: #1e292b; font-size: 20px; font-weight: 700;">Workspace Activation</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Hello <strong>${collaborator.name}</strong>,</p>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6;"><strong>${inviterName}</strong> has invited you to join their operational collective on Planora for the event <strong>${eventName || 'Event Context'}</strong> as a <strong>${collaborator.role}</strong>.</p>
                
                <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 30px 0; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">Your Access Logic</h3>
                    <p style="margin: 0; color: #1e293b; font-weight: 600;">${collaborator.permissions || "Standard project access"}</p>
                </div>
                
                <p style="color: #64748b; font-size: 16px; line-height: 1.6;">You can now log in to the dashboard to view shared events, manage guests, and synchronize with the lead team.</p>
                
                <div style="text-align: center; margin-top: 40px;">
                    <a href="${FRONTEND_URL}/login" style="background-color: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: 700; display: inline-block; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);">Access Dashboard</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 40px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated operational alert from Planora Smart Event OS.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Collaborator invite sent to ${collaborator.email}`);
    } catch (error) {
        console.error(`❌ Collaborator email delivery failed [${collaborator.email}]:`, error.message);
        if (error.code === 'EAUTH') {
            console.error("Authentication failed. Please verify your Google App Password.");
        }
    }
};

/**
 * Sends a polite rejection email for tech/college event applications.
 * @param {Object} guest - The guest/applicant object.
 * @param {string} eventName - The name of the event.
 */
export const sendRejectionMail = async (guest, eventName) => {
    if (!guest.email) return;

    const mailOptions = {
        from: `"Planora Selection Committee" <${EMAIL_USER}>`,
        to: guest.email,
        subject: `Update regarding your application for ${eventName}`,
        html: `
            <div style="font-family: 'Inter', 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.04em;">Planora <span style="color: #64748b;">Events</span></h1>
                </div>
                
                <h2 style="color: #1e293b; font-size: 18px; font-weight: 700; margin-bottom: 20px;">Regarding your application</h2>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Dear <strong>${guest.name}</strong>,</p>
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Thank you for your interest in joining us for <strong>${eventName}</strong>. We received an overwhelming number of high-quality applications this year, which made our selection process incredibly difficult.</p>
                
                <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 30px 0; border: 1px solid #e2e8f0;">
                    <p style="margin: 0; color: #64748b; font-style: italic; line-height: 1.5;">After a thorough review of your profile and background, we regret to inform you that we are unable to offer you a spot for this specific event.</p>
                </div>
                
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">Please keep in mind that our decision is based solely on the current event capacity and the specific requirements for this session. It is by no means a reflection of your talent or potential.</p>
                
                <p style="color: #475569; font-size: 15px; line-height: 1.6;">We will keep your details in our talent registry for future opportunities that align with your profile. Thank you for your understanding and for being part of our community.</p>
                
                <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                    <p style="color: #94a3b8; font-size: 13px; margin: 0;">Warm regards,</p>
                    <p style="color: #1e293b; font-weight: 700; font-size: 14px; margin: 4px 0 0;">The Selection Team</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`❌ Rejection notice delivered to ${guest.email}`);
    } catch (error) {
        console.error(`❌ Failed to deliver rejection mail to ${guest.email}:`, error.message);
    }
};
