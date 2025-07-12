module.exports = {
  roots: ['<rootDir>/tests'],         // Ne chercher que dans tests/
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)', // Le pattern par défaut
  ],
  collectCoverage: true,              // Générer le coverage
  coverageDirectory: 'coverage',      // Sortie des rapports
  coverageReporters: ['lcov', 'text'],// Format LCOV + affichage texte
};                                  