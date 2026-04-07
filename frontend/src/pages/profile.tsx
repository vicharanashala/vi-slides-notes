import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Profile = () => {
	const { user, logout } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const navigate = useNavigate();

	if (!user) {
		return <Navigate to="/login" replace />;
	}
	

	const handleLogout = () => {
		logout();
		navigate('/login');
	};

	return (
		<main className="container fade-in" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
			<div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
					<div
						style={{
							width: '64px',
							height: '64px',
							borderRadius: '50%',
							background: user.avatar ? `url(${user.avatar}) center/cover no-repeat` : 'var(--gradient-primary)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#fff',
							fontSize: '1.5rem',
							fontWeight: 700
						}}
					>
						{!user.avatar && user.name?.charAt(0).toUpperCase()}
					</div>
					<div>
						<h1 style={{ margin: 0 }}>Profile</h1>
						<p className="text-muted" style={{ margin: 0 }}>Manage your account details</p>
					</div>
				</div>

				<div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
					<div>
						<p className="text-muted" style={{ marginBottom: '0.25rem' }}>Name</p>
						<p style={{ margin: 0, fontWeight: 600 }}>{user.name}</p>
					</div>
					<div>
						<p className="text-muted" style={{ marginBottom: '0.25rem' }}>Email</p>
						<p style={{ margin: 0, fontWeight: 600 }}>{user.email}</p>
					</div>
					<div>
						<p className="text-muted" style={{ marginBottom: '0.25rem' }}>Role</p>
						<p style={{ margin: 0, fontWeight: 600, textTransform: 'capitalize' }}>{user.role}</p>
					</div>
				</div>

				<div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
					<button className="btn btn-secondary" onClick={toggleTheme}>
						{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
					</button>
					<button className="btn" onClick={handleLogout} style={{ background: 'var(--color-error)', color: '#fff' }}>
						Logout
					</button>
				</div>
			</div>
		</main>
	);
};

export default Profile;
