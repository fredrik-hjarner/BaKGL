#include "bak/file/packedFileProvider.hpp"

#include "bak/file/packedResourceFile.hpp"

namespace BAK::File {

// dataProvider seems to be the AggregateFileProvider...
// which executes FileDataProvider and PackedFileDataProvider
// so PackedFileDataProvider will pretty much execute itself too..
PackedFileDataProvider::PackedFileDataProvider(IDataBufferProvider& dataProvider)
:
    mCache{},
    mLogger{Logging::LogState::GetLogger("PackedFileDataProvider")}
{
    // auto* resourceIndexFb = dataProvider.GetDataBuffer(ResourceIndex::sFilename);
    // seems "krondor.rmf" is the "resource file".
    auto* resourceIndexFb = dataProvider.GetDataBuffer("krondor.rmf");
    if (resourceIndexFb == nullptr)
    {
        mLogger.Warn() << "Could not find resource index file [" << ResourceIndex::sFilename
            << "]. Will not use packed resource file for data." << std::endl;
        return;
    }

    // Constructor the ResourceIndex with the krondor.rmf file buffer.
    auto resourceIndex = ResourceIndex{*resourceIndexFb};

    // What is packed resource file? krondor.001 is what it is.
    auto* packedResource = dataProvider.GetDataBuffer(resourceIndex.GetPackedResourceFile());

    if (packedResource == nullptr)
    {
        mLogger.Warn() << "Could not find packed resource file [" << resourceIndex.GetPackedResourceFile()
            << "]. Will not use packed resource file for data." << std::endl;
        return;
    }

    for (const auto& index : resourceIndex.GetResourceIndex())
    {
        packedResource->Seek(index.mOffset);
        const auto resourceName = packedResource->GetString(ResourceIndex::sFilenameLength);
        const auto resourceSize = packedResource->GetUint32LE();
        const auto [it, emplaced] = mCache.emplace(
            resourceName,
            packedResource->MakeSubBuffer(index.mOffset + ResourceIndex::sFilenameLength + 4, resourceSize));

        mLogger.Spam() << "Resource: " << resourceName << " hash: " << std::hex << index.mHashKey
            << std::dec << " offset: " << index.mOffset << " size: " << resourceSize << "\n";
    }
}

// Simply returns what it loaded into the cache in the function above.
FileBuffer* PackedFileDataProvider::GetDataBuffer(const std::string& fileName)
{
    mLogger.Spam() << "Searching for file: " << fileName << std::endl;
    if (mCache.contains(fileName))
    {
        return &mCache.at(fileName);
    }

    return nullptr;
}

}
