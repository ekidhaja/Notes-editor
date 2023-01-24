import Head from "next/head";
import type { AppProps } from "next/app";
import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import NoteContextProvider from "../src/contexts/NoteContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </Head>
      <CssBaseline />
      <NoteContextProvider>
        <Component {...pageProps} />
      </NoteContextProvider>
    </>
  );
}
export default MyApp;
