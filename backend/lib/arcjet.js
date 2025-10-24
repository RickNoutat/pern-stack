import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";

import "dotenv/config";

// Initialize ArcJet

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    // shield against common attacks like SQL injection, XSS, CSRF attacks
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      // block all bots except search engines
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        // see the full list at https://arcjet.com/bot-list
      ],
    }),
    // rate limiting
    tokenBucket({
      mode: "LIVE",
      refillRate: 30,
      interval: 10,
      capacity: 20,
    }),
  ],
});
