import React, { useState, useEffect } from 'react';
import axios from 'axios';

//Popup Close Function
const Popup = ({ isOpen, closePopup, children }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <button className="close-btn" onClick={closePopup}>X</button> //
                {children}
            </div>
        </div>
    );
};

//Hobby Component
const Hobby = ({ showEventPopup, setShowEventPopup, selectedDate }) => {
    const [hobbies, setHobbies] = useState([]);
    const [newHobby, setNewHobby] = useState({ hobbyname: '', start: '', end: ''});
    const [editHobby, setEditHobby] = useState(null); // Used for editing events
    const [error, setError] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Tracks popup visibility
    const [isEditMode, setIsEditMode] = useState(false); // Tracks if we are editing

    // Read
    useEffect(() => {
        const fetchHobbies = async () => {
            try {
                const response = await axios.get('http://localhost:3001/hobby', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // sends a JWT token
                    }
                });
                setHobbies(response.data);
            } catch (error) {
                setError('Failed to fetch hobbies.');
            }
        };

        fetchHobbies();
    }, []);
    

    // Create
    const handleCreateHobby = async () => {
        try {
            await axios.post('http://localhost:3001/hobby', newHobby, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setNewHobby({ hobbyname: '', start: '', end: ''}); // Resets fields for next input
            setError('');
            setIsPopupOpen(false); // Closes popup
            // Re-fetch hobbies
            const response = await axios.get('http://localhost:3001/hobby', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setHobbies(response.data);
        } catch (error) {
            
            setError('Failed to create hobby.');
        }
    };

    // Update 
    const handleUpdateHobby = async () => {
        try {
            await axios.put(`http://localhost:3001/hobby/${editHobby.HobbyID}`, newHobby, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setError('');
            setIsPopupOpen(false); // Close popup
            // Re-fetch hobbies
            const response = await axios.get('http://localhost:3001/hobby', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setHobbies(response.data);
        } catch (error) {
            setError('Failed to update hobby.');
        }
    };

    // Delete
    const handleDeleteHobby = async (hobbyId) => {
        try {
            await axios.delete(`http://localhost:3001/hobby/${hobbyId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Re-fetch hobbies
            const response = await axios.get('http://localhost:3001/hobby', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setHobbies(response.data);
        } catch (error) {
            setError('Failed to delete hobby.');
        }
    };


    useEffect(() => {
        if (showEventPopup && selectedDate) {
            openCreatePopup();
            setShowEventPopup(false); // Reset the flag so it doesn’t reopen repeatedly
        }
    }, [showEventPopup, selectedDate]);

    // Popup open handler for creating
    const openCreatePopup = () => {
        const isoDate = selectedDate ? selectedDate.toISOString().slice(0, 16) : ''; // A better date-time format
    
        setNewHobby({
            hobbyname: '',
            start: isoDate,
            end: isoDate,
        });
        setIsEditMode(false);
        setIsPopupOpen(true);
    };

    // Opens popup for a hobby edit
    const openEditPopup = (hobby) => {
        setEditHobby(hobby);
        setNewHobby({
            hobbyname: hobby.HobbyName,
            start: hobby.Start,
            end: hobby.End,
        });
        setIsEditMode(true);
        setIsPopupOpen(true);
    };



    return (
        <div>
            <h2>Hobbies</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={openCreatePopup}>Create New Hobby</button>

            {/* Displaying Hobbies */}
            <div>
                <h3>Upcoming Hobbies</h3>
                <br></br>
                <ul>
                    <div>

                        {hobbies.map(hobby => (
                            <li key={hobby.HobbyID}>
                                <div className = "hobby">
                                    <h4>{hobby.HobbyName}</h4>
                                    <p>Start: {new Date(hobby.Start).toLocaleString()}</p>
                                    <p>End: {new Date(hobby.End).toLocaleString()}</p>
                                    <p>Category: {hobby.Category}</p>
                                    <button onClick={() => openEditPopup(hobby)}>Edit</button>
                                    <button onClick={() => handleDeleteHobby(hobby.HobbyID)}>Delete Hobby</button>
                                </div>
                            </li>
                        ))}
                    </div>
                </ul>
            </div>

            {/* Event Popup */}
            <Popup isOpen={isPopupOpen} closePopup={() => setIsPopupOpen(false)}>
                <h3>{isEditMode ? 'Edit Hobby' : 'Create Hobby'}</h3>  {/* If it is edit mode display edit hobby. Else display create hobby */}
                {isEditMode ? (
                    <button onClick={handleUpdateHobby}>Update Hobby</button>
                ) : (
                    <button onClick={handleCreateHobby}>Create Hobby</button>
                )}
                <input
                    type="text"
                    placeholder="Hobby Title"
                    value={newHobby.hobbyname}
                    onChange={(e) => setNewHobby({ ...newHobby, hobbyname: e.target.value })}
                />
                <input
                    type="datetime-local" 
                    value={newHobby.start}
                    onChange={(e) => setNewHobby({ ...newHobby, start: e.target.value })}
                />
                <input
                    type="datetime-local"
                    value={newHobby.end}
                    onChange={(e) => setNewHobby({ ...newHobby, end: e.target.value })}
                />

            </Popup>
        </div>
    );
};

export default Hobby;

