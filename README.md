# bcpl-interpreter

The presentation slides are checked in as Presentation.pdf.
The project is based on Martin Richard's BCPL, available at https://www.cl.cam.ac.uk/~mr10/.

## Setup
This project is using the [Bun](https://bun.sh) runtime.
Installation instructions can be found on the website.
For development, versions up to 1.1.17 were used, although everything should work on the latest version.

To install dependencies:

```bash
bun install
```

## Project overview

The implementation of the BCPL interpreter is in the `bcpl` directory. The `index.ts` file contains the common entry point for the tests and the UI.

The ocode parser is in `bcpl/parser/parser.ts`. The parser also takes care of the syntax highlighting for the HTML UI.

The BCPL standard library is partially implemented in `bcpl/stdlib`.

A number of sample programs extracted from the reference implementation reside in `bcpl/test-programs`. 
To run all tests, run `bun test`. They currently take about 30 seconds to complete.

The UI, written in Angular, is in the `ui` directory. Features like going back in time are implemented there.
To copy over the test OCODE files to the UI, run `bash copy-bcpl.sh`.
To start the UI, run `cd ui && bun start`. The provided sample scripts may need program arguments or stdin configured to work correctly.
