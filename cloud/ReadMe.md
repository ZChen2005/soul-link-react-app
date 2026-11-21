# Turning on sharing (Firebase, free)

Without this the app still works, but games are only saved in your own browser.
With it, anyone who has a game's link can open it and edit it, and changes show up for
everyone within about a second.

## 1. Create the project
1. Go to https://console.firebase.google.com and sign in with a Google account.
2. **Add project**, give it a name (for example `soul-link-tracker`). You can turn Google Analytics off.

## 2. Create the database
1. In the left menu choose **Build > Firestore Database > Create database**.
2. Pick any location near you. Choose **Start in production mode**.

## 3. Set the rules
Open the **Rules** tab, replace everything with the text below, and press **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow get, create, update, delete: if true;
      allow list: if false;
    }
  }
}
```

This lets anyone who knows a game's exact link read, change or delete that game. Nobody can
list all games, and the links are long random codes that can't be guessed.

## 4. Get your settings
1. Click the gear next to **Project Overview > Project settings**.
2. Under **Your apps** press the **</>** (web) button, give the app a nickname, and register it
   (no hosting needed).
3. Copy the `firebaseConfig` values it shows.
4. Paste them into `src/cloud/firebaseConfig.js` (apiKey, authDomain, projectId, and so on).

Restart `npm start`. A **Share link** button now appears at the top of each game.

## 5. Put the app online
Links only work for other people if the app itself is on the internet.
1. Run `npm run build`.
2. Upload the `build` folder to a free host such as Netlify (drag and drop the folder at
   https://app.netlify.com/drop) or Vercel.
3. Open the site and use it from there. The Share link button copies an address on that site.

Links look like `https://yoursite.netlify.app/#/game/<code>`, so no special hosting setup is needed.

## Notes
- If two people change the same thing in the same second, the most recent change wins.
- Load Game lists the games opened in this browser. Delete removes the game from the database
  for everyone, so the link stops working. Other people who had it open see "This game was deleted."
- A game you made before turning on sharing is uploaded the first time you open it.