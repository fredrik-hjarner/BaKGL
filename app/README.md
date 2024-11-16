TODO: Explain what all the apps are.

# Executable apps

## bmx_explorer

`./bmx_explorer`

Seems to display images that are displayed in "chapter books" like big stylish letters.

## display_book

Example command: `./display_book C11.BOK`

Based on the code in cutscenes.cpp, the `.BOK` files are named using the pattern `C<chapter_number>1.BOK` for the start scenes and `C<chapter_number>2.BOK` for the finish scenes. Here are the concrete exact names for each chapter:

For start scenes:
- Chapter 1: `C11.BOK`
- Chapter 2: `C21.BOK`
- Chapter 3: `C31.BOK`
- Chapter 4: `C41.BOK`
- Chapter 5: `C51.BOK`
- Chapter 6: `C61.BOK`
- Chapter 7: `C71.BOK`
- Chapter 8: `C81.BOK`
- Chapter 9: `C91.BOK`
- Chapter 10: (No `.BOK` file for start scene)

For finish scenes:
- Chapter 1: `C12.BOK`
- Chapter 2: (No `.BOK` file for finish scene)
- Chapter 3: `C32.BOK`
- Chapter 4: (No `.BOK` file for finish scene)
- Chapter 5: `C52.BOK`
- Chapter 6: (No `.BOK` file for finish scene)
- Chapter 7: (No `.BOK` file for finish scene)
- Chapter 8: (No `.BOK` file for finish scene)
- Chapter 9: `C92.BOK`
- Chapter 10: (No `.BOK` file for finish scene)

## dialog_explorer

`./dialog_explorer`

You can see the dialogs of the game. I dont know exactly how it is intended to work.

## display_fmap

`./display_fmap`

Outputs coordinates of towns and tiles of zones.

## display_object

`./display_object <ZONE> <OBJECT>`

For example: `./display_object 7 gate2`

Displays 3d models.

## display_ttm

`./display_ttm <ADS> <TTM>`

For example: `./display_ttm C11.ADS C11.TTM`

Not yet sure what those files are.

## guiInventoryTest

`./guiInventoryTest`

Seems to be testing code.

## instancing

Shows icons it seems.

## play_cutscene

`./play_cutscene 1`

Simply plays a cutscene. The argument is the chapter number. Valid numbers seems to be 1-9.

## show_imgui

`./show_imgui`

imgui seems to be library used rendering a debug UI.

## show_scene

No idea what this does.