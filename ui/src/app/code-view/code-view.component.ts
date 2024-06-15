import { Component, ViewEncapsulation, computed, effect, inject, input, output } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "code-view",
  standalone: true,
  template: `
        <pre class="highlighted-code"><code [innerHTML]="sanitizedCode()" (click)="setBreakpoint($event)"></code></pre>
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
  sanitizer = inject(DomSanitizer);
  sanitizedCode = computed(() => this.sanitizer.bypassSecurityTrustHtml(this.code()));

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

  setBreakpoint(event: Event) {
    if (event.target instanceof HTMLInputElement) {
      const index = Number(event.target.getAttribute("data-linenumber")) - 1;
      this.breakpoints[index] = event.target.checked;
      this.breakpointsChanged.emit(this.breakpoints);
    }
  }
}
