
let latestReport = null;

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');

    if (req.method === 'POST') {
        const secret = process.env.DASHBOARD_SECRET;
        const authorization = req.headers.authorization;

        if (!secret || authorization !== `Bearer ${secret}`) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        const body = req.body;

        if (
            !body ||
            !Number.isInteger(body.shardId) ||
            body.shardId < 0 ||
            !Number.isFinite(body.ping) ||
            !Number.isFinite(body.servers) ||
            !Number.isInteger(body.totalShards) ||
            body.totalShards < 1 ||
            body.shardId >= body.totalShards
        ) {
            return res.status(400).json({
                error: 'Invalid shard report'
            });
        }

        // Temporary storage for testing only.
        // Serverless instances may restart or use separate memory.
        if (!globalThis.dravixReports) {
            globalThis.dravixReports = new Map();
        }

        globalThis.dravixReports.set(body.shardId, {
            shardId: body.shardId,
            status: 'online',
            ping: body.ping,
            servers: body.servers,
            updatedAt: new Date().toISOString()
        });

        latestReport = {
            bot: 'Dravix',
            status: 'online',
            connected: true,
            shards: [...globalThis.dravixReports.values()],
            stats: {
                totalShards: body.totalShards,
                totalClusters: Math.ceil(body.totalShards / 7),
                totalServers: [...globalThis.dravixReports.values()]
                    .reduce((sum, shard) => sum + shard.servers, 0),
                averagePing: Math.round(
                    [...globalThis.dravixReports.values()]
                        .reduce((sum, shard) => sum + shard.ping, 0) /
                    globalThis.dravixReports.size
                )
            }
        };

        return res.status(200).json({
            success: true,
            message: 'Shard report received'
        });
    }

    if (req.method === 'GET') {
        return res.status(200).json(
            latestReport || {
                bot: 'Dravix',
                status: 'awaiting_connection',
                connected: false,
                shards: [],
                clusters: [],
                stats: {
                    totalShards: 0,
                    totalClusters: 0,
                    totalServers: 0,
                    averagePing: null
                },
                message: 'Waiting for shard reports.'
            }
        );
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
        error: 'Method not allowed'
    });
}
