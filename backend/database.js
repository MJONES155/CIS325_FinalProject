const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./myfinaldatabase.db')



db.serialize(() => { 

    
    db.run(`CREATE TABLE IF NOT EXISTS User (
        UserID INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT UNIQUE, 
        password TEXT,
        Email TEXT
    )`, logResult('User'));

    db.run(`CREATE TABLE IF NOT EXISTS Work (
        WorkID INTEGER PRIMARY KEY AUTOINCREMENT,
        Title TEXT NOT NULL, 
        Start TEXT NOT NULL,
        End TEXT NOT NULL,
        UserID INTEGER,
        FOREIGN KEY(UserID) REFERENCES User(UserID)
    )`, logResult('Work'));
    
    db.run(`CREATE TABLE IF NOT EXISTS Event(
        EventID INTEGER PRIMARY KEY,
        Title TEXT NOT NULL, 
        Start TEXT NOT NULL,
        End TEXT NOT NULL,
        Category TEXT CHECK(Category IN ('task', 'assignment', 'meeting', 'class', 'hobby')),
        UserID INTEGER,
        FOREIGN KEY(UserID) REFERENCES User(UserID)
    )`, logResult('Event'));

    db.run(`CREATE TABLE IF NOT EXISTS Tasks (
    TaskID INTEGER PRIMARY KEY,
    EventID INTEGER NOT NULL,
    FOREIGN KEY (EventID) REFERENCES Event(EventID)
    )`, logResult('Tasks'));
    
    db.run(`CREATE TABLE IF NOT EXISTS People (
    PeopleID INTEGER PRIMARY KEY,
    FirstName TEXT NOT NULL, 
    LastName TEXT NOT NULL, 
    Email TEXT,
    Category TEXT CHECK(Category IN ('teacher', 'friend', 'family')),
    UserID INTEGER,
    FOREIGN KEY(UserID) REFERENCES User(UserID)
    )`, logResult('People'));

    db.run(`CREATE TABLE IF NOT EXISTS Meeting (
    MeetingID INTEGER PRIMARY KEY,
    EventID INTEGER NOT NULL,
    PeopleID INTEGER NOT NULL,
    FOREIGN KEY (EventID) REFERENCES Event(EventID),
    FOREIGN KEY (PeopleID) REFERENCES People(PeopleID)
    )`, logResult('Meeting'));

    db.run(`CREATE TABLE IF NOT EXISTS Class (
    ClassID INTEGER PRIMARY KEY,
    Title TEXT,
    Time TEXT,
    StartDate TEXT NOT NULL,
    EndDate TEXT NOT NULL,
    DaysOfTheWeek TEXT,
    Teacher TEXT,
    UserID INTEGER,
    FOREIGN KEY(UserID) REFERENCES User(UserID)
    )`, logResult('Class'));

    db.run(`CREATE TABLE IF NOT EXISTS Assignments (
    AssignmentID INTEGER PRIMARY KEY,
    EventID INTEGER NOT NULL,
    ClassID INTEGER NOT NULL,
    FOREIGN KEY (EventID) REFERENCES Event(EventID),
    FOREIGN KEY (ClassID) REFERENCES Class(ClassID)
    )`, logResult('Assignments'));


    db.run(`CREATE TABLE IF NOT EXISTS Friend (
    FriendID INTEGER PRIMARY KEY,
    PeopleID INTEGER NOT NULL,
    FOREIGN KEY (PeopleID) REFERENCES People(PeopleID)
    )`, logResult('Friend'));
    
    db.run(`CREATE TABLE IF NOT EXISTS Family (
    FamilyID INTEGER PRIMARY KEY,
    PeopleID INTEGER NOT NULL,
    FOREIGN KEY (PeopleID) REFERENCES People(PeopleID)
    )`, logResult('Family'));

    db.run(`CREATE TABLE IF NOT EXISTS Teacher (
    TeacherID INTEGER PRIMARY KEY,
    PeopleID INTEGER NOT NULL,
    FOREIGN KEY (PeopleID) REFERENCES People(PeopleID)
    )`, logResult('Teacher'));

    db.run(`CREATE TABLE IF NOT EXISTS Hobby (
    HobbyID INTEGER PRIMARY KEY,
    HobbyName TEXT NOT NULL,
    Start TEXT NOT NULL,
    End TEXT NOT NULL,
    UserID INTEGER,
    FOREIGN KEY(UserID) REFERENCES User(UserID)
    )`, logResult('Hobby'));
     
    
});

//Makes sure tables are ready
function logResult(tableName) {
    return function (err) {
        if (err) {
            console.error(`Error creating ${tableName} table:`, err.message);
        } else {
            console.log(`${tableName} table is ready.`);
        }
    };
}
module.exports = db; //Exports the database