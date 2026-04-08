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
