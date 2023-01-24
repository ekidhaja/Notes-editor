import { getAllFromCache } from "../cache";
import db from "../firebase";

/** This simulates a worker or cronjob that runs every minute
 ** It loops through the cache and stores all note content to db
 */
export function dbWorker() {
    setInterval(() => {
        const notes = getAllFromCache();
        const batch = db.batch();
        
        if(notes.length) {
            //group all note content so you write as batch
            notes.forEach((note) => {
                let docRef = db.collection("notes").doc(note.id);
                batch.update(docRef, { content: note.content });  
            });

            //write to db
            batch.commit().then(() => {
                console.log("Note contents written to db");
            }).catch(err => {
                console.log("Failed to write batch files to db: ");
            }) 
        }

    }, 1000 * 60 * 60); //runs every
}