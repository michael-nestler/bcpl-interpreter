import { JsonPipe } from "@angular/common";
import { Component, type OnInit, signal } from "@angular/core";
import { loadProgram } from "bcpl";
import { CodeViewComponent } from "./code-view/code-view.component";
import { ControlPanelComponent } from "./control-panel/control-panel.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [JsonPipe, CodeViewComponent, ControlPanelComponent],
  template: `
    <control-panel [program]="program" [breakpoints]="breakpoints" (updateCodeView)="updateCodeView()" (loadCode)="loadCode($event)" (resetProgram)="resetProgram()"></control-panel>
    <div class="main-view">
      <div class="code-view">
        <code-view [code]="code" [highlightedSection]="highlightedSection()" (breakpointsChanged)="breakpoints = $event"></code-view>
      </div>
      <textarea readonly class="output-view">{{ program.output }}</textarea>
    </div>
    {{ stack | json }}
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
      background-color: #242630;
      border: 0;
      resize: none;
      color: #a3a3a3;
      font-family: 'Courier New', Courier, monospace;
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
    this.updateCodeView();
  }

  updateCodeView() {
    this.stack = this.program.environment.stack;
    const command = this.program.commands[this.program.programCounter];
    if (command) {
      this.highlightedSection.set([...command.start, ...command.end]);
    }
  }

  loadCode(code: string) {
    this.highlightedSection.set([-1, -1, -1, -1]);
    this.code = code;
    this.program = loadProgram(code);
    this.updateCodeView();
  }

  resetProgram() {
    this.loadCode(this.code);
  }
}
