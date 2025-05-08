const db = require('./database'); //Receives the database
const express = require('express'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express(); 
const cors = require('cors');

const secretKey = 'yourSecretKey';
const PORT = 3001;
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 
app.listen(PORT, () => { 
    console.log(`Server running on http://localhost:${PORT}`); 
});



//User CRUD
//Create User Registration
app.post('/register', async (req, res) => {
    console.log('Register route hit:', req.body);
    const { username, password, email } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            "INSERT INTO User (username, password, Email) VALUES (?, ?, ?)",
            [username, hashedPassword, email],
            function(err) {
                if (err) {
                    return res.status(400).json({ message: err.message });
                }
                res.status(201).json({ message: 'User created', userId: this.lastID });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Internal server error during registration" });
    }
});


// User Login 
app.post('/login', (req, res) => {
    console.log('Login route hit:', req.body);
    const { username, password } = req.body;

    db.get("SELECT * FROM User WHERE username = ?", [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Incorrect password' });
        }
        const token = jwt.sign({ userId: user.UserID }, secretKey, { expiresIn: '1h' });
        res.json({ message: 'Logged in', token: token });
    });
});

//Authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

//Event Read
app.get('/event', authenticateToken, (req, res) => {
    db.all("SELECT * FROM Event WHERE UserID = ?", [req.user.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


  
//-------------------------------------------------------------------------------------------------
//Event CRUD
//Create
app.post('/event', authenticateToken, (req, res) => {
    const { title, start, end, category } = req.body;
    const userId = req.user.userId;

    db.run(
        "INSERT INTO Event (Title, Start, End, Category, UserID) VALUES (?, ?, ?, ?, ?)",
        [title, start, end, category, userId],
        function(err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(201).json({ message: 'Event created', eventId: this.lastID });
        }
    );
});
  
//Update
app.put('/event/:EventID', (req, res) => {
    const { EventID } = req.params;
    const { title, start, end, category } = req.body;
  
    const query = 
        `UPDATE Event 
        SET Title = ?, Start = ?, End = ?, Category = ?
        WHERE EventID = ?`;
  
    db.run(query, [title, start, end, category, EventID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to update record', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${EventID}` 
        });
        res.json({ message: `Record with ID ${EventID} updated successfully`, updatedId: EventID });
    });
});
  
//Delete
app.delete('/event/:EventID', (req, res) => {
    const { EventID } = req.params;
    db.run('DELETE FROM Event WHERE EventID = ?', [EventID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to delete record', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${EventID}` 
        });
        res.json({ message: `Record with ID ${EventID} deleted successfully` });
    });
});



//Work CRUD

//Create
app.post('/work', authenticateToken, (req, res) => {
    const { title, start, end } = req.body;
    const userId = req.user.userId;

    db.run(
        "INSERT INTO Work (Title, Start, End, UserID) VALUES (?, ?, ?, ?)",
        [title, start, end, userId],
        function(err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(201).json({ message: 'Event created', workId: this.lastID });
        }
    );
});


//Read
app.get('/work', authenticateToken, (req, res) => {
    db.all("SELECT * FROM Work WHERE UserID = ?", [req.user.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


  
//Update
app.put('/work/:WorkID', (req, res) => {
    const { WorkID } = req.params;
    const { title, start, end } = req.body;
  
    const query = 
        `UPDATE Work 
        SET Title = ?, Start = ?, End = ?
        WHERE WorkID = ?`;
  
    db.run(query, [title, start, end, WorkID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to update record', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${WorkID}` 
        });
        res.json({ message: `Record with ID ${WorkID} updated successfully`, updatedId: WorkID });
    });
});
  
//Delete
app.delete('/work/:WorkID', (req, res) => {
    const { WorkID } = req.params;
    db.run('DELETE FROM Work WHERE WorkID = ?', [WorkID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to delete record', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${WorkID}` 
        });
        res.json({ message: `Record with ID ${WorkID} deleted successfully` });
    });
})





//Assignment CRUD
//Create
app.post('/assignments', (req, res) => {
    const { title, start, end, classId, category = 'assignment' } = req.body;

    const eventQuery = `INSERT INTO Event (Title, Start, End, Category) VALUES (?, ?, ?, ?)`;
    db.run(eventQuery, [title, start, end, category], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const eventId = this.lastID;

        const assignmentQuery = `INSERT INTO Assignments (EventID, ClassID) VALUES (?, ?)`;
        db.run(assignmentQuery, [eventId, classId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Assignment created', eventId });
        });
    });
});

