import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Bourgon Inquiry: ${name}`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; color: #1e293b;">
          <h2 style="color: #b91c1c; font-style: italic; border-bottom: 2px solid #b91c1c; padding-bottom: 10px;">New Concierge Request</h2>
          <p style="margin-top: 20px;"><strong>Client Name:</strong> ${name}</p>
          <p><strong>Client Email:</strong> ${email}</p>
          <div style="background: #f8fafc; padding: 20px; border-left: 4px solid #b91c1c; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; font-size: 12px; text-transform: uppercase; color: #64748b;">Message Detail:</p>
            <p style="line-height: 1.6; margin-top: 10px;">${message}</p>
          </div>
          <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 40px;">SENT VIA BOURGON INDUSTRIES SECURE PORTAL</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}