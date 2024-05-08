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
    <div [innerHtml]="html"></div>
    {{ stack | json }}
    <br>
    <button type="button" (click)="next()">Next</button>
  `,
  styles: [`
  .highlighted-word {
    background-color: olivedrab;
  }
  `],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  code = `
  LN 1    # factorial[n] at stack index 0
  LN 1    # n at stack index 1
  LAB L1
  LP 0
  LP 1
  MULT
  SP 0    # factorial[n] = n * factorial[n-1]
  LN 1
  PLUS
  LP 1
  LN 7
  GR
  JF L1
  LP 0    # Load result into top of stack
  FINISH
  `;
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
}