//Read
app.get('/assignments', (req, res) => {
    const query = `
        SELECT e.*, a.ClassID
        FROM Event e
        JOIN Assignments a ON e.EventID = a.EventID
        WHERE e.Category = 'assignment'
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//Update
app.put('/assignments/:EventID', (req, res) => {
    const { EventID } = req.params;
    const { title, start, end, classId, category = 'assignment' } = req.body;

    const eventQuery = `UPDATE Event SET Title = ?, Start = ?, End = ?, Category = ? WHERE EventID = ?`;
    db.run(eventQuery, [title, start, end, category, EventID], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const assignmentQuery = `UPDATE Assignments SET ClassID = ? WHERE EventID = ?`;
        db.run(assignmentQuery, [classId, EventID], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Assignment with ID ${EventID} updated successfully` });
        });
    });
});

//Delete
app.delete('/assignments/:EventID', (req, res) => {
    const { EventID } = req.params;

    db.run('DELETE FROM Assignments WHERE EventID = ?', [EventID], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run('DELETE FROM Event WHERE EventID = ?', [EventID], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Assignment with ID ${EventID} deleted successfully` });
        });
    });
});



//Class CRUD
//Create
app.post('/class', authenticateToken, (req, res) => {
    const { title, time, startdate, enddate, daysoftheweek, teacher } = req.body;
    const userid = req.user.userid;
  
    db.run(
        "INSERT INTO Class (Title, Time, StartDate, EndDate, DaysOfTheWeek, Teacher, UserID) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [title, time, startdate, enddate, daysoftheweek, teacher, userid],
        function(err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(201).json({ message: 'Class created', classId: this.lastID });
        }
    );
});
  



//Read
app.get('/class', authenticateToken, (req, res) => {
    db.all("SELECT * FROM Class WHERE UserID = ?", [req.user.userid], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});


//Update
app.put('/class/:ClassID', authenticateToken, (req, res) => {
    const { ClassID } = req.params;
    const { title, time, startdate, enddate, daysoftheweek, teacher } = req.body;

    const query = `
        UPDATE Class
        SET Title = ?, Time = ?, StartDate = ?, EndDate = ?, DaysOfTheWeek = ?, Teacher = ?
        WHERE ClassID = ?
    `;

    db.run(query, [title, time, startdate, enddate, daysoftheweek, teacher, ClassID], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${ClassID}` 
        });
        res.json({ message: `Class with ID ${ClassID} updated successfully` });
    });
});


//Delete
app.delete('/class/:ClassID', authenticateToken, (req, res) => {
    const { ClassID } = req.params;

    db.run('DELETE FROM Class WHERE ClassID = ?', [ClassID], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${ClassID}` 
        });
        res.json({ message: `Class with ID ${ClassID} deleted successfully` });
    });
});




//Hobby CRUD
//Create
app.post('/hobby', authenticateToken, (req, res) => {
    const { hobbyname, start, end } = req.body;
    const userid = req.user.userid;

    db.run(
        "INSERT INTO Hobby (HobbyName, Start, End, UserID) VALUES (?, ?, ?, ?)",
        [hobbyname, start, end, userid],
        function(err) {
            if (err) {
                console.error('DB error:', err);
                return res.status(400).json({ message: err.message });
            }
            res.status(201).json({ message: 'Hobby created', hobbyId: this.lastID });
        }
    );
});

app.get('/hobby', authenticateToken, (req, res) => {
    db.all("SELECT * FROM Hobby WHERE UserID = ?", [req.user.userid], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
  
//Update
app.put('/hobby/:HobbyID', (req, res) => {
    const { HobbyID } = req.params;
    const { hobbyname, start, end} = req.body;
  
    const query = 
        `UPDATE Hobby 
        SET HobbyName = ?, Start = ?, End = ?
        WHERE HobbyID = ?`;
  
    db.run(query, [hobbyname, start, end, HobbyID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to update record', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${HobbyID}` 
        });
        res.json({ message: `Record with ID ${HobbyID} updated successfully`, updatedId: HobbyID });
    });
});
  
//Delete
app.delete('/hobby/:HobbyID', (req, res) => {
    const { HobbyID } = req.params;
    db.run('DELETE FROM Hobby WHERE HobbyID = ?', [HobbyID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to delete record', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${HobbyID}` 
        });
        res.json({ message: `Record with ID ${HobbyID} deleted successfully` });
    });
})



//---------------------------------------------------------------------------------------------

//People CRUD
//Create
app.post('/people', authenticateToken, (req, res) => {
    const { firstname, lastname, email, category } = req.body;
    const userId = req.user.userId;
    
    db.run(
        "INSERT INTO People (FirstName, LastName, Email, Category, UserID) VALUES (?, ?, ?, ?, ?)",
        [firstname, lastname, email, category, userId], 
        function (err) {
            if (err) {
                return res.status(400).json({ message: err.message });
            }
            res.status(201).json({ message: 'Person created', personId: this.lastID });
        }
    );
});


  


