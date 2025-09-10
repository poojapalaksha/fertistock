import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [loggedInUser, setLoggedInUser] = useState('');
    const [showPassword, setShowPassword] = useState(false); // New state for password visibility

    useEffect(() => {
        // Fetch all users
        fetchUsers();

        // Get logged-in user from localStorage
        // IMPORTANT: In a real app, use AuthContext for this, not direct localStorage access for user ID.
        // This assumes 'userId' is stored in localStorage after login.
        const user = localStorage.getItem('userId');
        if (user) setLoggedInUser(user);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const addUser = async () => {
        if (userId.trim() && password.trim() && role.trim()) {
            try {
                const res = await fetch('http://localhost:5000/api/add-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, password, role }),
                });

                const data = await res.json();

                if (res.ok) {
                    alert('User added successfully!');
                    setUserId('');
                    setPassword('');
                    setRole('');
                    fetchUsers(); // Refresh the list of users
                } else {
                    alert(data.message || 'Failed to add user.');
                }
            } catch (err) {
                console.error('Error adding user:', err);
                alert('An error occurred while adding the user.');
            }
        } else {
            alert('Please fill all fields: User ID, Password, and Role.');
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm(`Are you sure you want to delete user: ${id}?`)) {
            try {
                const res = await fetch(`http://localhost:5000/api/delete-user/${id}`, {
                    method: 'DELETE',
                });

                const data = await res.json();

                if (res.ok) {
                    alert('User deleted successfully!');
                    fetchUsers(); // Refresh the list of users
                } else {
                    alert(data.message || 'Failed to delete user.');
                }
            } catch (err) {
                console.error('Error deleting user:', err);
                alert('An error occurred while deleting the user.');
            }
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="logo">FertiStock</div>
                {/* Moved welcome message here */}
                
                <ul className="nav-links">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/inventory">Inventory</Link></li>
                    <li><Link to="/sales">Sales</Link></li>
                    <li><Link to="/stock">Stock</Link></li>
                    <li><Link to="/notifications">Notifications</Link></li>
                    <li><Link to="/">Logout</Link></li> {/* This assumes '/' is your logout/login page */}
                </ul>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="top-bar">
                    <h2>User Management</h2>
                    {/* Logged in user can also be here if desired, but moved to sidebar */}
                </div>

                {/* Add User Form */}
                <div className="add-user-form">
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="User ID"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type={showPassword ? "text" : "password"} // Toggle type
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'} {/* Text for toggle button */}
                        </button>
                    </div>
                    <div className="form-group dropdown-wrapper"> {/* Wrap select for styling */}
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        >
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="worker">Worker</option>
                        </select>
                        <button onClick={addUser}>Add User</button>
                    </div>
                </div>

                {/* Users Table */}
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={index}>
                                <td>{user.userId}</td>
                                <td>{user.role}</td>
                                <td>
                                    <button className="delete-button" onClick={() => deleteUser(user.userId)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard;