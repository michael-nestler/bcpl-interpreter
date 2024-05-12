import { Component, ViewEncapsulation, computed, effect, input, output, signal } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import type { SafeHtml } from "@angular/platform-browser";
import { codeToHtml } from "shiki";

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
      await codeToHtml(code, {
        lang: "asm",
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
