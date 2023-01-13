import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Assignment as AssignmentIcon } from "@mui/icons-material";
import { useNotesList } from "./hooks";
import useWebSocket from 'react-use-websocket';

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
  const ws = useWebSocket(`ws://localhost:3001/api/notes`);

  useEffect(() => {
    setNotes(notesList);
  }, [notesList]);

  //listen to noteList changes
  useEffect(() => {
    if(!ws?.lastMessage?.data) return;
    const newNotes = ws?.lastMessage && (JSON.parse(ws?.lastMessage?.data) as Note[])
    setNotes(newNotes);
  }, [ws.lastMessage]);

  return (
    <List>
      {notes?.map((note) => (
        <Link href={`/notes/${note.id}`} key={note.id}>
          <ListItemButton selected={note.id === activeNoteId}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary={note.title} />
          </ListItemButton>
        </Link>
      ))}
    </List>
  );
};

export default NotesList;
