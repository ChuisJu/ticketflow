'use strict';

const express = require('express');
const store = require('./tickets');

function buildApp() {
  const app = express();
  app.use(express.json());

  // Identité simulée via en-têtes (en réel : jeton JWT vérifié côté serveur).
  function identify(req, res, next) {
    const agentId = req.header('x-agent-id');
    if (!agentId) {
      // Message générique : ne pas révéler quels comptes existent.
      return res.status(401).json({ erreur: 'Authentification requise' });
    }
    req.agentId = agentId;
    req.role = req.header('x-role') === 'superviseur' ? 'superviseur' : 'agent';
    return next();
  }

  // Journalisation minimale des accès (succès comme refus).
  function audit(req, action, decision) {
    const entry = {
      ts: new Date().toISOString(),
      agent: req.agentId,
      action,
      decision,
    };
    // En réel : journal structuré, immuable, sans donnée personnelle inutile.
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  }

  app.get('/health', (req, res) => {
    res.json({ statut: 'ok' });
  });

  app.get('/tickets', identify, (req, res) => {
    const data = store.listForAgent(req.agentId, req.role);
    audit(req, 'list', 'allow');
    res.json(data);
  });

  app.get('/tickets/:id', identify, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ erreur: 'Identifiant invalide' });
    }
    const ticket = store.findById(id);
    if (!ticket) {
      return res.status(404).json({ erreur: 'Ticket introuvable' });
    }
    // Contrôle d'accès côté serveur : un agent n'accède qu'à ses tickets.
    if (req.role !== 'superviseur' && ticket.agent !== req.agentId) {
      audit(req, `read:${id}`, 'deny');
      return res.status(403).json({ erreur: 'Accès refusé' });
    }
    audit(req, `read:${id}`, 'allow');
    return res.json(ticket);
  });

  app.post('/tickets', identify, (req, res) => {
    const { sujet, client } = req.body || {};
    if (typeof sujet !== 'string' || sujet.trim().length === 0) {
      return res.status(400).json({ erreur: 'Le sujet est obligatoire' });
    }
    if (typeof client !== 'string' || client.trim().length === 0) {
      return res.status(400).json({ erreur: 'Le client est obligatoire' });
    }
    const ticket = store.create({ sujet: sujet.trim(), client: client.trim(), agent: req.agentId });
    audit(req, `create:${ticket.id}`, 'allow');
    return res.status(201).json(ticket);
  });

  return app;
}

module.exports = buildApp;
