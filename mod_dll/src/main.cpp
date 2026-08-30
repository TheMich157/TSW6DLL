#include <windows.h>
#include <thread>
#include "Server.h"

// Standard DllMain entry point for Windows
BOOL APIENTRY DllMain(HMODULE hModule, DWORD  ul_reason_for_call, LPVOID lpReserved)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
        // Disable thread library calls for optimization
        DisableThreadLibraryCalls(hModule);
        
        // Start the HTTP server on a background thread
        // We use port 31271 to avoid conflicting with the official API if it's running
        TSWMod::Server::GetInstance().Start(31271);
        break;

    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
        break;

    case DLL_PROCESS_DETACH:
        // Clean up and stop the server gracefully
        TSWMod::Server::GetInstance().Stop();
        break;
    }
    return TRUE;
}
