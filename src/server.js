'use strict';

const buildApp = require('./app');
const { port, env } = require('./config');

const app = buildApp();

app.listen(port, () => {
  process.stdout.write(`TicketFlow démarré sur le port ${port} (${env})\n`);
});
