#pragma once

#include "bak/file/IDataBufferProvider.hpp"

#include <memory>
#include <vector>

namespace BAK::File {

// Hm so.....
// This implements IDataBufferProvider
// FileProvider and PackedFileProvider also implement IDataBufferProvider
// Seems to me that AggregateFileProvider just executes both of them
// if the first fails it tries the second.
class AggregateFileProvider : public IDataBufferProvider
{
public:
    AggregateFileProvider(const std::vector<std::string>& searchPaths);

    FileBuffer* GetDataBuffer(const std::string& fileName) override;

private:
    std::vector<std::unique_ptr<IDataBufferProvider>> mProviders;
};

}
