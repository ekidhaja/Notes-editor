import React, { createContext, useReducer } from "react";
import NoteReducer from "../reducers/NoteReducer";
import { Note } from "../../../backend/types";

export const NoteContext = createContext<any>(null);
const initNote: Note = { id: "", title: "" };

const NoteContextProvider: React.FC = ({ children }) => {
    const [activeNote, dispatch] = useReducer(NoteReducer, initNote);

    return (
        <NoteContext.Provider value={{ activeNote, dispatch }}>{ children }</NoteContext.Provider>
    )
}

export default NoteContextProvider;