#include "bak/file/fileProvider.hpp"

#include "bak/file/util.hpp"

#include "com/logger.hpp"

namespace BAK::File {

FileDataProvider::FileDataProvider(const std::string& basePath)
:
    mBasePath{basePath}
{}

bool FileDataProvider::DataFileExists(const std::string& path) const
{
    return mCache.contains(path)
        || std::filesystem::exists(mBasePath / path);
}

// Purpose
// - Retrieves a FileBuffer for the specified file path
//
// How it Works
// - Checks if the file exists in the cache or on disk
// - If the file is not in the cache, it creates a new FileBuffer and adds it to the cache
// - Returns a pointer to the FileBuffer if found, or nullptr if the file doesn't exist
//
// Dependencies
// - Relies on the mCache member variable to store cached FileBuffers
// - Uses the CreateFileBuffer function to create new FileBuffers
// - Depends on the mBasePath member variable for the base directory path
//
// Exceptions
// - No explicit exceptions are thrown
// - Returns nullptr if the requested file does not exist
//
// Inputs
// - path: A string representing the path of the file to retrieve, relative to mBasePath
//
// Output
// - Returns a pointer to the FileBuffer for the specified file path
// - If the file does not exist, returns nullptr
//
// Usage Examples
// - FileBuffer* buffer = fileProvider.GetDataBuffer("data/example.txt");
// - if (buffer != nullptr) { ... }
//
// Edge Cases
// - If the file does not exist, nullptr is returned
// - If the file is not in the cache but exists on disk, a new FileBuffer is created and cached
FileBuffer* FileDataProvider::GetDataBuffer(const std::string& path)
{
    Logging::LogSpam("FileDataProvider") << "Searching for file: "
        << path << " in directory [" << mBasePath.string() << "]" << std::endl;

    if (DataFileExists(path))
    {
        if (!mCache.contains(path))
        {
            const auto [it, emplaced] = mCache.emplace(path, CreateFileBuffer((mBasePath / path).string()));
            assert(emplaced);
        }
        return &mCache.at(path);
    }
    else
    {
        return nullptr;
    }
}

}
