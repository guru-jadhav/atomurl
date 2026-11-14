-- bench_mixed.lua: Realistic mixed workload benchmark for atomURL & CacheCore
-- Generates 80% Cache Hits, 20% Cache Misses, with unique client IPs to exercise CacheCore & PostgreSQL

local hot_codes = {"1", "2", "3", "4", "5"}

request = function()
    local path
    if math.random(1, 100) <= 80 then
        -- 80% Cache Hits
        path = "/" .. hot_codes[math.random(#hot_codes)]
    else
        -- 20% Cache Misses (forces fallback to PostgreSQL)
        path = "/miss_" .. math.random(10000, 99999)
    end

    -- Distribute simulated client IPs across 10.x.x.x
    local ip = string.format("10.%d.%d.%d", math.random(1, 254), math.random(1, 254), math.random(1, 254))
    
    local headers = {}
    headers["X-Forwarded-For"] = ip
    return wrk.format("GET", path, headers)
end

