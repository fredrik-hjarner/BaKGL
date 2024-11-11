#!/bin/bash

# Create a directory for QuickJS
mkdir -p external/quickjs
cd external/quickjs

# Clone QuickJS if not already present
if [ ! -d "quickjs" ]; then
    git clone https://github.com/bellard/quickjs.git
fi

cd quickjs

# Build QuickJS
make clean
make -j$(nproc)

# Create lib directory in project root if it doesn't exist
mkdir -p ../../../lib

# Copy the built library and headers to our project structure
cp libquickjs.a ../../../lib/
cp quickjs.h ../../../lib/
cp quickjs-libc.h ../../../lib/

echo "QuickJS built and installed to lib/ directory" 