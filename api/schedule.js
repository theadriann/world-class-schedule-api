const express = require("express");
const bodyParser = require("body-parser");
const serverless = require("serverless-http");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/index", async (req, res) => {
    await res.send({ status: 200, data: {} });
});

// app.get("/", async (req, res) => {
//     try {
//         await dbConnection();
//         const allProducts = await ProductService.getAllProduct();
//         if (allProducts) {
//             return res.status(200).send({
//                 data: allProducts
//             });
//         }
//     } catch (error) {
//         //  handle errors here
//         console.log(error, "error!!");
//     }
// });

module.exports.handler = serverless(app);
