import express, { RequestHandler, Response } from 'express';
import { WebsocketRequestHandler } from 'express-ws';
import * as WebSocketType from 'ws';
import { NotesResponse, NoteResponse, Note } from '../types';
import { getNotes, getNote, addNote, updateNote, deleteNote } from '../utils';
import db from "../firebase";

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
  const notes = await getNotes();

  //send notes to connected clients
  ws.send(JSON.stringify(notes));

  //push connected client to clients array
  clients.push(ws);

  //filter out client from clients arrays on disconnection
  ws.on("close", function () {
    clients = clients.filter((client) => client !== ws);
  });

  //listen for changes in notes collection and send to all connected clients
  db.collection("notes")
  .onSnapshot((snapshot) => {
    const notes: Note[] = [];
    const notesRes: NoteResponse[] = [];

    //loop through snapshot
    snapshot?.forEach((doc) => {
      const { title, content } = doc.data();
        notes.push({ id: doc.id, title});
        notesRes.push({ id: doc.id, title, content });
    });

    // Send notes to all clients
    clients.forEach((client) => {
      client.send(JSON.stringify(notes));
    });
  }, 
  (error) => {
    console.log("Error listening to firestore changes: ", error.message);
  });
};

const noteHandler: WebsocketRequestHandler = (ws, req) => {
  ws.on("message", async () => {
    const note = await getNote(req.params.id);
    return ws.send(JSON.stringify(note));
  });
};

const addNoteHandler: RequestHandler = async (req, res: Response, next) => {
  const { title } = req.body;

  try {
    const id = await addNote(title);
    res.status(200).json({ id });
  }
  catch(err) {
    console.log("error adding note fetching note by id");
    res.status(400).json(null);
    //next(err);
  }
}

const updateNoteHandler: RequestHandler = async (req, res: Response, next) => {

  try {
    const resObj = await updateNote(req.params.id, req.body.title);
    
    if(resObj) {
      res.status(200).json(resObj);
    }
    else {
      throw Error();
    }

  }
  catch(err) {
    console.log("error updating note title");
    res.status(400).json(null);
    //next(err);
  }
}

const deleteNoteHandler: RequestHandler = async (req, res: Response, next) => {

  try {
    const resObj = await deleteNote(req.params.id);
    
    if(resObj) {
      res.status(200).json(resObj);
    }
    else {
      throw Error();
    }

  }
  catch(err) {
    console.log("error deleting note");
    res.status(400).json(null);
    //next(err);
  }
}

router.get("/", notesHandler);
router.post('/', addNoteHandler);
router.patch('/:id', updateNoteHandler);
router.delete('/:id', deleteNoteHandler);
router.ws("/:id", noteHandler);
router.ws("/", notesHandlerWS);

export default router;
