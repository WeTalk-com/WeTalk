import http from "node:http";
const PORT = parseInt(process.env.PORT ?? "4003", 10);
const server = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", service: "notification-service" }));
        return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
});
server.listen(PORT, () => {
    console.log(`[notification-service] HTTP server running on port ${PORT}`);
});
