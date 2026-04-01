import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import DashboardHeader from '../components/DashboardHeader';
import "../styles/Profile.css"

interface ProfileData {
    name: string;
    email: string;
    avatar?: string;
    role: 'Teacher' | 'Student';
    points?: number;
    createdAt?: string;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface Connections {
    github?: string;
    linkedin?: string;
}

const Profile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile data state
    const [profileData, setProfileData] = useState<ProfileData>({
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || '',
        role: user?.role || 'Student'
    });

    // Password state
    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Connections state
    const [connections, setConnections] = useState<Connections>({
        github: '',
        linkedin: '',
    });

    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // UI state
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'connections' | 'account'>('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string>(user?.avatar || '');
    const [originalAvatar, setOriginalAvatar] = useState<string>(user?.avatar || '');
    const initialAvatarRef = useRef<string>('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Fetch full profile on mount
        const fetchProfile = async () => {
            try {
                const response = await authService.getProfile();
                if (response.success) {
                    setProfileData(response.user as ProfileData);
                    setPreviewUrl(response.user.avatar || '');
                    setOriginalAvatar(response.user.avatar || '');
                    initialAvatarRef.current = response.user.avatar || '';
                }
                if (response.user.connections) {
                    setConnections({
                        github: response.user.connections.github || '',
                        linkedin: response.user.connections.linkedin || ''
                    });
                }
                
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };

        

        fetchProfile();
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
        setMessage('');
        setError('');
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        setMessage('');
        setError('');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            // First update profile details
            const response = await authService.updateDetails({
                name: profileData.name,
                email: profileData.email
            });

            if (response.success) {
                updateUser(response.user);
            }

            // Then update avatar if it was changed (new preview differs from original)
            if (profileData.avatar && profileData.avatar !== originalAvatar) {
                try {
                    const avatarResponse = await authService.updateAvatar(profileData.avatar);
                    if (avatarResponse.success) {
                        updateUser(avatarResponse.user);
                        setOriginalAvatar(avatarResponse.user.avatar || '');
                    }
                } catch (err: any) {
                    console.error('Avatar update error:', err);
                    // Profile was updated but avatar failed, still show success
                }
            }

            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) return "Password must be at least 8 characters long";
        if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter (A-Z)";
        if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter (a-z)";
        if (!/[0-9]/.test(password)) return "Password must contain at least one number (0-9)";
        if (!/[!@#$%^&*]/.test(password)) return "Password must contain at least one special character (!@#$%^&*)";
        return null;
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setLoading(false);
            return;
        }

        const passwordError = validatePassword(passwordData.newPassword);
        if (passwordError) {
            setError(passwordError);
            setLoading(false);
            return;
        }

        try {
            const response = await authService.changePassword(passwordData);

            if (response.success) {
                setMessage('Password changed successfully!');
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleConnectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConnections(prev => ({ ...prev, [name]: value }));
        setMessage('');
        setError('');
    };

    const handleSaveConnections = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await authService.saveConnections(connections);
            if (response.success) {
                setMessage('Connections updated successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save connections');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== user?.name) {
            setError('Name does not match. Please type your name correctly.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Call delete account API
            await authService.deleteAccount();
            setMessage('Account deleted successfully');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete account');
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (1MB limit before conversion)
        if (file.size > 1 * 1024 * 1024) {
            setError('Image size must be less than 1MB');
            return;
        }

        setMessage('');
        setError('');

        try {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64String = event.target?.result as string;
                
                // Validate base64 size doesn't exceed 2MB
                if (base64String.length > 2000000) {
                    setError('Image is too large to upload');
                    return;
                }
                
                // Store in profile data and show preview
                setProfileData(prev => ({ ...prev, avatar: base64String }));
                setPreviewUrl(base64String);
                setMessage('Avatar selected. Click "Save Changes" to apply.');
            };
            reader.onerror = () => {
                setError('Failed to process image');
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError('Failed to process image');
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <DashboardHeader />
            <div className="profile-container">
                <div className="profile-section-header">
                    <h1>My Profile</h1>
                    <p>Manage your account settings</p>
                </div>

                <div className="profile-content">
                {/* Avatar Card */}
                <div className="profile-card profile-avatar-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-container">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile Avatar"
                                    className="profile-avatar-image"
                                    onClick={handleAvatarClick}
                                />
                            ) : (
                                <div
                                    className="profile-avatar-placeholder"
                                    onClick={handleAvatarClick}
                                >
                                    <svg
                                        width="64"
                                        height="64"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            )}
                            <div className="profile-avatar-overlay" onClick={handleAvatarClick}>
                                <span>Change</span>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />

                        <div className="profile-user-info">
                            <h2>{profileData.name}</h2>
                            <p className="profile-user-email">{profileData.email}</p>
                            <p className="profile-user-role">{profileData.role}</p>
                            {profileData.points !== undefined && (
                                <p className="profile-user-points">
                                    <strong>{profileData.points}</strong> points
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="profile-tabs">
                    <button
                        className={`profile-tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Info
                    </button>
                    <button
                        className={`profile-tab-button ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('password')}
                    >
                        Change Password
                    </button>
                    <button
                        className={`profile-tab-button ${activeTab === 'connections' ? 'active' : ''}`}
                        onClick={() => setActiveTab('connections')}
                    >
                        Connections
                    </button>
                    <button
                        className={`profile-tab-button ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        Account
                    </button>
                </div>

                {/* Alert Messages */}
                {message && <div className="profile-alert profile-alert-success">{message}</div>}
                {error && <div className="profile-alert profile-alert-error">{error}</div>}

                {/* Profile Info Tab */}
                {activeTab === 'profile' && (
                    <div className="profile-card">
                        <h3 className="profile-card-title">Profile Information</h3>
                        <form onSubmit={handleUpdateProfile} className="profile-form">
                            <div className="profile-form-group">
                                <label htmlFor="name" className="profile-form-label">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    className="profile-form-input"
                                    placeholder="Enter your full name"
                                    disabled={loading}
                                />
                            </div>

                            <div className="profile-form-group">
                                <label htmlFor="email" className="profile-form-label">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleProfileChange}
                                    className="profile-form-input"
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                            </div>

                            <div className="profile-form-group">
                                <label className="profile-form-label">Role</label>
                                <input
                                    type="text"
                                    value={profileData.role}
                                    className="profile-form-input"
                                    disabled
                                />
                            </div>

                            <button
                                type="submit"
                                className="profile-btn profile-btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'password' && (
                <div className="profile-card">
                    <h3 className="profile-card-title">Change Password</h3>
                    <form onSubmit={handleChangePassword} className="profile-form">

                        {/* Current Password */}
                        <div className="profile-form-group">
                            <label htmlFor="currentPassword" className="profile-form-label">
                                Current Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    id="currentPassword"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="profile-form-input"
                                    placeholder="Enter current password"
                                    style={{ paddingRight: '2.5rem' }}
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(p => !p)}
                                    style={{
                                        position: 'absolute', right: '10px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: 'var(--color-primary)',
                                        cursor: 'pointer', fontSize: '1.2rem',
                                        display: 'flex', alignItems: 'center', zIndex: 10
                                    }}
                                >
                                    {showCurrentPassword ? '👁️' : '🙈'}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="profile-form-group">
                            <label htmlFor="newPassword" className="profile-form-label">
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    id="newPassword"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="profile-form-input"
                                    placeholder="••••••••"
                                    style={{ paddingRight: '2.5rem' }}
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(p => !p)}
                                    style={{
                                        position: 'absolute', right: '10px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: 'var(--color-primary)',
                                        cursor: 'pointer', fontSize: '1.2rem',
                                        display: 'flex', alignItems: 'center', zIndex: 10
                                    }}
                                >
                                    {showNewPassword ? '👁️' : '🙈'}
                                </button>
                            </div>

                            {/* Live Requirements Checklist */}
                            <div style={{ marginTop: '0.8rem', fontSize: '0.85rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    {[
                                        { label: '8+ Characters',         met: passwordData.newPassword.length >= 8 },
                                        { label: 'Uppercase (A-Z)',        met: /[A-Z]/.test(passwordData.newPassword) },
                                        { label: 'Lowercase (a-z)',        met: /[a-z]/.test(passwordData.newPassword) },
                                        { label: 'Number (0-9)',           met: /[0-9]/.test(passwordData.newPassword) },
                                        { label: 'Special (!@#$%^&*)',     met: /[!@#$%^&*]/.test(passwordData.newPassword) }
                                    ].map((req, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                                            color: req.met ? '#22c55e' : 'var(--color-text-muted)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <span style={{
                                                display: 'inline-flex', width: '18px', height: '18px',
                                                alignItems: 'center', justifyContent: 'center',
                                                border: `1px solid ${req.met ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                                                borderRadius: '50%', fontSize: '0.7rem',
                                                background: req.met ? 'rgba(34, 197, 94, 0.1)' : 'transparent'
                                            }}>
                                                {req.met ? '✓' : ''}
                                            </span>
                                            {req.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="profile-form-group">
                            <label htmlFor="confirmPassword" className="profile-form-label">
                                Confirm New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="profile-form-input"
                                    placeholder="••••••••"
                                    style={{ paddingRight: '2.5rem' }}
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(p => !p)}
                                    style={{
                                        position: 'absolute', right: '10px', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none',
                                        border: 'none', color: 'var(--color-primary)',
                                        cursor: 'pointer', fontSize: '1.2rem',
                                        display: 'flex', alignItems: 'center', zIndex: 10
                                    }}
                                >
                                    {showConfirmPassword ? '👁️' : '🙈'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="profile-btn profile-btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Updating...' : 'Change Password'}
                        </button>
                    </form>
                </div>
            )}

                {/* Connections Tab */}
                {activeTab === 'connections' && (
                    <div className="profile-card">
                        <h3 className="profile-card-title">Connected Accounts</h3>
                        <p className="profile-card-description">Link your social media accounts to your profile</p>
                        <form onSubmit={handleSaveConnections} className="profile-form">
                            <div className="profile-form-group">
                                <label htmlFor="github" className="profile-form-label">
                                    GitHub
                                </label>
                                <input
                                    type="text"
                                    id="github"
                                    name="github"
                                    value={connections.github || ''}
                                    onChange={handleConnectionChange}
                                    className="profile-form-input"
                                    placeholder="Your GitHub username"
                                    disabled={loading}
                                />
                            </div>

                            <div className="profile-form-group">
                                <label htmlFor="linkedin" className="profile-form-label">
                                    LinkedIn
                                </label>
                                <input
                                    type="text"
                                    id="linkedin"
                                    name="linkedin"
                                    value={connections.linkedin || ''}
                                    onChange={handleConnectionChange}
                                    className="profile-form-input"
                                    placeholder="Your LinkedIn profile URL"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="profile-btn profile-btn-primary"
                                disabled={loading}
                            >

                                {loading ? 'Saving...' : 'Save Connections'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                    <div className="profile-card">
                        <h3 className="profile-card-title profile-card-title-danger">Account Actions</h3>
                        <p className="profile-card-description">Manage your account settings and data</p>
                        
                        <div className="profile-danger-section">
                            <div className="profile-danger-header">
                                <h4>Delete Account</h4>
                                <p>Permanently delete your account and all associated data</p>
                            </div>
                            <button
                                type="button"
                                className="profile-btn profile-btn-danger"
                                onClick={() => setShowDeleteModal(true)}
                                disabled={loading}
                            >
                                Delete Account
                            </button>
                        </div>

                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="profile-modal-overlay" onClick={() => setShowDeleteModal(false)}>
                                <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="profile-modal-title profile-modal-title-danger">Delete Account</h3>
                                    <p className="profile-modal-text">
                                        This action cannot be undone. All your data will be permanently deleted.
                                    </p>
                                    <p className="profile-modal-confirm-text">
                                        Type your name to confirm deletion:
                                    </p>
                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        className="profile-form-input profile-modal-input"
                                        placeholder="Your name"
                                    />
                                    <div className="profile-modal-actions">
                                        <button
                                            type="button"
                                            className="profile-btn profile-btn-secondary"
                                            onClick={() => {
                                                setShowDeleteModal(false);
                                                setDeleteConfirmation('');
                                                setError('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="profile-btn profile-btn-danger"
                                            onClick={handleDeleteAccount}
                                            disabled={loading || deleteConfirmation !== user?.name}
                                        >
                                            {loading ? 'Deleting...' : 'Delete Permanently'}
                                        </button>
                                    </div>
                                    {error && <div className="profile-alert profile-alert-error">{error}</div>}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
