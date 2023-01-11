import { slateNodesToInsertDelta } from '@slate-yjs/core';
import express from 'express';
import { WebsocketRequestHandler } from 'express-ws';
import * as WebSocketType from 'ws';
import * as Y from 'yjs';

import * as Notes from '../fixtures/notes';

//temp datastore of all notes. This will be replaced with actual notes stored in the database
const notes: { [k: string]: Notes.Note } = { ...Notes };

// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
const patch = require("express-ws/lib/add-ws-method");
patch.default(express.Router);

const router = express.Router();

/**
 * An in-memory storage that maintains key/value pairs of websocket clients connected to a particular note.
*/
const clients: { [k: string]: WebSocketType[] } = {};

/**
 * An in-memory storage of Y.Docs. One Y.Doc per note.
 * This stores notes currently being edited in memory
 * It is retrieved from db when someone connects to a note for the first time
 * When all websocket clients are disconnected, the corresponding item is deleted from the in-memory storage.
*/
const masterDocs: { [k: string]: Y.Doc } = {};

const syncHandler: WebsocketRequestHandler = (ws, req) => {
  const noteId = req.params.id;
  console.log("Client connected");

  //add new client to noteId array
  clients[noteId]? clients[noteId].push(ws) : clients[noteId] = [ws];

  /* Check if encoded Ydoc is in memory and send to client
  * Else retrieve note from db, encode to Ydoc and send to client
  */
  if(masterDocs[noteId]) {
    const doc = masterDocs[noteId];
    ws.send(Y.encodeStateAsUpdate(doc));
  } 
  else {
    // Find the correct note. Replace this with db query.
    let note = null;
    for (const i in notes) {
      if (notes[i].id === noteId) {
        note = notes[i];
        break;
      }
    }
    if (!note) return;

    // Create a new YDoc instance
    const doc = new Y.Doc();
    masterDocs[noteId] = doc;
    const sharedType = doc.get("content", Y.XmlText) as Y.XmlText;

    // Convert note contents from slate to yjs datatype and store it in ydoc.
    sharedType.applyDelta(slateNodesToInsertDelta(note.content));

    // send the encoded ydoc to client
    ws.send(Y.encodeStateAsUpdate(doc));
  }

  // Receive note edits from clients
  ws.on("message", (data) => {
    // console.log("Data received");

    // Merge data using yjs and broadcast to all clients connected to note.
    const doc = masterDocs[noteId];
    Y.applyUpdate(doc, new Uint8Array(data as ArrayBufferLike));

    // Send update to all clients with the new doc
    clients[noteId].forEach((client) => {
      client.send(Y.encodeStateAsUpdate(doc));
    });

  });

  ws.on("open", function () {
    console.log("websocket connection open");
  });

  ws.on("close", function () {
    console.log("Client disconnected");

    //filter out diconnected client
    clients[noteId] = clients[noteId].filter((client) => client !== ws);

    //delete endoced Ydoc from memory if all clinets are disconnected
    if (!clients[noteId].length) {
      console.log("All clients disconnected. Deleting masterDoc");
      delete masterDocs[noteId];
    }
  });

};

router.ws("/:id", syncHandler);

export default router;
