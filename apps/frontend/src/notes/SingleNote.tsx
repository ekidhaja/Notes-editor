import { Badge, BadgeTypeMap, Paper, TextField } from '@mui/material';
import React, { useEffect, useContext } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { NoteContext } from '../contexts/NoteContext';

import { Editor } from '../editor';
import { useNote } from './hooks';

interface SingleNoteProps {
  id: string;
}

const Home: React.FC<SingleNoteProps> = ({ id }) => {
  const { note, readyState } = useNote(id);
  const { activeNote, dispatch } = useContext(NoteContext);

  const connectionStatusColor = {
    [ReadyState.CONNECTING]: "info",
    [ReadyState.OPEN]: "success",
    [ReadyState.CLOSING]: "warning",
    [ReadyState.CLOSED]: "error",
    [ReadyState.UNINSTANTIATED]: "error",
  }[readyState] as BadgeTypeMap["props"]["color"];

  //set activeNote when note changes
  useEffect(() => {
    if(note && note?.id !== activeNote.id) {
      dispatch({ type: "SET", note: { id: note.id, title: note.title }});
    }
  }, [note]);

  return note ? (
    <>
      <Badge color={connectionStatusColor} variant="dot" sx={{ width: "100%" }}>
        <TextField
          value={activeNote.title}
          variant="standard"
          fullWidth={true}
          inputProps={{ style: { fontSize: 32, color: "#666" } }}
          sx={{ mb: 2 }}
        />
      </Badge>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}>
        <Editor initialValue={note.content} noteId={id} />
      </Paper>
    </>
  ) : null;
};

export default Home;
