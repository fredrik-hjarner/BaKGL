#include "src/dialog.hpp"

#include "src/resourceNames.hpp"

#include "src/logger.hpp"

#include "xbak/FileBuffer.h"
#include "xbak/FileManager.h"

#include <iomanip>

int main(int argc, char** argv)
{
    const auto& logger = Logging::LogState::GetLogger("main");
    Logging::LogState::SetLevel(Logging::LogLevel::Spam);
    
    BAK::DialogStore dialog{};
    dialog.Load();
    
    //dialog.ShowAllDialogs();
    return 0;
}

