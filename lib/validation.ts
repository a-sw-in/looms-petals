import { z } from 'zod';

// Email validation
export const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email is too long');

// Password validation - at least 8 characters, max 100
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long');

// Name validation
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Phone validation - 10 digits
export const phoneSchema = z.string()
  .regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits');

// Pincode validation - 6 digits
export const pincodeSchema = z.string()
  .regex(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits');

// Address validation
export const addressSchema = z.string()
  .min(10, 'Address must be at least 10 characters')
  .max(500, 'Address is too long');

// Age validation
export const ageSchema = z.number()
  .int('Age must be a whole number')
  .min(13, 'You must be at least 13 years old')
  .max(120, 'Invalid age');

// Gender validation
export const genderSchema = z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
  message: 'Invalid gender selection'
});

// OTP validation
export const otpSchema = z.string()
  .regex(/^[0-9]{6}$/, 'OTP must be exactly 6 digits');

// Message/Subject validation
export const messageSchema = z.string()
  .min(10, 'Message must be at least 10 characters')
  .max(2000, 'Message is too long');

export const subjectSchema = z.string()
  .min(3, 'Subject must be at least 3 characters')
  .max(200, 'Subject is too long');

// Composite schemas for API endpoints
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  otp: otpSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  age: ageSchema.optional(),
  gender: genderSchema.optional(),
});

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: subjectSchema,
  message: messageSchema,
});

// Validation helper functions
export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0].message };
    }
    return { valid: false, error: 'Invalid email' };
  }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  try {
    passwordSchema.parse(password);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0].message };
    }
    return { valid: false, error: 'Invalid password' };
  }
}

export function validatePhone(phone: string): { valid: boolean; error?: string } {
  try {
    phoneSchema.parse(phone);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.issues[0].message };
    }
    return { valid: false, error: 'Invalid phone number' };
  }
}

// Generic validation function
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: `${firstError.path.join('.')}: ${firstError.message}` };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Sanitize input by removing potentially dangerous characters
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

// Sanitize object inputs
export function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (value === null || value === undefined) {
      sanitized[key] = value;
    }
    // Ignore other types (objects, arrays, functions, etc.)
  }
  
  return sanitized;
}
