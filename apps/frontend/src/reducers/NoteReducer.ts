import { Note } from "../../../backend/types";

function NoteReducer(state: Note, action: any): Note {
    switch(action.type) {
        case "SET":
            return {
                ...state,
                id: action.note.id,
                title: action.note.title
            };

        case "UPDATE":
            return {
                ...state,
                title: action.note.title
            };
        
        default: return state;
    }
}

export default NoteReducer;