import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Reuse your Popup component if it exists elsewhere in your code
const Popup = ({ isOpen, closePopup, children }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-btn" onClick={closePopup}>X</button>
                {children}
            </div>
        </div>
    );
};

const People = () => {
    const [people, setPeople] = useState([]);
    const [newPeople, setNewPeople] = useState({ firstname: '', lastname: '', email: '', category: '' });
    const [editPeople, setEditPeople] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState('');

    // Read
    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const response = await axios.get('http://localhost:3001/people', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setPeople(response.data);
                setPeople(response.data.filter(p => p && p.PeopleID));
            } catch (error) {
                setError('Failed to fetch people.');
            }
        };

        fetchPeople();
    }, []);

    // Create
    const handleCreatePeople = async () => {
        try {
            await axios.post('http://localhost:3001/people', newPeople, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setNewPeople({ firstname: '', lastname: '', email: '', category: '' });
            setError('');
            setIsPopupOpen(false);
            const response = await axios.get('http://localhost:3001/people', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPeople(response.data);
        } catch (error) {
            setError('Failed to create person.');
        }
    };

    // Update
    const handleUpdatePeople = async () => {
        try {
            await axios.put(`http://localhost:3001/people/${editPeople.PeopleID}`, newPeople, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setError('');
            setIsPopupOpen(false);
            const response = await axios.get('http://localhost:3001/people', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPeople(response.data);
        } catch (error) {
            setError('Failed to update person.');
        }
    };

    // Delete
    const handleDeletePeople = async (peopleId) => {
        try {
            await axios.delete(`http://localhost:3001/people/${peopleId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
                
            });
            // Re-fetch people
            const response = await axios.get('http://localhost:3001/people', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPeople(response.data);
        } catch (error) {
            setError('Failed to delete people');
        }
    };


    const openCreatePopup = () => {
        setNewPeople({ firstname: '', lastname: '', email: '', category: '' });
        setIsEditMode(false);
        setIsPopupOpen(true);
    };

    const openEditPopup = (person) => {
        setEditPeople(person);
        setNewPeople({
            firstname: person.FirstName,
            lastname: person.LastName,
            email: person.Email,
            category: person.Category
        });
        setIsEditMode(true);
        setIsPopupOpen(true);
    };

    return (
        <div>
            <h2>People</h2>
            <button onClick={openCreatePopup}>Add Person</button>
            {error && <p>{error}</p>}
            <ul >
                {people.map(person => (
                    <li key={person.PeopleID}>
                        {person.FirstName} {person.LastName} ({person.Category}) - {person.Email}
                        <button onClick={() => openEditPopup(person)}>Edit</button>
                        <button onClick={() => handleDeletePeople(person.PeopleID)}>Delete</button>
                    </li>
                ))}
            </ul>

            <Popup isOpen={isPopupOpen} closePopup={() => setIsPopupOpen(false)}>
                <input
                    type="text"
                    placeholder="First Name"
                    value={newPeople.firstname}
                    onChange={e => setNewPeople({ ...newPeople, firstname: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={newPeople.lastname}
                    onChange={e => setNewPeople({ ...newPeople, lastname: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={newPeople.email}
                    onChange={e => setNewPeople({ ...newPeople, email: e.target.value })}
                />
                <select
                    value={newPeople.category}
                    onChange={e => setNewPeople({ ...newPeople, category: e.target.value })}
                >
                    <option value="">Select Category</option>
                    <option value="teacher">Teacher</option>
                    <option value="friend">Friend</option>
                    <option value="family">Family</option>
                </select>
                <button onClick={isEditMode ? handleUpdatePeople : handleCreatePeople}>
                    {isEditMode ? 'Update' : 'Create'}
                </button>
            </Popup>
        </div>
    );
};

export default People;

