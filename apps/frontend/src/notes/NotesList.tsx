import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";
import { useNotesList } from "./hooks";
import useWebSocket from 'react-use-websocket';
import { NoteContext } from "../contexts/NoteContext";
import EditButton from "../components/EditButton";

interface NotesListProps {
  activeNoteId?: string;
}

interface Note {
  id: string,
  title: string
}

const NotesList: React.FC<NotesListProps> = ({ activeNoteId }) => {
  const { notesList } = useNotesList();
  const [notes, setNotes] = useState<Note[] | undefined>(notesList);
  const { activeNote, dispatch } = useContext(NoteContext);
  const ws = useWebSocket(`ws://localhost:3001/api/notes`);

  useEffect(() => {
    setNotes(notesList);
  }, [notesList]);

  //listen to noteList changes
  useEffect(() => {
    if(!ws?.lastMessage?.data) return;
    const newNotes = ws?.lastMessage && (JSON.parse(ws?.lastMessage?.data) as Note[]);
    setNotes(newNotes); 

    //loop through newNotes and update activeNote title
    if(activeNote?.id) {
      newNotes.forEach((note) => {
        if(note.id === activeNote.id && note.title !== activeNote.title) {
          dispatch({ type: "UPDATE", note: { title: note.title }});
        }
      })
    }
  }, [ws.lastMessage]);

  return (
    <List>
      {notes?.map((note) => (
        <ListItem key={note.id} selected={note.id === activeNoteId} disablePadding>
            <Link href={`/notes/${note.id}`}>
              <ListItemButton>
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary={note.title} />
              </ListItemButton>
            </Link>
            <ListItemIcon>
              <EditButton title={note.title} id={note.id} />
            </ListItemIcon>
        </ListItem>
      ))}
    </List>
  );
};

export default NotesList;
