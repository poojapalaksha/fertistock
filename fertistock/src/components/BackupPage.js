// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import './BackupPage.css';

// function BackupPage() {
//   const navigate = useNavigate();
//   const [backupLogs] = useState([
//     { time: 'Jan 15, 2025 14:30', action: 'System Backup Created', performedBy: 'John Admin', status: 'Success' },
//     { time: 'Jan 14, 2025 10:00', action: 'Login', performedBy: 'Jane User', status: 'Success' },
//     { time: 'Jan 13, 2025 16:15', action: 'Backup Downloaded', performedBy: 'John Admin', status: 'Success' },
//     { time: 'Jan 12, 2025 09:45', action: 'Inventory Updated', performedBy: 'Mike Manager', status: 'Success' },
//     { time: 'Jan 11, 2025 11:20', action: 'Sales Record Created', performedBy: 'Sarah Sales', status: 'Success' },
//     { time: 'Jan 10, 2025 18:00', action: 'System Backup Created', performedBy: 'John Admin', status: 'Success' },
//     { time: 'Jan 9, 2025 14:00', action: 'Login', performedBy: 'David User', status: 'Success' },
//     { time: 'Jan 8, 2025 12:30', action: 'Backup Downloaded', performedBy: 'John Admin', status: 'Success' },
//     { time: 'Jan 7, 2025 08:00', action: 'Inventory Updated', performedBy: 'Emily Employee', status: 'Success' },
//     { time: 'Jan 6, 2025 15:40', action: 'Sales Record Created', performedBy: 'Robert Rep', status: 'Success' },
//     { time: 'Jan 5, 2025 20:00', action: 'System Backup Created', performedBy: 'John Admin', status: 'Success' },
//     { time: 'Jan 4, 2025 07:15', action: 'Login', performedBy: 'Jessica User', status: 'Success' },
//     { time: 'Jan 3, 2025 19:25', action: 'Backup Downloaded', performedBy: 'John Admin', status: 'Success' },
//     { time: 'Jan 2, 2025 11:05', action: 'Inventory Updated', performedBy: 'Kevin Clerk', status: 'Success' },
//     { time: 'Jan 1, 2025 17:55', action: 'Sales Record Created', performedBy: 'Nicole Agent', status: 'Success' },
//   ]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const logsPerPage = 5;

//   // Get current logs
//   const indexOfLastLog = currentPage * logsPerPage;
//   const indexOfFirstLog = indexOfLastLog - logsPerPage;
//   const currentLogs = backupLogs.slice(indexOfFirstLog, indexOfLastLog);

//   const totalPages = Math.ceil(backupLogs.length / logsPerPage);  // Defined here, before paginate

//   // Function to handle page navigation
//   const paginate = (pageNumber: number) => {
//     if (pageNumber < 1 || pageNumber > totalPages) return;
//     setCurrentPage(pageNumber);
//   };

//   const handleBackupNow = () => {
//     navigate('/backup/loading');
//     setTimeout(() => {
//       alert('Backup completed!');
//       navigate('/backup');
//     }, 3000);
//   };

//   const handleDownloadBackup = () => {
//     alert('Backup download initiated!');
//   };

//   return (
//     <div className="backup-container">
//       {/* Sidebar */}
//       <div className="sidebar">
//         <div className="logo">FertilizerStock</div>
//         <ul className="nav-links">
//           <li>
//             <Link to="/dashboard">
//               {/* Dashboard Icon */} Dashboard
//             </Link>
//           </li>
//           <li>
//             <Link to="/inventory">
//               {/* Inventory Icon */} Inventory
//             </Link>
//           </li>
//           <li>
//             <Link to="/sales">
//               {/* Sales Icon */} Sales
//             </Link>
//           </li>
//           <li>
//             <Link to="/stock">
//               {/* Stock Icon */} Stock
//             </Link>
//           </li>
//           <li>
//             <Link to="/notifications">
//               {/* Notifications Icon */} Notifications
//             </Link>
//           </li>
//           <li className="active">
//             <Link to="/backup">
//               {/* Backup Icon */} Backup
//             </Link>
//           </li>
//           <li>
//             <Link to="/">
//               {/* Logout Icon */} Logout
//             </Link>
//           </li>
//         </ul>
//       </div>

//       {/* Main Content */}
//       <div className="main-content">
//         <header>
//           <h2>System Administration</h2>
//           <div className="admin-info">Admin User {/* User Avatar */}</div>
//         </header>
//         <div className="backup-section">
//           <h3>{/* Database Icon */} Data Backup</h3>
//           <div className="backup-actions">
//             <button className="backup-now-button" onClick={handleBackupNow}>
//               Backup Now
//             </button>
//             <button className="download-backup-button" onClick={handleDownloadBackup}>
//               {/* Download Icon */} Download Backup
//             </button>
//           </div>
//           <div className="backup-info">
//             <div className="info-item">
//               <span>Last Backup</span>
//               <span>Jan 15, 2025 14:30</span>
//             </div>
//             <div className="info-item">
//               <span>Backup Size</span>
//               <span>2.4 GB</span>
//             </div>
//             <div className="info-item">
//               <span>Total Backups</span>
//               <span>24</span>
//             </div>
//           </div>
//         </div>

//         <div className="system-logs">
//           <h3>{/* Logs Icon */} System Logs</h3>
//           <div className="logs-table">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Date & Time</th>
//                   <th>Action Performed</th>
//                   <th>Performed By</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentLogs.map((log, index) => (
//                   <tr key={index}>
//                     <td>{log.time}</td>
//                     <td>{log.action}</td>
//                     <td>{log.performedBy}</td>
//                     <td className={`status-${log.status.toLowerCase()}`}>{log.status}</td>
//                   </tr>
//                 ))}
//                 {backupLogs.length === 0 && <p>No system logs available.</p>}
//               </tbody>
//             </table>
//             {/* Pagination */}
//             <div className="pagination">
//               <button
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 Previous
//               </button>
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                 <button
//                   key={page}
//                   onClick={() => paginate(page)}
//                   className={currentPage === page ? 'active' : ''}
//                 >
//                   {page}
//                 </button>
//               ))}
//               <button
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default BackupPage;
