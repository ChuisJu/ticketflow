'use strict';

// Configuration : paramètres qui varient selon l'environnement.
// Les secrets (clés, mots de passe) ne figurent JAMAIS ici : ils sont
// injectés au runtime via des variables d'environnement / un coffre-fort.

module.exports = {
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || 'development',
};
