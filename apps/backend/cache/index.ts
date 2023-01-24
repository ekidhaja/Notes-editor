import * as Y from 'yjs';
import { yTextToSlateElement } from '@slate-yjs/core';
import { Descendant } from "slate";

/**
 * An in-memory storage of Y.Docs. One Y.Doc per note.
 * This stores notes currently being edited in memory
 * It is retrieved from db when someone connects to a note for the first time
*/
const cache: { [k: string]: Y.Doc } = {};

type CacheData = {
    id: string,
    content: Descendant[] 
}

export function addToCache(key: string, value: Y.Doc) {
    cache[key] = value;
}

export function getFromCache(key: string) {
    return cache[key];
}

export function getAllFromCache() {
    const data: CacheData[] = [];

    //loop through cache
    Object.entries(cache).forEach((entry) => {
        //get doc content and convert to slate
        const sharedType = entry[1].get("content", Y.XmlText) as Y.XmlText;
        const content = yTextToSlateElement(sharedType).children;

        //push to array
        data.push({ id: entry[0], content });
    });

    return data;
}