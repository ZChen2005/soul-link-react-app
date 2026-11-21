// Finds the sprite images in src/sprites/pixel and src/sprites/high res.
// Files are matched to Pokemon by the number in the file name (25.png and 025.png
// both belong to Pokemon #25), whatever the image extension is.
function buildMap(context) {
  const map = {};
  context.keys().forEach((key) => {
    const file = key.split("/").pop();
    const stem = file.replace(/\.[^.]+$/, "");
    const match = stem.match(/\d+/);
    if (!match) return;
    const id = parseInt(match[0], 10);
    // A file named with just the number wins over one like "25-shiny".
    if (/^\d+$/.test(stem) || !(id in map)) {
      const loaded = context(key);
      map[id] = typeof loaded === "string" ? loaded : loaded.default;
    }
  });
  return map;
}

// (require.context needs its arguments written out literally, so the pattern is repeated.)
const pixel = buildMap(require.context("../sprites/pixel", false, /\.(png|jpe?g|gif|webp|svg)$/i));
const highRes = buildMap(
  require.context("../sprites/high res", false, /\.(png|jpe?g|gif|webp|svg)$/i)
);

// While developing, say in the browser console what was (or wasn't) found.
const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  console.info(
    `[sprites] found ${Object.keys(pixel).length} pixel and ${Object.keys(highRes).length} high res images`
  );
}

const warned = new Set();

function find(map, id, folder) {
  if (map[id]) return map[id];
  const key = `${folder}-${id}`;
  if (isDev && !warned.has(key)) {
    warned.add(key);
    console.warn(
      `[sprites] No image for Pokemon #${id} in src/sprites/${folder}. ` +
        `Files are matched by the number in the file name (for example ${id}.png).`
    );
  }
  return "";
}

// Small pixel-art sprite used on cards, the team and tombstones ("" if there is none).
export const pixelSprite = (id) => find(pixel, id, "pixel");

// Large image used in the pop-up ("" if there is none).
export const highResSprite = (id) => find(highRes, id, "high res");