//Read  
app.get('/people', authenticateToken, (req, res) => {
    db.all("SELECT * FROM People WHERE UserID = ?", [user.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

  
//Update
app.put('/people/:PeopleID', (req, res) => {
    const { PeopleID } = req.params;
    const { firstname, lastname, email, category } = req.body;
  
    const query = 
        `UPDATE People
        SET FirstName = ?, LastName = ?, Email = ?, Category = ?
        WHERE PeopleID = ?`;
  
    db.run(query, [firstname, lastname, email, category, PeopleID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to update person', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No person found with ID ${PeopleID}` 
        });
        res.json({ message: `Person with ID ${PeopleID} updated successfully`, updatedId: PeopleID });
    });
});
  
//Delete
app.delete('/people/:PeopleID', (req, res) => {
    const { PeopleID } = req.params;
    db.run('DELETE FROM People WHERE PeopleID = ?', [PeopleID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to delete person', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${PeopleID}` 
        });
        res.json({ message: `Record with ID ${PeopleID} deleted successfully` });
    });
})


// Teacher CRUD
//Create
app.post('/teacher', (req, res) => {
    const { firstname, lastname, email, category = 'teacher'} = req.body;
    const query = `INSERT INTO People (FirstName, LastName, Email, Category) VALUES (?, ?, ?, ?)`;

    db.run(query, [firstname, lastname, email, category], function (err) {
        if (err) return res.status(500).json({ 
            error: err.message 
        });
        res.json({ 
            message: 'Teacher profile created', 
            personId: this.lastID 
        });
    });
});

// Read  
app.get('/teacher', (req, res) => {
    db.all("SELECT * FROM People WHERE Category = 'teacher'", [], (err, rows) => {
        if (err) return res.status(500).json({ 
            error: err.message 
        });
        res.json(rows);
    });
});

// Update
app.put('/teacher/:TeacherID', (req, res) => {
    const { TeacherID } = req.params;
    const { firstname, lastname, email, category = 'teacher'} = req.body;

    const query = 
        `UPDATE People
        SET FirstName = ?, LastName = ?, Email = ?, Category = ?
        WHERE PeopleID = ?`; 

    db.run(query, [firstname, lastname, email, category, TeacherID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to update teacher', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No teacher found with ID ${TeacherID}` 
        });
        res.json({ message: `Teacher with ID ${TeacherID} updated successfully`, updatedId: TeacherID });
    });
});

// Delete
app.delete('/teacher/:TeacherID', (req, res) => {
    const { TeacherID } = req.params;
    db.run('DELETE FROM People WHERE PeopleID = ?', [TeacherID], function (err) { 
        if (err) return res.status(500).json({ 
            error: 'Failed to delete teacher', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No teacher found with ID ${TeacherID}` 
        });
        res.json({ message: `Teacher with ID ${TeacherID} deleted successfully` });
    });
});

//Family CRUD
//Create
app.post('/family', (req, res) => {
    const { firstname, lastname, email, category = 'family'} = req.body;
    const query = `INSERT INTO People (FirstName, LastName, Email, Category) VALUES (?, ?, ?, ?)`;

    db.run(query, [firstname, lastname, email, category], function (err) {
        if (err) return res.status(500).json({ 
            error: err.message 
        });
        res.json({ 
            message: 'Family member profile created', 
            personId: this.lastID 
        });
    });
});

// Read  
app.get('/family', (req, res) => {
    db.all("SELECT * FROM People WHERE Category = 'family'", [], (err, rows) => {
        if (err) return res.status(500).json({ 
            error: err.message 
        });
        res.json(rows);
    });
});

// Update
app.put('/family/:FamilyID', (req, res) => {
    const { FamilyID } = req.params;
    const { firstname, lastname, email, category = 'family'} = req.body;

    const query = 
        `UPDATE People
        SET FirstName = ?, LastName = ?, Email = ?, Category = ?
        WHERE PeopleID = ?`; 

    db.run(query, [firstname, lastname, email, category, FamilyID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to update teacher', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No family found with ID ${FamilyID}` 
        });
        res.json({ message: `Family with ID ${FamilyID} updated successfully`, updatedId: FamilyID });
    });
});

