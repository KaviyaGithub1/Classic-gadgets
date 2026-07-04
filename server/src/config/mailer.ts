import nodemailer from 'nodemailer';

let cachedTransporter: any = null;

export async function getTransporter(): Promise<{ transporter: any; isRealSMTP: boolean }> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    console.log(`[Email Setup] Using custom SMTP configuration: ${host}:${port}`);
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: port === '465',
      auth: { user, pass },
    });
    return { transporter, isRealSMTP: true };
  }

  console.warn("-------------------------------------------------------------------");
  console.warn("[SMTP WARNING] SMTP parameters are not configured in server/.env.");
  console.warn("Real welcome emails will not be sent to public inbox addresses.");
  console.warn("Falling back to Ethereal developer sandbox for mail simulation.");
  console.warn("-------------------------------------------------------------------");

  if (cachedTransporter) return { transporter: cachedTransporter, isRealSMTP: false };
  
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email Setup] Ethereal SMTP test account initialized: ${testAccount.user}`);
    return { transporter: cachedTransporter, isRealSMTP: false };
  } catch (error) {
    console.error("Failed to create Ethereal SMTP account, falling back to log emulation", error);
    return { transporter: null, isRealSMTP: false };
  }
}

export async function sendWelcomeEmail(toEmail: string, name: string, username: string, password: string, role: string): Promise<{ emailPreviewUrl: string; isRealSMTP: boolean }> {
  let emailPreviewUrl = '';
  const { transporter, isRealSMTP } = await getTransporter();
  
  if (!transporter) {
    return { emailPreviewUrl: '', isRealSMTP: false };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Classic Gadgets Admin" <admin@classicgadgets.com>',
    to: toEmail,
    subject: 'Welcome to Classic Gadgets! Your Account Credentials',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            padding: 20px;
            margin: 0;
          }
          .card {
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            padding: 30px;
            max-width: 500px;
            margin: 20px auto;
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #334155;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .logo {
            background: #4f46e5;
            color: white;
            font-size: 24px;
            font-weight: bold;
            width: 48px;
            height: 48px;
            line-height: 48px;
            border-radius: 12px;
            display: inline-block;
          }
          .title {
            font-size: 20px;
            font-weight: bold;
            color: white;
            margin-top: 15px;
          }
          .button-container {
            text-align: center;
            margin-top: 25px;
          }
          .btn {
            background: #4f46e5;
            color: white !important;
            text-decoration: none;
            padding: 10px 24px;
            border-radius: 10px;
            font-weight: bold;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">C</div>
            <div class="title">Welcome to Classic Gadgets!</div>
            <p style="color: #94a3b8; font-size: 13px; margin: 5px 0 0 0;">An administrator has set up a new account for you.</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px;">
            <tr style="border-bottom: 1px dashed #334155;">
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; text-align: left;">Full Name</td>
              <td style="padding: 12px 0; font-weight: bold; color: #f1f5f9; font-size: 14px; text-align: right;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #334155;">
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; text-align: left;">Username</td>
              <td style="padding: 12px 0; font-weight: bold; color: #f1f5f9; font-size: 14px; text-align: right;">${username}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #334155;">
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; text-align: left;">Email</td>
              <td style="padding: 12px 0; font-weight: bold; color: #f1f5f9; font-size: 14px; text-align: right;">${toEmail}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #334155;">
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; text-align: left;">Role</td>
              <td style="padding: 12px 0; font-weight: bold; color: #60a5fa; font-size: 14px; text-align: right;">${role}</td>
            </tr>
            <tr style="border-bottom: 1px dashed #334155;">
              <td style="padding: 12px 0; color: #94a3b8; font-size: 14px; text-align: left;">Temporary Password</td>
              <td style="padding: 12px 0; font-weight: bold; color: #f43f5e; font-size: 14px; text-align: right; font-family: monospace;">${password}</td>
            </tr>
          </table>
          
          <div class="button-container">
            <a href="http://localhost:3000/login" class="btn">Log In Now</a>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (isRealSMTP) {
      await transporter.sendMail(mailOptions);
      console.log("----------------------------------------");
      console.log(`[EMAIL SUCCESS] Sent actual credential email to real inbox: ${toEmail}`);
      console.log("----------------------------------------");
    } else {
      const info = await transporter.sendMail(mailOptions);
      emailPreviewUrl = nodemailer.getTestMessageUrl(info) || '';
      console.log("----------------------------------------");
      console.log(`[EMAIL SUCCESS] Sent developer mock email to ${toEmail}`);
      console.log(`[EMAIL PREVIEW] Ethereal URL: ${emailPreviewUrl}`);
      console.log("----------------------------------------");
    }
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }

  return { emailPreviewUrl, isRealSMTP };
}
