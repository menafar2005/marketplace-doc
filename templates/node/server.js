// server.js: همه‌ی مسیرها کنار هم. اجرا: node --env-file=.env server.js
// وابستگی‌ها: npm install express express-session
import express from "express";
import session from "express-session";
import { install } from "./install.js";
import { launch } from "./launch.js";
import { link } from "./link.js";
import { jsonModal } from "./json-modal.js";
import { customUi } from "./custom-ui.js";
import { settings } from "./settings.js";

const app = express();
app.set("trust proxy", 1); // پشت tunnel یا load balancer با HTTPS
// session سایت خودت (برای state نصب). SESSION_SECRET هم مثل بقیه‌ی secretها فقط روی سرور.
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { secure: true } }));

app.use(install, launch, link, jsonModal, customUi, settings);
app.listen(process.env.PORT ?? 3000);
