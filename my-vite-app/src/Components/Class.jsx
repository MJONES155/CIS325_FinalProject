import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Popup Component
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

// Class Component
const Class = () => {
    const [classes, setClasses] = useState([]);
    const [newClass, setNewClass] = useState({
        title: '',
        time: '',
        startdate: '',
        enddate: '',
        daysoftheweek: '',
        teacher: ''
      });
    const [editClass, setEditClass] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [error, setError] = useState('');



    // Fetch all classes
    useEffect(() => {
        const fetchClass = async () => {
            try {
                const response = await axios.get('http://localhost:3001/class', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}` // sends a JWT token
                    }
                });
                setClasses(response.data);
            } catch (error) {
                setError('Failed to fetch class.');
            }
        };

        fetchClass();
    }, []);


    // Create Class
    const handleCreateClass = async () => {
        try {
            await axios.post('http://localhost:3001/class', newClass, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setNewClass({ title: '', time: '', startdate: '', enddate: '', daysoftheweek: '', teacher: '' }); // Resets fields for next input
            setError('');
            setIsPopupOpen(false); // Closes popup
            // Re-fetch class
            const response = await axios.get('http://localhost:3001/class', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setClasses(response.data);
        } catch (error) {
            setError('Failed to create class.');
        }
    };



    // Update Class
    const handleUpdateClass = async () => {
        try {
            await axios.put(`http://localhost:3001/class/${editClass.ClassID}`, newClass, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setError('');
            setIsPopupOpen(false); // Close popup
            // Re-fetch class
            const response = await axios.get('http://localhost:3001/class', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setClasses(response.data);
        } catch (error) {
            setError('Failed to update class.');
        }
    
    };

    

    // Delete Class
    const handleDeleteClass = async (classId) => {
        try {
            await axios.delete(`http://localhost:3001/class/${classId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Re-fetch classes
            const response = await axios.get('http://localhost:3001/class', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setClasses(response.data);
        } catch (error) {
            setError('Failed to delete class.');
        }
    };

    // Open popup to create
    const openCreatePopup = () => {
        setIsEditMode(false);
        setNewClass({title: '', time: '', startdate: '', enddate: '', daysoftheweek: '', teacher: '' });
        setIsPopupOpen(true);
    };

    // Open popup to edit
    const openEditPopup = (classItem) => {
        setEditClass(classItem);
        setNewClass({
            title: classItem.Title,
            time: classItem.Time,
            startdate: classItem.StartDate,
            enddate: classItem.EndDate,
            daysoftheweek: classItem.DaysOfTheWeek,
            teacher: classItem.Teacher
        });
        setIsEditMode(true);
        setIsPopupOpen(true);
    };

    return (
        <div>
            <h2>Classes</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <button onClick={openCreatePopup}>Create New Class</button>

            <div>
                <h3>Scheduled Classes</h3>
                <ul>
                    {classes.map(classItem => (
                        <li key={classItem.ClassID}>
                            <div className="class">
                                <h4>{classItem.Title}</h4>
                                <p>Time: {classItem.Time}</p>
                                <p>Start Date: {classItem.StartDate}</p>
                                <p>End Date: {classItem.EndDate}</p>
                                <p>Days: {classItem.DaysOfTheWeek}</p>
                                <p>Teacher: {classItem.Teacher}</p>
                                <button onClick={() => openEditPopup(classItem)}>Edit</button>
                                <button onClick={() => handleDeleteClass(classItem.ClassID)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Class Popup */}
            <Popup isOpen={isPopupOpen} closePopup={() => setIsPopupOpen(false)}>
                <h3>{isEditMode ? 'Edit Class' : 'Create Class'}</h3>
                <input
                    type="text"
                    placeholder="Class Title"
                    value={newClass.Title}
                    onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                />
                
                <input
                    type="text"
                    placeholder="Time (e.g., 10:00 AM)"
                    value={newClass.Time}
                    onChange={(e) => setNewClass({ ...newClass, time: e.target.value })}
                />
                <input
                    type="date"
                    placeholder="Start Date"
                    value={newClass.StartDate}
                    onChange={(e) => setNewClass({ ...newClass, startdate: e.target.value })}
                />
                <input
                    type="date"
                    placeholder="End Date"
                    value={newClass.EndDate}
                    onChange={(e) => setNewClass({ ...newClass, enddate: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Days (e.g., MWF)"
                    value={newClass.DaysOfTheWeek}
                    onChange={(e) => setNewClass({ ...newClass, daysoftheweek: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Teacher Name"
                    value={newClass.Teacher}
                    onChange={(e) => setNewClass({ ...newClass, teacher: e.target.value })}
                />
                <br />
                {isEditMode ? (
                    <button onClick={handleUpdateClass}>Update Class</button>
                ) : (
                    <button onClick={handleCreateClass}>Create Class</button>
                )}
            </Popup>
        </div>
    );
};

export default Class;

