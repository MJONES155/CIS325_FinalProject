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

//Work Component
const Work = ({ showEventPopup, setShowEventPopup, selectedDate }) => {
    const [works, setWorks] = useState([]);
    const [newWork, setNewWork] = useState({ title: '', start: '', end: ''});
    const [editWork, setEditWork] = useState(null); // Used for editing work events
    const [error, setError] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Tracks popup visibility
    const [isEditMode, setIsEditMode] = useState(false); // Tracks if we are editing

    // Read
    useEffect(() => {
        const fetchWork = async () => {
            try {
                const response = await axios.get('http://localhost:3001/work', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // sends a JWT token
                    }
                });
                setWorks(response.data);
            } catch (error) {
                setError('Failed to fetch work event.');
            }
        };

        fetchWork();
    }, []);
    

    // Create
    const handleCreateWork = async () => {
        try {
            await axios.post('http://localhost:3001/work', newWork, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setNewWork({ title: '', start: '', end: ''}); // Resets fields for next input
            setError('');
            setIsPopupOpen(false); // Closes popup
            // Re-fetch work
            const response = await axios.get('http://localhost:3001/work', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setWorks(response.data);
        } catch (error) {
            setError('Failed to create work event.');
        }
    };

    // Update 
    const handleUpdateWork = async () => {
        try {
            await axios.put(`http://localhost:3001/work/${editWork.WorkID}`, newWork, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setError('');
            setIsPopupOpen(false); // Close popup
            // Re-fetch work
            const response = await axios.get('http://localhost:3001/work', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setWorks(response.data);
        } catch (error) {
            setError('Failed to update work event.');
        }
    };

    // Delete
    const handleDeleteWork = async (workId) => {
        try {
            await axios.delete(`http://localhost:3001/work/${workId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Re-fetch work events
            const response = await axios.get('http://localhost:3001/work', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setWorks(response.data);
        } catch (error) {
            setError('Failed to delete event.');
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
    
        setNewWork({
            title: '',
            start: isoDate,
            end: isoDate
        });
        setIsEditMode(false);
        setIsPopupOpen(true);
    };

    // Opens popup for an event edit
    const openEditPopup = (work) => {
        setEditWork(work);
        setNewWork({
            title: work.Title,
            start: work.Start,
            end: work.End,
        });
        setIsEditMode(true);
        setIsPopupOpen(true);
    };



    return (
        <div>
            <h2>Work Events</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={openCreatePopup}>Create New Event</button>

            {/* Displaying Events */}
            <div>
                <h3>Upcoming Work Events</h3>
                <br></br>
                <ul>
                    <div>

                        {works.map(work => (
                            <li key={work.WorkID}>
                                <div className = "work">
                                    <h4>{work.Title}</h4>
                                    <p>Start: {new Date(work.Start).toLocaleString()}</p>
                                    <p>End: {new Date(work.End).toLocaleString()}</p>
                                    <button onClick={() => openEditPopup(work)}>Edit</button>
                                    <button onClick={() => handleDeleteWork(work.WorkID)}>Delete Event</button>
                                </div>
                            </li>
                        ))}
                    </div>
                </ul>
            </div>

            {/* Work Event Popup */}
            <Popup isOpen={isPopupOpen} closePopup={() => setIsPopupOpen(false)}>
                <h3>{isEditMode ? 'Edit Event' : 'Create Event'}</h3>  {/* If it is edit mode display edit event. Else display create event */}
                {isEditMode ? (
                    <button onClick={handleUpdateWork}>Update Event</button>
                ) : (
                    <button onClick={handleCreateWork}>Create Event</button>
                )}
                <input
                    type="text"
                    placeholder="Work Title"
                    value={newWork.title}
                    onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                />
                <input
                    type="datetime-local" 
                    value={newWork.start}
                    onChange={(e) => setNewWork({ ...newWork, start: e.target.value })}
                />
                <input
                    type="datetime-local"
                    value={newWork.end}
                    onChange={(e) => setNewWork({ ...newWork, end: e.target.value })}
                />

            </Popup>
        </div>
    );
};

export default Work;

