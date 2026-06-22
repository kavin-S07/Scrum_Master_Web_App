import app from './app';

// app.ts already starts the HTTP server on import — this file exists solely
// as the entry point for nodemon/ts-node (nodemon.json:exec). Keeping the
// server bootstrap in app.ts means it can be imported by tests without
// automatically starting a listener.
export default app;
