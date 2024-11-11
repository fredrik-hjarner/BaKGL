#!/bin/bash

# QuickJS version to use (specific commit hash for stability)
QUICKJS_VERSION="6e2e68fd0896957f92eb6c242a2e048c1ef3cae0"

# Create QuickJS directory structure
mkdir -p quickjs/{src,build}

# Clone QuickJS if not already present
if [ ! -d "quickjs/src/quickjs" ]; then
    cd quickjs/src
    git clone https://github.com/bellard/quickjs.git
    cd quickjs
    git checkout ${QUICKJS_VERSION}
    cd ../../..
fi

# Build QuickJS
cd quickjs/src/quickjs
make clean
make -j$(nproc)

# Copy the built library and headers to our build directory
mkdir -p ../../build
cp libquickjs.a ../../build/
cp quickjs.h ../../build/
cp quickjs-libc.h ../../build/

# Create our C++ header wrapper
cat > ../../quickjs.hpp << 'EOL'
#pragma once

// Disable ALL warnings for QuickJS includes
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wall"
#pragma GCC diagnostic ignored "-Wextra"
#pragma GCC diagnostic ignored "-Wpedantic"
#pragma GCC diagnostic ignored "-Wcast-function-type"
extern "C" {
#include "quickjs/build/quickjs.h"
}
#pragma GCC diagnostic pop
EOL

echo "QuickJS built and installed to quickjs/build directory" 