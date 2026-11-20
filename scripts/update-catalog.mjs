import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CATALOG_PATH = path.join(ROOT, "src/data/catalog.json");
const POSTERS_PATH = path.join(ROOT, "src/data/posters.json");
const TMDB_KEY = process.env.TMDB_API_KEY || "";

const PROVIDER_TO_PLATFORM = {
  8: "Netflix",
  1899: "HBO Max",
  9: "Prime Video",
  15: "Hulu",
  337: "Disney+",
  350: "Apple TV",
  386: "Peacock",
  531: "Paramount+",
  636: "MGM+",
};

const GENRE_ID_TO_NAME = {
  18: "Drama",
  35: "Comedy",
  53: "Suspense",
  9648: "Suspense",
  80: "Suspense",
  27: "Horror",
  878: "Sci-Fi",
  10765: "Sci-Fi",
  28: "Action",
  10759: "Action",
  12: "Action",
  16: "Animation",
  10749: "Romance",
  14: "Fantasy",
  10751: "Family",
};

function norm(x) {
  return String(x || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function makeSlug(title, sub, platform, prefix) {
  return (
    prefix +
    "-" +
    (title + "-" + (sub || "") + "-" + platform)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

function getPacificDateParts() {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const iso = fmt.format(now);
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
  return { iso, label, yearMonth: iso.slice(0, 7) };
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function hydrateMissingPosters(catalog, posters) {
  if (!TMDB_KEY) return 0;
  let addedCount = 0;
  const all = [...catalog.topTitles, ...catalog.newTitles];
  const missing = all.filter((item) => !posters[item.id]);

  for (const item of missing.slice(0, 25)) {
    const kind = item.type === "movie" ? "movie" : "tv";
    let url = `https://api.themoviedb.org/3/search/${kind}?api_key=${encodeURIComponent(
      TMDB_KEY
    )}&query=${encodeURIComponent(item.title)}`;
    if (kind === "movie" && /^\d{4}$/.test(item.sub || "")) {
      url += `&year=${item.sub}`;
    }
    try {
      const data = await fetchJson(url);
      const want = norm(item.title);
      const match =
        (data.results || []).find(
          (r) => norm(r.title || r.name) === want && r.poster_path
        ) || (data.results || []).find((r) => r.poster_path);
      if (match) {
        posters[item.id] = {
          poster: match.poster_path,
          ...(match.backdrop_path ? { backdrop: match.backdrop_path } : {}),
        };
        addedCount++;
      }
    } catch {
      // Skip transient TMDB errors
    }
  }
  return addedCount;
}

async function discoverCurrentMonthReleases(catalog, posters, todayIso, yearMonth) {
  if (!TMDB_KEY) return 0;
  const existingTitles = new Set(
    catalog.newTitles.map((i) => norm(i.title) + "::" + i.platform)
  );
  const providerIds = Object.keys(PROVIDER_TO_PLATFORM).join("|");
  const startMonth = `${yearMonth}-01`;
  const [yr, mo] = yearMonth.split("-").map(Number);
  const lastDay = new Date(yr, mo, 0).getDate();
  const endMonth = `${yearMonth}-${String(lastDay).padStart(2, "0")}`;

  let added = 0;

  for (const [providerId, platformName] of Object.entries(PROVIDER_TO_PLATFORM)) {
    try {
      const url = `https://api.themoviedb.org/3/discover/movie?api_key=${encodeURIComponent(
        TMDB_KEY
      )}&watch_region=US&with_watch_providers=${providerId}&primary_release_date.gte=${startMonth}&primary_release_date.lte=${endMonth}&sort_by=popularity.desc&vote_count.gte=15`;
      const data = await fetchJson(url);
      for (const m of (data.results || []).slice(0, 2)) {
        if (!m.title || !m.release_date || !m.overview) continue;
        const key = norm(m.title) + "::" + platformName;
        if (existingTitles.has(key)) continue;

        const genres = Array.from(
          new Set(
            (m.genre_ids || [])
              .map((gid) => GENRE_ID_TO_NAME[gid])
              .filter(Boolean)
          )
        ).slice(0, 3);
        if (genres.length === 0) genres.push("Drama");

        const idx = catalog.newTitles.length;
        const id = makeSlug(m.title, "", platformName, `new-${idx}`);
        catalog.newTitles.push({
          id,
          title: m.title,
          sub: "",
          type: "movie",
          platform: platformName,
          genres,
          releaseDate: m.release_date,
          added: todayIso,
          score: m.vote_average ? Math.round(m.vote_average * 10) : null,
          description:
            m.overview.length > 220
              ? m.overview.slice(0, 217).trimEnd() + "..."
              : m.overview,
          source: "new",
        });

        if (m.poster_path) {
          posters[id] = {
            poster: m.poster_path,
            ...(m.backdrop_path ? { backdrop: m.backdrop_path } : {}),
          };
        }
        existingTitles.add(key);
        added++;
      }
    } catch {
      // Continue across providers if one fails
    }
  }

  return added;
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const posters = JSON.parse(fs.readFileSync(POSTERS_PATH, "utf8"));
  const { iso, label, yearMonth } = getPacificDateParts();

  catalog.lastUpdatedIso = iso;
  catalog.lastUpdatedLabel = label;

  const postersAdded = await hydrateMissingPosters(catalog, posters);
  const releasesAdded = await discoverCurrentMonthReleases(
    catalog,
    posters,
    iso,
    yearMonth
  );

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf8");
  fs.writeFileSync(POSTERS_PATH, JSON.stringify(posters, null, 2) + "\n", "utf8");

  console.log(
    `Catalog refreshed for ${label} (${iso}). Posters added: ${postersAdded}, New releases discovered: ${releasesAdded}.`
  );
}

main().catch((err) => {
  console.error("Catalog refresh error:", err);
  process.exit(1);
});
