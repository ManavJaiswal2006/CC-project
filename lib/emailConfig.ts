/**
 * Centralized Email Configuration
 * 
 * This module provides a centralized way to manage different email addresses
 * and credentials for different purposes (orders, refunds, contact, etc.)
 * 
 * Supports multiple Gmail accounts with different passwords for each purpose.
 */

export type EmailType = 
  | "orders" 
  | "refunds" 
  | "contact" 
  | "distributor" 
  | "security" 
  | "admin";

/**
 * Get the email address for a specific type
 * Falls back to EMAIL_USER if specific email is not configured
 */
export function getEmailFrom(type: EmailType): string {
  const emailMap: Record<EmailType, string | undefined> = {
    orders: process.env.EMAIL_ORDERS_USER || process.env.EMAIL_ORDERS,
    refunds: process.env.EMAIL_REFUNDS_USER || process.env.EMAIL_REFUNDS,
    contact: process.env.EMAIL_CONTACT_USER || process.env.EMAIL_CONTACT,
    distributor: process.env.EMAIL_DISTRIBUTOR_USER || process.env.EMAIL_DISTRIBUTOR,
    security: process.env.EMAIL_SECURITY_USER || process.env.EMAIL_SECURITY,
    admin: process.env.ADMIN_EMAIL_USER || process.env.ADMIN_EMAIL,
  };

  return emailMap[type] || process.env.EMAIL_USER || "";
}

/**
 * Get the password for a specific email type
 * Falls back to EMAIL_PASS if specific password is not configured
 */
export function getEmailPass(type: EmailType): string {
  const passMap: Record<EmailType, string | undefined> = {
    orders: process.env.EMAIL_ORDERS_PASS,
    refunds: process.env.EMAIL_REFUNDS_PASS,
    contact: process.env.EMAIL_CONTACT_PASS,
    distributor: process.env.EMAIL_DISTRIBUTOR_PASS,
    security: process.env.EMAIL_SECURITY_PASS,
    admin: process.env.ADMIN_EMAIL_PASS,
  };

  return passMap[type] || process.env.EMAIL_PASS || "";
}

/**
 * Get the appropriate "to" email address for admin notifications
 * Falls back to EMAIL_USER if ADMIN_EMAIL is not configured
 */
export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL_USER || process.env.ADMIN_EMAIL || process.env.EMAIL_USER || "";
}

/**
 * Get the display name for the email sender based on type
 */
export function getEmailDisplayName(type: EmailType): string {
  const nameMap: Record<EmailType, string> = {
    orders: "Bourgon Orders",
    refunds: "Bourgon Refunds",
    contact: "Bourgon Concierge",
    distributor: "Bourgon Industries",
    security: "Bourgon Security",
    admin: "Bourgon Admin",
  };

  return nameMap[type];
}

/**
 * Get the full "from" field with display name and email
 */
export function getEmailFromField(type: EmailType): string {
  const email = getEmailFrom(type);
  const displayName = getEmailDisplayName(type);
  return `"${displayName}" <${email}>`;
}

/**
 * Check if email service is configured for a specific type
 * Falls back to checking base EMAIL_USER/EMAIL_PASS if type-specific not configured
 */
export function isEmailConfigured(type?: EmailType): boolean {
  if (type) {
    const email = getEmailFrom(type);
    const pass = getEmailPass(type);
    return !!(email && pass);
  }
  // Check base configuration
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

/**
 * Get SMTP configuration for nodemailer for a specific email type
 * Uses type-specific credentials if available, otherwise falls back to base credentials
 */
export function getEmailTransporterConfig(type: EmailType) {
  const email = getEmailFrom(type);
  const pass = getEmailPass(type);
  
  return {
    service: "gmail" as const,
    auth: {
      user: email,
      pass: pass,
    },
    // Improve deliverability
    pool: true, // Use connection pooling
    maxConnections: 1,
    maxMessages: 3,
    rateDelta: 1000, // 1 second
    rateLimit: 5, // 5 messages per rateDelta
    // Additional security settings
    secure: true,
    tls: {
      rejectUnauthorized: false, // For Gmail SMTP
    },
  };
}

/**
 * Get reply-to email address for a specific type
 */
export function getReplyToEmail(type: EmailType): string {
  // Use contact email for replies, or fallback to the sending email
  return getEmailFrom("contact") || getEmailFrom(type) || "";
}

