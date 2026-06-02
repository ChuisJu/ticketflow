'use strict';

// Magasin en mémoire — données synthétiques (aucune donnée réelle).
// En contexte réel, ce module serait remplacé par un accès base de données
// avec des requêtes paramétrées (jamais de concaténation de chaînes).

const tickets = [
  { id: 1, sujet: 'Mot de passe oublié', client: 'alice', agent: 'agent1', statut: 'ouvert' },
  { id: 2, sujet: 'Facture incorrecte', client: 'bob', agent: 'agent2', statut: 'ouvert' },
  { id: 3, sujet: 'Bug à la connexion', client: 'carol', agent: 'agent1', statut: 'clos' },
];

let sequence = tickets.length;

function listForAgent(agentId, role) {
  // Le superviseur voit tout ; un agent ne voit que ses tickets.
  if (role === 'superviseur') {
    return tickets;
  }
  return tickets.filter((t) => t.agent === agentId);
}

function findById(id) {
  return tickets.find((t) => t.id === id);
}

function create({ sujet, client, agent }) {
  sequence += 1;
  const ticket = { id: sequence, sujet, client, agent, statut: 'ouvert' };
  tickets.push(ticket);
  return ticket;
}

module.exports = { listForAgent, findById, create };
