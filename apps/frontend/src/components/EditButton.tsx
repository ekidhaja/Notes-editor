import React from 'react'
import { Button } from '@mui/material'
import { Edit } from '@mui/icons-material';

interface EditButtonProps {
    id: string;
    title: string;
}

const EditButton: React.FC<EditButtonProps> = ({ id, title }) => {
    async function updateNote(newTitle: string) {
        try {
            //make put request to update note
            const res = await fetch(`http://localhost:3001/api/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'title': `${newTitle}`
                }),
            });
        }
        catch(err) {
            console.log("Error updating note title");
        }
    }

    return (
        <Button
            onMouseDown={event => {
                event.preventDefault()
                const noteName = prompt('Enter a new name for your note:', title);
                console.log(noteName);

                if(noteName && noteName !== title) {
                    updateNote(noteName);
                }
            }}
        >
            <Edit sx={{ fontSize: 17, cursor: "pointer" }} />
        </Button>
    );
}

export default EditButton;