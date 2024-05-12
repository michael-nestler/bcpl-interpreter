import { JsonPipe } from "@angular/common";
import { Component, type OnInit, signal } from "@angular/core";
import { loadProgram } from "bcpl";
import { CodeViewComponent } from "./code-view/code-view.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [JsonPipe, CodeViewComponent],
  template: `
    <div class="main-view">
      <div class="code-view">
        <code-view [code]="code" [highlightedSection]="highlightedSection()" (breakpointsChanged)="breakpoints = $event"></code-view>
      </div>
      <textarea readonly class="output-view">{{ program.output }}</textarea>
    </div>
    {{ stack | json }}
    <br>
    <button type="button" (click)="next()">Next</button>
    <button type="button" (click)="resumeExecution()">Run</button>
    <button type="button" (click)="reset()">Reset</button>
  `,
  styles: [
    `
    .main-view {
      display: flex;
      position: relative;
      height: 60%;
    }

    .code-view {
      flex: 1;
      overflow: auto;
    }

    .output-view {
      flex: 1;
    }
  `,
  ],
})
export class AppComponent implements OnInit {
  code = `JUMP L2
ENTRY L1 5 's' 't' 'a' 'r' 't'
SAVE 3 LN 1 LN 0 LN -1 STORE STACK 9
LSTR 13 'A' 'n' 's' 'w' 'e' 'r' ' ' 'i' 's' ' ' '%' 'n' 10
LP 4 LP 3 ADD LP 5 ADD LG 94 RTAP 6 RTRN STACK 3
ENDPROC STACK 3 LAB L2 STORE GLOBAL 1 1 L1`;
  title = "ui";
  program = loadProgram(this.code);
  highlightedSection = signal<[number, number, number, number]>([-1, -1, -1, -1]);
  breakpoints: boolean[] = [];
  stack: number[] = [];

  ngOnInit() {
    this.updateHighlightedCode();
  }

  next() {
    this.program.next();
    this.stack = this.program.environment.stack;
    this.updateHighlightedCode();
  }

  async resumeExecution() {
    let count = 0;
    while (this.program.next()) {
      if (count++ >= 1_000_000) {
        count = await new Promise((resolve) => {
          setTimeout(() => resolve(0), 0);
        });
      }
      const line = this.program.commands[this.program.programCounter]?.start?.[0];
      if (this.breakpoints[line - 1]) {
        break;
      }
    }
    this.updateHighlightedCode();
    this.stack = this.program.environment.stack;
  }

  reset() {
    this.program.environment.clear();
    this.program.programCounter = 0;
    this.program.output = "";
    this.stack = this.program.environment.stack;
    this.updateHighlightedCode();
  }

  updateHighlightedCode() {
    const command = this.program.commands[this.program.programCounter];
    if (command) {
      this.highlightedSection.set([...command.start, ...command.end]);
    }
  }
}
