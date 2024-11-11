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

# Special handling for main3d since it needs QuickJS
add_executable(main3d main3d.cpp)
target_include_directories(main3d PRIVATE ${CMAKE_SOURCE_DIR}/lib)
target_link_directories(main3d PRIVATE ${CMAKE_SOURCE_DIR}/lib)
set_target_properties(main3d PROPERTIES 
    CMAKE_CXX_CLANG_TIDY ""
    COMPILE_FLAGS "-Wno-error")
target_link_libraries(main3d
    ${LINK_UNIX_LIBRARIES}
    ${LINK_3D_LIBRARIES}
    ${APP_LIBS}
    quickjs m dl
)

# Handle all other binaries
foreach (APP_BIN IN LISTS APP_BINARIES)
    if(NOT ${APP_BIN} STREQUAL "main3d")
        add_executable (${APP_BIN} ${APP_BIN}.cpp)
        set_target_properties(${APP_BIN} PROPERTIES CMAKE_CXX_CLANG_TIDY "")
        target_link_libraries(${APP_BIN}
            ${LINK_UNIX_LIBRARIES}
            ${LINK_3D_LIBRARIES}
            #${SDL_LIBRARIES}
            ${APP_LIBS}
        )
    endif()
endforeach()

install(TARGETS main3d)


