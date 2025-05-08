import React, { useState } from 'react';
import Event from './Events.jsx';
import People from './People.jsx';
import Class from './Class.jsx'
import Hobby from './Hobby.jsx'
import Work from './Work.jsx'
import { Link } from 'react-router-dom';


const CalendarApp = () => {
    // Days and months used for displaying calendar headers
    const daysOfWeek = ['Sun', 'Mon', 'Tues', 'Wed', 'Thu', 'Fri', 'Sat'] //put days into an array
    const monthsOfYear = [ //put months into an array
        'January', 
        'February', 
        'March', 
        'April', 
        'May', 
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ]
    
    const currentDate = new Date()

    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth()) //useState for getting/setting month
    const [currentYear, setCurrentYear] = useState(currentDate.getFullYear()) //useState for getting/setting year
    const [selectedDate, setSelectedDate] = useState(currentDate)
    const [showEventPopup, setShowEventPopup] = useState(false)
    const [activeTab, setActiveTab] = useState('calendar');

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate() //sets date object to last day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay() //sets date object to first day of the month



    // Function to go to the previous month
    const prevMonth = () => {
        //Either goes to Dec if Jan, otherwise goes to previous month in array
        setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1)) 
        //Similar function for going back a year based on month
        setCurrentYear((prevYear) => (currentMonth === 0 ? prevYear - 1 : prevYear))
    }

    // Function to go to the next month
    const nextMonth = () => {
        //Either goes to Jan if Dec, otherwise goes to previous month in array
        setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1)) 
        //Similar function for going forward a year based on month
        setCurrentYear((prevYear) => (currentMonth === 11 ? prevYear + 1 : prevYear))
    }
    
    //const handleDayClick = (day) => {
        //const clickedDate = new Date(currentYear, currentMonth, day)
        //const today = new Date()

        //if(clickedDate >= today || isSameDay(clickedDate, today)) {
            //setSelectedDate(clickedDate)
            //setShowEventPopup(true)
        //}
    //}

    //const isSameDay = (date1, date2) => {
        //return (
            //date1.getFullYear() === date2.getFullYear() &&
            //date1.getMonth() === date2.getMonth() &&
            //date1.getDate() === date2.getDate()
            
        //)
    //}


    return (
        <div className = "calendar-app">
             {/* Tabs to switch views */}
             <div className="tabs flex space-x-4 mb-4">
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'calendar' ? 'bg-blue-500 text-black' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('calendar')}
                >
                    Calendar
                </button>
                <br></br>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'people' ? 'bg-blue-500 text-black' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('people')}
                >
                    People
                </button>
                <br></br>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'class' ? 'bg-blue-500 text-black' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('class')}
                >
                    Classes
                </button>
                <br></br>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'hobby' ? 'bg-blue-500 text-black' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('hobby')}
                >
                    Hobbies
                </button>
                <br></br>
                <button
                    className={`px-4 py-2 rounded ${activeTab === 'work' ? 'bg-blue-500 text-black' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('work')}
                >
                    Work
                </button>
            </div>
            <div className = "calendar">
                <h1 className = "heading">Calendar</h1>
                {/* Date navigation header */}
                <div className = "navigate-date">
                    <h2 className="month">{monthsOfYear[currentMonth]}</h2>
                    <h2 className = "year">{currentYear}</h2>
                    <div className = "buttons">
                        <i className="bx bx-chevron-left" onClick={prevMonth}></i> {/* Previous month arrow */}
                        <i className="bx bx-chevron-right" onClick={nextMonth}></i> {/* Next month arrow */}
                    </div>
                </div>

                <div className="weekdays">
                    {daysOfWeek.map((day)=> <span key={day}>{day}</span> ) } {/* iterates through each day of the week and detects a change using key*/}
                </div>
                
                <div className="days">
                    {/* Empty placeholders for days before the 1st of the month to align the calendar grid */}
                    {[...Array(firstDayOfMonth).keys()].map((_, index) => (
                        <span key={`empty-${index}`}/> // Render empty span for alignment
                    ))}

                    {/* Render each day of the current month */}
                    {[...Array(daysInMonth).keys()].map((day) => (
                        <span key={day + 1} className={day + 1 === currentDate.getDate() && currentMonth === currentDate.getMonth() && 
                            currentYear === currentDate.getFullYear() 
                            ? 'current-day' 
                            : ''
                        }
                        onClick={() => handleDayClick (day + 1)}
                        
                        > {day + 1}</span> /* Display the day number */
                    ))}
                </div>
            </div>
            
            {activeTab === 'calendar' && <Event/>}
            {activeTab === 'people' && <People />}
            {activeTab === 'class' && <Class />}
            {activeTab === 'hobby' && <Hobby />}
            {activeTab === 'work' && <Work />}
        </div>
    )
}

export default CalendarApp

