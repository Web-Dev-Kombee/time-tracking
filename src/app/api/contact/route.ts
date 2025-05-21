import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";

// Define validation schema for contact form data
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Email configuration type
interface EmailConfig {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async ({ email, subject, message }: EmailConfig) => {
  // Create reusable transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASSWORD || "",
    },
  });

  try {
    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@timetracker.com",
      to: email,
      subject: subject,
      html: message,
    });

    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate form data
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        { message: "Invalid form data", errors: result.error.format() },
        { status: 400 }
      );
    }

    // Destructure validated data
    const { name, email, subject, message } = result.data;

    // Send notification email to support
    const emailSent = await sendEmail({
      email: process.env.CONTACT_EMAIL || "support@timetracker.com",
      subject: `New contact form submission: ${subject}`,
      message: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    if (!emailSent) {
      console.warn("Failed to send email notification for contact form submission");
    }

    // Return success response
    return NextResponse.json({ message: "Contact form submitted successfully" });
  } catch (error) {
    console.error("Contact form submission error:", error);

    // Return error response
    return NextResponse.json(
      { message: "Failed to process contact form submission" },
      { status: 500 }
    );
  }
}
