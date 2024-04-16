import { JsonPipe } from "@angular/common";
import { Component } from "@angular/core";
import { loadProgram } from "bcpl";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h1>Welcome to {{title}}!</h1>
    {{ program.environment.stack | json }}
    <button type="button" (click)="program.next()">Next</button>
  `,
  styles: [],
})
export class AppComponent {
  title = "ui";
  program = loadProgram(`
  LN 1
  LN 2
  PLUS
  `);
}
