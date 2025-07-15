module.exports = {
  roots: ['<rootDir>/tests'],         // Ne chercher que dans tests/
  testMatch: [
    '**/?(*.)+(spec|test).[jt]s?(x)', // Le pattern par défaut
  ],
  collectCoverage: true,              // Générer le coverage
  coverageDirectory: 'coverage',      // Sortie des rapports
  coverageReporters: ['lcov', 'text'],// Format LCOV + affichage texte
};     

/*module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageThreshold: {
    global: { branches: 95, functions: 95, lines: 95, statements: 95 }
  }
};*/