const axios = require('axios');

let cache = { data: {}, timestamp: {} };
const REFRESH_INTERVAL = 30000;

const urls = {
    nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    nhl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard'
};

async function getFilteredScores(league, team, status, limit) {
    let leaguesToFetch = [];

    if (league && urls[league]) {
        leaguesToFetch.push(league);
    } else if (!league) {
        leaguesToFetch = Object.keys(urls);
    } else {
        return [];  // Invalid league provided
    }

    let allScores = [];

    for (const lg of leaguesToFetch) {
        const scores = await fetchScores(lg);
        allScores = allScores.concat(scores);
    }

    // Team Filter
    if (team) {
        allScores = allScores.filter(game =>
            game.home.toLowerCase() === team.toLowerCase() ||
            game.away.toLowerCase() === team.toLowerCase()
        );
    }

    // Status Filter
    if (status) {
        const statusLower = status.toLowerCase();

        allScores = allScores.filter(game => {
            const gameStatus = game.status.toLowerCase();

            if (statusLower === 'live') {
                return gameStatus.includes('qtr') || gameStatus.includes('period') || gameStatus.includes('half') || gameStatus.includes('in progress');
            } else if (statusLower === 'final') {
                return gameStatus.includes('final');
            } else if (statusLower === 'upcoming') {
                return gameStatus.includes('pm') || gameStatus.includes('am') || gameStatus.includes('scheduled');
            } else {
                return true;  // If unknown status filter, ignore filter
            }
        });
    }

    // Limit Results
    if (limit > 0) {
        allScores = allScores.slice(0, limit);
    }

    return allScores;
}

async function fetchScores(league) {
    const now = Date.now();

    if (cache[league] && (now - cache.timestamp[league] < REFRESH_INTERVAL)) {
        return cache[league];
    }

    try {
        const res = await axios.get(urls[league]);

        const games = res.data.events.map(game => {
            const homeTeam = game.competitions[0].competitors[0];
            const awayTeam = game.competitions[0].competitors[1];

            return {
                league,
                home: homeTeam.team.shortDisplayName,
                away: awayTeam.team.shortDisplayName,
                homeScore: homeTeam.score,
                awayScore: awayTeam.score,
                homeLogo: homeTeam.team.logo,
                awayLogo: awayTeam.team.logo,
                status: game.status.type.shortDetail
            };
        });

        cache[league] = games;
        cache.timestamp[league] = now;

        return games;

    } catch (err) {
        console.error(`Error fetching ${league} data`, err.message);
        return [];
    }
}

module.exports = { getFilteredScores };
