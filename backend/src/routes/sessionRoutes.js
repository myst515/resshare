const express = require('express');
const router = express.Router();

const sessionManager = require('./routes/sessionRoutes')

/***INTEGRATION***/
 
//Check facility availability
/* Code here*/


//Start a facility usage session
router.post('/sessions', (req, res) => {
    try{
        const {faciityId, userID, duration} = req.body;
        const session = sessionManager.startSession(Number(facilityId), Number(userId), Number(duration));

        res.status(201).json(session);
    }
    catch (error){
        res.status(400).json({message: error.message});
    }
});

//End a usage session
/*Code here */
