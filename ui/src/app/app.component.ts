import { JsonPipe } from "@angular/common";
import { Component, type OnInit, signal } from "@angular/core";
import { Program, loadProgram } from "bcpl";
import { CodeViewComponent } from "./code-view/code-view.component";
import { ControlPanelComponent } from "./control-panel/control-panel.component";
import { StackViewComponent } from "./stack-view/stack-view.component";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [JsonPipe, CodeViewComponent, ControlPanelComponent, StackViewComponent],
  template: `
    <control-panel [program]="program" [breakpoints]="breakpoints" (updateCodeView)="updateCodeView()" (loadCode)="loadCode($event)" (resetProgram)="resetProgram()" (arguments)="updateArguments($event)" (inputChange)="updateInput($event)"></control-panel>
    <div class="main-view">
      <div class="code-view">
        <code-view [code]="highlightedCode" [highlightedCommand]="highlightedCommand()" [lineNumbers]="lineNumbers" (breakpointsChanged)="breakpoints = $event"></code-view>
      </div>
      <textarea readonly class="output-view">{{ program.output }}</textarea>
    </div>
    <stack-view [program]="programCopy"></stack-view>
    {{ stack | json }}
  `,
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  code = `JUMP L2
ENTRY L1 5 's' 't' 'a' 'r' 't'
SAVE 3 LN 1 LN 0 LN -1 STORE STACK 9
LSTR 13 'A' 'n' 's' 'w' 'e' 'r' ' ' 'i' 's' ' ' '%' 'n' 10
LP 4 LP 3 ADD LP 5 ADD LG 94 RTAP 6 RTRN STACK 3
ENDPROC STACK 3 LAB L2 STORE GLOBAL 1 1 L1`;
  highlightedCode = "";
  title = "ui";
  program!: Program;
  programCopy!: Program;
  highlightedCommand = signal<number>(0);
  lineNumbers!: number;
  breakpoints: boolean[] = [];
  stack: number[] = [];
  arguments = "";
  input = "";

  ngOnInit() {
    const [program, styledHtml] = loadProgram(this.code);
    this.program = program;
    this.highlightedCode = styledHtml;
    this.updateCodeView();
  }

  updateCodeView() {
    this.stack = this.program.environment.stackSlice();
    const command = this.program.commands[this.program.programCounter];
    if (command) {
      this.highlightedCommand.set(this.program.programCounter);
    }
    this.lineNumbers = this.program.commands.at(-1)?.start[0] || 1;
    this.programCopy = Object.assign(Object.create(Program.prototype), this.program);
  }

  loadCode(code: string) {
    this.highlightedCommand.set(0);
    this.code = code;
    const [program, styledHtml] = loadProgram(code, this.arguments, this.input);
    this.program = program;
    this.highlightedCode = styledHtml;
    this.updateCodeView();
  }

  resetProgram() {
    this.loadCode(this.code);
  }

  updateArguments(args: string) {
    this.arguments = args;
    this.program.arguments = args;
  }

  updateInput(input: string) {
    this.input = input;
    this.program.input = input;
  }
}
