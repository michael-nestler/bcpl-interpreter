import { Component, ViewEncapsulation, effect, input, output } from "@angular/core";
import { getHighlighter } from "shiki";

const highlighter = getHighlighter({
  langs: [
    JSON.parse(
      JSON.stringify({
        name: "ocode",
        displayName: "OCODE",
        scopeName: "ocode",
        patterns: [
          { include: "#comments" },
          { include: "#characters" },
          { include: "#labels" },
          { include: "#numbers" },
          { include: "#operators" },
        ],
        repository: {
          comments: { patterns: [{ begin: "#", end: "$", name: "comment" }] },
          characters: { patterns: [{ match: "\\b'[a-zA-Z %*+]'\\b", name: "constant.numeric" }] },
          labels: { patterns: [{ match: "\\bL\\d+\\b", name: "variable.parameter" }] },
          numbers: { patterns: [{ match: "\\b\\d+\\b", name: "constant.numeric" }] },
          operators: { patterns: [{ match: "\\w", name: "keyword" }] },
        },
      }),
    ),
  ],
  themes: ["tokyo-night"],
});

@Component({
  selector: "code-view",
  standalone: true,
  template: `
        <div class="breakpoints">
          @for (breakpoint of breakpoints; let index = $index; track index) {
            <code class="breakpoint-wrapper">
              <span class="linenumber">{{ index + 1 }}</span>
              <input class="breakpoint" type="checkbox" [value]="breakpoint" (change)="setBreakpoint($event, index)">
            </code>
          }
        </div>
        <pre class="highlighted-code"><code [innerHTML]="code()"></code></pre>
    `,
  styleUrl: "./code-view.component.css",
  encapsulation: ViewEncapsulation.None,
})
export class CodeViewComponent {
  code = input.required<string>();
  highlightedCommand = input.required<number>();
  lineNumbers = input.required<number>();
  breakpoints: boolean[] = [];
  breakpointsChanged = output<boolean[]>();

  constructor() {
    effect(() => {
      this.breakpoints = Array.from({ length: this.lineNumbers() }, () => false);
    });
    effect(() => this.reloadCodeHighlighting(this.code(), this.highlightedCommand()));
  }

  async reloadCodeHighlighting(code: string, highlightedCommand: number) {
    const oldHighlights = document.getElementsByClassName("highlighted-word");
    Array.prototype.forEach.call(oldHighlights, (element) => element.classList.remove("highlighted-word"));
    const highlightedElements = document.getElementsByClassName(`command-${highlightedCommand}`);
    Array.prototype.forEach.call(highlightedElements, (element) => element.classList.add("highlighted-word"));
    setTimeout(() => document.getElementsByClassName("highlighted-word")[0]?.scrollIntoView({ block: "nearest" }));
  }

  setBreakpoint(event: Event, index: number) {
    if (event.target instanceof HTMLInputElement) {
      this.breakpoints[index] = event.target.checked;
      this.breakpointsChanged.emit(this.breakpoints);
    }
  }
}
