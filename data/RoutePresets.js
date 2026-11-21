import routeGroups from "./routes.json";

// Catch areas ("routes") filled in automatically when a new game starts.
// They come from routes.json: each entry lists the games that share a route list.
// Edit that file to add, remove or rename routes. Games with no entry start empty.
const ROUTE_PRESETS = {};
routeGroups.forEach((group) => {
  group.games.forEach((game) => {
    ROUTE_PRESETS[game] = group.routes;
  });
});

// Every new game begins with a "Starter" route, followed by the game's own routes.
export function getPresetRoutes(gameName) {
  return ["Starter", ...(ROUTE_PRESETS[gameName] || [])];
}