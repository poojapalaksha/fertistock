// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './ResetPasswordPage.css';

// function ResetPasswordPage() {
//   const [email, setEmail] = useState('');
//   const [step, setStep] = useState(1); // Step 1: Email, Step 2: Verification Code, Step 3: New Password
//   const [verificationCode, setVerificationCode] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmitEmail = (e) => {
//     e.preventDefault();
//     // In a real application, you would send a verification code to the email
//     console.log(`Sending verification code to: ${email}`);
//     setStep(2);
//   };

//   const handleVerifyCode = (e) => {
//     e.preventDefault();
//     // In a real application, you would verify the code
//     console.log(`Verifying code: ${verificationCode}`);
//     setStep(3);
//   };

//   const handleResetPassword = (e) => {
//     e.preventDefault();
    
//     // Validate passwords match
//     if (newPassword !== confirmPassword) {
//       alert("Passwords don't match!");
//       return;
//     }
    
//     // In a real application, you would update the password in your database
//     console.log("Password reset successfully");
    
//     // Navigate back to login page
//     navigate('/login');
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   const handleBackToLogin = () => {
//     navigate('/login');
//   };

//   return (
//     <div className="reset-password-container">
//       <div className="reset-password-box">
//         <div className="logo-area">
//           <h2>FertilizerStock</h2>
//           <p>{step === 1 ? 'Reset Your Password' : 
//              step === 2 ? 'Enter Verification Code' : 
//              'Create New Password'}</p>
//         </div>

//         {/* Step 1: Email Submission */}
//         {step === 1 && (
//           <form onSubmit={handleSubmitEmail}>
//             <div className="form-group">
//               <label htmlFor="email">Email Address</label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter your registered email"
//                 required
//               />
//             </div>
//             <button type="submit" className="reset-button">
//               Send Verification Code
//             </button>
//           </form>
//         )}

//         {/* Step 2: Verification Code */}
//         {step === 2 && (
//           <form onSubmit={handleVerifyCode}>
//             <div className="form-group">
//               <label htmlFor="verification-code">Verification Code</label>
//               <input
//                 type="text"
//                 id="verification-code"
//                 value={verificationCode}
//                 onChange={(e) => setVerificationCode(e.target.value)}
//                 placeholder="Enter the code sent to your email"
//                 required
//               />
//             </div>
//             <button type="submit" className="reset-button">
//               Verify Code
//             </button>
//           </form>
//         )}

//         {/* Step 3: New Password */}
//         {step === 3 && (
//           <form onSubmit={handleResetPassword}>
//             <div className="form-group">
//               <label htmlFor="new-password">New Password</label>
//               <div className="password-input">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="new-password"
//                   value={newPassword}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   placeholder="Enter new password"
//                   required
//                 />
//                 <button 
//                   type="button" 
//                   className="password-toggle" 
//                   onClick={togglePasswordVisibility}
//                 >
//                   {showPassword ? "Hide" : "Show"}
//                 </button>
//               </div>
//             </div>
//             <div className="form-group">
//               <label htmlFor="confirm-password">Confirm Password</label>
//               <div className="password-input">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   id="confirm-password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   placeholder="Confirm new password"
//                   required
//                 />
//               </div>
//             </div>
//             <button type="submit" className="reset-button">
//               Reset Password
//             </button>
//           </form>
//         )}

//         <p className="back-to-login">
//           <button onClick={handleBackToLogin}>Back to Login</button>
//         </p>

//         {/* Footer */}
//         <p className="copyright">© 2025 FertiStock. All rights reserved.</p>
//       </div>
//     </div>
//   );
// }

// export default ResetPasswordPage;