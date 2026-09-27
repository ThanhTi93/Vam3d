import nodemailer from "nodemailer";

interface SendOtpParams {
  to: string;
  username: string;
  otp: string;
}

interface SendNewPasswordParams {
  to: string;
  username: string;
  newPassword: string;
}

/**
 * Creates nodemailer transporter using SMTP environment variables.
 * Defaults to Gmail SMTP (smtp.gmail.com).
 */
function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || "";
  const pass = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Returns a strictly verified FROM address that matches the SMTP authenticated user.
 * This is crucial to prevent Gmail, Outlook, and Yahoo from flagging the email as Spam/Spoofing.
 */
function getFromAddress(): string {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  if (user) {
    return `"Vam3D Tu Tiên" <${user}>`;
  }
  return process.env.EMAIL_FROM || "Vam3D Tu Tiên <support@vam3d.com>";
}

/**
 * Sends a 6-digit OTP verification email for password reset.
 * Optimized with anti-spam compliance:
 * 1. Strict FROM alignment matching SMTP_USER (prevents SPF/DKIM fail).
 * 2. Multi-part MIME with both HTML and plain-text body.
 * 3. Standard transactional headers.
 */
export async function sendOtpEmail({
  to,
  username,
  otp,
}: SendOtpParams): Promise<{ sent: boolean; message?: string }> {
  const transporter = getTransporter();
  const from = getFromAddress();
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();

  // Spaced digits for readability: "5  8  2  9  1  4"
  const spacedOtp = otp.split("").join("  ");

  // Plain-text alternative (CRITICAL for anti-spam rating)
  const plainText = [
    `Kính chào đạo hữu ${username},`,
    ``,
    `Hệ thống Vam3D nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.`,
    ``,
    `MÃ XÁC THỰC OTP (Hiệu lực trong 10 phút):`,
    `>>>>>  ${otp}  <<<<<`,
    ``,
    `LƯU Ý BẢO MẬT:`,
    `- Tuyệt đối không chia sẻ mã này cho bất kỳ ai.`,
    `- Ban quản trị Vam3D không bao giờ chủ động yêu cầu bạn cung cấp mã OTP.`,
    `- Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua thư này.`,
    ``,
    `Trân trọng,`,
    `Đội ngũ Vam3D Tu Tiên`,
  ].join("\n");

  const emailHtml = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="vi">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Mã xác thực OTP Vam3D</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0d14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #0b0d14; padding: 25px 0;">
        <tr>
          <td align="center" style="padding: 0 15px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #151824; border: 1px solid #2a2f45; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              
              <!-- Brand Header -->
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 24px 20px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                    VAM3D TU TIÊN
                  </h1>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #fed7aa; font-weight: 500;">
                    Hệ thống xác thực tài khoản an toàn
                  </p>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 30px 25px;">
                  <p style="margin: 0 0 14px 0; font-size: 15px; color: #fdba74; font-weight: bold;">
                    Chào đạo hữu ${username},
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                    Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với địa chỉ email này. Dưới đây là mã xác thực OTP của bạn:
                  </p>

                  <!-- OTP Highlight Box -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d101d; border: 2px dashed #f97316; border-radius: 12px; margin: 20px 0;">
                    <tr>
                      <td align="center" style="padding: 22px 15px;">
                        <div style="font-size: 11px; font-weight: bold; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
                          MÃ XÁC THỰC OTP (GỒM 6 SỐ)
                        </div>
                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #fbbf24;">
                          ${spacedOtp}
                        </div>
                        <div style="display: inline-block; margin-top: 10px; background-color: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 20px; padding: 4px 14px; font-size: 11px; color: #fdba74; font-weight: 600;">
                          ⏱️ Hiệu lực trong 10 phút
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Security Warning -->
                  <p style="margin: 20px 0 0 0; font-size: 12px; line-height: 1.6; color: #94a3b8; text-align: center;">
                    🔒 <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã này cho bất kỳ ai. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua thư này, tài khoản của bạn vẫn an toàn.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #0e101a; padding: 18px 25px; border-top: 1px solid #1f2438; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                    Thư này được gửi tự động từ hệ thống Vam3D.<br />
                    Vui lòng không trả lời trực tiếp email này.
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

  if (!transporter) {
    console.warn("⚠️ SMTP credentials (SMTP_USER & SMTP_PASS) not configured in .env.local.");
    console.log(`🔑 [DEV-FALLBACK] 6-digit OTP for ${to} (${username}) is: ${otp}`);
    return {
      sent: false,
      message: "Chưa cấu hình SMTP_USER / SMTP_PASS trong .env.local. Mã OTP hiển thị ở chế độ phát triển.",
    };
  }

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: user || undefined,
      subject: `[Vam3D] Mã xác thực OTP đặt lại mật khẩu: ${otp}`,
      text: plainText,
      html: emailHtml,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
      },
    });
    console.log(`✅ Reset password OTP sent successfully to ${to}`);
    return { sent: true };
  } catch (error: any) {
    console.error("❌ Failed to send reset password OTP via SMTP:", error);
    return { sent: false, message: error.message };
  }
}

