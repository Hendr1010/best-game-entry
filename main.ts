import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const entryDirectory = fileURLToPath(new URL('.', import.meta.url));
const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const dossierLimits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function stageEntryFiles(): void {
  const gameDirectory = join(entryDirectory, 'game');
  if (!existsSync(join(gameDirectory, 'index.html'))) {
    throw new Error('The game entry is missing game/index.html.');
  }

  mkdirSync(outputDirectory, { recursive: true });
  cpSync(gameDirectory, join(outputDirectory, 'game'), { recursive: true });

  const sourceScreenshots = join(entryDirectory, 'screenshots');
  const stagedScreenshots = join(outputDirectory, 'screenshots');
  mkdirSync(stagedScreenshots, { recursive: true });
  if (existsSync(sourceScreenshots)) {
    cpSync(sourceScreenshots, stagedScreenshots, { recursive: true });
  }
}

function saveDossier(): void {
  const dossier = buildDossier(outputDirectory, dossierLimits);
  writeFileSync(join(outputDirectory, 'dossier.json'), dossier);
}

stageEntryFiles();
saveDossier();
