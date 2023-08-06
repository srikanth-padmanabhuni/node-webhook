const express = require('express');
const morgan = require('morgan');
const axios = require('axios');
const path = require('path');
const pool = require('./db');

const uuid = require('uuid')

const app = express();
const PORT = 8080

const startServer = () => {
    app.listen(PORT, () => {
        console.log("App server running on port " + PORT);
    })
}

const addMiddleWares = () => {
    app.use(express.json());
    app.use(morgan(function (tokens, req, res) {
        return [
          '[' + new Date().toLocaleString() + ']',
          '[' + path.basename(__filename) + ']',
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res), 'ms',
        ].join(' ');
      }));
}

const addRoutes = () => {
    app.get('/healthCheck', (req, res) => {
        return res.json({
            body: "Webapp is working fine",
            status: 200
        })
    })

    app.post('/create/school', (req, res) => {
        const response = createSchool(req.body);
        response.then((resp) => {
            return res.json(resp);
        }).catch((error) => {
            return res.json(error);
        })
    })

    app.post('/create/student', (req, res) => {
        const response = createStudent(req.body);
        response.then((resp) => {
            const school = getSchool(req.body.school_id);
            school.then((sch) => {
                const webhookUrl = sch[0].webhookurl;
                const resp_web = makeAxiosReq("POST", webhookUrl, {
                    data: "Admin Created Student with name " + req.body.name + " Successfully!!!"
                })
                resp_web.then((d) => {
                    return res.json(d.data)
                })
            })
        }).catch((error) => {
            return res.json(error);
        })
    })
}

async function makeAxiosReq(reqType, url, body) {
    if(reqType == 'GET') {
        const response = await axios.get(url);
        return response;
    } else {
        const response = await axios.post(url, body);
        return response;
    }
}

async function getSchool(schoolId) {
    const query = `SELECT * FROM school where id like '%${schoolId}%'`;
    
    try {
        const result = await pool.query(query);   
        return result.rows;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

async function createSchool(schoolData) {
    const query = `INSERT INTO school (id, name, webhookurl) VALUES ($1, $2, $3)`;
    const values = [uuid.v4(), schoolData.name, schoolData.webhookurl];

    try {
        const result = await pool.query(query, values);
        console.log('Data inserted successfully');
        return result;
    } catch (error) {
        console.error('Error inserting data:', error);
        return error;
    }
}

async function createStudent(studentData) {
    const query = `INSERT INTO student (id, name, school_id) VALUES ($1, $2, $3)`;
    const values = [uuid.v4(), studentData.name, studentData.school_id];

    try {
        const result = await pool.query(query, values);
        console.log('Data inserted successfully');
        return result;
    } catch (error) {
        console.error('Error inserting data:', error);
        return error;
    }
}

addMiddleWares();
addRoutes();
startServer();