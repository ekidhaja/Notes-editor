/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { useEffect, useState } from "react";
import useSWR from "swr";
import { NotesResponse, NoteResponse } from "../../../backend/types";
import useWebSocket, { ReadyState } from "react-use-websocket";

// If you want to use GraphQL API or libs like Axios, you can create your own fetcher function.
// Check here for more examples: https://swr.vercel.app/docs/data-fetching
const fetcher = async (input: RequestInfo, init: RequestInit) => {
  const res = await fetch(input, init);
  return res.json();
};

export const useNotesList = () => {
  const { data, error } = useSWR<NotesResponse>(
    `${process.env.NEXT_PUBLIC_HTTP_URL}/api/notes`,
    fetcher
  );

  return {
    notesList: data?.notes,
    isLoading: !error && !data,
    isError: error,
  };
};

export const useNote = (id: string) => {
  const { readyState, lastMessage, sendMessage } = useWebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}/api/notes/${id}`
  );

  // Send a message when ready on first load
  useEffect(() => {
    if (readyState === ReadyState.OPEN && lastMessage === null) {
      sendMessage("");
    }
  }, [readyState, lastMessage]);

  return {
    note: lastMessage && (JSON.parse(lastMessage.data) as NoteResponse),
    readyState,
  };
};
