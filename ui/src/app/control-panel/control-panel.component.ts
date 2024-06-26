import { HttpClient } from "@angular/common/http";
import { Component, OnInit, inject, input, output, signal } from "@angular/core";
import { Program } from "bcpl";
import { Operation } from "bcpl/operations/operations";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "control-panel",
  standalone: true,
  templateUrl: "./control-panel.component.html",
  styleUrl: "./control-panel.component.css",
})
export class ControlPanelComponent implements OnInit {
  program = input.required<Program>();
  breakpoints = input.required<boolean[]>();
  updateCodeView = output();
  resetProgram = output();
  loadCode = output<string>();
  state: "paused" | "finished" | "running" = "paused";
  predefinedPrograms = signal<string[]>([]);
  http = inject(HttpClient);
  arguments = output<string>();
  inputChange = output<string>();
  stopSignal = false;
  restoreCheckpoint = output<Program>();

  async ngOnInit() {
    const response = await firstValueFrom(this.http.get<string[]>("/assets/bcpl/index.json"));
    this.predefinedPrograms.set(response);
  }

  next() {
    this.stopSignal = false;
    const more = this.program().next();
    this.state = more ? "paused" : "finished";
    this.updateCodeView.emit();
  }

  async resumeExecution() {
    this.stopSignal = false;
    let count = 0;
    let paused = false;
    this.state = "running";
    while (this.program().next()) {
      if (count++ >= 5_000_000) {
        count = await new Promise((resolve) => {
          setTimeout(() => resolve(0), 0);
        });
      }
      const line = this.program().commands[this.program().programCounter]?.start?.[0];
      if (this.breakpoints()[line - 1]) {
        paused = true;
        break;
      }
      if (this.stopSignal) {
        paused = true;
        break;
      }
    }
    this.state = paused ? "paused" : "finished";
    this.updateCodeView.emit();
  }

  stepOver() {
    this.stopSignal = false;
    const start = this.program().programCounter;
    if (![Operation.FNAP, Operation.RTAP].includes(this.program().commands[start]?.operation)) {
      return this.next();
    }
    let paused = false;
    while (this.program().next()) {
      const line = this.program().commands[this.program().programCounter]?.start?.[0];
      if (this.program().programCounter === start + 1 || this.breakpoints()[line - 1]) {
        paused = true;
        break;
      }
      if (this.stopSignal) {
        paused = true;
        break;
      }
    }
    this.state = paused ? "paused" : "finished";
    this.updateCodeView.emit();
  }

  reset() {
    this.state = "paused";
    this.resetProgram.emit();
    this.stopSignal = true;
  }

  async pasteOCODE() {
    const text = await navigator.clipboard.readText();
    this.loadCode.emit(text);
    this.state = "paused";
  }

  async loadPredefinedProgram(name: string) {
    const text = await firstValueFrom(this.http.get(`/assets/bcpl/${name}.ocode`, { responseType: "text" }));
    this.loadCode.emit(text);
    this.state = "paused";
  }

  setArguments(event: Event) {
    if (event.target instanceof HTMLInputElement) {
      this.arguments.emit(event.target.value);
    }
  }

  setInput(event: Event) {
    if (event.target instanceof HTMLTextAreaElement) {
      this.inputChange.emit(event.target.value);
    }
  }

  stepBack() {
    const targetInstructions = this.program().instructionsRan - 1;
    this.program().reset();
    while (this.program().instructionsRan < targetInstructions) {
      this.program().next();
    }
    this.restoreCheckpoint.emit(this.program());
  }
}
