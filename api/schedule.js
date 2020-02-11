const cors = require('cors');
const dayjs = require('dayjs');
const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');

const app = express();
const api = require('../services/getSchedule');

const DATE_FORMAT = 'YYYY-MM-DD';

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/test', async (req, res) => {
    await res.send({ status: 200, data: {} });
});

app.get('/all', async (req, res) => {
    try {
        const today = dayjs();

        let date_start = today.format(DATE_FORMAT);
        let date_end = today.add(7, 'days').format(DATE_FORMAT);

        if (req.query.date_start) {
            const date = dayjs(req.query.date_start);
            date_start = date.isValid() ? date.format(DATE_FORMAT) : date_start;
        }

        if (req.query.date_end) {
            const date = dayjs(req.query.date_end);
            date_end = date.isValid() ? date.format(DATE_FORMAT) : date_end;
        }

        const { clubs, schedules } = await api.getAllSchedules({
            date_start,
            date_end
        });

        return res.status(200).send({
            clubs,
            schedules
        });
    } catch (error) {
        console.log(error, 'error!!');
        return res.status(500).send('sorry :)');
    }
});

module.exports.handler = serverless(app);
