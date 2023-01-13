import express, { RequestHandler, Response } from 'express';
import { WebsocketRequestHandler } from 'express-ws';
import * as WebSocketType from 'ws';
import { NotesResponse, NoteResponse } from '../types';
import { getNotes, getNote } from '../utils';

import { NOTE_1, NOTE_2 } from '../fixtures/notes';

// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
const patch = require("express-ws/lib/add-ws-method");
patch.default(express.Router);

const router = express.Router();

let clients: WebSocketType[] = [];

const notesHandler: RequestHandler = async (_req, res: Response<NotesResponse>) => {
  const notes = await getNotes();

  res.json({ notes });
};

const notesHandlerWS: WebsocketRequestHandler = async (ws, req) => {
  console.log("client connected for all notes");

  const notes = await getNotes();
  console.log("notes are: ", notes)

  ws.send(JSON.stringify(notes));

  clients.push(ws);

  ws.on("close", function () {
    console.log("Client disconnected");
  
    //filter out diconnected client
    clients = clients.filter((client) => client !== ws);
  });
};

const noteHandler: WebsocketRequestHandler = async (ws, req) => {
  ws.on("message", async () => {
    const note = await getNote(req.params.id);
    console.log("note is: ", note)
    return ws.send(JSON.stringify(NOTE_1));
  });
};

router.get("/", notesHandler);
router.ws("/:id", noteHandler);
router.ws("/", notesHandlerWS);

export default router;