/**
 * Sends an email with the newly generated password to the user.
 */
export async function sendNewPasswordEmail({
  to,
  username,
  newPassword,
}: SendNewPasswordParams): Promise<{ sent: boolean; message?: string }> {
  const transporter = getTransporter();
  const from = getFromAddress();
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const plainText = [
    `Kính chào đạo hữu ${username},`,
    ``,
    `Mật khẩu mới của bạn trên hệ thống Vam3D đã được thiết lập thành công.`,
    ``,
    `MẬT KHẨU MỚI:`,
    `>>>>>  ${newPassword}  <<<<<`,
    ``,
    `Đăng nhập ngay tại: ${siteUrl}/login`,
    ``,
    `Lưu ý: Vì lý do an toàn, vui lòng đổi lại mật khẩu cá nhân sau khi đăng nhập.`,
    ``,
    `Trân trọng,`,
    `Đội ngũ Vam3D Tu Tiên`,
  ].join("\n");

  const emailHtml = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="vi">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Cấp Mật Khẩu Mới - Vam3D</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b0d14; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #0b0d14; padding: 25px 0;">
        <tr>
          <td align="center" style="padding: 0 15px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #151824; border: 1px solid #2a2f45; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <tr>
                <td align="center" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px 20px; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">
                    VAM3D TU TIÊN
                  </h1>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #a7f3d0; font-weight: 500;">
                    Mật khẩu mới đã được cập nhật
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 25px;">
                  <p style="margin: 0 0 14px 0; font-size: 15px; color: #6ee7b7; font-weight: bold;">
                    Chào đạo hữu ${username},
                  </p>
                  <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #cbd5e1;">
                    Mật khẩu đăng nhập cho tài khoản của bạn đã được thiết lập thành công:
                  </p>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0d101d; border: 2px dashed #10b981; border-radius: 12px; margin: 20px 0;">
                    <tr>
                      <td align="center" style="padding: 20px 15px;">
                        <div style="font-size: 11px; font-weight: bold; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                          MẬT KHẨU MỚI CỦA BẠN
                        </div>
                        <div style="font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #34d399;">
                          ${newPassword}
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div style="text-align: center; margin: 25px 0 10px 0;">
                    <a href="${siteUrl}/login" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 10px; font-weight: bold; font-size: 13px;">
                      Đăng Nhập Ngay
                    </a>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #0e101a; padding: 18px 25px; border-top: 1px solid #1f2438; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.5;">
                    Thư này được gửi tự động từ hệ thống Vam3D.
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

  if (!transporter) {
    console.warn("⚠️ SMTP credentials (SMTP_USER & SMTP_PASS) not configured in .env.local.");
    console.log(`🔑 [DEV-FALLBACK] New password for ${to} (${username}) is: ${newPassword}`);
    return {
      sent: false,
      message: "Chưa cấu hình thông tin SMTP_USER / SMTP_PASS trong file môi trường .env.local.",
    };
  }

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: user || undefined,
      subject: `[Vam3D] Mật khẩu mới cho tài khoản ${username}`,
      text: plainText,
      html: emailHtml,
    });
    console.log(`✅ Reset password email sent successfully to ${to}`);
    return { sent: true };
  } catch (error: any) {
    console.error("❌ Failed to send reset password email via SMTP:", error);
    return { sent: false, message: error.message };
  }
}
