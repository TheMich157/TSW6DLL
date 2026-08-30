cmake_minimum_required(VERSION 3.10)
project(TSW6_Dispatcher_Mod)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Set output directory
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# Include directories for single-header libraries
include_directories(include)

# Compile as a shared library (DLL on Windows)
add_library(TSW6_Dispatcher SHARED
    src/main.cpp
    src/Server.cpp
)

# Target Windows specifically if cross-compiling
if(WIN32 OR MINGW)
    target_link_libraries(TSW6_Dispatcher wsock32 ws2_32)
    
    # Optional: static link standard libraries to avoid missing DLL errors on the target machine
    if(MINGW)
        set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -static-libgcc -static-libstdc++ -static")
        set(CMAKE_SHARED_LINKER_FLAGS "${CMAKE_SHARED_LINKER_FLAGS} -Wl,--kill-at")
    endif()
endif()
