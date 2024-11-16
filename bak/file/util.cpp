#include "bak/file/util.hpp"

#include "com/logger.hpp"

namespace BAK::File {

unsigned GetStreamSize(std::ifstream& ifs)
{
    ifs.ignore( std::numeric_limits<std::streamsize>::max() );
    std::streamsize length = ifs.gcount();
    ifs.clear();
    ifs.seekg( 0, std::ios_base::beg );
    return static_cast<unsigned>(length);
}

// Purpose
// - Load the contents of a file into a FileBuffer object
// 
// How it Works
// 1. Open the file specified by fileName in binary mode
// 2. Check if the file was opened successfully, throwing an exception if not
// 3. Get the size of the file using the GetStreamSize helper function
// 4. Create a FileBuffer object with the determined size
// 5. Load the file contents into the FileBuffer
// 6. Close the file
// 7. Return the populated FileBuffer
//
// Dependencies
// - Requires the <fstream>, <ios>, <limits>, and <sstream> headers
// - Uses the Logging::LogInfo and Logging::LogFatal functions for logging
//
// Exceptions
// - Throws a std::runtime_error if the file fails to open
// - The exception message includes the file name and line number
//
// Inputs
// - fileName: The path to the file to load into the buffer
//
// Output
// - Returns a FileBuffer object containing the contents of the specified file
//
// Usage Example
// FileBuffer fb = CreateFileBuffer("path/to/myfile.dat");
//
// Edge Cases
// - If the specified file does not exist or cannot be opened, an exception is thrown
// - If the file is empty, an empty FileBuffer will be returned
FileBuffer CreateFileBuffer(const std::string& fileName)
{
    Logging::LogInfo(__FUNCTION__) << "Opening: " << fileName << std::endl;
    std::ifstream in{};
    in.open(fileName, std::ios::in | std::ios::binary);

    if (!in.good())
    {
        std::cerr << "Failed to open file: " << fileName<< std::endl;
        std::stringstream ss{};
        ss << __FILE__ << ":" << __LINE__ << " " << __FUNCTION__ << " OpenError!";
        Logging::LogFatal("FileBuffer") << ss.str() << std::endl;
        throw std::runtime_error(ss.str());
    }

    FileBuffer fb{GetStreamSize(in)};
    fb.Load(in);
    in.close();
    return fb;
}

}
