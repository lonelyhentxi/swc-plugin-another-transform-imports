import fetch from 'node-fetch';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

interface VersionScope {
  from: string | null;
  to: string | null;
}

interface VersionSnapshot {
  swc_core: VersionScope;
  '@swc/core': VersionScope;
  'next': VersionScope;
}

const rsSwcCoreRegex = /###\s+`v?((\d+\.)*[\dx]+)`(\s*~\s*`v?((\d+\.)*[\dx]+)`)?\s*/;
const npmSwcCoreRegex = /\-\s+(`@swc\/core\@v?((\d+\.)*\d+(-\w+\.\d+)?)`)?\s*~\s*(`@swc\/core@\v?((\d+\.)*\d+(-\w+\.\d+)?)`)?/;
const nextRegex = /\-\s+(`(next@)?v?((\d+\.)*\d+(-\w+\.\d+)?)`)?\s*~\s*(`(next@)?v?((\d+\.)*\d+(-\w+\.\d+)?)`)?/

const manifestPath = path.resolve(
  import.meta.dirname,
  '..',
  'swc_version_manifest.json',
);

async function fetchAndParseSwcCoreVersions() {
  const mdxText = await fetch('https://raw.githubusercontent.com/swc-project/website/HEAD/pages/docs/plugin/selecting-swc-core.mdx').then(r => r.text());
  const sections = mdxText
    .split(/\n(?=###\s+`v?(\d+\.)*[\dx]+`(\s*~\s*`v?(\d+\.)*[\dx]+`)?\s*)/g)
    .map((v) => v?.trim?.())
    .filter(v => rsSwcCoreRegex.test(v));

  const versionSnapshots: VersionSnapshot[] = [];
  for (const s of sections) {
    const rsSwcCoreMatch = s.match(rsSwcCoreRegex);
    const npmSwcCoreMatch = s.match(npmSwcCoreRegex);
    const nextMatch = s.match(nextRegex);
    if (rsSwcCoreMatch && npmSwcCoreMatch) {
      const rsSwcCoreVersion = {
        from: rsSwcCoreMatch[1] as string ?? null,
        to: rsSwcCoreMatch[4] as string ?? null
      };
      const npmSwcCoreVersion = {
        from: npmSwcCoreMatch[2] as string ?? null,
        to: npmSwcCoreMatch[6] as string ?? null
      }
      const nextVersion = {
        from: nextMatch?.[3] as string ?? null,
        to: nextMatch?.[8] as string ?? null
      };
      versionSnapshots.push({
        swc_core: rsSwcCoreVersion,
        '@swc/core': npmSwcCoreVersion,
        'next': nextVersion
      });
    }
  }

  fs.writeFileSync(
    manifestPath,
    JSON.stringify(versionSnapshots, null, 2),
    {
      encoding: 'utf-8'
    }
  );
}

fetchAndParseSwcCoreVersions();