// Delete
app.delete('/family/:FamilyID', (req, res) => {
    const { FamilyID } = req.params;
    db.run('DELETE FROM People WHERE PeopleID = ?', [FamilyID], function (err) { 
        if (err) return res.status(500).json({ 
            error: 'Failed to delete family member', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No family member found with ID ${FamilyID}` 
        });
        res.json({ message: `Family member with ID ${FamilyID} deleted successfully` });
    });
});

//Friend CRUD
//Create
app.post('/friend', (req, res) => {
    const { firstname, lastname, email, category = 'friend'} = req.body;
    const query = `INSERT INTO People (FirstName, LastName, Email, Category) VALUES (?, ?, ?, ?)`;

    db.run(query, [firstname, lastname, email, category], function (err) {
        if (err) return res.status(500).json({ 
            error: err.message 
        });
        res.json({ 
            message: 'Friend profile created', 
            personId: this.lastID 
        });
    });
});

// Read  
app.get('/friend', (req, res) => {
    db.all("SELECT * FROM People WHERE Category = 'friend'", [], (err, rows) => {
        if (err) return res.status(500).json({ 
            error: err.message 
        });
        res.json(rows);
    });
});

// Update
app.put('/friend/:FriendID', (req, res) => {
    const { FriendID } = req.params;
    const { firstname, lastname, email, category = 'friend'} = req.body;

    const query = 
        `UPDATE People
        SET FirstName = ?, LastName = ?, Email = ?, Category = ?
        WHERE PeopleID = ?`; 

    db.run(query, [firstname, lastname, email, category, FriendID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to update friend', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No friend found with ID ${FriendID}` 
        });
        res.json({ message: `Friend with ID ${FriendID} updated successfully`, updatedId: TeacherID });
    });
});

// Delete
app.delete('/friend/:FriendID', (req, res) => {
    const { FriendID } = req.params;
    db.run('DELETE FROM People WHERE PeopleID = ?', [FriendID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to delete friend', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No friend found with ID ${FriendID}` 
        });
        res.json({ message: `Friend with ID ${FriendID} deleted successfully` });
    });
});

//Tasks CRUD
//Create
app.post('/tasks', (req, res) => {
    const { title, start, end, category = 'task'} = req.body;
    const query = `INSERT INTO Event (Title, Start, End, Category) VALUES (?, ?, ?, ?)`;
  
    db.run(query, [title, start, end, category], function (err) {
        if (err) return res.status(500).json({ 
            error: err.message 
        });
        res.json({ 
            message: 'Task created', 
            eventId: this.lastID 
        });
    });
  });
  
//Read  
app.get('/tasks', (req, res) => {
    db.all("SELECT * FROM Event WHERE Category = 'task'", [], (err, rows) => {
        if (err) return res.status(500).json({ 
            error: err.message 
        });
        res.json(rows);
    });
});
  
//Update
app.put('/tasks/:EventID', (req, res) => {
    const { EventID } = req.params;
    const { title, start, end, category = 'task'} = req.body;
  
    const query = 
        `UPDATE Event 
        SET Title = ?, Start = ?, End = ?, Category = ?
        WHERE EventID = ?`;
  
    db.run(query, [title, start, end, category, EventID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to update task', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${EventID}` 
        });
        res.json({ message: `Task with ID ${EventID} updated successfully`, updatedId: EventID });
    });
});
  
//Delete
app.delete('/tasks/:EventID', (req, res) => {
    const { EventID } = req.params;
    db.run('DELETE FROM Event WHERE EventID = ?', [EventID], function (err) {
        if (err) return res.status(500).json({ 
            error: 'Failed to delete task', details: err.message 
        });
        if (this.changes === 0) return res.status(404).json({ 
            error: `No record found with ID ${EventID}` 
        });
        res.json({ message: `Record with ID ${EventID} deleted successfully` });
    });
})
//Meeting CRUD
//Create
app.post('/meeting', (req, res) => {
    const { title, start, end, peopleID } = req.body;

    
    const eventQuery = `INSERT INTO Event (Title, Start, End, Category) VALUES (?, ?, ?, 'meeting')`;
    db.run(eventQuery, [title, start, end], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const eventId = this.lastID;

        
        const query = `INSERT INTO Meeting (EventID, PeopleID) VALUES (?, ?)`;
        db.run(query, [eventId, peopleID], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Meeting created', meetingId: this.lastID });
        });
    });
});

//Read
app.get('/meeting', (req, res) => {
    db.all("SELECT * FROM Meeting", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//Update
app.put('/meeting/:MeetingID', (req, res) => {
    const { MeetingID } = req.params;
    const { title, start, end, peopleID } = req.body;

    
    const eventQuery = `UPDATE Event SET Title = ?, Start = ?, End = ?, Category = 'meeting' WHERE EventID = ?`;
    db.run(eventQuery, [title, start, end, MeetingID], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: `No meeting found with ID ${MeetingID}` });

    
        const query = `UPDATE Meeting SET PeopleID = ? WHERE MeetingID = ?`;
        db.run(query, [peopleID, MeetingID], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: `Meeting with ID ${MeetingID} updated successfully` });
        });
    });
});

//Delete
app.delete('/meeting/:MeetingID', (req, res) => {
    const { MeetingID } = req.params;
    db.run('DELETE FROM Meeting WHERE MeetingID = ?', [MeetingID], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: `No meeting found with ID ${MeetingID}` });
        res.json({ message: `Meeting with ID ${MeetingID} deleted successfully` });
    });
});