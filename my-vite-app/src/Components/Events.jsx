import React, { useState, useEffect } from 'react';
import axios from 'axios';

//Popup Close Function
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

//Event Component
const Event = ({ showEventPopup, setShowEventPopup, selectedDate }) => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ 
        title: '', 
        start: '', 
        end: '', 
        category: '' 
    }); //used to get information for CRUD as well as for the popup
    const [editEvent, setEditEvent] = useState(null); // Used for editing events
    const [error, setError] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Tracks popup visibility
    const [isEditMode, setIsEditMode] = useState(false); // Tracks if we are editing

    // Read
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:3001/event', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // sends a JWT token
                    }
                });
                setEvents(response.data);
            } catch (error) {
                setError('Failed to fetch events.');
            }
        };

        fetchEvents();
    }, []);
    

    // Create
    const handleCreateEvent = async () => {
        try {
            await axios.post('http://localhost:3001/event', newEvent, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // sends a JWT token
                }
            });
            setNewEvent({ title: '', start: '', end: '', category: '' }); // Resets fields for next input
            setError('');
            setIsPopupOpen(false); // Closes popup
            // Re-fetch events
            const response = await axios.get('http://localhost:3001/event', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // sends a JWT token
                }
            });
            setEvents(response.data);
        } catch (error) {
            setError('Failed to create event.');
        }
    };

    // Update 
    const handleUpdateEvent = async () => {
        try {
            await axios.put(`http://localhost:3001/event/${editEvent.EventID}`, newEvent, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}` // sends a JWT token
                }
            });
            setError('');
            setIsPopupOpen(false); // Close popup
            // Re-fetch events
            const response = await axios.get('http://localhost:3001/event', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEvents(response.data);
        } catch (error) {
            setError('Failed to update event.');
        }
    };

    // Delete
    const handleDeleteEvent = async (eventId) => {
        try {
            await axios.delete(`http://localhost:3001/event/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Re-fetch events
            const response = await axios.get('http://localhost:3001/event', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setEvents(response.data);
        } catch (error) {
            setError('Failed to delete event.');
        }
    };


    // //useEffect(() => {
    //     //if (showEventPopup && selectedDate) {
    //         openCreatePopup();
    //         setShowEventPopup(false); // Reset the flag so it doesn’t reopen repeatedly
    //     }
    // }, [showEventPopup, selectedDate]);

    // Popup open handler for creating
    const openCreatePopup = () => {
        const isoDate = selectedDate ? selectedDate.toISOString().slice(0, 16) : ''; // A better date-time format
        setIsEditMode(false);
        setNewEvent({
            title: '',
            start: isoDate,
            end: isoDate,
            category: ''
        });
        setIsPopupOpen(true);
    };

    // Opens popup for an event edit
    const openEditPopup = (event) => {
        setEditEvent(event);
        setNewEvent({
            title: event.Title,
            start: event.Start,
            end: event.End,
            category: event.Category
        });
        setIsEditMode(true);
        setIsPopupOpen(true);
    };



    return (
        <div>
            <h2>Events</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={openCreatePopup}>Create New Event</button>

            {/* Displaying Events */}
            <div>
                <h3>Upcoming Events</h3>
                <br></br>
                <ul>
                    <div>

                        {events.map(event => (
                            <li key={event.EventID}>
                                <div className = "event">
                                    <h4>{event.Title}</h4>
                                    <p>Start: {new Date(event.Start).toLocaleString()}</p>
                                    <p>End: {new Date(event.End).toLocaleString()}</p>
                                    <p>Category: {event.Category}</p>
                                    <button onClick={() => openEditPopup(event)}>Edit</button>
                                    <button onClick={() => handleDeleteEvent(event.EventID)}>Delete Event</button>
                                </div>
                            </li>
                        ))}
                    </div>
                </ul>
            </div>

            {/* Event Popup */}
            <Popup isOpen={isPopupOpen} closePopup={() => setIsPopupOpen(false)}>
            <h3>{isEditMode ? 'Edit Event' : 'Create Event'}</h3>  {/* If it is edit mode display edit event. Else display create event */}
                <input
                    type="text"
                    placeholder="Event Title"
                    value={newEvent.Title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
                <input
                    type="datetime-local" 
                    value={newEvent.Start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                />
                <input
                    type="datetime-local"
                    value={newEvent.End}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                />
                <select
                    /* Displays all categories */
                    value={newEvent.Category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                >
                    <option value="">Select Category</option>
                    <option value="task">Task</option>
                    <option value="assignment">Assignment</option>
                    <option value="meeting">Meeting</option>
                    <option value="class">Class</option>
                    <option value="hobby">Hobby</option>
                </select>
                
                {isEditMode ? (
                    <button onClick={handleUpdateEvent}>Update Event</button>
                ) : (
                    <button classname="create" onClick={handleCreateEvent}>Create Event</button>
                )}

            </Popup>
        </div>
    );
};

export default Event;