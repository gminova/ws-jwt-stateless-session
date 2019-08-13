"use strict";

const { readFile } = require("fs");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");

const notFoundPage = '<p style="font-size: 10vh; text-align: center;">404!</p>';

module.exports = (req, res) => {
  switch (`${req.method} ${req.url}`) {
    case "GET /":
      return readFile("./index.html", (err, data) => {
        res.writeHead(200, {
          "Content-Type": "text/html",
          "Content-Length": data.length
        });
        return res.end(data);
      });
    case "POST /login":
      jwt.sign(
        { user: "Gigi" },
        "!some_super_secret_string!",
        { algorithm: "HS256" },
        (err, token) => {
          if (err) {
            const message = "<h1 style='font-size: 10vh; text-align: center;'>400, Bad Request :'(</h1>";
            res.writeHead(400, {
              "Content-type": "text/html",
              "Content-Length": message.length
            });
            res.end(message);
          } else {
            res.setHeader(
              "Set-Cookie",
              cookie.serialize("logged-in", token, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7 // 1 week
              })
            );
            // Redirect back after setting cookie
            res.statusCode = 302;
            res.setHeader("Location", req.headers.referer || "/");
            res.end();
          }
        }
      ); break;
    default:
      res.writeHead(404, {
        "Content-Type": "text/html",
        "Content-Length": notFoundPage.length
      });
      return res.end(notFoundPage);
  }
};
