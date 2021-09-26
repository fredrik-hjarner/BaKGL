#include "bak/gameData.hpp"

#include "com/logger.hpp"

#include "xbak/FileBuffer.h"
#include "xbak/FileManager.h"

int main(int argc, char** argv)
{
    const auto& logger = Logging::LogState::GetLogger("main");
    Logging::LogState::SetLevel(Logging::LogLevel::Error);
    
    std::string saveFile{argv[1]};

    logger.Info() << "Loading save:" << saveFile << std::endl;

    BAK::GameData gameData(saveFile);
    logger.Error() << "SaveName: " << gameData.mName << "\n";
    logger.Error() << "Tile: " << std::hex << gameData.mLocation.mTile << std::dec <<  " " << gameData.mLocation.mTile << "\n";
    logger.Error() << "Location: " << std::hex << gameData.mLocation.mLocation << std::dec << "\n";
    logger.Error() << "Location: " << gameData.mLocation.mLocation << "\n";

    return 0;
}

