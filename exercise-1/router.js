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
            const message =
              "<h1 style='font-size: 10vh; text-align: center;'>400, Bad Request :'(</h1>";
            res.writeHead(400, {
              "Content-type": "text/html",
              "Content-Length": message.length
            });
            res.end(message);
          } else {
            res.setHeader(
              "Set-Cookie",
              cookie.serialize("loggedIn", token, {
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
      );
      break;
    case "POST /logout":
      res.setHeader("Set-Cookie", "loggedIn=0; Max-Age=0;");
      // Redirect back after setting cookie
      res.statusCode = 302;
      res.setHeader("Location", req.headers.referer || "/");
      res.end();
      break;
    case "GET /auth_check":
      // Parse the cookies on the request
      let cookies = cookie.parse(req.headers.cookie || "");
      // Get the visitor name set in the cookie
      let loggedIn = cookies.loggedIn;
      if (typeof loggedIn != "undefined") {
        let decoded = jwt.verify(loggedIn, "!some_super_secret_string!");
        if (decoded && decoded.user === "Gigi") {
          const message = `<h1 style='font-size: 10vh; text-align: center;'>Welcome, back, ${
            decoded.user
          }!</h1>`;
          res.writeHead(200, {
            "Content-type": "text/html",
            "Content-Length": message.length
          });
          res.end(message);
        }
      } else {
        const message =
          "<h1 style='font-size: 10vh; text-align: center;'>Hello, new user!</h1>";
        res.writeHead(401, {
          "Content-type": "text/html",
          "Content-Length": message.length
        });
        res.end(message);
      }
      break;

    default:
      res.writeHead(404, {
        "Content-Type": "text/html",
        "Content-Length": notFoundPage.length
      });
      return res.end(notFoundPage);
  }
};
