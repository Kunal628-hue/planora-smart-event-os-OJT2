import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an invitation email to a guest with RSVP links.
 * @param {Object} guest - The guest object.
 * @param {string} eventName - The name of the event.
 */
export const sendInvitation = async (guest, eventName) => {
    if (!guest.email) return;

    const rsvpConfirmUrl = `${process.env.BACKEND_URL}/api/guests/rsvp/${guest._id}/Confirmed`;
    const rsvpDeclineUrl = `${process.env.BACKEND_URL}/api/guests/rsvp/${guest._id}/Declined`;

    const mailOptions = {
        from: `"Planora" <${process.env.EMAIL_USER}>`,
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
        console.log(`Invitation sent to ${guest.email}`);
    } catch (error) {
        console.error("Email sending failed:", error);
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
        from: `"Planora Hive" <${process.env.EMAIL_USER}>`,
        to: collaborator.email,
        subject: `Team Invitation: Join ${inviterName} for ${eventName || 'Event Planning'} on Planora`,
        html: `
            <div style="font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f1f5f9; border-radius: 24px; background: #ffffff;">
                <div style="text-align: center; marginBottom: 30px;">
                    <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.04em;">Planora <span style="color: #2563eb;">Hive</span></h1>
                </div>
                
                <h2 style="color: #1e293b; font-size: 20px; font-weight: 700;">Workspace Activation</h2>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6;">Hello <strong>${collaborator.name}</strong>,</p>
                <p style="color: #64748b; font-size: 16px; line-height: 1.6;"><strong>${inviterName}</strong> has invited you to join their operational collective on Planora for the event <strong>${eventName || 'Event Context'}</strong> as a <strong>${collaborator.role}</strong>.</p>
                
                <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin: 30px 0; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8;">Your Access Logic</h3>
                    <p style="margin: 0; color: #1e293b; font-weight: 600;">${collaborator.permissions || "Standard project access"}</p>
                </div>
                
                <p style="color: #64748b; font-size: 16px; line-height: 1.6;">You can now log in to the dashboard to view shared events, manage guests, and synchronize with the lead team.</p>
                
                <div style="text-align: center; margin-top: 40px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #2563eb; color: white; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: 700; display: inline-block; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);">Access Dashboard</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 40px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">This is an automated operational alert from Planora Smart Event OS.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Collaborator invite sent to ${collaborator.email}`);
    } catch (error) {
        console.error("Collaborator email sending failed:", error);
    }
};
