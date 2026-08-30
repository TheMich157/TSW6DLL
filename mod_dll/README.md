# TSW6 Dispatcher Mod - Build and Injection Guide

This folder contains the C++ source code for a custom Dynamic Link Library (DLL) that injects a lightweight, concurrent HTTP server directly into the Train Sim World 6 process. 

Because TSW6 is a Windows game, **this DLL must be compiled for Windows x64**. Since the source code was generated on a macOS machine, you have two options for building it:

---

## 🛠️ Option 1: Compiling on a Windows Machine (Recommended)

The easiest and most reliable method is to transfer this `mod_dll` folder to a Windows PC where you intend to play the game.

### Prerequisites (Windows)
1. Install [CMake](https://cmake.org/download/).
2. Install [Visual Studio Community](https://visualstudio.microsoft.com/vs/community/) (Make sure to select the "Desktop development with C++" workload during installation).

### Build Commands
Open **Developer PowerShell for VS** or a standard command prompt, navigate to this `mod_dll` folder, and run:

```cmd
# 1. Create a build directory
mkdir build
cd build

# 2. Generate the Visual Studio project files using CMake
cmake ..

# 3. Compile the DLL in Release mode
cmake --build . --config Release
```

**Result:** You will find `TSW6_Dispatcher.dll` inside the `build/bin/Release/` directory.

---

## 🛠️ Option 2: Cross-Compiling on macOS (Advanced)

If you prefer to compile the Windows DLL directly on your Mac before transferring it, you can use the MinGW-w64 cross-compiler.

### Prerequisites (macOS)
1. Install Homebrew (if you don't have it): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
2. Install CMake and MinGW-w64:
```bash
brew install cmake mingw-w64
```

### Build Commands
Open your macOS terminal, navigate to `/Users/michal/TSW6/mod_dll`, and run:

```bash
# 1. Create a build directory
mkdir build
cd build

# 2. Tell CMake to use the MinGW Windows cross-compiler
cmake .. -DCMAKE_C_COMPILER=x86_64-w64-mingw32-gcc -DCMAKE_CXX_COMPILER=x86_64-w64-mingw32-g++ -DCMAKE_SYSTEM_NAME=Windows

# 3. Compile the DLL
make
```

**Result:** You will find `TSW6_Dispatcher.dll` inside the `build/bin/` directory. Transfer this file to your Windows PC.

---

## 🚀 How to Inject and Use the Mod

Once you have the compiled `TSW6_Dispatcher.dll` on your Windows PC, follow these steps to use it:

### Step 1: Start the Game
Launch Train Sim World 6 normally and load into a route or the main menu.

### Step 2: Inject the DLL
To load the DLL into the game, you need a DLL Injector. 
*   **Popular options:** [Extreme Injector](https://github.com/master131/ExtremeInjector), [Xenos Injector](https://github.com/DarthTon/Xenos), or Process Hacker.
*   **Process:**
    1. Open your injector tool (you may need to run it as Administrator).
    2. Select the `TSW6-Win64-Shipping.exe` process (the exact name may vary slightly).
    3. Add `TSW6_Dispatcher.dll` to the injection list.
    4. Click **Inject**.

### Step 3: Verify the Server is Running
Once injected, the DLL will silently open port `31271` on your local network. You can verify it's working by opening a web browser on the same PC and navigating to:
`http://localhost:31271/api/status`

You should receive a JSON response confirming the server is online:
```json
{
  "message": "TSW6 Injectable Mod Server is running.",
  "status": "online"
}
```

### Step 4: Interact with Memory
You can now use HTTP requests to read/write memory. For example, using `curl` or Postman:

**Read Memory (GET):**
```bash
curl "http://localhost:31271/api/read?address=0x1AB2C3D4&type=int"
```

**Write Memory (POST):**
```bash
curl -X POST http://localhost:31271/api/write \
     -H "Content-Type: application/json" \
     -d '{"address": "0x1AB2C3D4", "type": "int", "value": 42}'
```

### Step 5: Connect Your Dashboard
In the dispatcher dashboard we built earlier (the Node.js/React app), update the backend `server.js` logic to route its signal overrides and train data requests to `http://localhost:31271` instead of mocking the data!
