import nodemailer from 'nodemailer'

// Email configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
}

const FROM_EMAIL = process.env.SMTP_FROM || 'Bloomtech ERP <noreply@erpbloom.com>'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

/**
 * Creates a nodemailer transporter instance
 */
function createTransporter() {
  // Check if SMTP is configured
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    console.warn('⚠️  SMTP credentials not configured. Email sending will be disabled.')
    return null
  }

  return nodemailer.createTransport(SMTP_CONFIG)
}

/**
 * Sends a welcome email to a newly created user with their temporary credentials
 */
export async function sendWelcomeEmail(
  userEmail: string,
  temporaryPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      console.warn('Email not sent: SMTP not configured')
      return { 
        success: false, 
        error: 'SMTP not configured. Please set SMTP environment variables.' 
      }
    }

    const mailOptions = {
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Welcome to Bloomtech ERP - Your Account Details',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a237e 0%, #283593 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .credentials { background: white; padding: 20px; border-left: 4px solid #ff6b35; margin: 20px 0; border-radius: 4px; }
            .credential-item { margin: 10px 0; }
            .credential-label { font-weight: bold; color: #555; }
            .credential-value { font-family: 'Courier New', monospace; background: #f0f0f0; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-left: 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #ff6b35; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome to Bloomtech ERP</h1>
              <p style="margin: 10px 0 0;">Your account has been created successfully</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Your Bloomtech ERP account has been created by an administrator. Below are your login credentials:</p>
              
              <div class="credentials">
                <div class="credential-item">
                  <span class="credential-label">Email:</span>
                  <span class="credential-value">${userEmail}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Temporary Password:</span>
                  <span class="credential-value">${temporaryPassword}</span>
                </div>
              </div>

              <div class="warning">
                <strong>⚠️ Important Security Notice</strong>
                <p style="margin: 5px 0 0;">This is a temporary password. Please log in and change your password immediately for security purposes.</p>
              </div>

              <center>
                <a href="${FRONTEND_URL}/login" class="button">Log In to Bloomtech ERP</a>
              </center>

              <p style="margin-top: 30px;">If you have any questions or need assistance, please contact your system administrator.</p>
              
              <p>Best regards,<br><strong>Bloomtech ERP Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Bloomtech ERP. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Bloomtech ERP

Your account has been created successfully!

Login Credentials:
Email: ${userEmail}
Temporary Password: ${temporaryPassword}

⚠️ IMPORTANT: This is a temporary password. Please log in and change your password immediately for security purposes.

Login at: ${FRONTEND_URL}/login

If you have any questions or need assistance, please contact your system administrator.

Best regards,
Bloomtech ERP Team

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} Bloomtech ERP. All rights reserved.
      `
    }

    await transporter.sendMail(mailOptions)
    
    console.log(`✅ Welcome email sent successfully to ${userEmail}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error sending welcome email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email' 
    }
  }
}

/**
 * Sends a password reset email with temporary credentials
 */
export async function sendPasswordResetEmail(
  userEmail: string,
  userName: string,
  temporaryPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      console.warn('Email not sent: SMTP not configured')
      return { 
        success: false, 
        error: 'SMTP not configured. Please set SMTP environment variables.' 
      }
    }

    const mailOptions = {
      from: FROM_EMAIL,
      to: userEmail,
      subject: 'Reset your BloomAudit password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a237e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .password-box { background: white; padding: 20px; border-left: 4px solid #ff6b35; margin: 20px 0; border-radius: 4px; }
            .password { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #1a237e; background: #f0f0f0; padding: 12px; border-radius: 4px; display: inline-block; }
            .footer { text-align: center; margin-top: 30px; color: #777; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Password Reset</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>An administrator has reset the password for your BloomAudit account.</p>
              
              <div class="password-box">
                <p style="margin: 0 0 10px; font-weight: bold;">Your temporary password is:</p>
                <div class="password">${temporaryPassword}</div>
              </div>

              <p><strong>Please log in and change your password immediately.</strong></p>
              
              <p>Login at: <a href="${FRONTEND_URL}/login">${FRONTEND_URL}/login</a></p>

              <p style="margin-top: 20px;">If you didn't request this change, please contact your system administrator immediately.</p>
              
              <p>Best regards,<br><strong>The BloomAudit Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} BloomAudit. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hi ${userName},

An administrator has reset the password for your BloomAudit account.

Your temporary password is: ${temporaryPassword}

Please log in and change your password immediately.

Login at: ${FRONTEND_URL}/login

If you didn't request this change, please contact your system administrator immediately.

Best regards,
The BloomAudit Team

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} BloomAudit. All rights reserved.
      `
    }

    await transporter.sendMail(mailOptions)
    
    console.log(`✅ Password reset email sent successfully to ${userEmail}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending email' 
    }
  }
}

/**
 * Sends a test email to verify SMTP configuration
 */
export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter()
    
    if (!transporter) {
      return { 
        success: false, 
        error: 'SMTP not configured' 
      }
    }

    await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Bloomtech ERP - Email Configuration Test',
      text: 'This is a test email to verify your SMTP configuration is working correctly.'
    })
    
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
