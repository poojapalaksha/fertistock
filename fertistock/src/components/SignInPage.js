// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './SignInPage.css';

// function SignInPage() {
//   const [userId, setUserId] = useState('');
//   const [email, setEmail] = useState('');
//   const [name, setName] = useState('');
//   const [role, setRole] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [errors, setErrors] = useState({});
//   const [successMessage, setSuccessMessage] = useState('');
//   const navigate = useNavigate();

//   const handleSignIn = () => {
//     const validationErrors = {};
//     setSuccessMessage(''); // Clear previous message

//     if (!userId.trim()) {
//       validationErrors.userId = 'User ID is required';
//     }
//     if (!email.trim()) {
//       validationErrors.email = 'Email is required';
//     } else if (!/^\S+@\S+$/.test(email)) {
//       validationErrors.email = 'Invalid email format';
//     }
//     if (!name.trim()) {
//       validationErrors.name = 'Name is required';
//     }
//     if (!role) {
//       validationErrors.role = 'Role is required';
//     }
//     if (!password.trim()) {
//       validationErrors.password = 'Password is required';
//     } else if (password.length < 8) {
//       validationErrors.password = 'Password must be at least 8 characters';
//     }
//     if (!confirmPassword.trim()) {
//       validationErrors.confirmPassword = 'Confirm Password is required';
//     } else if (confirmPassword !== password) {
//       validationErrors.confirmPassword = 'Passwords do not match';
//     }

//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       console.log({ userId, email, name, role, password });

//       setSuccessMessage('Sign in successful!');
      
//       // Clear the form after success
//       setUserId('');
//       setEmail('');
//       setName('');
//       setRole('');
//       setPassword('');
//       setConfirmPassword('');

//       // Optional: Navigate after short delay
//       setTimeout(() => navigate('/dashboard'), 1500);
//     }
//   };

//   return (
//     <div className="sign-in-container">
//       <div className="sign-in-box">
//         <h2>Sign In</h2>
//         <p>Create an account to get started.</p>

//         {successMessage && <p className="success-message">{successMessage}</p>}

//         <div className="form-group">
//           <label htmlFor="userId">User ID</label>
//           <input
//             type="text"
//             id="userId"
//             value={userId}
//             onChange={(e) => setUserId(e.target.value)}
//             placeholder="Enter User ID"
//           />
//           {errors.userId && <p className="error-message">{errors.userId}</p>}
//         </div>

//         <div className="form-group">
//           <label htmlFor="email">Email</label>
//           <input
//             type="email"
//             id="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="Enter your email"
//           />
//           {errors.email && <p className="error-message">{errors.email}</p>}
//         </div>

//         <div className="form-group">
//           <label htmlFor="name">Name</label>
//           <input
//             type="text"
//             id="name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             placeholder="Enter your name"
//           />
//           {errors.name && <p className="error-message">{errors.name}</p>}
//         </div>

//         <div className="form-group">
//           <label htmlFor="role">Role</label>
//           <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
//             <option value="">Select your role</option>
//             <option value="admin">Admin</option>
//             <option value="user">User</option>
//           </select>
//           {errors.role && <p className="error-message">{errors.role}</p>}
//         </div>

//         <div className="form-group">
//           <label htmlFor="password">Password</label>
//           <input
//             type="password"
//             id="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="Enter your password"
//           />
//           {errors.password && <p className="error-message">{errors.password}</p>}
//         </div>

//         <div className="form-group">
//           <label htmlFor="confirmPassword">Confirm Password</label>
//           <input
//             type="password"
//             id="confirmPassword"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             placeholder="Confirm your password"
//           />
//           {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
//         </div>

//         <button type="button" className="sign-in-button" onClick={handleSignIn}>
//           Sign In
//         </button>
//       </div>
//     </div>
//   );
// }

// export default SignInPage;
