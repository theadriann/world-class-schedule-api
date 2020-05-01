const _ = require("lodash");
const qs = require("qs");
const axios = require("axios");
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");

class API {
    //

    constructor() {
        this.urls = {
            auth: "authenticate.php",
            info: "member-get-dashboard-info.php",
            getClubs: "get-clubs.php",
            getSchedule: "class-schedule.php",
        };

        this.instance = axios.create({
            baseURL: "https://apiv2.upfit.biz/",
            // timeout: 1000,
            headers: {
                accept: "application/json, text/plain, */*",
                "content-type":
                    "application/x-www-form-urlencoded; charset=UTF-8",
                origin: "ionic://localhost",
                "accept-language": "en-gb",
                "user-agent":
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 13_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
            },
        });

        this.isAuthP = new Promise((resolve, reject) =>
            this._getInfo().then((data) => {
                if (data.error && data.error[0] === "ERROR_LOGIN_MEMBER") {
                    return this.auth().then(resolve).catch(reject);
                }
            })
        );
    }

    async auth() {
        const data = { project: "wcr" };
        const params = qs.stringify({
            json: true,
            email: process.env.EMAIL,
            member_password: process.env.PASSW,
        });

        const res = await this.instance({
            method: "POST",
            url: `${this.urls.auth}?${params}`,
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: qs.stringify(data),
        });

        try {
            this.instance.defaults.headers["auth"] = `Bearer ${res.data.token}`;
        } catch (e) {
            console.log("idk", e);
        }

        return res.data;
    }

    async _getInfo() {
        const data = { project: "wcr", mbid: "231819", lang: "2" };
        const res = await this.instance({
            method: "POST",
            url: `${this.urls.info}?${qs.stringify({ json: true })}`,
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: qs.stringify(data),
        });

        return res.data;
    }

    async getInfo() {
        await this.isAuthP;

        return this._getInfo();
    }

    async getClubsJSON() {
        await this.isAuthP;

        const data = { project: "wcr", mbid: "231819", lang: "2" };
        const res = await this.instance({
            method: "POST",
            url: `${this.urls.getClubs}?${qs.stringify({ json: true })}`,
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: qs.stringify(data),
        });

        return res.data;
    }

    async getClubs() {
        const json = await this.getClubsJSON();

        return _.map(json.clubs, (club, id) => ({
            id: club.clubid,
            name: club.club_name,
            shortName: club.club_name.replace("World Class ", ""),
            city: club.club_city,
            resources: _.map(_.values(club.resources), (res) => res.name),
        }));
    }

    async getScheduleJSON({ clubid, date_start, date_end }) {
        await this.isAuthP;

        const data = { project: "wcr", mbid: "231819", lang: "2" };
        const params = qs.stringify({
            json: true,
            clubid,
            date_start,
            date_end,
        });

        const res = await this.instance({
            method: "POST",
            url: `${this.urls.getSchedule}?${params}`,
            headers: { "content-type": "application/x-www-form-urlencoded" },
            data: qs.stringify(data),
        });

        return res.data;
    }

    async getSchedule({ clubid, date_start, date_end }) {
        const json = await this.getScheduleJSON({
            clubid,
            date_start,
            date_end,
        });

        return _.map(json.schedule, (sch) => {
            const end_hour = moment
                .duration(sch.hour)
                .add(Number(sch.duration), "minutes")
                .format("hh:mm");

            return {
                id: sch.id,
                date: sch.date,
                hour: sch.hour,
                start_hour: sch.hour,
                end_hour: end_hour,
                duration: sch.duration,
                name: sch.name,
                room: sch.room,
                clubid: json.clubid,
                trainers: sch.trainers,
            };
        });
    }

    async getSchedules({ clubids, date_start, date_end }) {
        const schedules = await Promise.all(
            clubids.map((clubid) =>
                this.getSchedule({ clubid, date_start, date_end })
            )
        );

        return _.flatten(schedules);
    }

    async getAllSchedules({ date_start, date_end }) {
        const clubs = await this.getClubs();
        const clubids = _.map(clubs, "id");
        const schedules = await this.getSchedules({
            clubids,
            date_start,
            date_end,
        });

        return { clubs, schedules };
    }
}

module.exports = new API();
