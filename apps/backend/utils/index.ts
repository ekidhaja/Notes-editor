import db from "../firebase";
import { Note, NoteResponse } from "../types";

export async function getNotes() {
    const snapshot = await db.collection('notes').get();
    const notes: Note[] = [];

    snapshot.forEach((doc) => {
      const { title } = doc.data();
      notes.push({ id: doc.id, title })
    });

    return notes;
}

export async function getNote(id: string) {
    const doc = await db.collection('notes').doc(id).get();
    const note = doc.data() as NoteResponse; 
    if(note) note.id = doc.id;

    return note;
}