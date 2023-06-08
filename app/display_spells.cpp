#include "bak/camp.hpp"

#include "com/logger.hpp"

int main(int argc, char** argv)
{
    const auto& logger = Logging::LogState::GetLogger("main");
    Logging::LogState::SetLevel(Logging::LogLevel::Debug);
    Logging::LogState::Disable("DialogStore");
    
    //BAK::SpellInfo();

    BAK::CampData{};
    return 0;
}

