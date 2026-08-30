#include "Server.h"
#include "httplib.h"
#include "json.hpp"
#include <thread>
#include <iostream>
#include <sstream>

#ifdef _WIN32
#include <windows.h>
#endif

using json = nlohmann::json;

namespace TSWMod {

// Helper to safely read memory
template <typename T>
T ReadMemory(uintptr_t address) {
    T value = 0;
#ifdef _WIN32
    // MinGW does not natively support MSVC's __try/__except SEH.
    // In a real mod, you'd want IsBadReadPtr checks or ReadProcessMemory if doing it externally.
    // Internally, a direct dereference works but can crash the game if the address is invalid.
    try {
        if (!IsBadReadPtr(reinterpret_cast<const void*>(address), sizeof(T))) {
            value = *reinterpret_cast<T*>(address);
        }
    } catch (...) {
        // Fallback for C++ exceptions, though access violations are hardware exceptions
    }
#endif
    return value;
}

// Helper to safely write memory
template <typename T>
bool WriteMemory(uintptr_t address, T value) {
#ifdef _WIN32
    try {
        if (!IsBadWritePtr(reinterpret_cast<void*>(address), sizeof(T))) {
            *reinterpret_cast<T*>(address) = value;
            return true;
        }
    } catch (...) {
        // Fallback for C++ exceptions
    }
    return false;
#else
    return false;
#endif
}

static httplib::Server* g_HttpServer = nullptr;
static std::thread* g_ServerThread = nullptr;

Server& Server::GetInstance() {
    static Server instance;
    return instance;
}

void Server::Start(int port) {
    if (m_isRunning) return;
    
    m_isRunning = true;
    g_ServerThread = new std::thread(&Server::RunServer, this, port);
}

void Server::Stop() {
    if (!m_isRunning) return;

    if (g_HttpServer) {
        g_HttpServer->stop();
    }

    if (g_ServerThread && g_ServerThread->joinable()) {
        g_ServerThread->join();
        delete g_ServerThread;
        g_ServerThread = nullptr;
    }

    m_isRunning = false;
}

void Server::SetupRoutes() {
    if (!g_HttpServer) return;

    // Middleware to add CORS headers
    g_HttpServer->set_post_routing_handler([](const auto& req, auto& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    });

    // Handle OPTIONS request for CORS preflight
    g_HttpServer->Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.status = 200;
    });

    // Health check
    g_HttpServer->Get("/api/status", [](const httplib::Request&, httplib::Response& res) {
        json response = {
            {"status", "online"},
            {"message", "TSW6 Injectable Mod Server is running."}
        };
        res.set_content(response.dump(), "application/json");
    });

    // Generic Memory Read: /api/read?address=0x1234&type=int
    g_HttpServer->Get("/api/read", [](const httplib::Request& req, httplib::Response& res) {
        if (!req.has_param("address") || !req.has_param("type")) {
            res.status = 400;
            res.set_content(R"({"error":"Missing address or type parameter"})", "application/json");
            return;
        }

        std::string addrStr = req.get_param_value("address");
        std::string typeStr = req.get_param_value("type");
        
        uintptr_t address = 0;
        try {
            address = std::stoull(addrStr, nullptr, 16); // Parse as hex
            
#ifdef _WIN32
            // If it's an offset from the base game module, add the base address
            if (req.has_param("isOffset") && req.get_param_value("isOffset") == "true") {
                HMODULE hModule = GetModuleHandleA(NULL); // Gets the base address of the exe we are injected into
                address += reinterpret_cast<uintptr_t>(hModule);
            }
#endif
        } catch (...) {
            res.status = 400;
            res.set_content(R"({"error":"Invalid address format"})", "application/json");
            return;
        }

        json response;
        response["address"] = addrStr;

        // Extremely basic typing for demonstration
        if (typeStr == "int") {
            response["value"] = ReadMemory<int>(address);
        } else if (typeStr == "float") {
            response["value"] = ReadMemory<float>(address);
        } else if (typeStr == "byte") {
            response["value"] = ReadMemory<uint8_t>(address);
        } else {
            res.status = 400;
            res.set_content(R"({"error":"Unsupported type"})", "application/json");
            return;
        }

        res.set_content(response.dump(), "application/json");
    });

    // Generic Memory Write: /api/write
    // Body: { "address": "0x1234", "type": "int", "value": 42 }
    g_HttpServer->Post("/api/write", [](const httplib::Request& req, httplib::Response& res) {
        try {
            auto body = json::parse(req.body);
            std::string addrStr = body["address"];
            std::string typeStr = body["type"];
            
            bool isOffset = false;
            if (body.contains("isOffset") && body["isOffset"].is_boolean()) {
                isOffset = body["isOffset"].get<bool>();
            }
            
            uintptr_t address = std::stoull(addrStr, nullptr, 16);
            
#ifdef _WIN32
            if (isOffset) {
                HMODULE hModule = GetModuleHandleA(NULL);
                address += reinterpret_cast<uintptr_t>(hModule);
            }
#endif
            
            bool success = false;

            if (typeStr == "int") {
                success = WriteMemory<int>(address, body["value"].get<int>());
            } else if (typeStr == "float") {
                success = WriteMemory<float>(address, body["value"].get<float>());
            } else if (typeStr == "byte") {
                success = WriteMemory<uint8_t>(address, body["value"].get<uint8_t>());
            }

            if (success) {
                res.set_content(R"({"success":true})", "application/json");
            } else {
                res.status = 500;
                res.set_content(R"({"error":"Failed to write to memory. Potential access violation."})", "application/json");
            }
        } catch (const std::exception& e) {
            res.status = 400;
            json error = {{"error", std::string("Parse error: ") + e.what()}};
            res.set_content(error.dump(), "application/json");
        }
    });
}

void Server::RunServer(int port) {
    g_HttpServer = new httplib::Server();
    
    SetupRoutes();

    // This call blocks until g_HttpServer->stop() is called
    g_HttpServer->listen("0.0.0.0", port);
    
    delete g_HttpServer;
    g_HttpServer = nullptr;
}

} // namespace TSWMod
