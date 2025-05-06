import Calendar from 'react-calendar'
import React,{useEffect} from 'react';


export default function Dashboard() {

    return (
        <div className="App">
            
            <div className="container">
                
                <div className="lg-container">
                    <div className="md-container">
                        <div className = "calendar">
                            <Calendar/>
                            </div>
                    </div>
                    <div className="sm-container">
                        
                    </div>
                </div>
            </div>
            
        </div>
    )
}
