import { Component, ViewEncapsulation, computed, effect, input, output, signal } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { DomSanitizer } from "@angular/platform-browser";
import { getHighlighter } from "shiki";

const highlighter = getHighlighter({
  langs: [JSON.parse(JSON.stringify({
    name: 'ocode',
    displayName: 'OCODE',
    scopeName: 'ocode',
    patterns: [
      { include: "#comments" }, { include: "#characters" }, { include: "#labels" }, { include: "#numbers" }, { include: "#operators" }
    ],
    repository: {
      comments: { patterns: [{ begin: "#", end: "$", name: "comment" }] },
      characters: { patterns: [{ match: "\\b'[a-zA-Z %*+]'\\b", name: "constant.numeric" }] },
      labels: { patterns: [{ match: "\\bL\\d+\\b", name: "variable.parameter" }] },
      numbers: { patterns: [{ match: "\\b\\d+\\b", name: "constant.numeric" }] },
      operators: { patterns: [{ match: "\\w", name: "keyword" }] },
    }
  }))],
  themes: ["tokyo-night"]
});

@Component({
  selector: "code-view",
  standalone: true,
  template: `
        <div class="breakpoints">
          @for (breakpoint of breakpoints; let index = $index; track index) {
            <code class="breakpoint-wrapper">
              &ZeroWidthSpace;
              <input class="breakpoint" type="checkbox" [value]="breakpoint" (change)="setBreakpoint($event, index)">
          </code>
          }
        </div>
        <div class="shiki-wrapper" [innerHtml]="highlightedCodeHtml()"></div>
    `,
  styleUrl: "./code-view.component.css",
  encapsulation: ViewEncapsulation.None,
})
export class CodeViewComponent {
  code = input.required<string>();
  highlightedSection = input.required<[number, number, number, number] | null>();
  highlightedCodeHtml = signal<SafeHtml>("");

  lineNumbers = computed(() => this.code().split("\n").length);
  breakpoints: boolean[] = [];
  breakpointsChanged = output<boolean[]>();

  constructor(private readonly domSanitizer: DomSanitizer) {
    effect(() => {
      this.breakpoints = Array.from({ length: this.lineNumbers() }, () => false);
    });
    effect(() => this.reloadCodeHighlighting(this.code(), this.highlightedSection() ?? [-1, -1, -1, -1]));
  }

  async reloadCodeHighlighting(code: string, [startLine, startColumn, endLine, endColumn]: [number, number, number, number]) {
    const html = this.domSanitizer.bypassSecurityTrustHtml(
      await (await highlighter).codeToHtml(code, {
        lang: "ocode",
        theme: "tokyo-night",
        decorations:
          startLine !== -1
            ? [
              {
                start: { line: startLine - 1, character: startColumn - 1 },
                end: { line: endLine - 1, character: endColumn },
                properties: { class: "highlighted-word" },
              },
            ]
            : [],
      }),
    );
    this.highlightedCodeHtml.set(html);
    setTimeout(() => document.getElementsByClassName("highlighted-word")[0]?.scrollIntoView({ block: "nearest" }));
  }

  setBreakpoint(event: Event, index: number) {
    if (event.target instanceof HTMLInputElement) {
      this.breakpoints[index] = event.target.checked;
      this.breakpointsChanged.emit(this.breakpoints);
    }
  }
}
