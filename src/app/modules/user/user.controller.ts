import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from './user.model.js';
import { sendPasswordResetEmail } from '../../../utils/emailService.js';
// Adjust path based on your structure

// REGISTER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// LOGIN
export const signInUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    user.token = token;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// LOGOUT
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token missing',
      });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid token',
      });
    }

    user.token = '';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Logout failed'
    });
  }
};

// FORGOT PASSWORD - Send OTP
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log('🔍 Forgot password request for:', email);

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    console.log('✅ User found:', user.email);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔢 Generated OTP:', otp);

    // Set OTP and expiration (10 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    console.log('💾 OTP saved to database');

    // Send OTP via email
    try {
      await sendPasswordResetEmail(email, otp);
      console.log('📧 Email sent successfully');
    } catch (emailError: any) {
      console.error('❌ Email sending failed:', emailError);
      
      // Clean up OTP if email fails
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: `Failed to send email: ${emailError.message}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
    });
  } catch (error: any) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process forgot password request',
    });
  }
};

// VERIFY OTP
export const verifyResetOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    console.log('🔍 Verifying OTP for:', email);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpire: { $gt: new Date() },
    });

    if (!user) {
      console.log('❌ Invalid or expired OTP');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    console.log('✅ OTP verified');

    // Generate reset token for the next step
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    console.log('🔑 Reset token generated');

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
    });
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP',
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    console.log('🔍 Resetting password with token');

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required',
      });
    }

    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      console.log('❌ Invalid or expired reset token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    console.log('✅ Reset token verified');

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('✅ Password reset successful');

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
    });
  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password',
    });
  }
};

// RESEND OTP (Optional)
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    console.log('🔍 Resend OTP request for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email',
    });
  } catch (error: any) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resend OTP',
    });
  }
};