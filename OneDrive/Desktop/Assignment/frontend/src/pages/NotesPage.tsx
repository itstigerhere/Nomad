import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const NotesPage: React.FC = () => {
	const [notes, setNotes] = useState<any[]>([]);
	const [content, setContent] = useState('');
	const [error, setError] = useState('');
	const token = localStorage.getItem('token');

	const fetchNotes = async () => {
		try {
			const res = await axios.get('/api/notes', { headers: { Authorization: `Bearer ${token}` } });
			setNotes(res.data);
		} catch {
			setError('Failed to fetch notes');
		}
	};

	useEffect(() => {
		fetchNotes();
	}, []);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		try {
			await axios.post('/api/notes', { content }, { headers: { Authorization: `Bearer ${token}` } });
			setContent('');
			fetchNotes();
		} catch {
			setError('Failed to create note');
		}
	};

	const handleDelete = async (id: string) => {
		setError('');
		try {
			await axios.delete(`/api/notes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
			fetchNotes();
		} catch {
			setError('Failed to delete note');
		}
	};

	return (
		<Box sx={{ maxWidth: 500, mx: 'auto', mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}>
			<Typography variant="h5" mb={2}>Your Notes</Typography>
			{error && <Typography color="error" mb={2}>{error}</Typography>}
			<form onSubmit={handleCreate}>
				<TextField label="New Note" fullWidth required value={content} onChange={e => setContent(e.target.value)} margin="normal" />
				<Button type="submit" variant="contained" fullWidth>Add Note</Button>
			</form>
			<List>
				{notes.map(note => (
					<ListItem key={note._id} secondaryAction={
						<IconButton edge="end" aria-label="delete" onClick={() => handleDelete(note._id)}>
							<DeleteIcon />
						</IconButton>
					}>
						<ListItemText primary={note.content} secondary={new Date(note.createdAt).toLocaleString()} />
					</ListItem>
				))}
			</List>
		</Box>
	);
};

export default NotesPage;
