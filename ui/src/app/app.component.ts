import { JsonPipe } from "@angular/common";
import { Component, OnInit, ViewEncapsulation, inject } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { loadProgram } from "bcpl";
import { codeToHtml } from "shiki";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [JsonPipe],
  template: `
    <div class="main-view">
      <div class="code-view">
        <div class="breakpoints">
          @for (breakpoint of breakpoints; let index = $index; track index) {
            <span class="breakpoint-wrapper">
              &ZeroWidthSpace;
              <input class="breakpoint" type="checkbox" [value]="breakpoint" (change)="setBreakpoint($event, index)">
            </span>
          }
        </div>
        <div class="shiki-wrapper" [innerHtml]="html"></div>
      </div>
      <textarea readonly class="output-view">{{ program.output }}</textarea>
    </div>
    {{ stack | json }}
    <br>
    <button type="button" (click)="next()">Next</button>
    <button type="button" (click)="resumeExecution()">Run</button>
    <button type="button" (click)="reset()">Reset</button>
  `,
  styles: [`
    :root {
      --breakpoint-sidebar-width: 20px;
    }

    .main-view {
      display: flex;
      position: relative;
      height: 60%;
    }

    .breakpoints {
      display: flex;
      flex-direction: column;
      position: absolute;
      font-family: monospace;
      width: var(--breakpoint-sidebar-width);
      height: 100%;
    }
    
    .breakpoint-wrapper {
      position: relative;
    }

    .breakpoint-wrapper .breakpoint {
      position: absolute;
      margin: 1.5px;
      font-family: monospace;
      opacity: 0;
      transition: opacity 100ms ease-in;
    }

    .breakpoint-wrapper .breakpoint:checked,
    .breakpoint-wrapper:hover .breakpoint {
      opacity: 1;
    }

    .code-view {
      flex: 1;
      overflow: auto;
    }
    
    .highlighted-word {
      background-color: olivedrab;
    }

    .shiki-wrapper {
      width: 100%;
      height: 100%;
    }

    .shiki {
      margin: 0;
      padding-left: var(--breakpoint-sidebar-width);
      min-height: 100%;
    }

    .output-view {
      flex: 1;
    }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  console = console;
  code = `JUMP L2
ENTRY L1 5 's' 't' 'a' 'r' 't'
SAVE 3 LN 1 LN 0 LN -1 STORE STACK 9
LSTR 13 'A' 'n' 's' 'w' 'e' 'r' ' ' 'i' 's' ' ' '%' 'n' 10
LP 4 LP 3 ADD LP 5 ADD LG 94 RTAP 6 RTRN STACK 3
ENDPROC STACK 3 LAB L2 STORE GLOBAL 1 1 L1`;
  breakpoints = Array.from({ length: this.code.split("\n").length }, () => false);
  html: SafeHtml = '';
  title = "ui";
  program = loadProgram(this.code);
  domSanitizer = inject(DomSanitizer);
  stack: number[] = [];

  async ngOnInit() {
    await this.loadHtml();
  }

  async next() {
    this.program.next();
    await this.loadHtml();
    setTimeout(() => document.getElementsByClassName("highlighted-word")[0]?.scrollIntoView({ block: 'nearest' }));
  }

  private async loadHtml() {
    this.stack = this.program.environment.stack.slice(0, this.program.environment.framePointer + this.program.environment.currentOffset);
    const command = this.program.commands[this.program.programCounter];
    this.html = this.domSanitizer.bypassSecurityTrustHtml(await codeToHtml(this.code, {
      lang: 'asm', theme: 'tokyo-night', decorations: command && [{
        start: { line: command.start[0] - 1, character: command.start[1] - 1 },
        end: { line: command.end[0] - 1, character: command.end[1] },
        properties: { class: 'highlighted-word' }
      }]
    }));
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
    await this.loadHtml();
  }

  setBreakpoint(event: Event, index: number) {
    if (event.target instanceof HTMLInputElement) {
      this.breakpoints[index] = event.target.checked;
    }
  }

  async reset() {
    this.program.environment.clear();
    this.program.programCounter = 0;
    this.program.output = "";
    await this.loadHtml();
  }
}
