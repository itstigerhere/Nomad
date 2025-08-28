import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
	const [user, setUser] = useState<any>(null);
	const navigate = useNavigate();

		useEffect(() => {
			const fetchUser = async () => {
				const token = localStorage.getItem('token');
				if (!token) return navigate('/');
				try {
					const res = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
					setUser(res.data);
				} catch {
					navigate('/');
				}
			};
			fetchUser();
		}, [navigate]);

	if (!user) return null;

	return (
		<Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}>
			<Typography variant="h5" mb={2}>Welcome, {user.name || user.email}!</Typography>
			{user.avatar && <img src={user.avatar} alt="avatar" style={{ width: 80, borderRadius: '50%' }} />}
			<Typography mt={2}>Email: {user.email}</Typography>
			<Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={() => navigate('/notes')}>Go to Notes</Button>
		</Box>
	);
};

export default WelcomePage;
