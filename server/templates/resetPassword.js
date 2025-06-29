// Reset password email template generator
const generateResetPasswordTemplate = (resetUrl, firstname = "dear") => {
  const year = new Date().getFullYear();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f9fafb;">

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9fafb; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background:white; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05); overflow:hidden; padding: 30px;">
          <tr>
            <td style="text-align:center; padding-bottom: 20px;">
              <h2 style="font-size:24px; font-weight:700; color:#111827; margin:0;">Reset Your Password</h2>
            </td>
          </tr>
          <tr>
            <td style="font-size:16px; color:#4b5563; padding-bottom: 20px;">
              <p style="margin:0;">Hi ${firstname},</p>
              <p style="margin:8px 0 0;">You recently requested to reset your password. Click the button below to proceed. This link is valid for 5 minutes.</p>
            </td>
          </tr>
          <tr>
            <td style="text-align:center; padding: 24px 0;">
              <a href="${resetUrl}" style="display:inline-block; background-color:#2563eb; color:#ffffff; padding:12px 24px; font-size:16px; font-weight:600; border-radius:6px; text-decoration:none;">Reset Password</a>
            </td>
          </tr>
          <tr>
            <td style="font-size:14px; color:#6b7280; text-align:center;">
              If you didn’t request a password reset, you can safely ignore this email.
            </td>
          </tr>
          <tr>
            <td style="text-align:center; padding-top:30px; font-size:12px; color:#9ca3af;">
              &copy; ${year} Smart Commerce. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

// Export the reset password email template generator
module.exports = {
  generateResetPasswordTemplate
};