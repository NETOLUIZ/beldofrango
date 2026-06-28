const { PrismaClient } = require('@prisma/client');

// Singleton — um unico pool de conexoes para toda a aplicacao.
const prisma = new PrismaClient();

module.exports = { prisma };
