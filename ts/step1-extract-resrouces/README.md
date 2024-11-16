This part of the code has a very specific purpose.
It reads original game files and extracts all resources into as new files.
Reads krodor.rmf which is the resource index file that explains where the
resources are located in krondor.001. As for the rest of the files I don't know
yet their purpose.

This part of the code is supposed to be independent/self-contained with very
very few exports that a later step in the "pipeline" can use (exports.ts).