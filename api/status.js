
export default function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    return res.status(200).json({
        bot: "Dravix",
        status: "awaiting_connection",
        connected: false,
        shards: [],
        clusters: [],
        stats: {
            totalShards: 0,
            totalClusters: 0,
            totalServers: 0,
            averagePing: null
        },
        message: "The Dravix bot has not been connected yet."
    });
}
