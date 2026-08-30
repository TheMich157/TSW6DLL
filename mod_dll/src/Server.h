#pragma once

namespace TSWMod {

class Server {
public:
    static Server& GetInstance();

    // Start the HTTP server on a background thread
    void Start(int port = 31271);

    // Stop the HTTP server and join the thread
    void Stop();

private:
    Server() = default;
    ~Server() = default;

    // Delete copy/move semantics
    Server(const Server&) = delete;
    Server& operator=(const Server&) = delete;

    void RunServer(int port);
    void SetupRoutes();

    bool m_isRunning = false;
    void* m_threadHandle = nullptr; // Using void* to avoid pulling in std::thread/windows.h in the header if possible
};

} // namespace TSWMod
