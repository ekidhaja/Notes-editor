import { slateNodesToInsertDelta } from '@slate-yjs/core';
import express from 'express';
import { WebsocketRequestHandler } from 'express-ws';
import * as WebSocketType from 'ws';
import * as Y from 'yjs';

import { getNote } from '../utils';
import { addToCache, getFromCache } from '../cache';

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

const syncHandler: WebsocketRequestHandler = async (ws, req) => {
  const noteId = req.params.id;
  console.log("Client connected");

  //add new client to noteId array
  clients[noteId]? clients[noteId].push(ws) : clients[noteId] = [ws];

  /* Check if encoded Ydoc is in memory and send to client
  * Else retrieve note from db, encode to Ydoc and send to client
  */
  if(getFromCache(noteId)) {
    const doc = getFromCache(noteId);
    ws.send(Y.encodeStateAsUpdate(doc));
  } 
  else {
    // Get note from db
    const note = await getNote(noteId);
    if (!note) return; 

    // Create a new YDoc instance
    const doc = new Y.Doc(); 
    addToCache(noteId, doc);

    // Declare a shared type and convert note contents from slate to yjs datatype and store it in ydoc.
    const sharedType = doc.get("content", Y.XmlText) as Y.XmlText;
    sharedType.applyDelta(slateNodesToInsertDelta(note.content));

    // send the encoded ydoc to client
    ws.send(Y.encodeStateAsUpdate(doc));
  }

  // Receive note edits from clients
  ws.on("message", (data) => {
    //get ydoc from in-memory storage
    const doc = getFromCache(noteId);

    // Merge data using yjs.
    Y.applyUpdate(doc, new Uint8Array(data as ArrayBufferLike));

    //masterDocs[noteId] = doc;

    // Send update to all clients with the new doc
    clients[noteId].forEach((client) => {
      client.send(Y.encodeStateAsUpdate(doc));
    });

  });

  //clean up on client disconnection
  ws.on("close", function () {
    console.log("Client disconnected");

    //filter out diconnected client
    clients[noteId] = clients[noteId].filter((client) => client !== ws);

    // //delete endoced Ydoc from memory if all clinets are disconnected
    // if (!clients[noteId].length) {
    //   console.log("All clients disconnected. Deleting note from in-memory store"); 
    //   delete masterDocs[noteId];
    // }
  });

};

router.ws("/:id", syncHandler);

export default router;
