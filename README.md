## Repository structure

We follow the monorepo pattern:

- [apps](apps) contains executable and deployable packages:
  - [frontend](apps/frontend) contains the user facing Next.JS app.
  - [backend](apps/backend) contains the backend express app.

## How to run the system

Start the dev server on [http://localhost:3000](http://localhost:3000) by running **`npm run dev`** in the root folder.

## Type checking and linting

Each app has a `check` script that runs the linting and typechecking. Run it in all apps from the root by running: `npm run check --workspaces`.

## Features

- Rich-text editing with support for formating such as Bold, Italic, Underline, etc.
- Realtime collaboration with changes synced and transmitted to all connected clients.
- Ability to created new notes.
- Ability to edit note titles and all connected clients will see changes.
- Ability to paste formated text and the original formating is retained.
- Ability to add and visit hyperlinks.

## Tech Stack

- **TypeScript** as the programming language.
- **ReactJS** on the frontend and **ExpressJS + NodeJS** on the backend.
- **[MaterialUI](https://mui.com/)** for styling
- **[SlateJS](https://www.slatejs.org/)** as primary text editor.
- **[Express-ws](https://www.npmjs.com/package/express-ws)** for emitting and receiving real-time changes to editor.
- **[Firestore](https://firebase.google.com/products/firestore)** for Database storage.
- **[Slate-yjs](https://docs.slate-yjs.dev/)** for editor shared types.
- **[Yjs](https://yjs.dev/)** for crdt syncing.

## Challenges, Implementation, and optimization

  #### How to implement rich-text editing

  Slatejs was used as the primary editor. It supports rich-text editing out-of-the-box. Different formating can be added, such as Bold, Italics, Underline, Bulleted-list, Numbered-list, etc.

  #### How to transmit changes made in editor to other clients in real-time

  This was done using [express-ws](https://www.npmjs.com/package/express-ws) on the backend, and [react-use-websocket](https://www.npmjs.com/package/react-use-websocket) on the frontend. When a client opens a note, they join a room represented by docId of the note, and they start receiving real-time changes made to that note.

  #### How to sync merge changes to a note from multiple clients

  The Yjs library, which is a crdt implementation, is used to sync updates made to a note by multiple collaborating clients. First the note is fetched from db in slatejs format, it is then converted to yjs doc and stored in memory/cache. A function exists on the backend that takes real-time updates from clients and merges them with the ydoc in memory using the Yjs library, in order to resolve merge conflicts. After merging, the function broadcasts updates to connected clients to sync locally. 
  
  #### How to improve load times of notes

  The caching layer also optimizes load times of notes because when a new client requests for a note, the cache is first checked to see if the note is already there and then returned to the client.

  #### How to save real-time changes to Database
  
  Notes that are currently active are temporarily stored in-memory as ydoc and real-time changes are synced with it. A background process or cronjob is then simulated using a Javascript setInterval function that runs to collect the notes, convert them back to slatejs, and persist them in the database in batches.
