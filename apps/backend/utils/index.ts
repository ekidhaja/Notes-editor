import { Descendant } from "slate";
import db from "../firebase";
import { Note, NoteResponse } from "../types";

const blankNoteContent = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  }
] as unknown as Array<Descendant>

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

export async function addNote(title: string) {
  const { id } = await db.collection("notes").add({
      title,
      content: blankNoteContent
  });

  return id;
}

export async function updateNote(id: string, title: string) {
  const res = await db.collection("notes").doc(id).update({ title });

  return res;
}

export async function deleteNote(id: string) {
  const res = await db.collection("notes").doc(id).delete();

  return res;
}