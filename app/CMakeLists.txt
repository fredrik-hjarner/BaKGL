list(APPEND APP_BINARIES
    decomp_ttm
    dialog_explorer
    display_book
    display_dialog
    display_encounters
    display_fo
    display_fmap
    display_gds
    display_object
    display_ramp
    display_save
    display_startup_files
    display_sound
    display_spells
    display_tbl
    display_tile
    display_traps
    display_ttm
    instancing
    main3d
    play_book
    play_cutscene
    play_ttm
    show_scene
    show_imgui
    bmx_explorer
)

set(APP_LIBS
    bak
    com
    game
    graphics
    gui
    imgui
)

# QuickJS setup
set(QUICKJS_LIBS
    quickjs
    m
    dl
)

# List of apps that need QuickJS
set(QUICKJS_APPS
    main3d
)

# Tell compiler to ignore warnings only for QuickJS header
set_source_files_properties(${CMAKE_SOURCE_DIR}/quickjs/quickjs.hpp
    PROPERTIES COMPILE_FLAGS "-w"
)

# Handle all binaries
foreach (APP_BIN IN LISTS APP_BINARIES)
    add_executable (${APP_BIN} ${APP_BIN}.cpp)
    set_target_properties(${APP_BIN} PROPERTIES CMAKE_CXX_CLANG_TIDY "")

    # Only add QuickJS for apps that need it
    if(${APP_BIN} IN_LIST QUICKJS_APPS)
        target_include_directories(${APP_BIN} PRIVATE 
            ${CMAKE_SOURCE_DIR}          # For quickjs/quickjs.hpp
            ${CMAKE_SOURCE_DIR}/quickjs/build  # For quickjs.h
        )
        target_link_directories(${APP_BIN} PRIVATE ${CMAKE_SOURCE_DIR}/quickjs/build)
        target_link_libraries(${APP_BIN}
            ${LINK_UNIX_LIBRARIES}
            ${LINK_3D_LIBRARIES}
            #${SDL_LIBRARIES}
            ${APP_LIBS}
            ${QUICKJS_LIBS}
        )
    else()
        target_link_libraries(${APP_BIN}
            ${LINK_UNIX_LIBRARIES}
            ${LINK_3D_LIBRARIES}
            #${SDL_LIBRARIES}
            ${APP_LIBS}
        )
    endif()
endforeach()

install(TARGETS main3d)


